import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import { EntityManager } from '@mikro-orm/postgresql';
import { EGaiaPlan, User } from '../../../users/domain/user.entity';
import { GAIA_PLAN_LIMITS, TGaiaPlan } from '../../domain/gaia-plans';
import { GaiaTtsForbiddenException } from '../../domain/exceptions/gaia-tts-forbidden.exception';

/** Female Spanish voice with natural intonation. */
const TTS_VOICE = 'Kore';

/**
 * Synthesizes text to speech via the Gemini TTS API.
 * Only available to users on Pro or ProMax plans.
 */
@Injectable()
export class GeminiTtsService {
  private readonly client: GoogleGenAI;
  private geminyTTSModel: string = process.env.GEMINY_TTS_MODEL;
  constructor(private readonly em: EntityManager) {
    const apiKey = process.env.GEMINY_TTS_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINY_TTS_API_KEY environment variable is not set.');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  /** Returns base64-encoded audio and its MIME type for the given text. */
  async synthesize(
    text: string,
    userId: string,
  ): Promise<{ data: string; mimeType: string }> {
    const user = await this.em.findOneOrFail(User, { id: userId });
    const plan = (user.subscriptionTier ?? EGaiaPlan.FREE) as TGaiaPlan;

    if (GAIA_PLAN_LIMITS[plan].tts !== 'enhanced') {
      throw new GaiaTtsForbiddenException();
    }

    const response = await this.client.models.generateContent({
      model: this.geminyTTSModel,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: TTS_VOICE },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType ?? 'audio/pcm;rate=24000';

    if (!audioData) {
      throw new Error(
        'GaIA TTS no pudo generar audio en este momento. Intenta de nuevo.',
      );
    }

    return { data: audioData, mimeType };
  }
}
