import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TaskType } from '../domain/task-type.entity';
import { ITaskTypeRepository } from '../domain/task-type.repository';

@Injectable()
export class MikroOrmTaskTypeRepository extends ITaskTypeRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findByKey(key: string): Promise<TaskType | null> {
    return this.em.findOne(
      TaskType,
      { key, isActive: true },
      { populate: ['detailSchemas', 'cropTypes'] },
    );
  }

  findById(id: string): Promise<TaskType | null> {
    return this.em.findOne(
      TaskType,
      { id, isActive: true },
      { populate: ['detailSchemas', 'cropTypes'] },
    );
  }

  async findAll(cropTypeKey?: string): Promise<TaskType[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (cropTypeKey) {
      where['cropTypes'] = { key: cropTypeKey };
    }
    return this.em.find(TaskType, where, {
      populate: ['detailSchemas', 'cropTypes'],
      orderBy: { key: 'ASC' },
    });
  }
}
