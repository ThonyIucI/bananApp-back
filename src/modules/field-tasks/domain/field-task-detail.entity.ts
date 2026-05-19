import { defineEntity, p } from '@mikro-orm/core';
import { entityIdV7 } from '../../shared/base.entity';
import { FieldTask } from './field-task.entity';

const FieldTaskDetailSchema = defineEntity({
  name: 'FieldTaskDetail',
  tableName: 'field_task_details',
  properties: {
    id: entityIdV7,
    fieldTask: () => p.manyToOne(FieldTask).deleteRule('cascade'),
    detailKey: p.string().length(100),
    valueText: p.text().nullable(),
    valueNumeric: p.decimal('number').precision(15).scale(6).nullable(),
    valueDate: p.datetime().nullable(),
    valueBoolean: p.boolean().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
  indexes: [{ properties: ['fieldTask', 'detailKey'], type: 'unique' }],
});

export class FieldTaskDetail extends FieldTaskDetailSchema.class {
  static make(props: {
    fieldTask: FieldTask;
    detailKey: string;
    valueText?: string | null;
    valueNumeric?: number | null;
    valueDate?: Date | null;
    valueBoolean?: boolean | null;
  }): FieldTaskDetail {
    const d = new FieldTaskDetail();
    d.fieldTask = props.fieldTask;
    d.detailKey = props.detailKey;
    d.valueText = props.valueText ?? null;
    d.valueNumeric = props.valueNumeric ?? null;
    d.valueDate = props.valueDate ?? null;
    d.valueBoolean = props.valueBoolean ?? null;
    return d;
  }
}

FieldTaskDetailSchema.setClass(FieldTaskDetail);
