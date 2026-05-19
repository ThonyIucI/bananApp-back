import { Injectable } from '@nestjs/common';
import { IFieldTaskRepository } from '../domain/field-task.repository';
import { FieldTask } from '../domain/field-task.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class GetFieldTaskHandler {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  async execute(id: string): Promise<FieldTask> {
    const fieldTask = await this.fieldTaskRepo.findById(id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');
    return fieldTask;
  }
}
