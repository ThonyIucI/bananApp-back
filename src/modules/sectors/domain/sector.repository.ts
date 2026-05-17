import { Sector } from './sector.entity';

export interface SectorFilters {
  cooperativeId: string;
  plotIds?: string[];
}

export abstract class ISectorRepository {
  abstract findById(id: string): Promise<Sector | null>;
  abstract findByCooperative(cooperativeId: string): Promise<Sector[]>;
  abstract findAll(filters: SectorFilters): Promise<Sector[]>;
  abstract persist(sector: Sector): void;
  abstract persistMany(sectors: Sector[]): void;
  abstract remove(sector: Sector): void;
  abstract flush(): Promise<void>;
}
