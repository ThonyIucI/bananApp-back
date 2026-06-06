import { Collection, defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { CropType } from '../../crop-types/domain/crop-type.entity';
import { TaskTypeDetailSchema } from './task-type-detail-schema.entity';

/**
 * Catálogo de labores agrícolas soportadas (EAV).
 * Las keys coinciden con `task_types.key` en backend (seed-task-types.service.ts).
 */
export enum ETaskTypeKey {
  BUNDLING = 'bundling',
  HARVEST = 'harvest',
  PRUNING = 'pruning',
  IRRIGATION = 'irrigation',
  FERTILIZATION_ORGANIC = 'fertilization_organic',
  FERTILIZATION_FOLIAR = 'fertilization_foliar',
  PEST_CONTROL_BIOLOGICAL = 'pest_control_biological',
  MEASUREMENT = 'measurement',
  PLANTING = 'planting',
  WEEDING = 'weeding',
  MULCHING = 'mulching',
  COVER_CROP_SEEDING = 'cover_crop_seeding',
  SOIL_ANALYSIS = 'soil_analysis',
  SAP_ANALYSIS = 'sap_analysis',
  NECK_PROTECTOR = 'neck_protector',
}

const TaskTypeSchema = defineEntity({
  name: 'TaskType',
  tableName: 'task_types',
  properties: {
    id: entityIdV7,
    key: p.string().length(100).unique(),
    label: p.string().length(200),
    isActive: p.boolean().default(true),
    cropTypes: () =>
      p
        .manyToMany(CropType)
        .pivotTable('crop_type_task_type')
        .joinColumn('task_type_id')
        .inverseJoinColumn('crop_type_id'),
    detailSchemas: () =>
      p.oneToMany(TaskTypeDetailSchema).mappedBy((s) => s.taskType),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class TaskType extends TaskTypeSchema.class {
  declare cropTypes: Collection<CropType>;
  declare detailSchemas: Collection<TaskTypeDetailSchema>;

  static make(props: {
    key: string;
    label: string;
    isActive?: boolean;
  }): TaskType {
    const tt = new TaskType();
    tt.key = props.key;
    tt.label = props.label;
    tt.isActive = props.isActive ?? true;
    return tt;
  }
}

TaskTypeSchema.setClass(TaskType);
