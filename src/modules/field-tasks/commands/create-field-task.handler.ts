import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ITaskTypeRepository } from '../domain/task-type.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { FieldTask } from '../domain/field-task.entity';
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
import { TCreateFieldTaskCommand } from './create-field-task.command';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import { mapFieldTask, type FieldTaskDto } from '../domain/field-task.mapper';

@Injectable()
export class CreateFieldTaskHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly taskTypeRepo: ITaskTypeRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(cmd: TCreateFieldTaskCommand): Promise<FieldTaskDto> {
    const [plot, taskType, performedByUser] = await Promise.all([
      this.plotRepo.findById(cmd.plotId),
      this.taskTypeRepo.findByKey(cmd.taskTypeKey),
      this.userRepo.findById(cmd.performedByUserId),
    ]);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    if (!taskType)
      throw new NotFoundException(
        `Tipo de labor "${cmd.taskTypeKey}" no encontrado`,
      );
    if (!performedByUser)
      throw new NotFoundException('Usuario ejecutor no encontrado');

    let subPlot: SubPlot | undefined;
    if (cmd.subPlotId) {
      subPlot = (await this.subPlotRepo.findById(cmd.subPlotId)) ?? undefined;
      if (!subPlot) throw new NotFoundException('Subparcela no encontrada');
      const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
      if (subPlotPlotId !== cmd.plotId) {
        throw new ValidationException(
          'La subparcela no pertenece a la parcela seleccionada',
          'subPlotId',
        );
      }
    }

    await this.em.populate(taskType, ['detailSchemas.detailOptions']);
    const schemas = taskType.detailSchemas.getItems();

    const encodedDetails = this.validateAndEncodeDetails(
      cmd.details ?? [],
      schemas,
    );

    // Default areaCoveredHa to the plot's area when not specified
    const areaCoveredHa =
      cmd.areaCoveredHa ?? (plot.areaHectares as unknown as number) ?? null;

    const fieldTask = await this.em.transactional((txEm) => {
      const ft = FieldTask.make({
        plot,
        taskType,
        performedAt: cmd.performedAt,
        performedByUser,
        subPlot,
        areaCoveredHa,
        cost: cmd.cost,
        laborDays: cmd.laborDays,
        notes: cmd.notes,
        localUuid: cmd.localUuid,
      });
      txEm.persist(ft);

      for (const { detailKey, encodedValue } of encodedDetails) {
        const detail = FieldTaskDetail.make({
          fieldTask: ft,
          detailKey,
          value: encodedValue,
        });
        txEm.persist(detail);
      }

      return ft;
    });

    // Reload with all relations needed for the mapper (details + taskType schemas + options)
    await this.em.populate(fieldTask, [
      'details',
      'taskType.detailSchemas.detailOptions',
      'plot',
      'subPlot',
      'performedByUser',
    ]);

    return mapFieldTask(fieldTask);
  }

  private validateAndEncodeDetails(
    providedDetails: TCreateFieldTaskCommand['details'],
    schemas: TaskTypeDetailSchema[],
  ): Array<{ detailKey: string; encodedValue: string | null }> {
    const providedMap = new Map(providedDetails.map((d) => [d.detailKey, d]));

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

    const schemaMap = new Map(schemas.map((s) => [s.detailKey, s]));

    return providedDetails.map((detail) => {
      const schema = schemaMap.get(detail.detailKey);
      if (!schema) {
        throw new ValidationException(
          `El detalle "${detail.detailKey}" no está definido para este tipo de labor`,
          detail.detailKey,
        );
      }

      if (detail.value !== null && detail.value !== undefined) {
        this.validateDetailValue(detail.value, schema);
      }

      return {
        detailKey: detail.detailKey,
        encodedValue: encodeDetailValue(
          schema.valueType,
          detail.value as TDetailValue,
        ),
      };
    });
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
