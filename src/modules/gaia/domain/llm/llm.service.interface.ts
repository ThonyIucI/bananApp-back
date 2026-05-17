export interface IGaiaHistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

export interface ILLMService {
  /** Envía un turno de conversación y devuelve la respuesta textual del modelo. */
  chat(params: {
    systemPrompt: string;
    history: IGaiaHistoryEntry[];
    userMessage: string;
  }): Promise<string>;
}

export const ILLM_SERVICE = Symbol('ILLMService');
