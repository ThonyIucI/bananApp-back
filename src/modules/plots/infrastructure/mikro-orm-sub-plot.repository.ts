import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SubPlot } from '../domain/sub-plot.entity';
import { ISubPlotRepository } from '../domain/sub-plot.repository';

@Injectable()
export class MikroOrmSubPlotRepository extends ISubPlotRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<SubPlot | null> {
    return this.em.findOne(
      SubPlot,
      { id, deletedAt: null },
      { populate: ['plot', 'responsibleUser'] },
    );
  }

  findByPlot(plotId: string): Promise<SubPlot[]> {
    return this.em.find(
      SubPlot,
      { plot: { id: plotId }, deletedAt: null },
      { populate: ['responsibleUser'], orderBy: { name: 'ASC' } },
    );
  }

  async sumAreaByPlot(plotId: string): Promise<number> {
    const subPlots = await this.em.find(SubPlot, {
      plot: { id: plotId },
      deletedAt: null,
    });
    return subPlots.reduce(
      (sum, m) => sum + parseFloat(m.areaHectares as unknown as string),
      0,
    );
  }

  persist(subPlot: SubPlot): void {
    this.em.persist(subPlot);
  }

  remove(subPlot: SubPlot): void {
    this.em.remove(subPlot);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
