import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import {
  ILLMService,
  IGaiaHistoryEntry,
  IGaiaQueryClassification,
} from '../../domain/llm/llm.service.interface';
import { EGaiaQueryCategory } from '../../domain/gaia-query-category.enum';
import { GAIA_CLASSIFICATION_PROMPT } from '../../application/gaia-classification-prompt';

const CATEGORY_VALUES = Object.values(EGaiaQueryCategory);

@Injectable()
export class GeminiLLMService implements ILLMService, OnModuleInit {
  private client!: GoogleGenAI;
  private geminyModel: string = process.env.GEMINY_LLM_MODEL;

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
    const contents = [
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
