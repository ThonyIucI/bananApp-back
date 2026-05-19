import { defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { TaskType } from './task-type.entity';

export enum EDetailValueType {
  TEXT = 'text',
  NUMERIC = 'numeric',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
}

const TaskTypeDetailSchemaSchema = defineEntity({
  name: 'TaskTypeDetailSchema',
  tableName: 'task_type_detail_schemas',
  properties: {
    id: entityIdV7,
    taskType: () => p.manyToOne(TaskType).deleteRule('cascade'),
    detailKey: p.string().length(100),
    label: p.string().length(200),
    valueType: p.enum(() => EDetailValueType),
    isRequired: p.boolean().default(true),
    enumOptions: p.json().nullable(),
    validationRules: p.json().nullable(),
    sortOrder: p.integer().default(0),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
  indexes: [{ properties: ['taskType', 'detailKey'], type: 'unique' }],
});

export class TaskTypeDetailSchema extends TaskTypeDetailSchemaSchema.class {
  static make(props: {
    taskType: TaskType;
    detailKey: string;
    label: string;
    valueType: EDetailValueType;
    isRequired?: boolean;
    enumOptions?: string[] | null;
    validationRules?: Record<string, unknown> | null;
    sortOrder?: number;
  }): TaskTypeDetailSchema {
    const s = new TaskTypeDetailSchema();
    s.taskType = props.taskType;
    s.detailKey = props.detailKey;
    s.label = props.label;
    s.valueType = props.valueType;
    s.isRequired = props.isRequired ?? true;
    s.enumOptions = props.enumOptions ?? null;
    s.validationRules = props.validationRules ?? null;
    s.sortOrder = props.sortOrder ?? 0;
    return s;
  }
}

TaskTypeDetailSchemaSchema.setClass(TaskTypeDetailSchema);
