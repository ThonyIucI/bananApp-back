import { TCreateFieldTaskDetailCommand } from './create-field-task.command';

export interface TUpdateFieldTaskCommand {
  id: string;
  subPlotId?: string | null;
  performedAt?: Date;
  areaCoveredHa?: number | null;
  cost?: number | null;
  laborDays?: number | null;
  notes?: string | null;
  details?: TCreateFieldTaskDetailCommand[];
}
