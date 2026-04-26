import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Plot } from './plot.entity';
import { User } from '../../users/domain/user.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

const SubPlotSchema = defineEntity({
  name: 'SubPlot',
  tableName: 'sub_plots',
  extends: BaseSchema,
  properties: {
    name: p.string().length(200),
    plot: () => p.manyToOne(Plot).deleteRule('cascade'),
    responsibleUser: () =>
      p
        .manyToOne(User)
        .nullable()
        .deleteRule('set null')
        .serializedName('responsibleUserId'),
    areaHectares: p.decimal('number').precision(8).scale(4),
  },
});

export class SubPlot extends SubPlotSchema.class {
  static make(props: {
    name: string;
    plot: Plot;
    responsibleUser?: User;
    areaHectares: number;
  }): SubPlot {
    const subPlot = new SubPlot();
    subPlot.name = props.name.trim();
    subPlot.plot = props.plot;
    subPlot.responsibleUser = props.responsibleUser ?? null;
    subPlot.areaHectares = props.areaHectares;
    subPlot.validate();
    return subPlot;
  }

  set(props: {
    name?: string;
    responsibleUser?: User | null;
    areaHectares?: number;
  }): void {
    if (props.name !== undefined) this.name = props.name.trim();
    if (props.responsibleUser !== undefined)
      this.responsibleUser = props.responsibleUser;
    if (props.areaHectares !== undefined)
      this.areaHectares = props.areaHectares;
    this.validate();
  }

  private validate(): void {
    if (this.name !== undefined && (!this.name || this.name.length < 2)) {
      throw new ValidationException(
        'El nombre del lote debe tener al menos 2 caracteres',
        'name',
      );
    }
    const area = this.areaHectares;
    if (this.areaHectares !== undefined && (isNaN(area) || area <= 0)) {
      throw new ValidationException(
        'El área debe ser un número positivo',
        'areaHectares',
      );
    }
  }
}

SubPlotSchema.setClass(SubPlot);
