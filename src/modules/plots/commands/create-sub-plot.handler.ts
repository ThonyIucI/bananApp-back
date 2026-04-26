import { Injectable } from '@nestjs/common';
import { SubPlot } from '../domain/sub-plot.entity';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { IPlotRepository } from '../domain/plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import {
  BusinessRuleException,
  NotFoundException,
} from '../../shared/exceptions/domain.exception';
import { User } from '../../users/domain/user.entity';

export interface CreateSubPlotCommand {
  plotId: string;
  name: string;
  responsibleUserId?: string;
  areaHectares: number;
}

@Injectable()
export class CreateSubPlotHandler {
  constructor(
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(cmd: CreateSubPlotCommand): Promise<SubPlot> {
    const plot = await this.plotRepo.findById(cmd.plotId);
    if (!plot) throw new NotFoundException('Parcela no encontrada');

    const currentSum = await this.subPlotRepo.sumAreaByPlot(cmd.plotId);
    const plotArea = plot.getAreaAsNumber();
    if (currentSum + cmd.areaHectares > plotArea) {
      throw new BusinessRuleException(
        `La suma de áreas de los lotes (${(currentSum + cmd.areaHectares).toFixed(4)} ha) excede el área de la parcela (${plotArea.toFixed(4)} ha)`,
      );
    }

    let responsibleUser: User | null = null;
    if (cmd.responsibleUserId) {
      responsibleUser = await this.userRepo.findById(cmd.responsibleUserId);
      if (!responsibleUser)
        throw new NotFoundException('Usuario responsable no encontrado');
    }

    const subPlot = SubPlot.make({
      name: cmd.name,
      plot,
      responsibleUser,
      areaHectares: cmd.areaHectares,
    });

    this.subPlotRepo.persist(subPlot);
    await this.subPlotRepo.flush();
    return subPlot;
  }
}
