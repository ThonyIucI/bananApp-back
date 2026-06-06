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

  findAll(filters: TFieldTaskFilters = {}): Promise<[FieldTask[], number]> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.plotId) where['plot'] = { id: filters.plotId };
    if (filters.subPlotId) where['subPlot'] = { id: filters.subPlotId };
    if (filters.taskTypeKey) where['taskType'] = { key: filters.taskTypeKey };
    if (filters.performedByUserId)
      where['performedByUser'] = { id: filters.performedByUserId };

    if (filters.from || filters.to) {
      const dateFilter: Record<string, Date> = {};
      if (filters.from) dateFilter['$gte'] = filters.from;
      if (filters.to) dateFilter['$lte'] = filters.to;
      where['performedAt'] = dateFilter;
    }

    return this.em.findAndCount(FieldTask, where, {
      populate: ['plot', 'taskType', 'details'],
      orderBy: { performedAt: 'DESC' },
      limit: filters.limit,
      offset: filters.offset,
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
