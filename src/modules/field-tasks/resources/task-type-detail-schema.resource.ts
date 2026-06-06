import { ApiResource } from '../../shared/resources/api-resource';
import { TaskTypeDetailSchema } from '../entities/task-type-detail-schema.entity';
import {
  ITaskTypeDetailOptionResource,
  taskTypeDetailOptionResource,
} from './task-type-detail-option.resource';

export interface ITaskTypeDetailSchemaResource {
  id: string;
  detailKey: string;
  label: string;
  valueType: string;
  isRequired: boolean;
  options: ITaskTypeDetailOptionResource[];
  validationRules: Record<string, unknown> | null;
  sortOrder: number;
}

class TaskTypeDetailSchemaResource extends ApiResource<
  TaskTypeDetailSchema,
  ITaskTypeDetailSchemaResource
> {
  protected toShape(
    schema: TaskTypeDetailSchema,
  ): ITaskTypeDetailSchemaResource {
    return {
      id: schema.id,
      detailKey: schema.detailKey,
      label: schema.label,
      valueType: schema.valueType,
      isRequired: schema.isRequired,
      options: taskTypeDetailOptionResource.whenLoaded(
        schema.detailOptions,
        (options) =>
          [...options].sort(
            (optionA, optionB) => optionA.sortOrder - optionB.sortOrder,
          ),
      ),
      validationRules: schema.validationRules as Record<string, unknown> | null,
      sortOrder: schema.sortOrder,
    };
  }
}

export const taskTypeDetailSchemaResource = new TaskTypeDetailSchemaResource();
