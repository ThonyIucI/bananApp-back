import { defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';

export enum ELifecycleType {
  CONTINUOUS_PERENNIAL = 'continuous_perennial',
  DETERMINATE_ANNUAL = 'determinate_annual',
  SEASONAL_PERENNIAL = 'seasonal_perennial',
}

const CropTypeSchema = defineEntity({
  name: 'CropType',
  tableName: 'crop_types',
  properties: {
    id: entityIdV7,
    key: p.string().length(100).unique(),
    label: p.string().length(200),
    lifecycleType: p.enum(() => ELifecycleType),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class CropType extends CropTypeSchema.class {
  static make(props: {
    key: string;
    label: string;
    lifecycleType: ELifecycleType;
    isActive?: boolean;
  }): CropType {
    const ct = new CropType();
    ct.key = props.key;
    ct.label = props.label;
    ct.lifecycleType = props.lifecycleType;
    ct.isActive = props.isActive ?? true;
    return ct;
  }
}

CropTypeSchema.setClass(CropType);
