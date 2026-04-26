import { Injectable } from '@nestjs/common';
import { ISectorRepository } from '../domain/sector.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteSectorHandler {
  constructor(private readonly sectorRepo: ISectorRepository) {}

  async execute(id: string): Promise<void> {
    const sector = await this.sectorRepo.findById(id);
    if (!sector) throw new NotFoundException('Sector no encontrado');
    sector.deletedAt = new Date();
    await this.sectorRepo.flush();
  }
}
