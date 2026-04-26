import { Injectable } from '@nestjs/common';
import { ICooperativeRepository } from '../domain/cooperative.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteCooperativeHandler {
  constructor(private readonly repo: ICooperativeRepository) {}

  async execute(id: string): Promise<void> {
    const cooperative = await this.repo.findById(id);
    if (!cooperative) throw new NotFoundException('Cooperativa no encontrada');
    cooperative.deletedAt = new Date();
    await this.repo.flush();
  }
}
