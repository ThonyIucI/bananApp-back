import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IFieldTaskRepository } from '../repositories/field-task.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { FieldTask } from '../entities/field-task.entity';
import { FieldTaskDetail } from '../entities/field-task-detail.entity';
import { TaskTypeDetailSchema } from '../entities/task-type-detail-schema.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import {
  IProvidedDetail,
  validateAndEncodeDetails,
} from '../utils/validate-and-encode-details.util';

export interface TUpdateFieldTask {
  id: string;
  subPlotId?: string | null;
  performedAt?: Date;
  areaCoveredHa?: number | null;
  cost?: number | null;
  laborDays?: number | null;
  notes?: string | null;
  details?: IProvidedDetail[];
}

@Injectable()
export class UpdateFieldTaskService {
  constructor(
    private readonly em: EntityManager,
    private readonly fieldTaskRepo: IFieldTaskRepository,
    private readonly subPlotRepo: ISubPlotRepository,
  ) {}

  async execute(command: TUpdateFieldTask): Promise<FieldTask> {
    const fieldTask = await this.fieldTaskRepo.findById(command.id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');

    let subPlot: SubPlot | undefined = undefined;
    if (command.subPlotId !== undefined) {
      if (command.subPlotId === null) {
        subPlot = null;
      } else {
        subPlot = await this.subPlotRepo.findById(command.subPlotId);
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
      performedAt: command.performedAt,
      areaCoveredHa: command.areaCoveredHa,
      cost: command.cost,
      laborDays: command.laborDays,
      notes: command.notes,
    });

    if (command.details !== undefined) {
      await this.em.populate(fieldTask, [
        'taskType.detailSchemas.detailOptions',
      ]);
      const schemas = fieldTask.taskType.detailSchemas.getItems();
      await this.replaceDetails(fieldTask, command.details, schemas);
    }

    await this.fieldTaskRepo.flush();

    await this.em.populate(fieldTask, [
      'details',
      'taskType.detailSchemas.detailOptions',
      'plot',
      'subPlot',
      'performedByUser',
    ]);

    return fieldTask;
  }

  private async replaceDetails(
    fieldTask: FieldTask,
    newDetails: IProvidedDetail[],
    schemas: TaskTypeDetailSchema[],
  ): Promise<void> {
    const existingDetails = await this.em.find(FieldTaskDetail, { fieldTask });
    for (const existingDetail of existingDetails) {
      this.em.remove(existingDetail);
    }

    const encodedDetails = validateAndEncodeDetails(newDetails, schemas);
    for (const { detailKey, encodedValue } of encodedDetails) {
      this.em.persist(
        FieldTaskDetail.make({ fieldTask, detailKey, value: encodedValue }),
      );
    }
  }
}
