import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Plot } from '../domain/plot.entity';
import { IPlotRepository, PlotFilters } from '../domain/plot.repository';
import { UserPlot } from '../domain/user-plot.entity';

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
    if (filters.workerUserId) where['workerUser'] = { id: filters.workerUserId };
    if (filters.cooperativeId)
      where['sector'] = { cooperative: { id: filters.cooperativeId } };

    if (filters.assignedUserId) {
      const assignments = await this.em.find(UserPlot, {
        user: { id: filters.assignedUserId },
        unassignedAt: null,
        deletedAt: null,
      });
      const plotIds = assignments.map(
        (a) => (a.plot as unknown as { id: string }).id,
      );
      where['id'] = { $in: plotIds };
    }

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
