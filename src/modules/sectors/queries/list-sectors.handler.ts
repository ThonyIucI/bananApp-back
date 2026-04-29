import { Injectable } from '@nestjs/common';
import { ISectorRepository } from '../domain/sector.repository';

export interface ListSectorsQuery {
  cooperativeId: string;
  plotIds?: string[];
}

@Injectable()
export class ListSectorsHandler {
  constructor(private readonly sectorRepo: ISectorRepository) {}

  execute(query: ListSectorsQuery) {
    return this.sectorRepo.findAll({
      cooperativeId: query.cooperativeId,
      plotIds: query.plotIds,
    });
  }
}
