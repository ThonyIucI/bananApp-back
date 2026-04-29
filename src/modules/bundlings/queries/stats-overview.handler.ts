import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

export interface StatsOverviewQuery {
  cooperativeId: string;
}

export interface PeriodStats {
  totalQuantity: number;
  totalRecords: number;
  deltaPctVsLastPeriod: number | null;
}

export interface TopEnfundador {
  userId: string;
  fullName: string;
  totalQuantity: number;
}

export interface TopPlot {
  plotId: string;
  plotName: string;
  totalQuantity: number;
}

export interface RibbonColorEntry {
  color: string;
  totalQuantity: number;
}

export interface StatsOverviewResult {
  thisWeek: PeriodStats;
  thisMonth: PeriodStats;
  last30Days: {
    totalQuantity: number;
    totalRecords: number;
    activeEnfundadores: number;
    activePlots: number;
  };
  topEnfundadores: TopEnfundador[];
  topPlots: TopPlot[];
  ribbonColorDistribution: RibbonColorEntry[];
}

interface PeriodRow {
  total_quantity: string;
  total_records: string;
}

interface TopEnfundadorRow {
  user_id: string;
  first_name: string;
  last_name: string;
  total_quantity: string;
}

interface TopPlotRow {
  plot_id: string;
  plot_name: string;
  total_quantity: string;
}

interface RibbonRow {
  color: string;
  total_quantity: string;
}

interface Last30Row {
  total_quantity: string;
  total_records: string;
  active_enfundadores: string;
  active_plots: string;
}

@Injectable()
export class StatsOverviewHandler {
  constructor(private readonly em: EntityManager) {}

  /** Executes a parameterized SQL query via the Kysely pg connection directly. */
  private async q<T>(sql: string, parameters: unknown[]): Promise<T[]> {
    const conn = this.em.getConnection() as any;
    const result = await conn.getClient().executeQuery({ sql, parameters });
    return result.rows as T[];
  }

  /** Returns aggregated KPIs for the dashboard overview using parallel queries. */
  async execute(query: StatsOverviewQuery): Promise<StatsOverviewResult> {
    const { cooperativeId } = query;

    const [
      thisWeekRows,
      lastWeekRows,
      thisMonthRows,
      lastMonthRows,
      last30Rows,
      topEnfRows,
      topPlotRows,
      ribbonRows,
    ] = await Promise.all([
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND date_trunc('week', b.bundled_at) = date_trunc('week', now())`,
        [cooperativeId],
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND date_trunc('week', b.bundled_at) = date_trunc('week', now() - interval '1 week')`,
        [cooperativeId],
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND date_trunc('month', b.bundled_at) = date_trunc('month', now())`,
        [cooperativeId],
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND date_trunc('month', b.bundled_at) = date_trunc('month', now() - interval '1 month')`,
        [cooperativeId],
      ),
      this.q<Last30Row>(
        `SELECT
             SUM(b.quantity)::int                        AS total_quantity,
             COUNT(*)::int                               AS total_records,
             COUNT(DISTINCT b.enfundador_user_id)::int   AS active_enfundadores,
             COUNT(DISTINCT b.plot_id)::int              AS active_plots
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND b.bundled_at >= now() - interval '30 days'`,
        [cooperativeId],
      ),
      this.q<TopEnfundadorRow>(
        `SELECT
             b.enfundador_user_id     AS user_id,
             u.first_name,
             u.last_name,
             SUM(b.quantity)::int     AS total_quantity
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           JOIN users u ON u.id = b.enfundador_user_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY b.enfundador_user_id, u.first_name, u.last_name
           ORDER BY total_quantity DESC
           LIMIT 5`,
        [cooperativeId],
      ),
      this.q<TopPlotRow>(
        `SELECT
             b.plot_id,
             p.name              AS plot_name,
             SUM(b.quantity)::int AS total_quantity
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY b.plot_id, p.name
           ORDER BY total_quantity DESC
           LIMIT 5`,
        [cooperativeId],
      ),
      this.q<RibbonRow>(
        `SELECT
             COALESCE(b.ribbon_color_free, 'calendar') AS color,
             SUM(b.quantity)::int                       AS total_quantity
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE s.cooperative_id = $1
             AND b.deleted_at IS NULL
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY color
           ORDER BY total_quantity DESC`,
        [cooperativeId],
      ),
    ]);

    const calcDelta = (current: number, previous: number): number | null => {
      if (previous === 0) return null;
      return Math.round(((current - previous) / previous) * 100);
    };

    const weekQty = Number(thisWeekRows[0]?.total_quantity ?? 0);
    const lastWeekQty = Number(lastWeekRows[0]?.total_quantity ?? 0);
    const monthQty = Number(thisMonthRows[0]?.total_quantity ?? 0);
    const lastMonthQty = Number(lastMonthRows[0]?.total_quantity ?? 0);
    const l30 = last30Rows[0];

    return {
      thisWeek: {
        totalQuantity: weekQty,
        totalRecords: Number(thisWeekRows[0]?.total_records ?? 0),
        deltaPctVsLastPeriod: calcDelta(weekQty, lastWeekQty),
      },
      thisMonth: {
        totalQuantity: monthQty,
        totalRecords: Number(thisMonthRows[0]?.total_records ?? 0),
        deltaPctVsLastPeriod: calcDelta(monthQty, lastMonthQty),
      },
      last30Days: {
        totalQuantity: Number(l30?.total_quantity ?? 0),
        totalRecords: Number(l30?.total_records ?? 0),
        activeEnfundadores: Number(l30?.active_enfundadores ?? 0),
        activePlots: Number(l30?.active_plots ?? 0),
      },
      topEnfundadores: topEnfRows.map((r) => ({
        userId: r.user_id,
        fullName: `${r.first_name} ${r.last_name}`,
        totalQuantity: Number(r.total_quantity),
      })),
      topPlots: topPlotRows.map((r) => ({
        plotId: r.plot_id,
        plotName: r.plot_name,
        totalQuantity: Number(r.total_quantity),
      })),
      ribbonColorDistribution: ribbonRows.map((r) => ({
        color: r.color,
        totalQuantity: Number(r.total_quantity),
      })),
    };
  }
}
