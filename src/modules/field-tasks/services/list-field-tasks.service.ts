import { Injectable } from '@nestjs/common';
import {
  IFieldTaskRepository,
  TFieldTaskFilters,
} from '../repositories/field-task.repository';
import { FieldTask } from '../entities/field-task.entity';

@Injectable()
export class ListFieldTasksService {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  execute(filters: TFieldTaskFilters): Promise<[FieldTask[], number]> {
    return this.fieldTaskRepo.findAll(filters);
  }
}
