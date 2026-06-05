import { EGaiaQueryCategory } from '../gaia-query-category.enum';
import type { FunctionDeclaration } from '@google/genai';
import type {
  IGaiaToolContext,
  IPendingAction,
} from '../../tools/gaia-tool.types';

export interface IGaiaHistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

export interface IGaiaQueryClassification {
  category: EGaiaQueryCategory;
  topic: string | null;
  summary: string;
}

export interface IGaiaMessageResponse {
  text: string;
  pendingAction: IPendingAction | null;
}

export interface IGaiaLiveSessionOptions {
  systemPrompt: string;
  tools: FunctionDeclaration[];
  /** Optional compact context block appended to systemPrompt (plots + task schemas). */
  userContextBlock?: string;
  onAudio: (base64: string) => void;
  onText: (text: string, isFinal: boolean) => void;
  /** Called when the model requests a tool call. Return the result as a JSON-serializable value. */
  onToolCall: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  onTurnComplete: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export interface ILiveSession {
  sendAudio(base64Pcm16: string): void;
  sendText(text: string): void;
  close(): void;
}

export interface ILLMService {
  /** Envía un turno de conversación y devuelve la respuesta textual del modelo. */
  chat(params: {
    systemPrompt: string;
    history: IGaiaHistoryEntry[];
    userMessage: string;
  }): Promise<string>;

  /**
   * Igual que chat() pero con soporte de function calling.
   * Los read tools se ejecutan automáticamente (hasta MAX_TOOL_ITERATIONS).
   * Los write tools devuelven un pendingAction sin persistir.
   */
  chatWithTools(params: {
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
  }): Promise<IGaiaMessageResponse>;

  /**
   * Crea una sesión de Gemini Live para conversación de voz en tiempo real.
   * Retorna un wrapper limpio sobre la sesión de la SDK.
   */
  createLiveSession(options: IGaiaLiveSessionOptions): Promise<ILiveSession>;

  /**
   * Clasifica un mensaje de usuario en categoría, tema libre y resumen de una frase.
   * Usa structured output JSON para garantizar la forma de la respuesta.
   */
  classifyQuery(text: string): Promise<IGaiaQueryClassification>;
}

export const ILLM_SERVICE = Symbol('ILLMService');
