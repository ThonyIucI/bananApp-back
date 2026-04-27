import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Bundling } from '../domain/bundling.entity';

export interface HarvestPredictionQuery {
  cooperativeId?: string;
  plotId?: string;
}

export type MaturityStatus = 'green' | 'yellow' | 'red';

export interface HarvestWindow {
  plotId: string;
  plotName: string;
  weekStart: string;
  weekEnd: string;
  estimatedBunches: number;
  maturityStatus: MaturityStatus;
  weeksRemaining: number;
}

export interface HarvestPredictionResult {
  predictions: HarvestWindow[];
}

const HARVEST_WEEKS_MIN = 11;
const HARVEST_WEEKS_MAX = 12;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getMaturityStatus(weeksRemaining: number): MaturityStatus {
  if (weeksRemaining > 4) return 'green';
  if (weeksRemaining >= 2) return 'yellow';
  return 'red';
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

@Injectable()
export class HarvestPredictionHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(
    query: HarvestPredictionQuery,
  ): Promise<HarvestPredictionResult> {
    const now = new Date();
    // Only consider bundlings that haven't reached the max harvest window yet
    const cutoffDate = new Date(
      now.getTime() - HARVEST_WEEKS_MAX * MS_PER_WEEK,
    );

    const where: Record<string, unknown> = {
      deletedAt: null,
      bundledAt: { $gte: cutoffDate },
    };

    if (query.plotId) where['plot'] = { id: query.plotId };
    if (query.cooperativeId)
      where['plot'] = { sector: { cooperative: { id: query.cooperativeId } } };

    const bundlings = await this.em.find(Bundling, where, {
      populate: ['plot'],
      fields: ['quantity', 'bundledAt', 'plot'],
    });

    // Group by plot + harvest week window
    const windowMap = new Map<string, HarvestWindow>();

    for (const b of bundlings) {
      const harvestStart = new Date(
        b.bundledAt.getTime() + HARVEST_WEEKS_MIN * MS_PER_WEEK,
      );
      const harvestEnd = new Date(
        b.bundledAt.getTime() + HARVEST_WEEKS_MAX * MS_PER_WEEK,
      );
      const weekStartStr = toDateString(harvestStart);
      const key = `${b.plot.id}::${weekStartStr}`;

      const msRemaining = harvestStart.getTime() - now.getTime();
      const weeksRemaining = Math.ceil(msRemaining / MS_PER_WEEK);

      const existing = windowMap.get(key);
      if (existing) {
        existing.estimatedBunches += b.quantity;
      } else {
        windowMap.set(key, {
          plotId: b.plot.id,
          plotName: b.plot.name,
          weekStart: weekStartStr,
          weekEnd: toDateString(harvestEnd),
          estimatedBunches: b.quantity,
          maturityStatus: getMaturityStatus(weeksRemaining),
          weeksRemaining,
        });
      }
    }

    const predictions = [...windowMap.values()].sort((a, b) =>
      a.weekStart.localeCompare(b.weekStart),
    );

    return { predictions };
  }
}
