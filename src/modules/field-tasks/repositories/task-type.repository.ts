import { TaskType } from '../entities/task-type.entity';

export abstract class ITaskTypeRepository {
  abstract findByKey(key: string): Promise<TaskType | null>;
  abstract findById(id: string): Promise<TaskType | null>;
  abstract findAll(cropTypeKey?: string): Promise<TaskType[]>;
}
