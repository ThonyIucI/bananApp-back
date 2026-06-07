import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { FieldTask } from '../entities/field-task.entity';
import {
  IFieldTaskRepository,
  TFieldTaskFilters,
} from './field-task.repository';

@Injectable()
export class MikroOrmFieldTaskRepository extends IFieldTaskRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<FieldTask | null> {
    return this.em.findOne(
      FieldTask,
      { id, deletedAt: null },
      {
        populate: [
          'plot',
          'subPlot',
          'taskType',
          'taskType.detailSchemas',
          'taskType.detailSchemas.detailOptions',
          'performedByUser',
          'details',
        ],
      },
    );
  }

  findAll({
    plotId,
    plotIds,
    subPlotId,
    taskTypeKey,
    from,
    to,
    limit,
    offset,
  }: TFieldTaskFilters = {}): Promise<[FieldTask[], number]> {
    const where: Record<string, unknown> = { deletedAt: null };

    const resolvedPlotIds = Array.isArray(plotIds) ? plotIds : [];
    if (resolvedPlotIds.length > 0) {
      where['plot'] = { id: { $in: resolvedPlotIds } };
    } else if (plotId) {
      where['plot'] = { id: plotId };
    }

    if (subPlotId) where['subPlot'] = { id: subPlotId };
    if (taskTypeKey) where['taskType'] = { key: taskTypeKey };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter['$gte'] = from;
      if (to) dateFilter['$lte'] = to;
      where['performedAt'] = dateFilter;
    }

    return this.em.findAndCount(FieldTask, where, {
      populate: ['plot', 'taskType', 'details'],
      orderBy: { performedAt: 'DESC' },
      limit,
      offset,
    });
  }

  persist(task: FieldTask): void {
    this.em.persist(task);
  }

  persistDetails(task: FieldTask): void {
    for (const detail of task.details.getItems()) {
      this.em.persist(detail);
    }
  }

  remove(task: FieldTask): void {
    task.deletedAt = new Date();
    this.em.persist(task);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
