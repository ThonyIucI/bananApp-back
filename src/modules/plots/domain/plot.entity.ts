import { Collection, defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Sector } from '../../sectors/domain/sector.entity';
import { User } from '../../users/domain/user.entity';
import { SubPlot } from './sub-plot.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

const PlotSchema = defineEntity({
  name: 'Plot',
  tableName: 'plots',
  extends: BaseSchema,
  properties: {
    name: p.string().length(200),
    sector: () => p.manyToOne(Sector).nullable().deleteRule('set null'),
    ownerUser: () => p.manyToOne(User).deleteRule('cascade'),
    workerUser: () => p.manyToOne(User).nullable().deleteRule('set null'),
    areaHectares: p.decimal('number').precision(8).scale(4),
    cadastralCode: p.string().length(50).nullable(),
    subPlots: () => p.oneToMany(SubPlot).mappedBy((im) => im.plot),
  },
});

export class Plot extends PlotSchema.class {
  declare subPlots: Collection<SubPlot>;

  static make(props: {
    name: string;
    sector?: Sector | null;
    ownerUser: User;
    workerUser?: User;
    areaHectares: number;
    cadastralCode?: string;
  }): Plot {
    const plot = new Plot();
    plot.name = props.name.trim();
    plot.sector = props.sector ?? null;
    plot.ownerUser = props.ownerUser;
    plot.workerUser = props.workerUser ?? null;
    plot.areaHectares = props.areaHectares;
    plot.cadastralCode = props.cadastralCode?.trim() ?? null;
    plot.validate();
    return plot;
  }

  set(props: {
    name?: string;
    sector?: Sector;
    ownerUser?: User;
    workerUser?: User | null;
    areaHectares?: number;
    cadastralCode?: string | null;
  }): void {
    if (props.name !== undefined) this.name = props.name.trim();
    if (props.sector !== undefined) this.sector = props.sector;
    if (props.ownerUser !== undefined) this.ownerUser = props.ownerUser;
    if (props.workerUser !== undefined) this.workerUser = props.workerUser;
    if (props.areaHectares !== undefined)
      this.areaHectares = props.areaHectares;
    if (props.cadastralCode !== undefined)
      this.cadastralCode = props.cadastralCode;
    this.validate();
  }

  getAreaAsNumber(): number {
    return this.areaHectares;
  }

  private validate(): void {
    if (this.name !== undefined && (!this.name || this.name.length < 2)) {
      throw new ValidationException(
        'El nombre de la parcela debe tener al menos 2 caracteres',
        'name',
      );
    }
    const area = parseFloat(this.areaHectares as unknown as string);
    if (this.areaHectares !== undefined && (isNaN(area) || area <= 0)) {
      throw new ValidationException(
        'El área debe ser un número positivo',
        'areaHectares',
      );
    }
  }
}

PlotSchema.setClass(Plot);
