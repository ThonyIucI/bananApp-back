import { Injectable } from '@nestjs/common';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { SubPlot } from '../domain/sub-plot.entity';

@Injectable()
export class ListSubPlotsHandler {
  constructor(private readonly subPlotRepo: ISubPlotRepository) {}

  execute(plotId: string): Promise<SubPlot[]> {
    return this.subPlotRepo.findByPlot(plotId);
  }
}
