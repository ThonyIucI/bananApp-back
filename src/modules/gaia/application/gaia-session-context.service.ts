import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TaskType } from '../../field-tasks/domain/task-type.entity';
import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../../field-tasks/domain/task-type-detail-schema.entity';
import { ListPlotsHandler } from '../../plots/queries/list-plots.handler';

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

  /** Returns compact context string: PARCELAS line + ACT[crop] lines. */
  async buildUserContextBlock(userId: string): Promise<string> {
    const { items: plots } = await this.listPlotsHandler.execute({
      ownerUserId: userId,
      limit: 100,
      offset: 0,
    });

    if (plots.length === 0) return 'PARCELAS: ninguna registrada';

    const parcelasLine = `PARCELAS: ${plots
      .map(
        (p) =>
          `${p.name}(${p.sector?.name ?? 'sin sector'},${p.cropType?.key ?? 'sin cultivo'})`,
      )
      .join(', ')}`;

    const cropTypeKeys = [
      ...new Set(
        plots.map((p) => p.cropType?.key).filter((k): k is string => !!k),
      ),
    ];

    const taskTypes = await this.em.find(
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

    const cropTaskMap = new Map<string, TaskType[]>();
    const universalTasks: TaskType[] = [];

    for (const tt of taskTypes) {
      const ctKeys = tt.cropTypes.getItems().map((ct) => ct.key);
      if (ctKeys.length === 0) {
        universalTasks.push(tt);
      } else {
        for (const ck of ctKeys) {
          if (cropTypeKeys.includes(ck)) {
            const list = cropTaskMap.get(ck) ?? [];
            list.push(tt);
            cropTaskMap.set(ck, list);
          }
        }
      }
    }

    const lines: string[] = [parcelasLine];

    for (const ck of cropTypeKeys) {
      const tasks = cropTaskMap.get(ck) ?? [];
      if (tasks.length > 0) {
        lines.push(
          `ACT[${ck}]: ${tasks.map((t) => this.formatTask(t)).join(', ')}`,
        );
      }
    }

    if (universalTasks.length > 0) {
      lines.push(
        `ACT[*]: ${universalTasks.map((t) => this.formatTask(t)).join(', ')}`,
      );
    }

    return lines.join('\n');
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
