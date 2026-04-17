import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../exceptions/domain.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: unknown, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido o sesión expirada');
    }
    return user;
  }
}
