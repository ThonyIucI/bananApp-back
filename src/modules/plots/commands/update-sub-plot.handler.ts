import { Injectable } from '@nestjs/common';
import { SubPlot } from '../domain/sub-plot.entity';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { IPlotRepository } from '../domain/plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import {
  BusinessRuleException,
  NotFoundException,
} from '../../shared/exceptions/domain.exception';

export interface UpdateSubPlotCommand {
  id: string;
  name?: string;
  responsibleUserId?: string | null;
  areaHectares?: number;
}

@Injectable()
export class UpdateSubPlotHandler {
  constructor(
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(cmd: UpdateSubPlotCommand): Promise<SubPlot> {
    const subPlot = await this.subPlotRepo.findById(cmd.id);
    if (!subPlot) throw new NotFoundException('Lote interno no encontrado');

    if (cmd.areaHectares !== undefined) {
      const plot = await this.plotRepo.findById(subPlot.plot.id);
      if (!plot) throw new NotFoundException('Parcela no encontrada');

      const currentSum = await this.subPlotRepo.sumAreaByPlot(plot.id);
      const oldArea = subPlot.areaHectares;
      const newSum = currentSum - oldArea + cmd.areaHectares;

      if (newSum > plot.getAreaAsNumber()) {
        throw new BusinessRuleException(
          `La suma de áreas de los lotes (${newSum.toFixed(4)} ha) excede el área de la parcela (${plot.getAreaAsNumber().toFixed(4)} ha)`,
        );
      }
    }

    let responsibleUser: typeof subPlot.responsibleUser | null | undefined =
      undefined;
    if (cmd.responsibleUserId !== undefined) {
      if (cmd.responsibleUserId === null) {
        responsibleUser = null;
      } else {
        responsibleUser = await this.userRepo.findById(cmd.responsibleUserId);
        if (!responsibleUser)
          throw new NotFoundException('Usuario responsable no encontrado');
      }
    }

    subPlot.set({
      name: cmd.name,
      responsibleUser,
      areaHectares: cmd.areaHectares,
    });

    await this.subPlotRepo.flush();
    return subPlot;
  }
}
