import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { GaiaQuery } from '../domain/gaia-query.entity';
import { EGaiaQueryFeedback } from '../domain/gaia-query-feedback.enum';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class GaiaFeedbackService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Registra el feedback del usuario (útil / no útil) sobre una respuesta de GaIA.
   * Lanza NotFoundException si el queryId no corresponde al usuario autenticado.
   */
  async submitFeedback({
    queryId,
    userId,
    helpful,
  }: {
    queryId: string;
    userId: string;
    helpful: boolean;
  }): Promise<void> {
    const query = await this.em.findOne(GaiaQuery, {
      id: queryId,
      user: { id: userId },
    });

    if (!query) {
      throw new NotFoundException('Consulta no encontrada');
    }

    query.feedback = helpful ? EGaiaQueryFeedback.HELPFUL : EGaiaQueryFeedback.NOT_HELPFUL;
    query.feedbackAt = new Date();

    await this.em.flush();
  }
}
