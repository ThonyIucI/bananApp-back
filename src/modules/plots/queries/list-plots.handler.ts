import { Injectable } from '@nestjs/common';
import { IPlotRepository, PlotFilters } from '../domain/plot.repository';
import { PlotLookupDto, PlotMapper } from '../domain/plot.mapper';

export interface ListPlotsResult {
  items: PlotLookupDto[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ListPlotsHandler {
  constructor(private readonly plotRepo: IPlotRepository) {}

  async execute(filters: PlotFilters = {}): Promise<ListPlotsResult> {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const { items, total } = await this.plotRepo.findAll({
      ...filters,
      limit,
      offset,
    });
    return {
      items: items.map((plot) => PlotMapper.toListDto(plot)),
      total,
      limit,
      offset,
    };
  }
}
