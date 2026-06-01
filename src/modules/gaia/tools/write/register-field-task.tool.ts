import { Injectable } from '@nestjs/common';
import { Type } from '@google/genai';
import type {
  IGaiaTool,
  IGaiaToolContext,
  IPendingAction,
} from '../gaia-tool.types';

/** Formatea una fecha ISO 8601 a `DD/MM/YYYY HH:mm`. Devuelve el valor original si no es parseable. */
const formatPerformedAt = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

@Injectable()
export class RegisterFieldTaskTool implements IGaiaTool {
  readonly name = 'register_field_task';

  readonly declaration = {
    name: 'register_field_task',
    description:
      'Propone registrar una actividad agrícola. NUNCA persiste directamente — siempre genera una confirmación que el usuario debe aprobar. Úsalo cuando el usuario diga que hizo algo (fumigó, regó, fertilizó, etc.).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        plotId: {
          type: Type.STRING,
          description:
            'ID de la parcela donde se realizó la actividad. Usar list_my_plots para obtener el ID correcto.',
        },
        taskTypeKey: {
          type: Type.STRING,
          description:
            'Clave del tipo de actividad (ej: irrigation, pest_control, fertilization).',
        },
        taskLabel: {
          type: Type.STRING,
          description:
            'Nombre legible de la actividad para mostrar al usuario en la confirmación.',
        },
        performedAt: {
          type: Type.STRING,
          description:
            'Fecha y hora ISO 8601 en que se realizó la actividad (ej: 2025-05-31T07:00:00).',
        },
        notes: {
          type: Type.STRING,
          description: 'Notas adicionales opcionales sobre la actividad.',
        },
      },
      required: ['plotId', 'taskTypeKey', 'taskLabel', 'performedAt'],
    },
  };

  async execute(
    args: Record<string, unknown>,
    _ctx: IGaiaToolContext,
  ): Promise<IPendingAction> {
    const plotId = args.plotId as string;
    const taskTypeKey = args.taskTypeKey as string;
    const taskLabel = args.taskLabel as string;
    const performedAt = args.performedAt as string;
    const notes = args.notes as string | undefined;

    const dateStr = formatPerformedAt(performedAt);

    const humanSummary = `Registrar: ${taskLabel} · ${dateStr}${notes ? ` · Nota: ${notes}` : ''}`;

    return {
      tool: this.name,
      payload: { plotId, taskTypeKey, performedAt, notes: notes ?? null },
      humanSummary,
    };
  }
}
