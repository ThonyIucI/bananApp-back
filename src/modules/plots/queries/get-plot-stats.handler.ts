import { Injectable } from '@nestjs/common';
import { IPlotRepository, PlotStats } from '../domain/plot.repository';

export interface GetPlotStatsQuery {
  cooperativeId?: string;
  ownerUserId?: string;
  sectorId?: string;
}

/**
 * Devuelve métricas agregadas de parcelas: cantidad total y sumatoria de hectáreas.
 * Si no se pasa filtro, agrega sobre toda la base (uso típico: superadmin).
 */
@Injectable()
export class GetPlotStatsHandler {
  constructor(private readonly plotRepo: IPlotRepository) {}

  execute(query: GetPlotStatsQuery = {}): Promise<PlotStats> {
    return this.plotRepo.getStats(query);
  }
}
