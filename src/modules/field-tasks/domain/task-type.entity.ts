import { Collection, defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { CropType } from '../../crop-types/domain/crop-type.entity';
import { TaskTypeDetailSchema } from './task-type-detail-schema.entity';

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
