import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IFieldTaskRepository } from '../domain/field-task.repository';
import { ITaskTypeRepository } from '../domain/task-type.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { FieldTask } from '../domain/field-task.entity';
import { FieldTaskDetail } from '../domain/field-task-detail.entity';
import { TaskTypeDetailSchema, EDetailValueType } from '../domain/task-type-detail-schema.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import { TCreateFieldTaskCommand } from './create-field-task.command';
import { SubPlot } from '../../plots/domain/sub-plot.entity';

@Injectable()
export class CreateFieldTaskHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly fieldTaskRepo: IFieldTaskRepository,
    private readonly taskTypeRepo: ITaskTypeRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(cmd: TCreateFieldTaskCommand): Promise<FieldTask> {
    const [plot, taskType, performedByUser] = await Promise.all([
      this.plotRepo.findById(cmd.plotId),
      this.taskTypeRepo.findByKey(cmd.taskTypeKey),
      this.userRepo.findById(cmd.performedByUserId),
    ]);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    if (!taskType) throw new NotFoundException(`Tipo de labor "${cmd.taskTypeKey}" no encontrado`);
    if (!performedByUser) throw new NotFoundException('Usuario ejecutor no encontrado');

    let subPlot: SubPlot | undefined;
    if (cmd.subPlotId) {
      subPlot = await this.subPlotRepo.findById(cmd.subPlotId) ?? undefined;
      if (!subPlot) throw new NotFoundException('Subparcela no encontrada');
      const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
      if (subPlotPlotId !== cmd.plotId) {
        throw new ValidationException(
          'La subparcela no pertenece a la parcela seleccionada',
          'subPlotId',
        );
      }
    }

    this.validateDetails(cmd.details ?? [], taskType.detailSchemas.getItems());

    return this.em.transactional(async (txEm) => {
      const fieldTask = FieldTask.make({
        plot,
        taskType,
        performedAt: cmd.performedAt,
        performedByUser,
        subPlot,
        areaCoveredHa: cmd.areaCoveredHa,
        cost: cmd.cost,
        notes: cmd.notes,
        localUuid: cmd.localUuid,
      });
      txEm.persist(fieldTask);

      for (const detailCmd of cmd.details ?? []) {
        const detail = FieldTaskDetail.make({
          fieldTask,
          detailKey: detailCmd.detailKey,
          valueText: detailCmd.valueText,
          valueNumeric: detailCmd.valueNumeric,
          valueDate: detailCmd.valueDate,
          valueBoolean: detailCmd.valueBoolean,
        });
        txEm.persist(detail);
      }

      return fieldTask;
    });
  }

  private validateDetails(
    providedDetails: TCreateFieldTaskCommand['details'],
    schemas: TaskTypeDetailSchema[],
  ): void {
    const providedMap = new Map(providedDetails.map((d) => [d.detailKey, d]));

    for (const schema of schemas) {
      if (!schema.isRequired) continue;
      const provided = providedMap.get(schema.detailKey);
      if (!provided) {
        throw new ValidationException(
          `El detalle "${schema.label}" es obligatorio para este tipo de labor`,
          schema.detailKey,
        );
      }
      this.validateDetailValue(provided, schema);
    }

    for (const detail of providedDetails) {
      const schema = schemas.find((s) => s.detailKey === detail.detailKey);
      if (!schema) {
        throw new ValidationException(
          `El detalle "${detail.detailKey}" no está definido para este tipo de labor`,
          detail.detailKey,
        );
      }
      this.validateDetailValue(detail, schema);
    }
  }

  private validateDetailValue(
    detail: TCreateFieldTaskCommand['details'][number],
    schema: TaskTypeDetailSchema,
  ): void {
    if (schema.valueType === EDetailValueType.NUMERIC && detail.valueNumeric === undefined) {
      throw new ValidationException(
        `El detalle "${schema.label}" debe ser numérico`,
        schema.detailKey,
      );
    }
    if (schema.valueType === EDetailValueType.ENUM) {
      const options = schema.enumOptions as string[] | null;
      if (options && detail.valueText && !options.includes(detail.valueText)) {
        throw new ValidationException(
          `"${detail.valueText}" no es una opción válida para "${schema.label}"`,
          schema.detailKey,
        );
      }
    }
  }
}
