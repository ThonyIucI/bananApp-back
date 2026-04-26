import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Cooperative } from '../domain/cooperative.entity';
import {
  ICooperativeRepository,
  CooperativeFilters,
} from '../domain/cooperative.repository';

@Injectable()
export class MikroOrmCooperativeRepository extends ICooperativeRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async findById(id: string): Promise<Cooperative | null> {
    return this.em.findOne(Cooperative, { id, deletedAt: null });
  }

  async findByRuc(ruc: string): Promise<Cooperative | null> {
    return this.em.findOne(Cooperative, { ruc, deletedAt: null });
  }

  async findAll(
    filters: CooperativeFilters = {},
  ): Promise<{ items: Cooperative[]; total: number }> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [items, total] = await this.em.findAndCount(Cooperative, where, {
      limit,
      offset,
      orderBy: { name: 'ASC' },
    });

    return { items, total };
  }

  persist(cooperative: Cooperative): void {
    this.em.persist(cooperative);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
