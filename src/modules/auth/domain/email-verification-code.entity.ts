import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { User } from '../../users/domain/user.entity';

const EmailVerificationCodeSchema = defineEntity({
  name: 'EmailVerificationCode',
  tableName: 'email_verification_codes',
  extends: BaseSchema,
  properties: {
    user: () => p.manyToOne(User).deleteRule('cascade'),
    codeHash: p.string().length(64),
    expiresAt: p.datetime(),
    usedAt: p.datetime().nullable(),
  },
});

export class EmailVerificationCode extends EmailVerificationCodeSchema.class {
  static make(
    user: User,
    codeHash: string,
    expiresAt: Date,
  ): EmailVerificationCode {
    const evc = new EmailVerificationCode();
    evc.user = user;
    evc.codeHash = codeHash;
    evc.expiresAt = expiresAt;
    evc.usedAt = null;
    return evc;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  markUsed(): void {
    this.usedAt = new Date();
  }
}

EmailVerificationCodeSchema.setClass(EmailVerificationCode);
