import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  ILLMService,
  IGaiaHistoryEntry,
  ILLM_SERVICE,
} from '../domain/llm/llm.service.interface';
import { GAIA_PLAN_LIMITS, TGaiaPlan } from '../domain/gaia-plans';
import { GAIA_SYSTEM_PROMPT } from './gaia-system-prompt';
import { GaiaQuotaService } from './gaia-quota.service';
import { EGaiaPlan, User } from '../../users/domain/user.entity';

export interface GaiaConversationResult {
  reply: { text: string };
  pendingAction: null;
  usage: { remaining: number; limit: number };
}

@Injectable()
export class GaiaConversationService {
  constructor(
    @Inject(ILLM_SERVICE) private readonly llm: ILLMService,
    private readonly quotaService: GaiaQuotaService,
    private readonly em: EntityManager,
  ) {}

  /**
   * Procesa un mensaje del usuario, verifica la cuota y devuelve la respuesta de GaIA.
   * El historial se recorta según el plan del usuario antes de enviarse al LLM.
   */
  async handleMessage({
    userId,
    text,
    history,
  }: {
    userId: string;
    text: string;
    history: IGaiaHistoryEntry[];
  }): Promise<GaiaConversationResult> {
    await this.quotaService.assertWithinQuota(userId);

    const user = await this.em.findOneOrFail(User, { id: userId });
    const plan = (user.subscriptionTier ?? EGaiaPlan.FREE) as TGaiaPlan;
    const maxContext = GAIA_PLAN_LIMITS[plan].contextMessages;
    const trimmedHistory = history.slice(-maxContext);

    const replyText = await this.llm.chat({
      systemPrompt: GAIA_SYSTEM_PROMPT,
      history: trimmedHistory,
      userMessage: text,
    });

    await this.quotaService.incrementUsage(userId);

    const usage = await this.quotaService.getRemainingInteractions(userId);

    return {
      reply: { text: replyText },
      pendingAction: null,
      usage,
    };
  }
}
