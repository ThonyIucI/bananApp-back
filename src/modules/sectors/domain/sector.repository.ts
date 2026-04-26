import { Sector } from './sector.entity';

export abstract class ISectorRepository {
  abstract findById(id: string): Promise<Sector | null>;
  abstract findByCooperative(cooperativeId: string): Promise<Sector[]>;
  abstract persist(sector: Sector): void;
  abstract persistMany(sectors: Sector[]): void;
  abstract remove(sector: Sector): void;
  abstract flush(): Promise<void>;
}
