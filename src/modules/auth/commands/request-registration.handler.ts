import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { RegistrationChallenge } from '../domain/registration-challenge.entity';
import { ConflictException } from '../../shared/exceptions/domain.exception';
import {
  EMAIL_SERVICE_TOKEN,
  IEmailService,
} from '../../shared/email/email.service.interface';
import { generateSixDigitCode, hashCode } from '../utils/crypto.util';
import type {
  RequestRegistrationCommand,
  RequestRegistrationResult,
} from './request-registration.command';

const CODE_TTL_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES ?? 15,
);

@Injectable()
export class RequestRegistrationHandler {
  constructor(
    private readonly em: EntityManager,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
  ) {}

  async execute(
    command: RequestRegistrationCommand,
  ): Promise<RequestRegistrationResult> {
    const email = command.email.trim().toLowerCase();

    const existingUser = await this.em.findOne(User, { email });
    if (existingUser?.isEmailVerified()) {
      throw new ConflictException('El email ya está registrado');
    }

    const existing = await this.em.findOne(RegistrationChallenge, { email });

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
    const challenge = RegistrationChallenge.make(
      email,
      hashCode(code),
      expiresAt,
    );

    await this.em.transactional((tem) => {
      if (existing) tem.remove(existing);
      tem.persist(challenge);
    });

    await this.emailService.sendEmailVerificationCode(email, email, code);

    return { message: `Se ha enviado un código de verificación a ${email}` };
  }
}
