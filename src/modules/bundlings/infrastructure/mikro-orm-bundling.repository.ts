import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Bundling } from '../domain/bundling.entity';
import {
  IBundlingRepository,
  BundlingFilters,
} from '../domain/bundling.repository';

@Injectable()
export class MikroOrmBundlingRepository extends IBundlingRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<Bundling | null> {
    return this.em.findOne(
      Bundling,
      { id, deletedAt: null },
      { populate: ['plot', 'subPlot', 'enfundadorUser', 'ribbonCalendar'] },
    );
  }

  async findAll(
    filters: BundlingFilters = {},
  ): Promise<{ items: Bundling[]; total: number }> {
    const where: Record<string, unknown> = { deletedAt: null };

    const plotFilter: Record<string, unknown> = {};
    if (filters.cooperativeId) plotFilter['sector'] = { cooperative: { id: filters.cooperativeId } };
    if (filters.plotIds?.length) plotFilter['id'] = { $in: filters.plotIds };
    else if (filters.plotId) plotFilter['id'] = filters.plotId;
    if (Object.keys(plotFilter).length) where['plot'] = plotFilter;

    if (filters.subPlotId) where['subPlot'] = { id: filters.subPlotId };
    if (filters.enfundadorUserId)
      where['enfundadorUser'] = { id: filters.enfundadorUserId };
    if (filters.from || filters.to) {
      const dateFilter: Record<string, Date> = {};
      if (filters.from) dateFilter['$gte'] = filters.from;
      if (filters.to) dateFilter['$lte'] = filters.to;
      where['bundledAt'] = dateFilter;
    }

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [items, total] = await this.em.findAndCount(Bundling, where, {
      populate: ['plot', 'subPlot', 'enfundadorUser', 'ribbonCalendar'],
      orderBy: { bundledAt: 'DESC' },
      limit,
      offset,
    });

    return { items, total };
  }

  async sumQuantityByPlot(
    plotId: string,
    from?: Date,
    to?: Date,
  ): Promise<number> {
    const where: Record<string, unknown> = {
      plot: { id: plotId },
      deletedAt: null,
    };
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter['$gte'] = from;
      if (to) dateFilter['$lte'] = to;
      where['bundledAt'] = dateFilter;
    }
    const items = await this.em.find(Bundling, where, { fields: ['quantity'] });
    return items.reduce((sum, b) => sum + b.quantity, 0);
  }

  persist(bundling: Bundling): void {
    this.em.persist(bundling);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
