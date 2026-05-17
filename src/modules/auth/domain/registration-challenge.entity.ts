import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';

const RegistrationChallengeSchema = defineEntity({
  name: 'RegistrationChallenge',
  tableName: 'registration_challenges',
  extends: BaseSchema,
  properties: {
    email: p.string().length(150).unique(),
    codeHash: p.string().length(64),
    expiresAt: p.datetime(),
  },
});

export class RegistrationChallenge extends RegistrationChallengeSchema.class {
  static make(
    email: string,
    codeHash: string,
    expiresAt: Date,
  ): RegistrationChallenge {
    const challenge = new RegistrationChallenge();
    challenge.email = email.trim().toLowerCase();
    challenge.codeHash = codeHash;
    challenge.expiresAt = expiresAt;
    return challenge;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

RegistrationChallengeSchema.setClass(RegistrationChallenge);
