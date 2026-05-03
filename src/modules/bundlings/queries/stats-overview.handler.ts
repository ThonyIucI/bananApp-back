import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { APP_TIMEZONE } from '../../shared/constants/timezone';
import { RIBBON_COLORS_CYCLE } from '../../ribbon-calendars/domain/ribbon-calendar.entity';

export interface StatsOverviewQuery {
  cooperativeId: string;
  /** Scope stats to plots assigned to this user via user_plot */
  scopedUserId?: string;
  /** Filter bundlings by who performed them (superadmin drill-down) */
  enfundadorUserId?: string;
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

export interface HarvestColorEntry {
  color: string;
  totalQuantity: number;
}

export interface HarvestThisWeek {
  estimatedBunches: number;
  totalRecords: number;
  byRibbonColor: HarvestColorEntry[];
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
  harvestThisWeek: HarvestThisWeek;
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

interface HarvestRawRow {
  ribbon_color_free: string | null;
  start_color_index: string | null;
  week_num: string;
  total_quantity: string;
  total_records: string;
}

/** Builds extra WHERE clauses + extra params starting at $paramStart */
function buildExtraFilters(
  query: StatsOverviewQuery,
  paramStart: number,
): { clauses: string[]; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];
  let idx = paramStart;

  if (query.scopedUserId) {
    clauses.push(
      `b.plot_id IN (SELECT up.plot_id FROM user_plot up WHERE up.user_id = $${idx++} AND up.deleted_at IS NULL)`,
    );
    params.push(query.scopedUserId);
  }
  if (query.enfundadorUserId) {
    clauses.push(`b.enfundador_user_id = $${idx++}`);
    params.push(query.enfundadorUserId);
  }

  return { clauses, params };
}

/** Resolves ribbon color for a harvest row: free color or calendar-derived */
function resolveHarvestColor(row: HarvestRawRow): string {
  if (row.ribbon_color_free) return row.ribbon_color_free;
  if (row.start_color_index == null) return 'unknown';
  const weekNum = Number(row.week_num);
  const startIdx = Number(row.start_color_index);
  const idx = (startIdx + weekNum - 1) % RIBBON_COLORS_CYCLE.length;
  return RIBBON_COLORS_CYCLE[idx];
}

@Injectable()
export class StatsOverviewHandler {
  constructor(private readonly em: EntityManager) {}

  private async q<T>(sql: string, parameters: unknown[]): Promise<T[]> {
    const conn = this.em.getConnection() as any;
    const result = await conn.getClient().executeQuery({ sql, parameters });
    return result.rows as T[];
  }

  async execute(query: StatsOverviewQuery): Promise<StatsOverviewResult> {
    const { cooperativeId } = query;
    const { clauses: extraClauses, params: extraParams } = buildExtraFilters(
      query,
      2,
    );

    const baseWhere = [
      `s.cooperative_id = $1`,
      `b.deleted_at IS NULL`,
      ...extraClauses,
    ].join('\n             AND ');

    const allParams = [cooperativeId, ...extraParams];

    const [
      thisWeekRows,
      lastWeekRows,
      thisMonthRows,
      lastMonthRows,
      last30Rows,
      topEnfRows,
      topPlotRows,
      ribbonRows,
      harvestRows,
    ] = await Promise.all([
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND date_trunc('week', b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')
               = date_trunc('week', now() AT TIME ZONE '${APP_TIMEZONE}')`,
        allParams,
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND date_trunc('week', b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')
               = date_trunc('week', (now() - interval '1 week') AT TIME ZONE '${APP_TIMEZONE}')`,
        allParams,
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND date_trunc('month', b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')
               = date_trunc('month', now() AT TIME ZONE '${APP_TIMEZONE}')`,
        allParams,
      ),
      this.q<PeriodRow>(
        `SELECT SUM(b.quantity)::int AS total_quantity, COUNT(*)::int AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND date_trunc('month', b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')
               = date_trunc('month', (now() - interval '1 month') AT TIME ZONE '${APP_TIMEZONE}')`,
        allParams,
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
           WHERE ${baseWhere}
             AND b.bundled_at >= now() - interval '30 days'`,
        allParams,
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
           WHERE ${baseWhere}
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY b.enfundador_user_id, u.first_name, u.last_name
           ORDER BY total_quantity DESC
           LIMIT 5`,
        allParams,
      ),
      this.q<TopPlotRow>(
        `SELECT
             b.plot_id,
             p.name              AS plot_name,
             SUM(b.quantity)::int AS total_quantity
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY b.plot_id, p.name
           ORDER BY total_quantity DESC
           LIMIT 5`,
        allParams,
      ),
      this.q<RibbonRow>(
        `SELECT
             COALESCE(b.ribbon_color_free, 'calendar') AS color,
             SUM(b.quantity)::int                       AS total_quantity
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           WHERE ${baseWhere}
             AND b.bundled_at >= now() - interval '30 days'
           GROUP BY color
           ORDER BY total_quantity DESC`,
        allParams,
      ),
      // Harvest estimate: bundlings registered exactly 12 weeks ago
      this.q<HarvestRawRow>(
        `SELECT
             b.ribbon_color_free,
             rc.start_color_index,
             EXTRACT(WEEK FROM b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')::int AS week_num,
             SUM(b.quantity)::int AS total_quantity,
             COUNT(*)::int        AS total_records
           FROM bundlings b
           JOIN plots p ON p.id = b.plot_id
           JOIN sectors s ON s.id = p.sector_id
           LEFT JOIN ribbon_calendars rc
             ON rc.cooperative_id = s.cooperative_id
             AND rc.year = EXTRACT(YEAR FROM b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')::int
             AND rc.deleted_at IS NULL
           WHERE ${baseWhere}
             AND date_trunc('week', b.bundled_at AT TIME ZONE '${APP_TIMEZONE}')
               = date_trunc('week', (now() AT TIME ZONE '${APP_TIMEZONE}') - interval '12 weeks')
           GROUP BY b.ribbon_color_free, rc.start_color_index, week_num`,
        allParams,
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

    // Aggregate harvest rows by resolved color
    const harvestByColor = new Map<string, number>();
    let harvestTotalBunches = 0;
    let harvestTotalRecords = 0;

    for (const row of harvestRows) {
      const color = resolveHarvestColor(row);
      const qty = Number(row.total_quantity);
      harvestByColor.set(color, (harvestByColor.get(color) ?? 0) + qty);
      harvestTotalBunches += qty;
      harvestTotalRecords += Number(row.total_records);
    }

    const byRibbonColor: HarvestColorEntry[] = [...harvestByColor.entries()]
      .map(([color, totalQuantity]) => ({ color, totalQuantity }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

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
      harvestThisWeek: {
        estimatedBunches: harvestTotalBunches,
        totalRecords: harvestTotalRecords,
        byRibbonColor,
      },
    };
  }
}
