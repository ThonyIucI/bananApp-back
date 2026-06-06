import { Injectable } from '@nestjs/common';
import { IFieldTaskRepository } from '../repositories/field-task.repository';
import { FieldTask } from '../entities/field-task.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class GetFieldTaskService {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  async execute(id: string): Promise<FieldTask> {
    const fieldTask = await this.fieldTaskRepo.findById(id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');
    return fieldTask;
  }
}
