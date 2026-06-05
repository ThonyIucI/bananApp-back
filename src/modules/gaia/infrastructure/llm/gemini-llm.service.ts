import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import type {
  FunctionDeclaration,
  Content,
  LiveServerMessage,
  Session,
} from '@google/genai';
import {
  ILLMService,
  IGaiaHistoryEntry,
  IGaiaQueryClassification,
  IGaiaMessageResponse,
  IGaiaLiveSessionOptions,
  ILiveSession,
} from '../../domain/llm/llm.service.interface';
import { EGaiaQueryCategory } from '../../domain/gaia-query-category.enum';
import { GAIA_CLASSIFICATION_PROMPT } from '../../application/gaia-classification-prompt';
import type { IGaiaToolContext } from '../../tools/gaia-tool.types';

const CATEGORY_VALUES = Object.values(EGaiaQueryCategory);
const MAX_TOOL_ITERATIONS = 3;

@Injectable()
export class GeminiLLMService implements ILLMService, OnModuleInit {
  private readonly logger = new Logger(GeminiLLMService.name);
  private client!: GoogleGenAI;
  private geminyModel: string = process.env.GEMINY_LLM_MODEL;
  private geminyLiveModel: string = process.env.GEMINY_LIVE_MODEL;

  onModuleInit(): void {
    const apiKey = process.env.GEMINY_LLM_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINY_LLM_API_KEY environment variable is not set. GaIA cannot start.',
      );
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async chat({
    systemPrompt,
    history,
    userMessage,
  }: {
    systemPrompt: string;
    history: IGaiaHistoryEntry[];
    userMessage: string;
  }): Promise<string> {
    const contents: Content[] = [
      ...history.map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await this.client.models.generateContent({
      model: this.geminyModel,
      contents,
      config: { systemInstruction: systemPrompt },
    });

    const text = response.text;
    if (!text) {
      throw new Error(
        'GaIA no está disponible en este momento. Intenta de nuevo.',
      );
    }
    return text;
  }

  /**
   * Chat con soporte de function calling.
   * Itera hasta MAX_TOOL_ITERATIONS ejecutando read tools automáticamente.
   * Write tools devuelven pendingAction sin persistir.
   */
  async chatWithTools({
    systemPrompt,
    history,
    userMessage,
    toolDeclarations,
    toolExecutor,
    ctx,
    writeToolNames,
  }: {
    systemPrompt: string;
    history: IGaiaHistoryEntry[];
    userMessage: string;
    toolDeclarations: FunctionDeclaration[];
    toolExecutor: (
      name: string,
      args: Record<string, unknown>,
      ctx: IGaiaToolContext,
    ) => Promise<unknown>;
    ctx: IGaiaToolContext;
    writeToolNames: string[];
  }): Promise<IGaiaMessageResponse> {
    const contents: Content[] = [
      ...history.map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await this.client.models.generateContent({
        model: this.geminyModel,
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools:
            toolDeclarations.length > 0
              ? [{ functionDeclarations: toolDeclarations }]
              : undefined,
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];

      const functionCallParts = parts.filter((p) => p.functionCall);

      if (functionCallParts.length === 0) {
        const text = response.text ?? '';
        return { text, pendingAction: null };
      }

      const fc = functionCallParts[0].functionCall;
      const toolName = fc.name ?? '';
      const toolArgs = fc.args ?? {};

      if (writeToolNames.includes(toolName)) {
        const result = await toolExecutor(toolName, toolArgs, ctx);
        const pendingAction =
          result as import('../../tools/gaia-tool.types').IPendingAction;
        return { text: pendingAction.humanSummary, pendingAction };
      }

      const toolResult = await toolExecutor(toolName, toolArgs, ctx).catch(
        (err: unknown) => {
          this.logger.error(`Tool "${toolName}" failed`, err);
          return { error: 'No se pudo obtener la información.' };
        },
      );

      contents.push(
        { role: 'model', parts: [{ functionCall: fc }] },
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: { result: toolResult },
              },
            },
          ],
        },
      );
    }

    throw new Error('GaIA alcanzó el límite de iteraciones de herramientas.');
  }

  /**
   * Crea una sesión de Gemini Live para conversación de voz en tiempo real.
   */
  async createLiveSession(
    options: IGaiaLiveSessionOptions,
  ): Promise<ILiveSession> {
    const { systemPrompt, tools, onError, onClose } = options;

    console.log(
      `[GEMINI] 🔌 Conectando a live session... modelo=${this.geminyLiveModel}\n`,
    );
    console.log(`[GEMINI] Tools disponibles: ${tools.length}\n`);

    const session = await this.client.live.connect({
      model: this.geminyLiveModel,
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: {
          parts: [
            {
              text: options.userContextBlock
                ? `${systemPrompt}\n\n${options.userContextBlock}`
                : systemPrompt,
            },
          ],
        },
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      },
      callbacks: {
        onopen: () => {
          console.log(`[GEMINI] ✅ Session ABIERTA (onopen)\n`);
        },
        onmessage: (message) => {
          console.log(`[GEMINI] 📨 Mensaje recibido (onmessage)\n`);
          void this.handleLiveMessage(message, session, options);
        },
        onerror: (err) => {
          console.log(`[GEMINI] ❌ Error en sesión:`, err, '\n');
          onError('Error de conexión con GaIA.');
        },
        onclose: (e: any) => {
          console.log(
            e,
            `[GEMINI] 🔌 Session CERRADA (onclose) — code=${e?.code} reason="${e?.reason}" wasClean=${e?.wasClean}\n`,
          );
          onClose();
        },
      },
    });

    console.log(`[GEMINI] ✅ Session creada y conectada\n`);

    return {
      sendAudio: (base64Pcm16: string) => {
        session.sendRealtimeInput({
          audio: { data: base64Pcm16, mimeType: 'audio/pcm;rate=16000' },
        });
      },
      sendText: (text: string) => {
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        });
      },
      close: () => {
        session.close();
      },
    };
  }

  /**
   * Procesa cada mensaje entrante de la sesión Live: emite texto/audio al cliente,
   * señala el fin de turno y resuelve las tool calls solicitadas por el modelo.
   */
  private async handleLiveMessage(
    message: LiveServerMessage,
    session: Session,
    options: IGaiaLiveSessionOptions,
  ): Promise<void> {
    const { onAudio, onText, onToolCall, onTurnComplete, onError } = options;
    try {
      if (message.serverContent?.modelTurn?.parts) {
        console.log(
          `[GEMINI handleLiveMessage] modelTurn con ${message.serverContent.modelTurn.parts.length} parts\n`,
        );
        for (const part of message.serverContent.modelTurn.parts) {
          if (part.text) {
            console.log(
              `[GEMINI handleLiveMessage] 📝 Text: "${part.text.substring(0, 50)}..."\n`,
            );
            onText(part.text, false);
          }
          if (part.inlineData?.data) {
            console.log(
              `[GEMINI handleLiveMessage] 🔊 Audio: ${part.inlineData.data.length} bytes\n`,
            );
            onAudio(part.inlineData.data);
          }
        }
      }

      if (message.serverContent?.turnComplete) {
        console.log(`[GEMINI handleLiveMessage] 🔄 turnComplete\n`);
        onTurnComplete();
      }

      if (message.toolCall?.functionCalls) {
        console.log(
          `[GEMINI handleLiveMessage] 🛠️  ${message.toolCall.functionCalls.length} tool calls\n`,
        );
        for (const fc of message.toolCall.functionCalls) {
          console.log(
            `[GEMINI handleLiveMessage] → Ejecutando tool: ${fc.name}\n`,
          );
          const result = await onToolCall(fc.name ?? '', fc.args ?? {});
          console.log(
            `[GEMINI handleLiveMessage] → Tool result: ${JSON.stringify(result).substring(0, 50)}\n`,
          );
          session.sendToolResponse({
            functionResponses: [
              {
                id: fc.id ?? fc.name ?? '',
                name: fc.name ?? '',
                response: { result },
              },
            ],
          });
        }
      }
    } catch (err) {
      console.log(`[GEMINI handleLiveMessage] ❌ Error:`, err, '\n');
      onError('Error interno al procesar respuesta de GaIA.');
    }
  }

  /**
   * Clasifica el mensaje del usuario en una categoría agrícola, tema libre y resumen.
   * Usa structured output JSON de Gemini para garantizar la forma de la respuesta.
   * Ante cualquier fallo devuelve GENERAL como fallback sin lanzar excepción.
   */
  async classifyQuery(text: string): Promise<IGaiaQueryClassification> {
    try {
      const response = await this.client.models.generateContent({
        model: this.geminyModel,
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: GAIA_CLASSIFICATION_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: CATEGORY_VALUES },
              topic: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
            required: ['category', 'summary'],
          },
        },
      });

      const json = response.text;
      if (!json) return this.fallbackClassification(text);

      const parsed = JSON.parse(json) as {
        category?: string;
        topic?: string;
        summary?: string;
      };

      const category = CATEGORY_VALUES.includes(
        parsed.category as EGaiaQueryCategory,
      )
        ? (parsed.category as EGaiaQueryCategory)
        : EGaiaQueryCategory.GENERAL;

      return {
        category,
        topic: parsed.topic?.slice(0, 120) ?? null,
        summary: (parsed.summary ?? '').slice(0, 300),
      };
    } catch {
      return this.fallbackClassification(text);
    }
  }

  private fallbackClassification(text: string): IGaiaQueryClassification {
    return {
      category: EGaiaQueryCategory.GENERAL,
      topic: null,
      summary: text.slice(0, 300),
    };
  }
}
