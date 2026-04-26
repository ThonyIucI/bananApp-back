import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '../exceptions/domain.exception';
import { JwtPayload } from '../../auth/infrastructure/jwt.strategy';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!request.user?.isSuperadmin) {
      throw new ForbiddenException(
        'Se necesita máxima autorización para realizar esta acción',
      );
    }
    return true;
  }
}
