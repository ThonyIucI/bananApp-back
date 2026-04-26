import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Cooperative } from '../../cooperatives/domain/cooperative.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

const SectorSchema = defineEntity({
  name: 'Sector',
  tableName: 'sectors',
  extends: BaseSchema,
  properties: {
    name: p.string().length(100),
    cooperative: () => p.manyToOne(Cooperative).deleteRule('cascade'),
  },
});

export class Sector extends SectorSchema.class {
  static make(props: { name: string; cooperative: Cooperative }): Sector {
    const s = new Sector();
    s.name = props.name.trim();
    s.cooperative = props.cooperative;
    s.validate();
    return s;
  }

  update(name: string): void {
    this.name = name.trim();
    this.validate();
  }

  private validate(): void {
    if (this.name !== undefined && (!this.name || this.name.length < 2)) {
      throw new ValidationException(
        'El nombre del sector debe tener al menos 2 caracteres',
        'name',
      );
    }
  }
}

SectorSchema.setClass(Sector);
