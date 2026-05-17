import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { ERole, Role } from '../../roles/domain/role.entity';
import { UserRole } from '../../roles/domain/user-role.entity';
import { EmailVerificationCode } from '../domain/email-verification-code.entity';
import { ConflictException } from '../../shared/exceptions/domain.exception';
import {
  EMAIL_SERVICE_TOKEN,
  IEmailService,
} from '../../shared/email/email.service.interface';
import { generateSixDigitCode, hashCode } from '../utils/crypto.util';
import type { RegisterCommand, RegisterResult } from './register.command';

const EMAIL_VERIFICATION_TTL_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES ?? 15,
);

@Injectable()
export class RegisterHandler {
  constructor(
    private readonly em: EntityManager,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const existing = await this.em.findOne(User, {
      email: command.email.toLowerCase(),
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const role = await this.em.findOneOrFail(Role, {
      key: ERole.INDEPENDENT_FARMER,
    });

    const user = await User.make({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      password: command.password,
    });

    const userRole = UserRole.make(user, role);

    const code = generateSixDigitCode();
    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000,
    );
    const evc = EmailVerificationCode.make(user, hashCode(code), expiresAt);

    await this.em.transactional((tem) => {
      tem.persist(user);
      tem.persist(userRole);
      tem.persist(evc);
    });

    await this.emailService.sendEmailVerificationCode(
      user.email,
      user.firstName,
      code,
    );

    return {
      userId: user.id,
      email: user.email,
      requiresEmailVerification: true,
    };
  }
}
