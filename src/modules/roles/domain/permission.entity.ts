import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

export const PERMISSION_KEYS = [
  'bundling_create',
  'bundling_read',
  'bundling_update',
  'plot_read',
  'plot_manage',
  'cooperative_read',
  'cooperative_manage',
  'user_read',
  'user_manage',
  'sector_read',
  'sector_manage',
  'ribbon_calendar_read',
  'ribbon_calendar_manage',
  'sanction_read',
  'sanction_manage',
  'harvest_read',
  'harvest_manage',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const PermissionSchema = defineEntity({
  name: 'Permission',
  tableName: 'permissions',
  extends: BaseSchema,
  properties: {
    key: p.string().length(100).unique(),
    description: p.string().length(300).nullable(),
  },
});

export class Permission extends PermissionSchema.class {
  static make(props: { key: PermissionKey; description?: string }): Permission {
    const perm = new Permission();
    perm.key = props.key;
    perm.description = props.description?.trim() ?? null;
    perm.validate();
    return perm;
  }

  private validate(): void {
    if (this.key !== undefined && !this.key) {
      throw new ValidationException('El key del permiso es requerido', 'key');
    }
  }
}

PermissionSchema.setClass(Permission);
