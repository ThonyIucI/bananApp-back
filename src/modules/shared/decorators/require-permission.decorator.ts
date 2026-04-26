import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../../roles/domain/permission.entity';

export const PERMISSION_KEY = 'required_permission';
export const RequirePermission = (permission: PermissionKey) =>
  SetMetadata(PERMISSION_KEY, permission);
