import { Injectable } from '@nestjs/common';
import { ITaskTypeRepository } from '../repositories/task-type.repository';
import { TaskType } from '../entities/task-type.entity';

@Injectable()
export class ListTaskTypesService {
  constructor(private readonly taskTypeRepo: ITaskTypeRepository) {}

  execute(cropTypeKey?: string): Promise<TaskType[]> {
    return this.taskTypeRepo.findAll(cropTypeKey);
  }
}
