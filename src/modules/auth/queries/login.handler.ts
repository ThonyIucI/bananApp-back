import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { LoginCommand, LoginResult } from '../commands/login.command';
import {
  UnauthorizedException,
  BusinessRuleException,
} from '../../shared/exceptions/domain.exception';
import {
  EXPIRING_ACCESS_TOKEN_TIME,
  EXPIRING_REFRESH_TOKEN_TIME,
} from '../constants';

@Injectable()
export class LoginHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.em.findOne(User, {
      email: command.email.toLowerCase(),
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.isLocked()) {
      throw new BusinessRuleException(
        'Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.',
      );
    }

    const passwordValid = user.comparePassword(command.password);

    if (!passwordValid) {
      user.recordFailedLogin();
      await this.em.flush();
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.recordSuccessfullLogin();
    await this.em.flush();

    const payload = {
      sub: user.id,
      email: user.email,
      isSuperadmin: user.isSuperadmin ?? false,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: EXPIRING_ACCESS_TOKEN_TIME,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id as string },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: EXPIRING_REFRESH_TOKEN_TIME,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSuperadmin: user.isSuperadmin ?? false,
      },
    };
  }
}
