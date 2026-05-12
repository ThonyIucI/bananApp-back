import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

export interface StatsMonthlyQuery {
  cooperativeId: string;
  months?: number;
  scopedUserId?: string;
}

export interface MonthEntry {
  month: string;
  label: string;
  totalQuantity: number;
  totalRecords: number;
  activeEnfundadores: number;
}

export interface StatsMonthlyResult {
  months: MonthEntry[];
}

interface MonthRow {
  month: string;
  total_quantity: string;
  total_records: string;
  active_enfundadores: string;
}

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

@Injectable()
export class StatsMonthlyHandler {
  constructor(private readonly em: EntityManager) {}

  /** Returns monthly bundling stats for the last N months, always returning N entries (zeros for missing months). */
  async execute(query: StatsMonthlyQuery): Promise<StatsMonthlyResult> {
    const monthCount = query.months ?? 12;
    const params: unknown[] = [query.cooperativeId, monthCount];
    const conditions = [
      's.cooperative_id = $1',
      'b.deleted_at IS NULL',
      'b.bundled_at >= now() - make_interval(months => $2)',
    ];

    if (query.scopedUserId) {
      params.push(query.scopedUserId);
      conditions.push(
        `b.plot_id IN (SELECT up.plot_id FROM user_plot up WHERE up.user_id = $${params.length} AND up.deleted_at IS NULL)`,
      );
    }

    const sql = `
      SELECT
        to_char(date_trunc('month', b.bundled_at AT TIME ZONE 'America/Lima'), 'YYYY-MM') AS month,
        SUM(b.quantity)::int                          AS total_quantity,
        COUNT(*)::int                                 AS total_records,
        COUNT(DISTINCT b.enfundador_user_id)::int     AS active_enfundadores
      FROM bundlings b
      JOIN plots p      ON p.id = b.plot_id
      JOIN sectors s    ON s.id = p.sector_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY month
      ORDER BY month ASC
    `;

    const conn = this.em.getConnection() as any;
    const result = await conn
      .getClient()
      .executeQuery({ sql, parameters: params });
    const rows: MonthRow[] = result.rows;

    const rowMap = new Map<string, MonthRow>(rows.map((r) => [r.month, r]));
    const entries: MonthEntry[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      const row = rowMap.get(key);

      entries.push({
        month: key,
        label,
        totalQuantity: row ? Number(row.total_quantity) : 0,
        totalRecords: row ? Number(row.total_records) : 0,
        activeEnfundadores: row ? Number(row.active_enfundadores) : 0,
      });
    }

    return { months: entries };
  }
}
