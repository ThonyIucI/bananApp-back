import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

export const ROLE_KEYS = [
  'superadmin',
  'admin',
  'member',
  'bagger',
  'harvest_chief',
  'calibrator',
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

const RoleSchema = defineEntity({
  name: 'Role',
  tableName: 'roles',
  extends: BaseSchema,
  properties: {
    key: p.string().length(50).unique(),
    name: p.string().length(100).unique(),
    description: p.string().length(300).nullable(),
  },
});

export class Role extends RoleSchema.class {
  static make(props: {
    key: RoleKey;
    name: string;
    description?: string;
  }): Role {
    const role = new Role();
    role.key = props.key;
    role.name = props.name.trim();
    role.description = props.description?.trim() ?? null;
    role.validate();
    return role;
  }

  private validate(): void {
    if (this.key !== undefined && !this.key) {
      throw new ValidationException('El key del rol es requerido', 'key');
    }
    if (this.name !== undefined && (!this.name || this.name.length < 2)) {
      throw new ValidationException(
        'El nombre del rol debe tener al menos 2 caracteres',
        'name',
      );
    }
  }
}

RoleSchema.setClass(Role);
