import { EGaiaQueryCategory } from '../gaia-query-category.enum';

export interface IGaiaHistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

export interface IGaiaQueryClassification {
  category: EGaiaQueryCategory;
  topic: string | null;
  summary: string;
}

export interface ILLMService {
  /** Envía un turno de conversación y devuelve la respuesta textual del modelo. */
  chat(params: {
    systemPrompt: string;
    history: IGaiaHistoryEntry[];
    userMessage: string;
  }): Promise<string>;

  /**
   * Clasifica un mensaje de usuario en categoría, tema libre y resumen de una frase.
   * Usa structured output JSON para garantizar la forma de la respuesta.
   */
  classifyQuery(text: string): Promise<IGaiaQueryClassification>;
}

export const ILLM_SERVICE = Symbol('ILLMService');
