import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import type { Server, Socket } from 'socket.io';
import {
  ILLMService,
  ILLM_SERVICE,
  ILiveSession,
} from '../../domain/llm/llm.service.interface';
import { GaiaQuotaService } from '../../application/gaia-quota.service';
import { GaiaSessionContextService } from '../../application/gaia-session-context.service';
import { GaiaQuotaExceededException } from '../../domain/exceptions/gaia-quota-exceeded.exception';
import { GAIA_SYSTEM_PROMPT } from '../../application/gaia-system-prompt';
import { WsJwtGuard } from '../../../shared/guards/ws-jwt.guard';
import { ListMyPlotsTool } from '../../tools/read/list-my-plots.tool';
import { GetFieldTasksTool } from '../../tools/read/get-field-tasks.tool';
import { RegisterFieldTaskTool } from '../../tools/write/register-field-task.tool';
import {
  GAIA_READ_TOOLS,
  GAIA_WRITE_TOOLS,
  toFunctionDeclarations,
} from '../../tools/gaia-tool-registry';
import type {
  IGaiaTool,
  IGaiaToolContext,
  IPendingAction,
} from '../../tools/gaia-tool.types';
import type { JwtPayload } from '../../../auth/infrastructure/jwt.strategy';
import { EGaiaLiveEvent } from './gaia-live-event.enum';

interface IActiveSession {
  liveSession: ILiveSession;
  userId: string;
  startedAt: Date;
}

