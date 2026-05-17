import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import {
  COOPERATIVE_SCOPE_KEY,
  CooperativeScopeStrategy,
} from '../decorators/cooperative-scope.decorator';
import { PermissionKey } from '../../roles/domain/permission.entity';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../../cooperatives/domain/user-cooperative-role.entity';
import { RolePermission } from '../../roles/domain/role-permission.entity';
import { UserRole } from '../../roles/domain/user-role.entity';
import { ERole } from '../../roles/domain/role.entity';
import { Plot } from '../../plots/domain/plot.entity';
import { ForbiddenException } from '../exceptions/domain.exception';
import { JwtPayload } from '../../auth/infrastructure/jwt.strategy';

type RequestShape = {
  user: JwtPayload;
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, string>;
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionRequiredKey = this.reflector.getAllAndOverride<
      PermissionKey | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!permissionRequiredKey) return true;

    const request = context.switchToHttp().getRequest<RequestShape>();
    const { user, params, query, body } = request;

    if (user.isSuperadmin) return true;
    const independentFarmerRole = await this.em.findOne(UserRole, {
      user: { id: user.sub },
      role: { key: ERole.INDEPENDENT_FARMER },
    });

    if (independentFarmerRole) {
      const hasPermission = await this.em.findOne(RolePermission, {
        role: independentFarmerRole.role,
        permission: { key: permissionRequiredKey },
      });

      if (!hasPermission) throw new ForbiddenException();
      return true;
    }

    const strategy = this.reflector.getAllAndOverride<
      CooperativeScopeStrategy | undefined
    >(COOPERATIVE_SCOPE_KEY, [context.getHandler(), context.getClass()]);

    const cooperativeId = await this.resolveCooperativeId(strategy, {
      params,
      query,
      body,
    });
    console.log(cooperativeId, strategy);

    if (!cooperativeId) throw new ForbiddenException();

    const membership = await this.em.findOne(UserCooperative, {
      user: { id: user.sub },
      cooperative: { id: cooperativeId },
      isActive: true,
    });

    if (!membership) throw new ForbiddenException();

    const ucRoles = await this.em.find(
      UserCooperativeRole,
      { userCooperative: membership },
      { populate: ['role'] as never[] },
    );

    const roleIds = ucRoles.map(
      (ucr) => (ucr.role as unknown as { id: string }).id,
    );

    const hasPermission = await this.em.findOne(RolePermission, {
      role: { id: { $in: roleIds } },
      permission: { key: permissionRequiredKey },
    });

    if (!hasPermission) throw new ForbiddenException();

    return true;
  }

  private async resolveCooperativeId(
    strategy: CooperativeScopeStrategy,
    ctx: {
      params: Record<string, string>;
      query: Record<string, string>;
      body: Record<string, string>;
    },
  ): Promise<string | undefined> {
    switch (strategy) {
      case 'param':
        return ctx.params.cooperativeId ?? ctx.params.id;

      case 'query':
        return ctx.query.cooperativeId;

      case 'body':
        return ctx.body.cooperativeId;

      case 'derive-from-plot': {
        const plotId = ctx.params.plotId ?? ctx.params.id;
        if (!plotId) return undefined;

        const plot = await this.em.findOne(
          Plot,
          { id: plotId, deletedAt: null },
          { populate: ['sector', 'sector.cooperative'] as never[] },
        );

        return (
          plot?.sector as unknown as { cooperative: { id: string } } | null
        )?.cooperative?.id;
      }
      default:
        return (
          ctx.params?.cooperativeId ||
          ctx.query?.cooperativeId ||
          ctx.body?.cooperativeId
        );
    }
  }
}
