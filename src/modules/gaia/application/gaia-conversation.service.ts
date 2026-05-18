import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { uuidv7 } from 'uuidv7';
import {
  ILLMService,
  IGaiaHistoryEntry,
  ILLM_SERVICE,
} from '../domain/llm/llm.service.interface';
import { GAIA_PLAN_LIMITS, TGaiaPlan } from '../domain/gaia-plans';
import { GAIA_SYSTEM_PROMPT } from './gaia-system-prompt';
import { GaiaQuotaService } from './gaia-quota.service';
import { EGaiaPlan, User } from '../../users/domain/user.entity';
import { GaiaUsage } from '../domain/gaia-usage.entity';
import { GaiaQuery } from '../domain/gaia-query.entity';
import {
  GAIA_MESSAGE_PROCESSED,
  GaiaMessageProcessedEvent,
} from '../domain/events/gaia-message-processed.event';

export interface GaiaConversationResult {
  reply: { text: string };
  pendingAction: null;
  queryId: string | null;
  usage: { remaining: number; limit: number };
}

@Injectable()
export class GaiaConversationService {
  constructor(
    @Inject(ILLM_SERVICE) private readonly llm: ILLMService,
    private readonly quotaService: GaiaQuotaService,
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Procesa un mensaje del usuario, verifica la cuota, llama al LLM y persiste
   * un registro analítico. La cuota y el registro se guardan en una transacción
   * atómica: o ambos persisten o ninguno (sin residuos ante fallo de DB).
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

    const queryId = uuidv7();
    const today = new Date().toISOString().split('T')[0];

    // Persist usage increment + minimal GaiaQuery atomically.
    // Inline usage logic to share the txEm with the GaiaQuery insert.
    await this.em.transactional(async (txEm) => {
      const usage = await txEm.findOne(GaiaUsage, {
        user: { id: userId },
        usageDate: today,
      });
      if (!usage) {
        const newUsage = txEm.create(GaiaUsage, {
          id: uuidv7(),
          user: txEm.getReference(User, userId),
          usageDate: today,
          interactionCount: 1,
          tokenEstimate: null,
        });
        txEm.persist(newUsage);
      } else {
        usage.interactionCount += 1;
      }

      const query = txEm.create(GaiaQuery, {
        id: queryId,
        user: txEm.getReference(User, userId),
      });
      txEm.persist(query);
    });

    // Clear EM identity map so getRemainingInteractions reads fresh data from DB
    this.em.clear();

    this.eventEmitter.emit(
      GAIA_MESSAGE_PROCESSED,
      new GaiaMessageProcessedEvent({ queryId, text }),
    );

    const usage = await this.quotaService.getRemainingInteractions(userId);

    return {
      reply: { text: replyText },
      pendingAction: null,
      queryId,
      usage,
    };
  }
}
