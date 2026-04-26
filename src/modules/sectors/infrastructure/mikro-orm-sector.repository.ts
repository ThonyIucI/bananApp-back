import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Sector } from '../domain/sector.entity';
import { ISectorRepository } from '../domain/sector.repository';

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
