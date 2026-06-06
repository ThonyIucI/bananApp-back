import { Injectable } from '@nestjs/common';
import { Type } from '@google/genai';
import { EGaiaToolName, IToolConfirmation } from '../gaia-tool.types';
import type { IGaiaTool, IGaiaToolContext } from '../gaia-tool.types';
import { CreateFieldTaskService } from '../../../field-tasks/services/create-field-task.service';
import { formatDateTime, getWeekOfYear } from '../../../shared/utils/date.util';

const buildHumanSummary = (
  taskLabel: string,
  rawDetails: Record<string, string>,
  performedAt: string,
): string => {
  const detailParts = Object.entries(rawDetails).map(([k, v]) => `${k}: ${v}`);
  return [
    taskLabel,
    ...detailParts,
    formatDateTime(performedAt),
    'realizado por ti',
  ].join(' · ');
};

/**
 * Write tool: persists a field task directly (no pending-action flow in live mode).
 * GaIA verbally confirms data with the user before calling this tool.
 */
@Injectable()
export class RegisterFieldTaskTool implements IGaiaTool {
  readonly name = EGaiaToolName.REGISTER_FIELD_TASK;

  readonly declaration = {
    name: EGaiaToolName.REGISTER_FIELD_TASK,
    description:
      'Registra una actividad agrícola. Úsalo SOLO después de confirmar verbalmente los datos con el agricultor. Persiste de inmediato — no hay paso adicional de confirmación.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        plotId: {
          type: Type.STRING,
          description: 'ID de la parcela. Usar list_my_plots para obtenerlo.',
        },
        taskTypeKey: {
          type: Type.STRING,
          description:
            'Clave del tipo de actividad (ej: bundling, irrigation, harvest).',
        },
        taskLabel: {
          type: Type.STRING,
          description:
            'Nombre legible de la actividad para el resumen de confirmación.',
        },
        performedAt: {
          type: Type.STRING,
          description: 'Fecha y hora ISO 8601 en que se realizó la actividad.',
        },
        notes: {
          type: Type.STRING,
          description: 'Notas adicionales opcionales.',
        },
        details: {
          type: Type.OBJECT,
          description:
            'Detalles específicos del tipo de actividad (campo: valor). Claves y valores según el esquema ACT del contexto de la sesión.',
          additionalProperties: { type: Type.STRING },
        },
      },
      required: ['plotId', 'taskTypeKey', 'taskLabel', 'performedAt'],
    },
  };

  constructor(private readonly createFieldTask: CreateFieldTaskService) {}

  async execute(
    args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<IToolConfirmation> {
    const plotId = args.plotId as string;
    const taskTypeKey = args.taskTypeKey as string;
    const taskLabel = args.taskLabel as string;
    const performedAt = args.performedAt as string;
    const notes = (args.notes as string | undefined) ?? null;
    let rawDetails = (args.details as Record<string, string> | undefined) ?? {};

    // Auto-compute bundled_week from performedAt when the task is bundling and not provided.
    if (taskTypeKey === 'bundling' && !rawDetails['bundled_week']) {
      rawDetails = {
        ...rawDetails,
        bundled_week: String(getWeekOfYear(new Date(performedAt))),
      };
    }

    await this.createFieldTask.execute({
      plotId,
      taskTypeKey,
      performedAt: new Date(performedAt),
      notes,
      details: Object.entries(rawDetails).map(([detailKey, value]) => ({
        detailKey,
        value,
      })),
      performedByUserId: ctx.currentUser.sub,
    });

    return {
      confirmed: true,
      humanSummary: buildHumanSummary(taskLabel, rawDetails, performedAt),
    };
  }
}
