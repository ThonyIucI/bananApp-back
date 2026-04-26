import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

const RUC_REGEX = /^\d{11}$/;

const CooperativeSchema = defineEntity({
  name: 'Cooperative',
  tableName: 'cooperatives',
  extends: BaseSchema,
  properties: {
    name: p.string().length(200),
    ruc: p.string().length(11).unique(),
    address: p.string().length(300).nullable(),
    department: p.string().length(100).nullable(),
    province: p.string().length(100).nullable(),
    district: p.string().length(100).nullable(),
    isActive: p.boolean().default(true),
  },
});

export class Cooperative extends CooperativeSchema.class {
  static make(props: {
    name: string;
    ruc: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
  }): Cooperative {
    const coop = new Cooperative();
    coop.name = props.name.trim();
    coop.ruc = props.ruc.trim();
    coop.address = props.address?.trim() ?? null;
    coop.department = props.department?.trim() ?? null;
    coop.province = props.province?.trim() ?? null;
    coop.district = props.district?.trim() ?? null;
    coop.isActive = true;
    coop.validate();
    return coop;
  }

  set(props: {
    name?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) this.name = props.name.trim();
    if (props.address !== undefined) this.address = props.address.trim();
    if (props.department !== undefined)
      this.department = props.department.trim();
    if (props.province !== undefined) this.province = props.province.trim();
    if (props.district !== undefined) this.district = props.district.trim();
    if (props.isActive !== undefined) this.isActive = props.isActive;
    this.validate();
  }

  private validate(): void {
    if (this.name !== undefined && (!this.name || this.name.length < 3)) {
      throw new ValidationException(
        'El nombre debe tener al menos 3 caracteres',
        'name',
      );
    }
    if (this.ruc !== undefined && (!this.ruc || !RUC_REGEX.test(this.ruc))) {
      throw new ValidationException(
        'El RUC debe tener exactamente 11 dígitos',
        'ruc',
      );
    }
  }
}

CooperativeSchema.setClass(Cooperative);
