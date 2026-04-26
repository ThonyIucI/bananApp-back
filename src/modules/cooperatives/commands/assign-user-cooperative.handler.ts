import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { RoleKey } from '../../roles/domain/role.entity';
import { Role } from '../../roles/domain/role.entity';
import { UserCooperative } from '../domain/user-cooperative.entity';
import { UserCooperativeRole } from '../domain/user-cooperative-role.entity';
import { ICooperativeRepository } from '../domain/cooperative.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import {
  NotFoundException,
  ConflictException,
} from '../../shared/exceptions/domain.exception';

export interface AssignUserCooperativeCommand {
  userId: string;
  cooperativeId: string;
  roleKey: RoleKey;
  memberCode?: string;
}

@Injectable()
export class AssignUserCooperativeHandler {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly cooperativeRepo: ICooperativeRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(
    cmd: AssignUserCooperativeCommand,
  ): Promise<UserCooperativeRole> {
    const user = await this.userRepo.findById(cmd.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const cooperative = await this.cooperativeRepo.findById(cmd.cooperativeId);
    if (!cooperative) throw new NotFoundException('Cooperativa no encontrada');

    const role = await this.em.findOne(Role, { key: cmd.roleKey });
    if (!role) throw new NotFoundException('Rol no encontrado');

    let membership = await this.em.findOne(UserCooperative, {
      user: { id: cmd.userId },
      cooperative: { id: cmd.cooperativeId },
    });

    if (!membership) {
      membership = UserCooperative.make({
        user,
        cooperative,
        memberCode: cmd.memberCode,
      });
      this.em.persist(membership);
    }

    const existing = await this.em.findOne(UserCooperativeRole, {
      userCooperative: membership,
      role,
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ya tiene el rol '${role.name}' en esta cooperativa`,
      );
    }

    const ucr = UserCooperativeRole.make(membership, role);
    this.em.persist(ucr);
    await this.em.flush();

    return ucr;
  }
}
