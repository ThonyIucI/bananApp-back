import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

export interface StatsWeeklyQuery {
  cooperativeId: string;
  weeks?: number;
  enfundadorUserId?: string;
}

export interface WeekEntry {
  week: string;
  label: string;
  startDate: string;
  endDate: string;
  totalQuantity: number;
  totalRecords: number;
}

export interface StatsWeeklyResult {
  weeks: WeekEntry[];
}

interface WeekRow {
  week_start: string;
  total_quantity: string;
  total_records: string;
}

@Injectable()
export class StatsWeeklyHandler {
  constructor(private readonly em: EntityManager) {}

  /** Returns weekly bundling stats for the last N weeks, always returning N entries. */
  async execute(query: StatsWeeklyQuery): Promise<StatsWeeklyResult> {
    const weekCount = query.weeks ?? 8;
    const params: unknown[] = [query.cooperativeId, weekCount];
    const conditions: string[] = [
      's.cooperative_id = $1',
      'b.deleted_at IS NULL',
      `b.bundled_at >= now() - make_interval(weeks => $2)`,
    ];

    if (query.enfundadorUserId) {
      params.push(query.enfundadorUserId);
      conditions.push(`b.enfundador_user_id = $${params.length}`);
    }

    const sql = `
      SELECT
        date_trunc('week', b.bundled_at AT TIME ZONE 'America/Lima')::date::text AS week_start,
        SUM(b.quantity)::int AS total_quantity,
        COUNT(*)::int        AS total_records
      FROM bundlings b
      JOIN plots p   ON p.id = b.plot_id
      JOIN sectors s ON s.id = p.sector_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY week_start
      ORDER BY week_start ASC
    `;

    const conn = this.em.getConnection() as any;
    const result = await conn
      .getClient()
      .executeQuery({ sql, parameters: params });
    const rows: WeekRow[] = result.rows;
    const rowMap = new Map<string, WeekRow>(rows.map((r) => [r.week_start, r]));

    const entries: WeekEntry[] = [];

    for (let i = weekCount - 1; i >= 0; i--) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - i * 7);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().slice(0, 10);
      const endDate = sunday.toISOString().slice(0, 10);

      const year = monday.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const weekNum = Math.ceil(
        ((monday.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7,
      );
      const week = `${year}-W${String(weekNum).padStart(2, '0')}`;
      const label = `Sem ${weekNum}`;

      const row = rowMap.get(startDate);
      entries.push({
        week,
        label,
        startDate,
        endDate,
        totalQuantity: row ? Number(row.total_quantity) : 0,
        totalRecords: row ? Number(row.total_records) : 0,
      });
    }

    return { weeks: entries };
  }
}
