import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { User } from '../../users/domain/user.entity';
import { Cooperative } from './cooperative.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';
// TODO: revisar estructura de codigos de parcela
const MEMBER_CODE_REGEX = /^[A-Z0-9]{3,20}$/;

const UserCooperativeSchema = defineEntity({
  name: 'UserCooperative',
  extends: BaseSchema,
  properties: {
    user: () => p.manyToOne(User).deleteRule('cascade'),
    cooperative: () => p.manyToOne(Cooperative).deleteRule('cascade'),
    memberCode: p.string().length(20).nullable(),
    isActive: p.boolean().default(true),
  },
  uniques: [{ properties: ['user', 'cooperative'] }],
});

export class UserCooperative extends UserCooperativeSchema.class {
  static make(props: {
    user: User;
    cooperative: Cooperative;
    memberCode?: string;
  }): UserCooperative {
    const uc = new UserCooperative();
    uc.user = props.user;
    uc.cooperative = props.cooperative;
    uc.memberCode = props.memberCode?.trim().toUpperCase() ?? null;
    uc.isActive = true;
    uc.validate();
    return uc;
  }

  private validate(): void {
    if (
      this.memberCode !== undefined &&
      this.memberCode &&
      !MEMBER_CODE_REGEX.test(this.memberCode)
    ) {
      throw new ValidationException(
        'El código de socio debe tener entre 3 y 20 caracteres alfanuméricos',
        'memberCode',
      );
    }
  }
}

UserCooperativeSchema.setClass(UserCooperative);
