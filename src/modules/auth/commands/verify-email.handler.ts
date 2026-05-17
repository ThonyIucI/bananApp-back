import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { EmailVerificationCode } from '../domain/email-verification-code.entity';
import {
  NotFoundException,
  BusinessRuleException,
} from '../../shared/exceptions/domain.exception';
import { hashCode } from '../utils/crypto.util';
import type {
  VerifyEmailCommand,
  VerifyEmailResult,
} from './verify-email.command';

@Injectable()
export class VerifyEmailHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    const user = await this.em.findOne(User, { id: command.userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isEmailVerified()) {
      return { success: true, alreadyVerified: true };
    }

    const evc = await this.em.findOne(
      EmailVerificationCode,
      { user, usedAt: null },
      { orderBy: { createdAt: 'DESC' } },
    );

    if (!evc) {
      throw new BusinessRuleException('Código inválido o expirado');
    }

    if (evc.isExpired()) {
      throw new BusinessRuleException(
        'El código ha expirado. Solicita uno nuevo',
      );
    }

    if (evc.codeHash !== hashCode(command.code)) {
      throw new BusinessRuleException('Código incorrecto');
    }

    await this.em.transactional((tem) => {
      evc.markUsed();
      user.emailVerifiedAt = new Date();
      tem.persist(evc);
      tem.persist(user);
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
