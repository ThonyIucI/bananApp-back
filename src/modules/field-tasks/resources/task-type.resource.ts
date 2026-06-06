import { ApiResource } from '../../shared/resources/api-resource';
import { TaskType } from '../entities/task-type.entity';
import {
  ITaskTypeDetailSchemaResource,
  taskTypeDetailSchemaResource,
} from './task-type-detail-schema.resource';

export interface ITaskTypeResource {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  detailSchemas: ITaskTypeDetailSchemaResource[];
}

class TaskTypeResource extends ApiResource<TaskType, ITaskTypeResource> {
  protected toShape(taskType: TaskType): ITaskTypeResource {
    return {
      id: taskType.id,
      key: taskType.key,
      label: taskType.label,
      isActive: taskType.isActive,
      detailSchemas: taskTypeDetailSchemaResource.whenLoaded(
        taskType.detailSchemas,
        (schemas) =>
          [...schemas].sort(
            (schemaA, schemaB) => schemaA.sortOrder - schemaB.sortOrder,
          ),
      ),
    };
  }
}

export const taskTypeResource = new TaskTypeResource();
