import { Injectable } from '@nestjs/common';
import { ISectorRepository } from '../domain/sector.repository';

@Injectable()
export class ListSectorsHandler {
  constructor(private readonly sectorRepo: ISectorRepository) {}

  execute(cooperativeId: string) {
    return this.sectorRepo.findByCooperative(cooperativeId);
  }
}
