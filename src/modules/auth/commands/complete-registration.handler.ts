import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { Role } from '../../roles/domain/role.entity';
import { UserRole } from '../../roles/domain/user-role.entity';
import { RegistrationChallenge } from '../domain/registration-challenge.entity';
import {
  ConflictException,
  BusinessRuleException,
} from '../../shared/exceptions/domain.exception';
import { hashCode } from '../utils/crypto.util';
import {
  EXPIRING_ACCESS_TOKEN_TIME,
  EXPIRING_REFRESH_TOKEN_TIME,
} from '../constants';
import type {
  CompleteRegistrationCommand,
  CompleteRegistrationResult,
} from './complete-registration.command';

@Injectable()
export class CompleteRegistrationHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: CompleteRegistrationCommand,
  ): Promise<CompleteRegistrationResult> {
    const email = command.email.trim().toLowerCase();

    const existingUser = await this.em.findOne(User, { email });
    if (existingUser?.isEmailVerified()) {
      throw new ConflictException('El email ya está registrado');
    }

    const challenge = await this.em.findOne(RegistrationChallenge, { email });
    if (!challenge) {
      throw new BusinessRuleException(
        'No hay un código de verificación activo para este email',
      );
    }
    if (challenge.isExpired()) {
      throw new BusinessRuleException(
        'El código ha expirado, solicita uno nuevo',
      );
    }
    if (challenge.codeHash !== hashCode(command.code)) {
      throw new BusinessRuleException('El código de verificación no es válido');
    }

    const role = await this.em.findOneOrFail(Role, {
      key: 'independent_farmer',
    });

    const user = await User.make({
      firstName: command.firstName,
      lastName: command.lastName,
      email,
      password: command.password,
      emailVerifiedAt: new Date(),
    });

    const userRole = UserRole.make(user, role);

    await this.em.transactional((tem) => {
      tem.persist(user);
      tem.persist(userRole);
      tem.remove(challenge);
    });

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
