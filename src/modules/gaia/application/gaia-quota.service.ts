import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IGaiaUsageRepository } from '../domain/gaia-usage.repository';
import { GAIA_PLAN_LIMITS, TGaiaPlan } from '../domain/gaia-plans';
import { GaiaQuotaExceededException } from '../domain/exceptions/gaia-quota-exceeded.exception';
import { User } from '../../users/domain/user.entity';

const getTodayIso = (): string => new Date().toISOString().split('T')[0];

@Injectable()
export class GaiaQuotaService {
  constructor(
    private readonly usageRepo: IGaiaUsageRepository,
    private readonly em: EntityManager,
  ) {}

  /**
   * Lanza GaiaQuotaExceededException si el usuario ya superó su límite diario.
   */
  async assertWithinQuota(userId: string): Promise<void> {
    const user = await this.em.findOneOrFail(User, { id: userId });
    const plan = (user.subscriptionTier ?? 'free') as TGaiaPlan;
    const limit = GAIA_PLAN_LIMITS[plan].dailyInteractions;

    const today = getTodayIso();
    const usage = await this.usageRepo.getUsageForDate(userId, today);
    const count = usage?.interactionCount ?? 0;

    if (count >= limit) {
      throw new GaiaQuotaExceededException();
    }
  }

  /** Incrementa el contador de interacciones del día actual. */
  async incrementUsage(userId: string): Promise<void> {
    await this.usageRepo.incrementUsage(userId, getTodayIso());
  }

  /** Devuelve las interacciones restantes del día. */
  async getRemainingInteractions(userId: string): Promise<{ remaining: number; limit: number }> {
    const user = await this.em.findOneOrFail(User, { id: userId });
    const plan = (user.subscriptionTier ?? 'free') as TGaiaPlan;
    const limit = GAIA_PLAN_LIMITS[plan].dailyInteractions;

    const today = getTodayIso();
    const usage = await this.usageRepo.getUsageForDate(userId, today);
    const count = usage?.interactionCount ?? 0;

    return { remaining: Math.max(0, limit - count), limit };
  }
}
