import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  UseGuards,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import {
  ILLMService,
  ILLM_SERVICE,
  ILiveSession,
} from '../../domain/llm/llm.service.interface';
import { GaiaQuotaService } from '../../application/gaia-quota.service';
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
import type { IGaiaTool, IGaiaToolContext, IPendingAction } from '../../tools/gaia-tool.types';
import type { JwtPayload } from '../../../auth/infrastructure/jwt.strategy';

interface IActiveSession {
  liveSession: ILiveSession;
  userId: string;
  startedAt: Date;
}

@WebSocketGateway({
  namespace: '/gaia-live',
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
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
  @SubscribeMessage('live:start')
  async handleStart(@ConnectedSocket() client: Socket): Promise<void> {
    const user = client.data.user as JwtPayload;

    // Close any existing session for this user (1 active session per user)
    const existingSocketId = this.userSockets.get(user.sub);
    if (existingSocketId && existingSocketId !== client.id) {
      const existing = this.sessions.get(existingSocketId);
      if (existing) {
        existing.liveSession.close();
        this.sessions.delete(existingSocketId);
      }
    }

    try {
      await this.quotaService.assertWithinQuota(user.sub);
    } catch {
      client.emit('live:quota_exceeded', {});
      return;
    }

    const ctx: IGaiaToolContext = { currentUser: user };
    const toolMap = new Map(this.allTools.map((t) => [t.name, t]));

    const liveSession = await this.llm.createLiveSession({
      systemPrompt: GAIA_SYSTEM_PROMPT,
      tools: toFunctionDeclarations(this.allTools),
      onAudio: (base64) => {
        client.emit('live:audio_response', { audio: base64, mimeType: 'audio/pcm;rate=24000' });
      },
      onText: (text, isFinal) => {
        client.emit('live:text_response', { text, isFinal });
      },
      onToolCall: async (name, args) => {
        const tool = toolMap.get(name);
        if (!tool) return { error: `Herramienta desconocida: ${name}` };

        const result = await tool.execute(args, ctx);

        if (this.writeToolNames.includes(name)) {
          const pendingAction = result as IPendingAction;
          client.emit('live:pending_action', pendingAction);
          return { queued: true, humanSummary: pendingAction.humanSummary };
        }

        return result;
      },
      onTurnComplete: async () => {
        client.emit('live:turn_complete', {});
        try {
          await this.quotaService.incrementUsage(user.sub);
          const remaining = await this.quotaService.getRemainingInteractions(user.sub);
          client.emit('live:quota_update', {
            remaining: remaining.remaining,
            limit: remaining.limit,
            percentage: Math.round((remaining.remaining / remaining.limit) * 100),
          });

          if (remaining.remaining <= 0) {
            client.emit('live:quota_exceeded', {});
            const session = this.sessions.get(client.id);
            if (session) {
              session.liveSession.close();
              this.sessions.delete(client.id);
              this.userSockets.delete(user.sub);
            }
          }
        } catch (err) {
          this.logger.error('Error updating quota', err);
        }
      },
      onError: (message) => {
        client.emit('live:error', { message });
      },
      onClose: () => {
        this.sessions.delete(client.id);
        this.userSockets.delete(user.sub);
      },
    });

    this.sessions.set(client.id, { liveSession, userId: user.sub, startedAt: new Date() });
    this.userSockets.set(user.sub, client.id);
    this.logger.log(`Live session started for user ${user.sub}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('live:audio')
  handleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { audio: string },
  ): void {
    const session = this.sessions.get(client.id);
    if (!session) return;
    session.liveSession.sendAudio(data.audio);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('live:text')
  handleText(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string },
  ): void {
    const session = this.sessions.get(client.id);
    if (!session) return;
    session.liveSession.sendText(data.text);
  }

  @SubscribeMessage('live:end')
  handleEnd(@ConnectedSocket() client: Socket): void {
    const session = this.sessions.get(client.id);
    if (!session) return;
    session.liveSession.close();
    this.sessions.delete(client.id);
    this.userSockets.delete(session.userId);
    this.logger.log(`Live session ended by client: ${client.id}`);
  }
}
