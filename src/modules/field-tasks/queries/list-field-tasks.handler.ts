import { Injectable } from '@nestjs/common';
import {
  IFieldTaskRepository,
  TFieldTaskFilters,
} from '../domain/field-task.repository';
import { mapFieldTask, type FieldTaskDto } from '../domain/field-task.mapper';

@Injectable()
export class ListFieldTasksHandler {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  async execute(
    filters: TFieldTaskFilters,
  ): Promise<{ items: FieldTaskDto[]; total: number }> {
    const { items, total } = await this.fieldTaskRepo.findAll(filters);
    return { items: items.map(mapFieldTask), total };
  }
}
