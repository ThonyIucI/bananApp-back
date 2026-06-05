import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Type } from '@google/genai';
import { EGaiaToolName } from '../gaia-tool.types';
import type {
  IGaiaTool,
  IGaiaToolContext,
  TGaiaToolResult,
} from '../gaia-tool.types';
import { FieldTask } from '../../../field-tasks/domain/field-task.entity';

type TPeriod = 'today' | 'week' | 'month';

const PERIOD_DAYS: Record<TPeriod, number> = { today: 0, week: 6, month: 29 };

const buildDateRange = (period: TPeriod): { from: Date; to: Date } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - PERIOD_DAYS[period]);
  from.setHours(0, 0, 0, 0);
  return { from, to };
};

@Injectable()
export class GetFieldTasksTool implements IGaiaTool {
  readonly name = EGaiaToolName.GET_FIELD_TASKS;

  readonly declaration = {
    name: EGaiaToolName.GET_FIELD_TASKS,
    description:
      'Consulta las actividades agrícolas del usuario. Úsalo cuando pregunte cuántos riegos, fumigaciones, fertilizaciones u otras labores realizó en un período o parcela específica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskTypeKey: {
          type: Type.STRING,
          description:
            'Clave del tipo de actividad (ej: irrigation, pest_control, fertilization). Omitir para todas.',
        },
        period: {
          type: Type.STRING,
          enum: ['today', 'week', 'month'],
          description: 'Período de tiempo a consultar.',
        },
        plotId: {
          type: Type.STRING,
          description:
            'ID de la parcela a filtrar. Usar list_my_plots para obtener IDs.',
        },
        detail: {
          type: Type.BOOLEAN,
          description:
            'Si es true devuelve registro completo con detalles. Por defecto false (resumen de las últimas 5).',
        },
      },
      required: [],
    },
  };

  private static readonly DEFAULT_LIMIT = 5;

  constructor(private readonly em: EntityManager) {}

  async execute(
    args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<TGaiaToolResult> {
    const taskTypeKey = args.taskTypeKey as string | undefined;
    const period = (args.period as TPeriod | undefined) ?? 'month';
    const plotId = args.plotId as string | undefined;
    const detail = args.detail === true;

    const { from, to } = buildDateRange(period);

    const where: Record<string, unknown> = {
      performedByUser: { id: ctx.currentUser.sub },
      performedAt: { $gte: from, $lte: to },
    };

    if (taskTypeKey) where['taskType'] = { key: taskTypeKey };
    if (plotId) where['plot'] = { id: plotId };

    const limit = detail ? 20 : GetFieldTasksTool.DEFAULT_LIMIT;

    const [items, total] = await this.em.findAndCount(FieldTask, where, {
      populate: ['taskType', 'plot'],
      limit,
      orderBy: { performedAt: 'DESC' },
    });

    const tasks = items.map((ft) => {
      const base = {
        taskLabel: ft.taskType.label,
        plotName: ft.plot.name,
        performedAt: ft.performedAt.toISOString(),
      };
      if (!detail) return base;
      return {
        ...base,
        notes: ft.notes ?? null,
        areaCoveredHa: ft.areaCoveredHa ?? null,
      };
    });

    const hint =
      total > GetFieldTasksTool.DEFAULT_LIMIT && !detail
        ? `Mostrando ${tasks.length} de ${total} actividades. Pregunta con detail=true para ver más.`
        : undefined;

    return { tasks, totalCount: total, ...(hint ? { hint } : {}) };
  }
}
