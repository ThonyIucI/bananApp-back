import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  ILLM_SERVICE,
  ILLMService,
} from '../domain/llm/llm.service.interface';
import {
  GAIA_MESSAGE_PROCESSED,
  GaiaMessageProcessedEvent,
} from '../domain/events/gaia-message-processed.event';
import { GaiaQuery } from '../domain/gaia-query.entity';

@Injectable()
export class GaiaQueryAnalyticsListener {
  private readonly logger = new Logger(GaiaQueryAnalyticsListener.name);

  constructor(
    @Inject(ILLM_SERVICE) private readonly llm: ILLMService,
    private readonly em: EntityManager,
  ) {}

  /**
   * Clasifica la consulta del usuario en background y actualiza el GaiaQuery con
   * categoría, tema libre y resumen. El fallo de clasificación nunca afecta al chat.
   */
  @OnEvent(GAIA_MESSAGE_PROCESSED, { async: true })
  async handle(event: GaiaMessageProcessedEvent): Promise<void> {
    const forkedEm = this.em.fork();
    try {
      const classification = await this.llm.classifyQuery(event.text);
      const query = await forkedEm.findOne(GaiaQuery, { id: event.queryId });
      if (!query) return;

      query.category = classification.category;
      query.topic = classification.topic;
      query.summary = classification.summary;

      await forkedEm.flush();
    } catch (err) {
      this.logger.error(
        `GaiaQueryAnalytics: classification failed for query ${event.queryId}`,
        err,
      );
    }
  }
}
