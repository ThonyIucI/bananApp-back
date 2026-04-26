import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../domain/user.entity';
import { IUserRepository, UserFilters } from '../domain/user.repository';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';

@Injectable()
export class MikroOrmUserRepository extends IUserRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id, deletedAt: null });
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return this.em.find(User, { id: { $in: ids }, deletedAt: null });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, {
      email: email.toLowerCase(),
      deletedAt: null,
    });
  }

  async findAll(
    filters: UserFilters = {},
  ): Promise<{ items: User[]; total: number }> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    // Filter by cooperative using a subquery via the UserCooperative pivot
    if (filters.cooperativeId) {
      const memberships = await this.em.find(
        UserCooperative,
        {
          cooperative: { id: filters.cooperativeId },
          deletedAt: null,
        },
        { fields: ['user'] },
      );

      const userIds = memberships.map(
        (m) => (m.user as unknown as { id: string }).id,
      );
      if (userIds.length === 0) return { items: [], total: 0 };

      where.id = { $in: userIds };
    }

    const [items, total] = await this.em.findAndCount(User, where, {
      limit,
      offset,
      orderBy: { lastName: 'ASC', firstName: 'ASC' },
    });

    return { items, total };
  }

  persist(user: User): void {
    this.em.persist(user);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
