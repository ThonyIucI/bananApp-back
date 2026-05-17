import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { EmailVerificationCode } from '../domain/email-verification-code.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';
import {
  EMAIL_SERVICE_TOKEN,
  IEmailService,
} from '../../shared/email/email.service.interface';
import { generateSixDigitCode, hashCode } from '../utils/crypto.util';
import type { ResendVerificationCommand } from './resend-verification.command';

const EMAIL_VERIFICATION_TTL_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES ?? 15,
);

@Injectable()
export class ResendVerificationHandler {
  constructor(
    private readonly em: EntityManager,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
  ) {}

  async execute(
    command: ResendVerificationCommand,
  ): Promise<{ success: true; alreadyVerified?: boolean }> {
    const user = await this.em.findOne(User, { id: command.userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isEmailVerified()) {
      return { success: true, alreadyVerified: true };
    }

    await this.em.nativeUpdate(
      EmailVerificationCode,
      { user, usedAt: null },
      { usedAt: new Date() },
    );

    const code = generateSixDigitCode();
    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000,
    );
    const evc = EmailVerificationCode.make(user, hashCode(code), expiresAt);

    await this.em.persist(evc).flush();

    await this.emailService.sendEmailVerificationCode(
      user.email,
      user.firstName,
      code,
    );

    return { success: true };
  }
}
