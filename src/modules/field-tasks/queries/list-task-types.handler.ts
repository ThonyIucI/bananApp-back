import { Injectable } from '@nestjs/common';
import { ITaskTypeRepository } from '../domain/task-type.repository';
import { TaskType } from '../domain/task-type.entity';

@Injectable()
export class ListTaskTypesHandler {
  constructor(private readonly taskTypeRepo: ITaskTypeRepository) {}

  async execute(cropTypeKey?: string): Promise<TaskType[]> {
    return this.taskTypeRepo.findAll(cropTypeKey);
  }
}
