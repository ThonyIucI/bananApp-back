import { Injectable } from '@nestjs/common';
import { IFieldTaskRepository, TFieldTaskFilters } from '../domain/field-task.repository';
import { FieldTask } from '../domain/field-task.entity';

@Injectable()
export class ListFieldTasksHandler {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  async execute(filters: TFieldTaskFilters): Promise<{ items: FieldTask[]; total: number }> {
    return this.fieldTaskRepo.findAll(filters);
  }
}
