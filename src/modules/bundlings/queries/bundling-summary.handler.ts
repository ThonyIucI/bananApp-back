import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

export interface BundlingSummaryQuery {
  cooperativeId?: string;
  plotId?: string;
  plotIds?: string[];
  enfundadorUserId?: string;
  from?: Date;
  to?: Date;
}

export interface SubPlotSummary {
  subPlotId: string;
  subPlotName: string;
  totalQuantity: number;
  totalRecords: number;
}

export interface PlotSummary {
  plotId: string;
  plotName: string;
  totalQuantity: number;
  totalRecords: number;
  bySubPlot: SubPlotSummary[];
}

export interface BundlingSummaryResult {
  totalQuantity: number;
  totalRecords: number;
  byPlot: PlotSummary[];
}

interface SummaryRow {
  plot_id: string;
  plot_name: string;
  sub_plot_id: string | null;
  sub_plot_name: string | null;
  total_quantity: string;
  total_records: string;
}

@Injectable()
export class BundlingSummaryHandler {
  constructor(private readonly em: EntityManager) {}

  /** Aggregates bundling totals by plot and sub-plot using a single SQL query. */
  async execute(query: BundlingSummaryQuery): Promise<BundlingSummaryResult> {
    const params: unknown[] = [];
    const conditions: string[] = ['b.deleted_at IS NULL'];
    const joins: string[] = [];

    if (query.cooperativeId) {
      joins.push('JOIN sectors s ON s.id = p.sector_id');
      params.push(query.cooperativeId);
      conditions.push(`s.cooperative_id = $${params.length}`);
    }
    if (query.plotIds?.length) {
      params.push(query.plotIds);
      conditions.push(`b.plot_id = ANY($${params.length})`);
    } else if (query.plotId) {
      params.push(query.plotId);
      conditions.push(`b.plot_id = $${params.length}`);
    }
    if (query.enfundadorUserId) {
      params.push(query.enfundadorUserId);
      conditions.push(`b.enfundador_user_id = $${params.length}`);
    }
    if (query.from) {
      params.push(query.from);
      conditions.push(`b.bundled_at >= $${params.length}`);
    }
    if (query.to) {
      params.push(query.to);
      conditions.push(`b.bundled_at <= $${params.length}`);
    }

    const sql = `
      SELECT
        p.id        AS plot_id,
        p.name      AS plot_name,
        sp.id       AS sub_plot_id,
        sp.name     AS sub_plot_name,
        SUM(b.quantity)::int AS total_quantity,
        COUNT(*)::int        AS total_records
      FROM bundlings b
      JOIN plots p ON p.id = b.plot_id
      LEFT JOIN sub_plots sp ON sp.id = b.sub_plot_id
      ${joins.join('\n      ')}
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id, p.name, sp.id, sp.name
      ORDER BY p.name
    `;

    const rows = await this.em.execute<SummaryRow[]>(sql, params);

    const plotMap = new Map<string, PlotSummary>();
    let totalQuantity = 0;
    let totalRecords = 0;

    for (const row of rows) {
      const qty = Number(row.total_quantity);
      const rec = Number(row.total_records);
      totalQuantity += qty;
      totalRecords += rec;

      let plotSummary = plotMap.get(row.plot_id);
      if (!plotSummary) {
        plotSummary = {
          plotId: row.plot_id,
          plotName: row.plot_name,
          totalQuantity: 0,
          totalRecords: 0,
          bySubPlot: [],
        };
        plotMap.set(row.plot_id, plotSummary);
      }

      plotSummary.totalQuantity += qty;
      plotSummary.totalRecords += rec;

      if (row.sub_plot_id) {
        plotSummary.bySubPlot.push({
          subPlotId: row.sub_plot_id,
          subPlotName: row.sub_plot_name,
          totalQuantity: qty,
          totalRecords: rec,
        });
      }
    }

    return {
      totalQuantity,
      totalRecords,
      byPlot: [...plotMap.values()],
    };
  }
}
