import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../../cooperatives/domain/user-cooperative-role.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

export interface ProfileCooperative {
  cooperativeId: string;
  cooperativeName: string;
  memberCode: string | null;
  roles: string[];
}

export interface ProfileResult {
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
  cooperatives: ProfileCooperative[];
  userRoles: string[];
}

@Injectable()
export class GetProfileHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(userId: string): Promise<ProfileResult> {
    const user = await this.em.findOne(
      User,
      { id: userId },
      { populate: ['userRoles'] },
    );
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const memberships = await this.em.find(
      UserCooperative,
      { user: { id: userId }, isActive: true, deletedAt: null },
      { populate: ['cooperative'] },
    );

    const ucRoles = memberships.length
      ? await this.em.find(
          UserCooperativeRole,
          {
            userCooperative: {
              id: { $in: memberships.map((m) => m.id as string) },
            },
            deletedAt: null,
          },
          { populate: ['role', 'userCooperative'] },
        )
      : [];

    const cooperatives: ProfileCooperative[] = memberships.map((m) => {
      const coop = m.cooperative as unknown as { id: string; name: string };
      const roles = ucRoles
        .filter(
          (r) => (r.userCooperative as unknown as { id: string }).id === m.id,
        )
        .map((r) => (r.role as unknown as { key: string }).key);

      return {
        cooperativeId: coop.id,
        cooperativeName: coop.name,
        memberCode: m.memberCode ?? null,
        roles,
      };
    });

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
      userRoles: user?.userRoles?.map((r) => r.key),
    };
  }
}
