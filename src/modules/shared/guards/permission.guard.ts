import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionKey } from '../../roles/domain/permission.entity';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../../cooperatives/domain/user-cooperative-role.entity';
import { RolePermission } from '../../roles/domain/role-permission.entity';
import { ForbiddenException } from '../exceptions/domain.exception';
import { JwtPayload } from '../../auth/infrastructure/jwt.strategy';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      PermissionKey | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!required) return true;

    const request = context.switchToHttp().getRequest<{
      user: JwtPayload;
      params: Record<string, string>;
    }>();

    const { user, params } = request;

    if (user.isSuperadmin) return true;

    const cooperativeId = params.cooperativeId ?? params.id;
    if (!cooperativeId) throw new ForbiddenException();

    const membership = await this.em.findOne(UserCooperative, {
      user: { id: user.sub },
      cooperative: { id: cooperativeId },
      isActive: true,
    });

    if (!membership) throw new ForbiddenException();

    const ucRoles = await this.em.find(
      UserCooperativeRole,
      {
        userCooperative: membership,
      },
      { populate: ['role'] as never[] },
    );

    const roleIds = ucRoles.map(
      (ucr) => (ucr.role as unknown as { id: string }).id,
    );

    const hasPermission = await this.em.findOne(RolePermission, {
      role: { id: { $in: roleIds } },
      permission: { key: required },
    });

    if (!hasPermission) throw new ForbiddenException();

    return true;
  }
}
