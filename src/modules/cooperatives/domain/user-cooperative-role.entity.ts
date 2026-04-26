import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { UserCooperative } from './user-cooperative.entity';
import { Role } from '../../roles/domain/role.entity';

const UserCooperativeRoleSchema = defineEntity({
  name: 'UserCooperativeRole',
  extends: BaseSchema,
  properties: {
    userCooperative: () => p.manyToOne(UserCooperative).deleteRule('cascade'),
    role: () => p.manyToOne(Role).deleteRule('cascade'),
  },
  uniques: [{ properties: ['userCooperative', 'role'] }],
});

export class UserCooperativeRole extends UserCooperativeRoleSchema.class {
  static make(
    userCooperative: UserCooperative,
    role: Role,
  ): UserCooperativeRole {
    const ucr = new UserCooperativeRole();
    ucr.userCooperative = userCooperative;
    ucr.role = role;
    return ucr;
  }
}

UserCooperativeRoleSchema.setClass(UserCooperativeRole);
