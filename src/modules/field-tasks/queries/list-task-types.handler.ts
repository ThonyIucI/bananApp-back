import { Injectable } from '@nestjs/common';
import { ITaskTypeRepository } from '../domain/task-type.repository';
import { mapTaskType, type TaskTypeDto } from '../domain/field-task.mapper';

@Injectable()
export class ListTaskTypesHandler {
  constructor(private readonly taskTypeRepo: ITaskTypeRepository) {}

  async execute(cropTypeKey?: string): Promise<TaskTypeDto[]> {
    const types = await this.taskTypeRepo.findAll(cropTypeKey);
    return types.map(mapTaskType);
  }
}
