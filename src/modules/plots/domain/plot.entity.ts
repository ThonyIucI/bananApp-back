import { Collection, defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Sector } from '../../sectors/domain/sector.entity';
import { User } from '../../users/domain/user.entity';
import { CropType } from '../../crop-types/domain/crop-type.entity';
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
    cropType: () => p.manyToOne(CropType).nullable().deleteRule('restrict'),
    areaHectares: p.decimal('number').precision(8).scale(4),
    cadastralCode: p.string().length(50).nullable(),
    latitude: p.decimal('number').precision(9).scale(6).nullable(),
    longitude: p.decimal('number').precision(9).scale(6).nullable(),
    altitude: p.decimal('number').precision(8).scale(2).nullable(),
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
    cropType?: CropType | null;
    areaHectares: number;
    cadastralCode?: string;
    latitude: number;
    longitude: number;
    altitude?: number | null;
  }): Plot {
    const plot = new Plot();
    plot.name = props.name.trim();
    plot.sector = props.sector ?? null;
    plot.ownerUser = props.ownerUser;
    plot.workerUser = props.workerUser ?? null;
    plot.cropType = props.cropType ?? null;
    plot.areaHectares = props.areaHectares;
    plot.cadastralCode = props.cadastralCode?.trim() ?? null;
    plot.latitude = props.latitude;
    plot.longitude = props.longitude;
    plot.altitude = props.altitude ?? null;
    plot.validate();
    return plot;
  }

  set(props: {
    name?: string;
    sector?: Sector;
    ownerUser?: User;
    workerUser?: User | null;
    cropType?: CropType | null;
    areaHectares?: number;
    cadastralCode?: string | null;
    latitude?: number;
    longitude?: number;
    altitude?: number | null;
  }): void {
    if (props.name !== undefined) this.name = props.name.trim();
    if (props.sector !== undefined) this.sector = props.sector;
    if (props.ownerUser !== undefined) this.ownerUser = props.ownerUser;
    if (props.workerUser !== undefined) this.workerUser = props.workerUser;
    if (props.cropType !== undefined) this.cropType = props.cropType;
    if (props.areaHectares !== undefined)
      this.areaHectares = props.areaHectares;
    if (props.cadastralCode !== undefined)
      this.cadastralCode = props.cadastralCode;
    if (props.latitude !== undefined) this.latitude = props.latitude;
    if (props.longitude !== undefined) this.longitude = props.longitude;
    if (props.altitude !== undefined) this.altitude = props.altitude;
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
    if (this.latitude != null && (this.latitude < -90 || this.latitude > 90)) {
      throw new ValidationException(
        'La latitud debe estar entre -90 y 90',
        'latitude',
      );
    }
    if (
      this.longitude != null &&
      (this.longitude < -180 || this.longitude > 180)
    ) {
      throw new ValidationException(
        'La longitud debe estar entre -180 y 180',
        'longitude',
      );
    }
    if (
      this.altitude != null &&
      (this.altitude < -500 || this.altitude > 9000)
    ) {
      throw new ValidationException(
        'La altitud debe estar entre -500 y 9000 metros',
        'altitude',
      );
    }
  }
}

PlotSchema.setClass(Plot);
