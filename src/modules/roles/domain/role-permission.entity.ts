import { defineEntity, p } from '@mikro-orm/core';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { entityIdV7 } from '../../shared/base.entity';

const RolePermissionSchema = defineEntity({
  name: 'RolePermission',
  properties: {
    id: entityIdV7,
    role: () => p.manyToOne(Role).deleteRule('cascade'),
    permission: () => p.manyToOne(Permission).deleteRule('cascade'),
  },
  uniques: [{ properties: ['role', 'permission'] }],
});

export class RolePermission extends RolePermissionSchema.class {
  static make(role: Role, permission: Permission): RolePermission {
    const rp = new RolePermission();
    rp.role = role;
    rp.permission = permission;
    return rp;
  }
}

RolePermissionSchema.setClass(RolePermission);
