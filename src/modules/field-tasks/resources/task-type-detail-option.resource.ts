import { ApiResource } from '../../shared/resources/api-resource';
import { TaskTypeDetailOption } from '../entities/task-type-detail-option.entity';

export interface ITaskTypeDetailOptionResource {
  key: string;
  label: string;
  sortOrder: number;
}

class TaskTypeDetailOptionResource extends ApiResource<
  TaskTypeDetailOption,
  ITaskTypeDetailOptionResource
> {
  protected toShape(
    option: TaskTypeDetailOption,
  ): ITaskTypeDetailOptionResource {
    return {
      key: option.key,
      label: option.label,
      sortOrder: option.sortOrder,
    };
  }
}

export const taskTypeDetailOptionResource = new TaskTypeDetailOptionResource();
