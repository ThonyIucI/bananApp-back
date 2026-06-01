import { defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { TaskTypeDetailSchema } from './task-type-detail-schema.entity';

const TaskTypeDetailOptionSchema = defineEntity({
  name: 'TaskTypeDetailOption',
  tableName: 'task_type_detail_options',
  properties: {
    id: entityIdV7(),
    detailSchema: () => p.manyToOne(TaskTypeDetailSchema).deleteRule('cascade'),
    label: p.string().length(200),
    key: p.string().length(50),
    sortOrder: p.integer().default(0),
    isActive: p.boolean().default(true),
  },
  indexes: [{ properties: ['detailSchema', 'key'], type: 'unique' }],
});

export class TaskTypeDetailOption extends TaskTypeDetailOptionSchema.class {
  static make(props: {
    detailSchema: TaskTypeDetailSchema;
    label: string;
    key: string;
    sortOrder?: number;
    isActive?: boolean;
  }): TaskTypeDetailOption {
    const o = new TaskTypeDetailOption();
    o.detailSchema = props.detailSchema;
    o.label = props.label;
    o.key = props.key;
    o.sortOrder = props.sortOrder ?? 0;
    o.isActive = props.isActive ?? true;
    return o;
  }
}

TaskTypeDetailOptionSchema.setClass(TaskTypeDetailOption);
