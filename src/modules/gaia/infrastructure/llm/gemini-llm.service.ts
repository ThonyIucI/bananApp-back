import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ILLMService, IGaiaHistoryEntry } from '../../domain/llm/llm.service.interface';

const GEMINI_MODEL_ID = 'gemini-2.5-flash-preview-05-20';

@Injectable()
export class GeminiLLMService implements ILLMService, OnModuleInit {
  private client!: GoogleGenAI;

  onModuleInit(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. GaIA cannot start.');
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
      model: GEMINI_MODEL_ID,
      systemInstruction: systemPrompt,
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('GaIA no está disponible en este momento. Intenta de nuevo.');
    }
    return text;
  }
}
