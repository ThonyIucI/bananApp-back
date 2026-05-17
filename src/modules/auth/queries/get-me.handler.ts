import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../../cooperatives/domain/user-cooperative-role.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';
import { UserRole } from '../../roles/domain/user-role.entity';

export interface CooperativeMembership {
  cooperativeId: string;
  cooperativeName: string;
  memberCode: string | null;
  roles: string[];
}

export interface MeResult {
  id: string;
  email: string;
  fullName: string;
  isSuperadmin: boolean;
  mustChangePassword: boolean;
  cooperatives: CooperativeMembership[];
  userRoles: UserRole[];
}

@Injectable()
export class GetMeHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(userId: string): Promise<MeResult> {
    const user = await this.em.findOne(User, { id: userId, deletedAt: null });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const memberships = await this.em.find(
      UserCooperative,
      { user: { id: userId }, isActive: true, deletedAt: null },
      { populate: ['cooperative'] },
    );

    const userRoles = await this.em.find(
      UserRole,
      { user: { id: userId } },
      { populate: ['role'] },
    );

    const cooperatives: CooperativeMembership[] = [];

    for (const membership of memberships) {
      const ucRoles = await this.em.find(
        UserCooperativeRole,
        { userCooperative: membership, deletedAt: null },
        { populate: ['role'] },
      );

      const coop = membership.cooperative as unknown as {
        id: string;
        name: string;
      };

      cooperatives.push({
        cooperativeId: coop.id,
        cooperativeName: coop.name,
        memberCode: membership.memberCode ?? null,
        roles: ucRoles.map(
          (ucr) => (ucr.role as unknown as { key: string }).key,
        ),
      });
    }

    return {
      id: user.id as string,
      email: user.email,
      fullName: user.fullName,
      isSuperadmin: user.isSuperadmin ?? false,
      mustChangePassword: user.mustChangePassword ?? false,
      cooperatives,
      userRoles,
    };
  }
}
