import { Injectable } from '@nestjs/common';
import { IBundlingRepository } from '../domain/bundling.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteBundlingHandler {
  constructor(private readonly bundlingRepo: IBundlingRepository) {}

  /** Soft-deletes a bundling by setting deletedAt. */
  async execute(id: string): Promise<void> {
    const bundling = await this.bundlingRepo.findById(id);
    if (!bundling) throw new NotFoundException('Enfunde no encontrado');

    bundling.deletedAt = new Date();
    await this.bundlingRepo.flush();
  }
}
