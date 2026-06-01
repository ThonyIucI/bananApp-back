import { defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { FieldTask } from './field-task.entity';

const FieldTaskDetailSchema = defineEntity({
  name: 'FieldTaskDetail',
  tableName: 'field_task_details',
  properties: {
    id: entityIdV7(),
    fieldTask: () => p.manyToOne(FieldTask).deleteRule('cascade'),
    detailKey: p.string().length(100),
    value: p.text().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
  indexes: [{ properties: ['fieldTask', 'detailKey'], type: 'unique' }],
});

export class FieldTaskDetail extends FieldTaskDetailSchema.class {
  static make(props: {
    fieldTask: FieldTask;
    detailKey: string;
    value?: string | null;
  }): FieldTaskDetail {
    const d = new FieldTaskDetail();
    d.fieldTask = props.fieldTask;
    d.detailKey = props.detailKey;
    d.value = props.value ?? null;
    return d;
  }
}

FieldTaskDetailSchema.setClass(FieldTaskDetail);
