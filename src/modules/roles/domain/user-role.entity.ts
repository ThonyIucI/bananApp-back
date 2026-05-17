import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { User } from '../../users/domain/user.entity';
import { Role } from './role.entity';

const UserRoleSchema = defineEntity({
  name: 'UserRole',
  tableName: 'user_roles',
  extends: BaseSchema,
  properties: {
    user: () => p.manyToOne(User).deleteRule('cascade'),
    role: () => p.manyToOne(Role).deleteRule('cascade'),
  },
  uniques: [{ properties: ['user', 'role'] }],
});

export class UserRole extends UserRoleSchema.class {
  static make(user: User, role: Role): UserRole {
    const ur = new UserRole();
    ur.user = user;
    ur.role = role;
    return ur;
  }
}

UserRoleSchema.setClass(UserRole);
