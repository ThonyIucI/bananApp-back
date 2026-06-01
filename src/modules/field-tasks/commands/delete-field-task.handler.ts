import { Injectable } from '@nestjs/common';
import { IFieldTaskRepository } from '../domain/field-task.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteFieldTaskHandler {
  constructor(private readonly fieldTaskRepo: IFieldTaskRepository) {}

  async execute(id: string): Promise<void> {
    const fieldTask = await this.fieldTaskRepo.findById(id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');

    this.fieldTaskRepo.remove(fieldTask);
    await this.fieldTaskRepo.flush();
  }
}
