import { Injectable } from '@nestjs/common';
import { ISectorRepository } from '../domain/sector.repository';
import { Sector } from '../domain/sector.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

export interface UpdateSectorCommand {
  id: string;
  name: string;
}

@Injectable()
export class UpdateSectorHandler {
  constructor(private readonly sectorRepo: ISectorRepository) {}

  async execute(cmd: UpdateSectorCommand): Promise<Sector> {
    const sector = await this.sectorRepo.findById(cmd.id);
    if (!sector) throw new NotFoundException('Sector no encontrado');
    sector.update(cmd.name);
    await this.sectorRepo.flush();
    return sector;
  }
}
