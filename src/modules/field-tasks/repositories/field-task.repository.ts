import { FieldTask } from '../entities/field-task.entity';

export interface TFieldTaskFilters {
  plotId?: string;
  subPlotId?: string;
  taskTypeKey?: string;
  performedByUserId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export abstract class IFieldTaskRepository {
  abstract findById(id: string): Promise<FieldTask | null>;
  abstract findAll(filters?: TFieldTaskFilters): Promise<[FieldTask[], number]>;
  abstract persist(task: FieldTask): void;
  abstract persistDetails(task: FieldTask): void;
  abstract remove(task: FieldTask): void;
  abstract flush(): Promise<void>;
}
