import { Collection, defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Plot } from '../../plots/domain/plot.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import { User } from '../../users/domain/user.entity';
import { TaskType } from './task-type.entity';
import { FieldTaskDetail } from './field-task-detail.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

const FieldTaskSchema = defineEntity({
  name: 'FieldTask',
  tableName: 'field_tasks',
  extends: BaseSchema,
  properties: {
    plot: () => p.manyToOne(Plot).deleteRule('cascade'),
    subPlot: () => p.manyToOne(SubPlot).nullable().deleteRule('set null'),
    taskType: () => p.manyToOne(TaskType).deleteRule('restrict'),
    performedAt: p.datetime(),
    performedByUser: () => p.manyToOne(User).deleteRule('cascade'),
    areaCoveredHa: p.decimal('number').precision(8).scale(4).nullable(),
    cost: p.decimal('number').precision(10).scale(2).nullable(),
    notes: p.text().nullable(),
    localUuid: p.string().length(36).unique().nullable(),
    syncedAt: p.datetime().nullable(),
    details: () =>
      p.oneToMany(FieldTaskDetail).mappedBy((d) => d.fieldTask),
  },
});

export class FieldTask extends FieldTaskSchema.class {
  declare details: Collection<FieldTaskDetail>;

  static make(props: {
    plot: Plot;
    taskType: TaskType;
    performedAt: Date;
    performedByUser: User;
    subPlot?: SubPlot | null;
    areaCoveredHa?: number | null;
    cost?: number | null;
    notes?: string | null;
    localUuid?: string | null;
  }): FieldTask {
    const ft = new FieldTask();
    ft.plot = props.plot;
    ft.taskType = props.taskType;
    ft.performedAt = props.performedAt;
    ft.performedByUser = props.performedByUser;
    ft.subPlot = props.subPlot ?? null;
    ft.areaCoveredHa = props.areaCoveredHa ?? null;
    ft.cost = props.cost ?? null;
    ft.notes = props.notes?.trim() ?? null;
    ft.localUuid = props.localUuid ?? null;
    ft.syncedAt = null;
    ft.validate();
    return ft;
  }

  set(props: {
    subPlot?: SubPlot | null;
    performedAt?: Date;
    areaCoveredHa?: number | null;
    cost?: number | null;
    notes?: string | null;
  }): void {
    if (props.subPlot !== undefined) this.subPlot = props.subPlot;
    if (props.performedAt !== undefined) this.performedAt = props.performedAt;
    if (props.areaCoveredHa !== undefined) this.areaCoveredHa = props.areaCoveredHa;
    if (props.cost !== undefined) this.cost = props.cost;
    if (props.notes !== undefined) this.notes = props.notes?.trim() ?? null;
    this.validate();
  }

  private validate(): void {
    if (this.performedAt && this.performedAt > new Date()) {
      throw new ValidationException(
        'La fecha de ejecución no puede ser futura',
        'performedAt',
      );
    }
    if (this.areaCoveredHa !== undefined && this.areaCoveredHa !== null && this.areaCoveredHa <= 0) {
      throw new ValidationException(
        'El área cubierta debe ser mayor a 0',
        'areaCoveredHa',
      );
    }
  }
}

FieldTaskSchema.setClass(FieldTask);
