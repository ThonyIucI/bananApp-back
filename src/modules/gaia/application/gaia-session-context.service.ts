import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TaskType } from '../../field-tasks/domain/task-type.entity';
import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../../field-tasks/domain/task-type-detail-schema.entity';
import { ListPlotsHandler } from '../../plots/queries/list-plots.handler';
import { PlotLookupDto } from '../../plots/domain/plot.mapper';
import { User } from '../../users/domain/user.entity';

const DETAIL_TYPE_LABEL: Record<EDetailValueType, string> = {
  [EDetailValueType.TEXT]: 'TEXT',
  [EDetailValueType.NUMERIC]: 'NUM',
  [EDetailValueType.DATE]: 'DATE',
  [EDetailValueType.BOOLEAN]: 'BOOL',
  [EDetailValueType.ENUM]: 'ENUM',
};

/**
 * Builds a compact user context block injected into the GaIA live system prompt.
 * Encodes user plots + applicable task schemas in a token-efficient format.
 */
@Injectable()
export class GaiaSessionContextService {
  constructor(
    private readonly em: EntityManager,
    private readonly listPlotsHandler: ListPlotsHandler,
  ) {}

  /**
   * Returns a compact context block injected into the GaIA live system instruction.
   * Format: USUARIO line, PARCELAS line (with plot IDs), ACT lines per crop type.
   */
  async buildUserContextBlock(userId: string): Promise<string> {
    const [plots, firstName] = await Promise.all([
      this.fetchUserPlots(userId),
      this.fetchUserFirstName(userId),
    ]);

    if (plots.length === 0) {
      return `USUARIO: ${firstName}\nPARCELAS: ninguna registrada`;
    }

    const taskTypes = await this.fetchActiveTaskTypes();

    const cropTypeKeys = this.getUniqueCropTypes(plots);
    const { cropTaskMap, universalTasks } = this.groupTasksByCrop(
      taskTypes,
      cropTypeKeys,
    );

    const lines: string[] = [
      `USUARIO: ${firstName}`,
      this.formatPlotsLine(plots),
      ...this.formatCropTasksLines(cropTypeKeys, cropTaskMap),
      ...this.formatUniversalTasksLines(universalTasks),
    ];

    return lines.join('\n');
  }

  // --- Data Fetching ---

  private async fetchUserPlots(userId: string): Promise<PlotLookupDto[]> {
    const { items } = await this.listPlotsHandler.execute({
      ownerUserId: userId,
      limit: 100,
      offset: 0,
    });
    return items;
  }

  /** Fetches the user's first name for the greeting line; falls back to 'agricultor'. */
  private async fetchUserFirstName(userId: string): Promise<string> {
    const user = await this.em.findOne(User, { id: userId });
    return user?.firstName ?? 'agricultor';
  }

  private async fetchActiveTaskTypes(): Promise<TaskType[]> {
    return this.em.find(
      TaskType,
      { isActive: true },
      {
        populate: [
          'detailSchemas',
          'detailSchemas.detailOptions',
          'cropTypes',
        ] as never,
        orderBy: { key: 'ASC' },
      },
    );
  }

  // --- Data Processing ---

  private getUniqueCropTypes(plots: PlotLookupDto[]): string[] {
    return [
      ...new Set(
        plots.map((p) => p.cropType?.key).filter((k): k is string => !!k),
      ),
    ];
  }

  private groupTasksByCrop(taskTypes: TaskType[], validCropTypeKeys: string[]) {
    const cropTaskMap = new Map<string, TaskType[]>();
    const universalTasks: TaskType[] = [];

    for (const tt of taskTypes) {
      const ctKeys = tt.cropTypes.getItems().map((ct) => ct.key);

      if (ctKeys.length === 0) {
        universalTasks.push(tt);
        continue; // Skip the rest of the loop for universal tasks
      }

      for (const ck of ctKeys) {
        if (validCropTypeKeys.includes(ck)) {
          const list = cropTaskMap.get(ck) ?? [];
          list.push(tt);
          cropTaskMap.set(ck, list);
        }
      }
    }

    return { cropTaskMap, universalTasks };
  }

  // --- Formatting ---

  private formatPlotsLine(plots: PlotLookupDto[]): string {
    const formattedPlots = plots.map(
      (p) =>
        `${p.name}(id:${p.id},${p.sector?.name ?? 'sin sector'},${p.cropType?.key ?? 'sin cultivo'})`,
    );
    return `PARCELAS: ${formattedPlots.join(', ')}`;
  }

  private formatCropTasksLines(
    cropTypeKeys: string[],
    cropTaskMap: Map<string, TaskType[]>,
  ): string[] {
    const lines: string[] = [];
    for (const ck of cropTypeKeys) {
      const tasks = cropTaskMap.get(ck) ?? [];
      if (tasks.length > 0) {
        lines.push(
          `ACT[${ck}]: ${tasks.map((t) => this.formatTask(t)).join(', ')}`,
        );
      }
    }
    return lines;
  }

  private formatUniversalTasksLines(universalTasks: TaskType[]): string[] {
    if (universalTasks.length === 0) return [];
    return [
      `ACT[*]: ${universalTasks.map((t) => this.formatTask(t)).join(', ')}`,
    ];
  }

  private formatTask(tt: TaskType): string {
    const schemas = [...tt.detailSchemas.getItems()].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (schemas.length === 0) return tt.key;
    return `${tt.key}(${schemas.map((s) => this.formatSchema(s)).join(',')})`;
  }

  private formatSchema(s: TaskTypeDetailSchema): string {
    const suffix = s.isRequired ? '*' : '';
    if (s.valueType === EDetailValueType.ENUM) {
      const opts = s.detailOptions
        .getItems()
        .map((o) => o.key)
        .join(',');
      return `${s.detailKey}:ENUM[${opts}]${suffix}`;
    }
    return `${s.detailKey}:${DETAIL_TYPE_LABEL[s.valueType]}${suffix}`;
  }
}
