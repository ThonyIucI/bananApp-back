import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { GaiaUsage } from '../../domain/gaia-usage.entity';
import { IGaiaUsageRepository } from '../../domain/gaia-usage.repository';
import { User } from '../../../users/domain/user.entity';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class MikroOrmGaiaUsageRepository extends IGaiaUsageRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async getUsageForDate(userId: string, date: string): Promise<GaiaUsage | null> {
    return this.em.findOne(GaiaUsage, {
      user: { id: userId },
      usageDate: date,
    });
  }

  async incrementUsage(userId: string, date: string): Promise<GaiaUsage> {
    let usage = await this.getUsageForDate(userId, date);

    if (!usage) {
      usage = this.em.create(GaiaUsage, {
        id: uuidv7(),
        user: this.em.getReference(User, userId),
        usageDate: date,
        interactionCount: 1,
        tokenEstimate: null,
      });
      this.em.persist(usage);
    } else {
      usage.interactionCount += 1;
    }

    await this.em.flush();
    return usage;
  }
}
