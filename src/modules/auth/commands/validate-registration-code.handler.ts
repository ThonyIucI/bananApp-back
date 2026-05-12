import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { RegistrationChallenge } from '../domain/registration-challenge.entity';
import { BusinessRuleException } from '../../shared/exceptions/domain.exception';
import { hashCode } from '../utils/crypto.util';
import type {
  ValidateRegistrationCodeCommand,
  ValidateRegistrationCodeResult,
} from './validate-registration-code.command';

@Injectable()
export class ValidateRegistrationCodeHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(
    command: ValidateRegistrationCodeCommand,
  ): Promise<ValidateRegistrationCodeResult> {
    const email = command.email.trim().toLowerCase();

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

    return { message: 'Código verificado correctamente' };
  }
}
