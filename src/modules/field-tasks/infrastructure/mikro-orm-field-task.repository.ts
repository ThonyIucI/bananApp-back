import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { FieldTask } from '../domain/field-task.entity';
import {
  IFieldTaskRepository,
  TFieldTaskFilters,
} from '../domain/field-task.repository';

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

  async findAll(
    filters: TFieldTaskFilters = {},
  ): Promise<{ items: FieldTask[]; total: number }> {
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

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [items, total] = await this.em.findAndCount(FieldTask, where, {
      populate: ['plot', 'subPlot', 'taskType', 'performedByUser', 'details'],
      orderBy: { performedAt: 'DESC' },
      limit,
      offset,
    });

    return { items, total };
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
