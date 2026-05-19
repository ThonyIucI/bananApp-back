import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IFieldTaskRepository } from '../domain/field-task.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { FieldTaskDetail } from '../domain/field-task-detail.entity';
import { NotFoundException, ValidationException } from '../../shared/exceptions/domain.exception';
import { TUpdateFieldTaskCommand } from './update-field-task.command';
import { FieldTask } from '../domain/field-task.entity';

@Injectable()
export class UpdateFieldTaskHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly fieldTaskRepo: IFieldTaskRepository,
    private readonly subPlotRepo: ISubPlotRepository,
  ) {}

  async execute(cmd: TUpdateFieldTaskCommand): Promise<FieldTask> {
    const fieldTask = await this.fieldTaskRepo.findById(cmd.id);
    if (!fieldTask) throw new NotFoundException('Labor de campo no encontrada');

    let subPlot = undefined;
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
      notes: cmd.notes,
    });

    if (cmd.details !== undefined) {
      await this.replaceDetails(fieldTask, cmd.details);
    }

    await this.fieldTaskRepo.flush();
    return fieldTask;
  }

  private async replaceDetails(
    fieldTask: FieldTask,
    newDetails: TUpdateFieldTaskCommand['details'],
  ): Promise<void> {
    if (!newDetails) return;

    const existing = await this.em.find(FieldTaskDetail, { fieldTask });
    for (const d of existing) {
      this.em.remove(d);
    }

    for (const detailCmd of newDetails) {
      const detail = FieldTaskDetail.make({
        fieldTask,
        detailKey: detailCmd.detailKey,
        valueText: detailCmd.valueText,
        valueNumeric: detailCmd.valueNumeric,
        valueDate: detailCmd.valueDate,
        valueBoolean: detailCmd.valueBoolean,
      });
      this.em.persist(detail);
    }
  }
}
