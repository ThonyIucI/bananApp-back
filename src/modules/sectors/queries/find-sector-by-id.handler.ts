import { Injectable } from '@nestjs/common';
import { ISectorRepository } from '../domain/sector.repository';
import { Sector } from '../domain/sector.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class FindSectorByIdHandler {
  constructor(private readonly sectorRepo: ISectorRepository) {}

  async execute(id: string): Promise<Sector> {
    const sector = await this.sectorRepo.findById(id);
    if (!sector) throw new NotFoundException('Sector no encontrado');
    return sector;
  }
}
