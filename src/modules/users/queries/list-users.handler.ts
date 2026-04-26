import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IUserRepository, UserFilters } from '../domain/user.repository';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../../cooperatives/domain/user-cooperative-role.entity';

export interface UserCooperativeSummary {
  cooperativeId: string;
  cooperativeName: string;
  memberCode: string | null;
  roles: string[];
}

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dni: string | null;
  isActive: boolean;
  isSuperadmin: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  cooperatives: UserCooperativeSummary[];
}

export interface ListUsersResult {
  items: UserListItem[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ListUsersHandler {
  constructor(
    private readonly repo: IUserRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(filters: UserFilters = {}): Promise<ListUsersResult> {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const { items, total } = await this.repo.findAll({
      ...filters,
      limit,
      offset,
    });

    const userIds = items.map((u) => u.id as string);

    const memberships = userIds.length
      ? await this.em.find(
          UserCooperative,
          { user: { id: { $in: userIds } }, isActive: true, deletedAt: null },
          { populate: ['cooperative'] as never[] },
        )
      : [];

    const ucRoles = memberships.length
      ? await this.em.find(
          UserCooperativeRole,
          {
            userCooperative: {
              id: { $in: memberships.map((m) => m.id as string) },
            },
            deletedAt: null,
          },
          { populate: ['role', 'userCooperative'] as never[] },
        )
      : [];

    const mapped: UserListItem[] = items.map((user) => {
      const userMemberships = memberships.filter(
        (m) => (m.user as unknown as { id: string }).id === user.id,
      );

      const cooperatives: UserCooperativeSummary[] = userMemberships.map(
        (m) => {
          const coop = m.cooperative as unknown as { id: string; name: string };
          const roles = ucRoles
            .filter(
              (r) =>
                (r.userCooperative as unknown as { id: string }).id === m.id,
            )
            .map((r) => (r.role as unknown as { key: string }).key);

          return {
            cooperativeId: coop.id,
            cooperativeName: coop.name,
            memberCode: m.memberCode ?? null,
            roles,
          };
        },
      );

      return {
        id: user.id as string,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        dni: user.dni ?? null,
        isActive: user.isActive ?? true,
        isSuperadmin: user.isSuperadmin ?? false,
        mustChangePassword: user.mustChangePassword ?? false,
        createdAt: user.createdAt as Date,
        cooperatives,
      };
    });

    return { items: mapped, total, limit, offset };
  }
}
