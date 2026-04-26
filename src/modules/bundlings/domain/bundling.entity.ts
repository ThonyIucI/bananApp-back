import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Plot } from '../../plots/domain/plot.entity';
import { User } from '../../users/domain/user.entity';
import { RibbonCalendar } from '../../ribbon-calendars/domain/ribbon-calendar.entity';
import {
  BusinessRuleException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';

const BundlingSchema = defineEntity({
  name: 'Bundling',
  tableName: 'bundlings',
  extends: BaseSchema,
  properties: {
    plot: () => p.manyToOne(Plot).deleteRule('cascade'),
    enfundadorUser: () => p.manyToOne(User).deleteRule('cascade'),
    quantity: p.integer(),
    ribbonCalendar: () =>
      p.manyToOne(RibbonCalendar).nullable().deleteRule('set null'),
    ribbonColorFree: p.string().length(50).nullable(),
    bundledAt: p.datetime(),
    notes: p.string().length(500).nullable(),
    localUuid: p.uuid().unique(),
    syncedAt: p.datetime().nullable(),
  },
});

export class Bundling extends BundlingSchema.class {
  static make(props: {
    plot: Plot;
    enfundadorUser: User;
    quantity: number;
    bundledAt: Date;
    localUuid: string;
    ribbonCalendar?: RibbonCalendar;
    ribbonColorFree?: string;
    notes?: string;
  }): Bundling {
    const b = new Bundling();
    b.plot = props.plot;
    b.enfundadorUser = props.enfundadorUser;
    b.quantity = props.quantity;
    b.bundledAt = props.bundledAt;
    b.localUuid = props.localUuid;
    b.ribbonCalendar = props.ribbonCalendar ?? null;
    b.ribbonColorFree = props.ribbonColorFree?.trim() ?? null;
    b.notes = props.notes?.trim() ?? null;
    b.syncedAt = null;
    b.validate();
    return b;
  }

  private validate(): void {
    if (this.quantity !== undefined && this.quantity <= 0) {
      throw new ValidationException(
        'La cantidad de fundas debe ser mayor a 0',
        'quantity',
      );
    }
    if (this.ribbonCalendar === null && !this.ribbonColorFree) {
      throw new BusinessRuleException(
        'Debe indicar el calendario de cinta o un color de cinta libre',
      );
    }
  }
}

BundlingSchema.setClass(Bundling);
