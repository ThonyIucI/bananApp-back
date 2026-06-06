import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ITaskTypeRepository } from '../repositories/task-type.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { FieldTask } from '../entities/field-task.entity';
import { FieldTaskDetail } from '../entities/field-task-detail.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import {
  IProvidedDetail,
  validateAndEncodeDetails,
} from '../utils/validate-and-encode-details.util';

export interface TCreateFieldTask {
  plotId: string;
  taskTypeKey: string;
  performedAt: Date;
  performedByUserId: string;
  subPlotId?: string | null;
  areaCoveredHa?: number | null;
  cost?: number | null;
  laborDays?: number | null;
  notes?: string | null;
  localUuid?: string | null;
  details: IProvidedDetail[];
}

@Injectable()
export class CreateFieldTaskService {
  constructor(
    private readonly em: EntityManager,
    private readonly taskTypeRepo: ITaskTypeRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(command: TCreateFieldTask): Promise<FieldTask> {
    const [plot, taskType, performedByUser] = await Promise.all([
      this.plotRepo.findById(command.plotId),
      this.taskTypeRepo.findByKey(command.taskTypeKey),
      this.userRepo.findById(command.performedByUserId),
    ]);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    if (!taskType)
      throw new NotFoundException(
        `Tipo de labor "${command.taskTypeKey}" no encontrado`,
      );
    if (!performedByUser)
      throw new NotFoundException('Usuario ejecutor no encontrado');

    let subPlot: SubPlot | undefined;
    if (command.subPlotId) {
      subPlot =
        (await this.subPlotRepo.findById(command.subPlotId)) ?? undefined;
      if (!subPlot) throw new NotFoundException('Subparcela no encontrada');
      const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
      if (subPlotPlotId !== command.plotId) {
        throw new ValidationException(
          'La subparcela no pertenece a la parcela seleccionada',
          'subPlotId',
        );
      }
    }

    await this.em.populate(taskType, ['detailSchemas.detailOptions']);
    const schemas = taskType.detailSchemas.getItems();
    const encodedDetails = validateAndEncodeDetails(
      command.details ?? [],
      schemas,
    );

    // El área cubierta por defecto es la de la parcela cuando no se especifica.
    const areaCoveredHa =
      command.areaCoveredHa ?? (plot.areaHectares as unknown as number) ?? null;

    const fieldTask = await this.em.transactional((txEm) => {
      const createdFieldTask = FieldTask.make({
        plot,
        taskType,
        performedAt: command.performedAt,
        performedByUser,
        subPlot,
        areaCoveredHa,
        cost: command.cost,
        laborDays: command.laborDays,
        notes: command.notes,
        localUuid: command.localUuid,
      });
      txEm.persist(createdFieldTask);

      for (const { detailKey, encodedValue } of encodedDetails) {
        txEm.persist(
          FieldTaskDetail.make({
            fieldTask: createdFieldTask,
            detailKey,
            value: encodedValue,
          }),
        );
      }

      return createdFieldTask;
    });

    // Recargar las relaciones que el controller necesita para serializar.
    await this.em.populate(fieldTask, [
      'details',
      'taskType.detailSchemas.detailOptions',
      'plot',
      'subPlot',
      'performedByUser',
    ]);

    return fieldTask;
  }
}
