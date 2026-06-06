import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TaskType } from '../entities/task-type.entity';
import { ITaskTypeRepository } from './task-type.repository';

const DETAIL_POPULATE = [
  'detailSchemas',
  'detailSchemas.detailOptions',
  'cropTypes',
] as const;

@Injectable()
export class MikroOrmTaskTypeRepository extends ITaskTypeRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findByKey(key: string): Promise<TaskType | null> {
    return this.em.findOne(
      TaskType,
      { key, isActive: true },
      { populate: DETAIL_POPULATE },
    );
  }

  findById(id: string): Promise<TaskType | null> {
    return this.em.findOne(
      TaskType,
      { id, isActive: true },
      { populate: DETAIL_POPULATE },
    );
  }

  async findAll(cropTypeKey?: string): Promise<TaskType[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (cropTypeKey) {
      where['cropTypes'] = { key: cropTypeKey };
    }
    return this.em.find(TaskType, where, {
      populate: DETAIL_POPULATE,
      orderBy: { key: 'ASC' },
    });
  }
}
