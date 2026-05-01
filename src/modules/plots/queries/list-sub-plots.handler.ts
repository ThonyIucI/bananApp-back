import { Injectable } from '@nestjs/common';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { SubPlot } from '../domain/sub-plot.entity';

export interface ListSubPlotsFilters {
  plotId?: string;
  plotIds?: string[];
}

@Injectable()
export class ListSubPlotsHandler {
  constructor(private readonly subPlotRepo: ISubPlotRepository) {}

  execute(filters: ListSubPlotsFilters): Promise<SubPlot[]> {
    if (filters.plotIds?.length) {
      return this.subPlotRepo.findByPlots(filters.plotIds);
    }
    if (filters.plotId) {
      return this.subPlotRepo.findByPlot(filters.plotId);
    }
    return Promise.resolve([]);
  }
}