@WebSocketGateway({
  namespace: '/gaia-live',
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class GaiaLiveGateway implements OnGatewayDisconnect {
  @WebSocketServer() readonly server!: Server;

  private readonly logger = new Logger(GaiaLiveGateway.name);
  private readonly sessions = new Map<string, IActiveSession>();
  /** socketId → userId for deduplication */
  private readonly userSockets = new Map<string, string>();

  private readonly allTools: IGaiaTool[];
  private readonly writeToolNames: string[];

  constructor(
    @Inject(ILLM_SERVICE) private readonly llm: ILLMService,
    private readonly quotaService: GaiaQuotaService,
    private readonly sessionContextService: GaiaSessionContextService,
    private readonly orm: MikroORM,
    private readonly listMyPlots: ListMyPlotsTool,
    private readonly getFieldTasks: GetFieldTasksTool,
    private readonly registerFieldTask: RegisterFieldTaskTool,
  ) {
    GAIA_READ_TOOLS.push(listMyPlots, getFieldTasks);
    GAIA_WRITE_TOOLS.push(registerFieldTask);
    this.allTools = [...GAIA_READ_TOOLS, ...GAIA_WRITE_TOOLS];
    this.writeToolNames = GAIA_WRITE_TOOLS.map((t) => t.name);
  }

  handleDisconnect(client: Socket): void {
    const session = this.sessions.get(client.id);
    if (session) {
      session.liveSession.close();
      this.sessions.delete(client.id);
      this.userSockets.delete(session.userId);
      this.logger.log(`Session closed on disconnect: ${client.id}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(EGaiaLiveEvent.START)
  async handleStart(@ConnectedSocket() client: Socket): Promise<void> {
    const user = (client.data as { user: JwtPayload }).user;
    console.log(
      `\n[LIVE] 1️⃣  live:start recibido — user=${user.sub} socket=${client.id}\n`,
    );

    // Close any existing session for this user (1 active session per user)
    const existingSocketId = this.userSockets.get(user.sub);
    if (existingSocketId && existingSocketId !== client.id) {
      console.log(
        `[LIVE] ⚠️  Sesión anterior abierta, cerrando — oldSocket=${existingSocketId}\n`,
      );
      const existing = this.sessions.get(existingSocketId);
      if (existing) {
        existing.liveSession.close();
        this.sessions.delete(existingSocketId);
      }
    }

    console.log(`[LIVE] 2️⃣  Verificando cuota — user=${user.sub}\n`);
    const quotaOk = await RequestContext.create(this.orm.em, async () => {
      try {
        await this.quotaService.assertWithinQuota(user.sub);
        console.log(`[LIVE] ✅ Cuota OK\n`);
        return true;
      } catch (err) {
        if (err instanceof GaiaQuotaExceededException) {
          console.log(`[LIVE] ❌ Cuota excedida para user=${user.sub}\n`);
          client.emit(EGaiaLiveEvent.QUOTA_EXCEEDED, {});
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`[LIVE] ❌ Error al verificar cuota (infra): ${msg}\n`);
          client.emit(EGaiaLiveEvent.ERROR, {
            message: 'No se pudo verificar tu cuota. Intenta de nuevo.',
          });
        }
        return false;
      }
    });
    if (!quotaOk) return;

    const userContextBlock = await RequestContext.create(this.orm.em, () =>
      this.sessionContextService.buildUserContextBlock(user.sub),
    );

    const ctx: IGaiaToolContext = { currentUser: user };
    const toolMap = new Map(this.allTools.map((t) => [t.name, t]));

    console.log(`[LIVE] 3️⃣  Creando sesión Gemini Live...\n`);

    let liveSession: ILiveSession;
    try {
      liveSession = await this.llm.createLiveSession({
        systemPrompt: GAIA_SYSTEM_PROMPT,
        userContextBlock,
        tools: toFunctionDeclarations(this.allTools),
        onAudio: (base64) => {
          console.log(
            `[LIVE onAudio] Recibido audio de Gemini (${base64.length} bytes)\n`,
          );
          client.emit(EGaiaLiveEvent.AUDIO_RESPONSE, {
            audio: base64,
            mimeType: 'audio/pcm;rate=24000',
          });
        },
        onText: (text, isFinal) => {
          console.log(
            `[LIVE onText] isFinal=${isFinal} texto="${text.substring(0, 50)}..."\n`,
          );
          client.emit(EGaiaLiveEvent.TEXT_RESPONSE, { text, isFinal });
        },
        onToolCall: async (name, args) => {
          console.log(
            `[LIVE onToolCall] tool="${name}" args=${JSON.stringify(args)}\n`,
          );
          const tool = toolMap.get(name);
          if (!tool) {
            console.log(`[LIVE onToolCall] ❌ Tool no encontrada: ${name}\n`);
            return { error: `Herramienta desconocida: ${name}` };
          }

          return RequestContext.create(this.orm.em, async () => {
            const result = await tool.execute(args, ctx);

            if (this.writeToolNames.includes(name)) {
              const pendingAction = result as IPendingAction;
              console.log(
                `[LIVE onToolCall] ✅ Write tool ejecutado, emitiendo PENDING_ACTION\n`,
              );
              client.emit(EGaiaLiveEvent.PENDING_ACTION, pendingAction);
              return { queued: true, humanSummary: pendingAction.humanSummary };
            }

            console.log(`[LIVE onToolCall] ✅ Read tool ejecutado\n`);
            return result;
          });
        },
        onTurnComplete: () => {
          console.log(`[LIVE onTurnComplete] Turno completado\n`);
          void this.handleTurnComplete(client, user.sub);
        },
        onError: (message) => {
          console.log(`[LIVE onError] ❌ ${message}\n`);
          client.emit(EGaiaLiveEvent.ERROR, { message });
        },
        onClose: () => {
          console.log(`[LIVE onClose] ⚠️  Gemini cerró la sesión\n`);
          const stillActive = this.sessions.has(client.id);
          this.sessions.delete(client.id);
          this.userSockets.delete(user.sub);
          if (stillActive && client.connected) {
            console.log(`[LIVE onClose] Notificando al cliente\n`);
            client.emit(EGaiaLiveEvent.ERROR, {
              message: 'La sesión de GaIA se cerró inesperadamente.',
            });
          }
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al crear sesión';
      console.log(`[LIVE] ❌ createLiveSession falló: ${msg}\n`);
      console.log(
        `[LIVE] Stack:`,
        err instanceof Error ? err.stack : String(err),
        '\n',
      );
      client.emit(EGaiaLiveEvent.ERROR, {
        message: 'No se pudo conectar con GaIA.',
      });
      return;
    }

    this.sessions.set(client.id, {
      liveSession,
      userId: user.sub,
      startedAt: new Date(),
    });
    this.userSockets.set(user.sub, client.id);
    console.log(`[LIVE] 4️⃣  ✅ Sesión Gemini lista — emitiendo READY\n`);
    client.emit(EGaiaLiveEvent.READY, {});
  }

  /**
   * Incrementa el uso de cuota al terminar un turno, notifica la cuota restante
   * y cierra la sesión si el usuario agotó sus interacciones.
   * Requiere RequestContext porque los métodos de QuotaService usan em.findOneOrFail
   * y los handlers WS no pasan por el middleware HTTP que forkea el EM automáticamente.
   */
  private async handleTurnComplete(
    client: Socket,
    userId: string,
  ): Promise<void> {
    console.log(`[LIVE handleTurnComplete] socket=${client.id}\n`);
    client.emit(EGaiaLiveEvent.TURN_COMPLETE, {});
    try {
      await RequestContext.create(this.orm.em, async () => {
        console.log(`[LIVE handleTurnComplete] Incrementando cuota...\n`);
        await this.quotaService.incrementUsage(userId);
        const remaining =
          await this.quotaService.getRemainingInteractions(userId);
        console.log(
          `[LIVE handleTurnComplete] Cuota: ${remaining.remaining}/${remaining.limit}\n`,
        );
        client.emit(EGaiaLiveEvent.QUOTA_UPDATE, {
          remaining: remaining.remaining,
          limit: remaining.limit,
          percentage: Math.round((remaining.remaining / remaining.limit) * 100),
        });

        if (remaining.remaining <= 0) {
          console.log(
            `[LIVE handleTurnComplete] ⚠️  Cuota agotada, cerrando sesión\n`,
          );
          client.emit(EGaiaLiveEvent.QUOTA_EXCEEDED, {});
          const session = this.sessions.get(client.id);
          if (session) {
            session.liveSession.close();
            this.sessions.delete(client.id);
            this.userSockets.delete(userId);
          }
        }
      });
    } catch (err) {
      console.log(
        `[LIVE handleTurnComplete] ❌ Error actualizar cuota:`,
        err,
        '\n',
      );
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(EGaiaLiveEvent.AUDIO)
  handleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { audio: string },
  ): void {
    const session = this.sessions.get(client.id);
    if (!session) {
      console.log(
        `[LIVE handleAudio] ⚠️  No hay sesión activa para socket ${client.id}\n`,
      );
      return;
    }
    console.log(
      `[LIVE handleAudio] Enviando audio a Gemini (${data.audio.length} bytes)\n`,
    );
    session.liveSession.sendAudio(data.audio);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(EGaiaLiveEvent.TEXT)
  handleText(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string },
  ): void {
    const session = this.sessions.get(client.id);
    if (!session) {
      console.log(
        `[LIVE handleText] ⚠️  No hay sesión activa para socket ${client.id}\n`,
      );
      return;
    }
    console.log(`[LIVE handleText] Enviando texto: "${data.text}"\n`);
    session.liveSession.sendText(data.text);
  }

  @SubscribeMessage(EGaiaLiveEvent.END)
  handleEnd(@ConnectedSocket() client: Socket): void {
    console.log(
      `[LIVE handleEnd] Cliente solicita colgar — socket=${client.id}\n`,
    );
    const session = this.sessions.get(client.id);
    if (!session) {
      console.log(`[LIVE handleEnd] ⚠️  No hay sesión activa\n`);
      return;
    }
    console.log(`[LIVE handleEnd] Cerrando sesión Gemini\n`);
    session.liveSession.close();
    this.sessions.delete(client.id);
    this.userSockets.delete(session.userId);
    console.log(`[LIVE handleEnd] ✅ Sesión cerrada\n`);
  }
}
