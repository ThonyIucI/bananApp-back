import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Sector } from '../domain/sector.entity';
import { ISectorRepository, SectorFilters } from '../domain/sector.repository';

@Injectable()
export class MikroOrmSectorRepository extends ISectorRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<Sector | null> {
    return this.em.findOne(Sector, { id, deletedAt: null });
  }

  findByCooperative(cooperativeId: string): Promise<Sector[]> {
    return this.em.find(
      Sector,
      { cooperative: { id: cooperativeId }, deletedAt: null },
      { orderBy: { name: 'ASC' } },
    );
  }

  async findAll(filters: SectorFilters): Promise<Sector[]> {
    if (!filters.plotIds?.length) {
      return this.findByCooperative(filters.cooperativeId);
    }

    // Subquery: return only sectors that contain at least one of the given plots
    const rows = await this.em.execute<{ id: string }[]>(
      `SELECT DISTINCT s.id
       FROM sectors s
       JOIN plots p ON p.sector_id = s.id AND p.deleted_at IS NULL
       WHERE s.cooperative_id = $1
         AND s.deleted_at IS NULL
         AND p.id = ANY($2)`,
      [filters.cooperativeId, filters.plotIds],
    );

    if (!rows.length) return [];

    const ids = rows.map((r) => r.id);
    return this.em.find(
      Sector,
      { id: { $in: ids }, deletedAt: null },
      { orderBy: { name: 'ASC' } },
    );
  }

  persist(sector: Sector): void {
    this.em.persist(sector);
  }

  persistMany(sectors: Sector[]): void {
    sectors.forEach((s) => this.em.persist(s));
  }

  remove(sector: Sector): void {
    this.em.remove(sector);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
