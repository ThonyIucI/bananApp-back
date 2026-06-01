import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IFieldTaskRepository } from '../domain/field-task.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { FieldTaskDetail } from '../domain/field-task-detail.entity';
import {
  TaskTypeDetailSchema,
  EDetailValueType,
} from '../domain/task-type-detail-schema.entity';
import {
  encodeDetailValue,
  TDetailValue,
} from '../domain/field-task-detail-value.util';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import { TUpdateFieldTaskCommand } from './update-field-task.command';
import { FieldTask } from '../domain/field-task.entity';
import { mapFieldTask, type FieldTaskDto } from '../domain/field-task.mapper';
import { SubPlot } from '../../plots/domain/sub-plot.entity';

@Injectable()
export class UpdateFieldTaskHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly fieldTaskRepo: IFieldTaskRepository,
    private readonly subPlotRepo: ISubPlotRepository,
  ) {}

  async execute(cmd: TUpdateFieldTaskCommand): Promise<FieldTaskDto> {
    const fieldTask = await this.fieldTaskRepo.findById(cmd.id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');

    let subPlot: SubPlot | undefined = undefined;
    if (cmd.subPlotId !== undefined) {
      if (cmd.subPlotId === null) {
        subPlot = null;
      } else {
        subPlot = await this.subPlotRepo.findById(cmd.subPlotId);
        if (!subPlot) throw new NotFoundException('Subparcela no encontrada');
        const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
        const plotId = (fieldTask.plot as unknown as { id: string }).id;
        if (subPlotPlotId !== plotId) {
          throw new ValidationException(
            'La subparcela no pertenece a la parcela de esta labor',
            'subPlotId',
          );
        }
      }
    }

    fieldTask.set({
      subPlot,
      performedAt: cmd.performedAt,
      areaCoveredHa: cmd.areaCoveredHa,
      cost: cmd.cost,
      laborDays: cmd.laborDays,
      notes: cmd.notes,
    });

    if (cmd.details !== undefined) {
      await this.em.populate(fieldTask, [
        'taskType.detailSchemas.detailOptions',
      ]);
      const schemas = fieldTask.taskType.detailSchemas.getItems();
      await this.replaceDetails(fieldTask, cmd.details, schemas);
    }

    await this.fieldTaskRepo.flush();

    await this.em.populate(fieldTask, [
      'details',
      'taskType.detailSchemas.detailOptions',
      'plot',
      'subPlot',
      'performedByUser',
    ]);

    return mapFieldTask(fieldTask);
  }

  private async replaceDetails(
    fieldTask: FieldTask,
    newDetails: TUpdateFieldTaskCommand['details'],
    schemas: TaskTypeDetailSchema[],
  ): Promise<void> {
    if (!newDetails) return;

    const existing = await this.em.find(FieldTaskDetail, { fieldTask });
    for (const d of existing) {
      this.em.remove(d);
    }

    const providedMap = new Map(newDetails.map((d) => [d.detailKey, d]));
    const schemaMap = new Map(schemas.map((s) => [s.detailKey, s]));

    for (const schema of schemas) {
      if (!schema.isRequired) continue;
      const provided = providedMap.get(schema.detailKey);
      if (
        provided === undefined ||
        provided.value === null ||
        provided.value === undefined
      ) {
        throw new ValidationException(
          `El detalle "${schema.label}" es obligatorio para este tipo de labor`,
          schema.detailKey,
        );
      }
    }

    for (const detailCmd of newDetails) {
      const schema = schemaMap.get(detailCmd.detailKey);
      if (!schema) {
        throw new ValidationException(
          `El detalle "${detailCmd.detailKey}" no está definido para este tipo de labor`,
          detailCmd.detailKey,
        );
      }

      if (detailCmd.value !== null && detailCmd.value !== undefined) {
        this.validateDetailValue(detailCmd.value, schema);
      }

      const detail = FieldTaskDetail.make({
        fieldTask,
        detailKey: detailCmd.detailKey,
        value: encodeDetailValue(
          schema.valueType,
          detailCmd.value as TDetailValue,
        ),
      });
      this.em.persist(detail);
    }
  }

  private validateDetailValue(
    raw: string | number | boolean,
    schema: TaskTypeDetailSchema,
  ): void {
    if (schema.valueType === EDetailValueType.NUMERIC && isNaN(Number(raw))) {
      throw new ValidationException(
        `El detalle "${schema.label}" debe ser numérico`,
        schema.detailKey,
      );
    }

    if (schema.valueType === EDetailValueType.ENUM) {
      const activeKeys = schema.detailOptions
        .getItems()
        .filter((o) => o.isActive)
        .map((o) => o.key);

      if (activeKeys.length > 0 && !activeKeys.includes(String(raw))) {
        throw new ValidationException(
          `"${raw}" no es una opción válida para "${schema.label}"`,
          schema.detailKey,
        );
      }
    }
  }
}
