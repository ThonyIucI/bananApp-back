import { FieldTask } from './field-task.entity';
import { TaskType } from './task-type.entity';
import {
  TaskTypeDetailSchema,
  EDetailValueType,
} from './task-type-detail-schema.entity';
import { decodeDetailValue } from './field-task-detail-value.util';
import { getISOWeek } from '../../shared/utils/iso-week.util';

// ── Response shapes ────────────────────────────────────────────────────────────

export interface TaskTypeDetailOptionDto {
  key: string;
  label: string;
  sortOrder: number;
}

export interface TaskTypeDetailSchemaDto {
  id: string;
  detailKey: string;
  label: string;
  valueType: string;
  isRequired: boolean;
  options: TaskTypeDetailOptionDto[];
  validationRules: Record<string, unknown> | null;
  sortOrder: number;
}

export interface TaskTypeDto {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  detailSchemas: TaskTypeDetailSchemaDto[];
}

export interface FieldTaskDetailDto {
  detailKey: string;
  label: string;
  valueType: string;
  value: string | number | boolean | null;
  optionLabel?: string | null;
}

export interface FieldTaskDto {
  id: string;
  plot: { id: string; name: string };
  subPlot: { id: string; name: string } | null;
  taskType: TaskTypeDto;
  performedAt: string;
  week: number;
  performedByUser: { id: string; fullName: string };
  areaCoveredHa: number | null;
  cost: number | null;
  laborDays: number | null;
  notes: string | null;
  details: FieldTaskDetailDto[];
  createdAt: string;
  updatedAt: string;
}

// ── Mappers ────────────────────────────────────────────────────────────────────

/** Maps a detail schema collection to its DTO (options sorted by sortOrder). */
const mapDetailSchema = (
  schema: TaskTypeDetailSchema,
): TaskTypeDetailSchemaDto => ({
  id: schema.id,
  detailKey: schema.detailKey,
  label: schema.label,
  valueType: schema.valueType,
  isRequired: schema.isRequired,
  options: schema?.detailOptions?.isInitialized()
    ? [...schema.detailOptions.getItems()]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((o) => ({ key: o.key, label: o.label, sortOrder: o.sortOrder }))
    : [],
  validationRules: schema.validationRules as Record<string, unknown> | null,
  sortOrder: schema.sortOrder,
});

/** Maps a TaskType entity to its response DTO. */
export const mapTaskType = (tt: TaskType): TaskTypeDto => ({
  id: tt.id,
  key: tt.key,
  label: tt.label,
  isActive: tt.isActive,
  detailSchemas: tt.detailSchemas?.isInitialized()
    ? [...tt.detailSchemas.getItems()]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(mapDetailSchema)
    : [],
});

/** Maps a FieldTask entity to its response DTO. */
export const mapFieldTask = (ft: FieldTask): FieldTaskDto => {
  const { week } = getISOWeek(ft.performedAt);

  // Build a schema map for ENUM label lookup (schemaKey → detailSchema)
  const schemaMap = new Map<string, TaskTypeDetailSchema>(
    ft.taskType?.detailSchemas?.isInitialized()
      ? ft.taskType.detailSchemas.getItems().map((s) => [s.detailKey, s])
      : [],
  );

  const details: FieldTaskDetailDto[] = ft.details?.isInitialized()
    ? ft.details.getItems().map((d) => {
        const schema = schemaMap.get(d.detailKey);
        const decodedValue = schema
          ? decodeDetailValue(schema.valueType as EDetailValueType, d.value)
          : d.value;

        let optionLabel: string | null = null;
        if (
          schema?.valueType === EDetailValueType.ENUM &&
          typeof decodedValue === 'string'
        ) {
          const option = schema.detailOptions?.isInitialized()
            ? (schema.detailOptions
                .getItems()
                .find((o) => o.key === decodedValue) ?? null)
            : null;
          optionLabel = option?.label ?? null;
        }

        return {
          detailKey: d.detailKey,
          label: schema?.label ?? d.detailKey,
          valueType: schema?.valueType ?? 'text',
          value: decodedValue,
          ...(schema?.valueType === EDetailValueType.ENUM
            ? { optionLabel }
            : {}),
        };
      })
    : [];

  const plot = ft.plot as unknown as { id: string; name: string };
  const subPlot = ft.subPlot as unknown as { id: string; name: string } | null;
  const performedByUser = ft.performedByUser as unknown as {
    id: string;
    fullName: string;
  };

  return {
    id: ft.id,
    plot: { id: plot.id, name: plot.name },
    subPlot: subPlot ? { id: subPlot.id, name: subPlot.name } : null,
    taskType: ft.taskType
      ? mapTaskType(ft.taskType)
      : {
          id: '',
          key: '' as string,
          label: '',
          isActive: false,
          detailSchemas: [],
        },
    performedAt: ft.performedAt.toISOString(),
    week,
    performedByUser: {
      id: performedByUser.id,
      fullName: performedByUser.fullName,
    },
    areaCoveredHa: ft.areaCoveredHa != null ? Number(ft.areaCoveredHa) : null,
    cost: ft.cost != null ? Number(ft.cost) : null,
    laborDays: ft.laborDays != null ? Number(ft.laborDays) : null,
    notes: ft.notes,
    details,
    createdAt: ft.createdAt.toISOString(),
    updatedAt: ft.updatedAt.toISOString(),
  };
};
