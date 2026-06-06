import { ApiResource } from '../../shared/resources/api-resource';
import { FieldTask } from '../entities/field-task.entity';
import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../entities/task-type-detail-schema.entity';
import { decodeDetailValue } from '../utils/field-task-detail-value.util';
import { getISOWeek } from '../../shared/utils/iso-week.util';
import { ITaskTypeResource, taskTypeResource } from './task-type.resource';

export interface IFieldTaskDetailResource {
  detailKey: string;
  label: string;
  valueType: string;
  value: string | number | boolean | null;
  optionLabel?: string | null;
}

export interface IFieldTaskResource {
  id: string;
  plot: { id: string; name: string };
  subPlot: { id: string; name: string } | null;
  taskType: ITaskTypeResource;
  performedAt: string;
  week: number;
  performedByUser: { id: string; fullName: string };
  areaCoveredHa: number | null;
  cost: number | null;
  laborDays: number | null;
  notes: string | null;
  details: IFieldTaskDetailResource[];
}

class FieldTaskResource extends ApiResource<FieldTask, IFieldTaskResource> {
  protected toShape(fieldTask: FieldTask): IFieldTaskResource {
    const { week } = getISOWeek(fieldTask.performedAt);

    return {
      id: fieldTask.id,
      plot: { id: fieldTask.plot.id, name: fieldTask.plot.name },
      subPlot: fieldTask.subPlot
        ? { id: fieldTask.subPlot.id, name: fieldTask.subPlot.name }
        : null,
      taskType: taskTypeResource.toItem(fieldTask.taskType),
      performedAt: fieldTask.performedAt.toISOString(),
      week,
      performedByUser: {
        id: fieldTask.performedByUser.id,
        fullName: fieldTask.performedByUser.fullName,
      },
      areaCoveredHa: fieldTask.areaCoveredHa,
      cost: fieldTask.cost,
      laborDays: fieldTask.laborDays,
      notes: fieldTask.notes,
      details: this.serializeDetails(fieldTask),
    };
  }

  /**
   * Serializa los details decodificando cada valor según su `valueType` y, para los
   * ENUM, resolviendo el `optionLabel` desde el schema del taskType padre. Es la única
   * lógica que necesita contexto cruzado entre relaciones, por eso vive aquí y no en un
   * resource de detail aislado.
   */
  private serializeDetails(fieldTask: FieldTask): IFieldTaskDetailResource[] {
    if (!fieldTask.details?.isInitialized()) return [];

    const schemaByKey = new Map<string, TaskTypeDetailSchema>(
      fieldTask.taskType?.detailSchemas?.isInitialized()
        ? fieldTask.taskType.detailSchemas
            .getItems()
            .map((schema) => [schema.detailKey, schema])
        : [],
    );

    return fieldTask.details.getItems().map((detail) => {
      const schema = schemaByKey.get(detail.detailKey);
      const decodedValue = schema
        ? decodeDetailValue(schema.valueType as EDetailValueType, detail.value)
        : detail.value;

      let optionLabel: string | null = null;
      if (
        schema?.valueType === EDetailValueType.ENUM &&
        typeof decodedValue === 'string'
      ) {
        const matchedOption = schema.detailOptions?.isInitialized()
          ? (schema.detailOptions
              .getItems()
              .find((option) => option.key === decodedValue) ?? null)
          : null;
        optionLabel = matchedOption?.label ?? null;
      }

      return {
        detailKey: detail.detailKey,
        label: schema?.label ?? detail.detailKey,
        valueType: schema?.valueType ?? 'text',
        value: decodedValue,
        ...(schema?.valueType === EDetailValueType.ENUM ? { optionLabel } : {}),
      };
    });
  }
}

export const fieldTaskResource = new FieldTaskResource();
