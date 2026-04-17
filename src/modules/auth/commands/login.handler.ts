import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/domain/user.entity';
import { LoginCommand, LoginResult } from './login.command';
import {
  UnauthorizedException,
  BusinessRuleException,
} from '../../shared/exceptions/domain.exception';

@Injectable()
export class LoginHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.em.findOne(User, { email: command.email.toLowerCase() });

    if (!user || !user.isActive) {
      // Same message for both cases — avoid leaking whether email exists
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.isLocked()) {
      throw new BusinessRuleException(
        'Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.',
      );
    }

    const passwordValid = await bcrypt.compare(command.password, user.passwordHash);

    if (!passwordValid) {
      user.recordFailedLogin();
      await this.em.flush();
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.recordSuccessfulLogin();
    await this.em.flush();

    const payload = {
      sub: user.id as string,
      email: user.email,
      isSuperadmin: (user.isSuperadmin ?? false) as boolean,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev_secret_change_me',
      expiresIn: 3600, // 1 hour in seconds
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id as string },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
        expiresIn: 2592000, // 30 days in seconds
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
