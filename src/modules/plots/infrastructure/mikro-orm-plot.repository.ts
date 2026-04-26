import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Plot } from '../domain/plot.entity';
import { IPlotRepository, PlotFilters } from '../domain/plot.repository';

const PLOT_POPULATE = [
  'sector',
  'ownerUser',
  'workerUser',
  'subPlots',
] as const;

@Injectable()
export class MikroOrmPlotRepository extends IPlotRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<Plot | null> {
    return this.em.findOne(
      Plot,
      { id, deletedAt: null },
      { populate: PLOT_POPULATE },
    );
  }

  async findAll(
    filters: PlotFilters = {},
  ): Promise<{ items: Plot[]; total: number }> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.sectorId) where['sector'] = { id: filters.sectorId };
    if (filters.ownerUserId) where['ownerUser'] = { id: filters.ownerUserId };
    if (filters.workerUserId)
      where['workerUser'] = { id: filters.workerUserId };
    // cooperativeId overrides sectorId when both are present
    if (filters.cooperativeId)
      where['sector'] = { cooperative: { id: filters.cooperativeId } };

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [items, total] = await this.em.findAndCount(Plot, where, {
      populate: PLOT_POPULATE,
      orderBy: { name: 'ASC' },
      limit,
      offset,
      fields: [
        'name',
        'areaHectares',
        'sector.name',
        'ownerUser.id',
        'ownerUser.firstName',
        'ownerUser.lastName',
        'subPlots.id',
      ] as const,
    });
    console.log({ items });

    return { items: items as unknown as Plot[], total };
  }

  persist(plot: Plot): void {
    this.em.persist(plot);
  }

  persistMany(plots: Plot[]): void {
    plots.forEach((p) => this.em.persist(p));
  }

  remove(plot: Plot): void {
    this.em.remove(plot);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
