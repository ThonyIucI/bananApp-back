import { Plot } from './plot.entity';

export interface PlotFilters {
  sectorId?: string;
  ownerUserId?: string;
  workerUserId?: string;
  cooperativeId?: string;
  /** Filter plots that have an active user_plot assignment for this user. */
  assignedUserId?: string;
  limit?: number;
  offset?: number;
}

export abstract class IPlotRepository {
  abstract findById(id: string): Promise<Plot | null>;
  abstract findAll(
    filters?: PlotFilters,
  ): Promise<{ items: Plot[]; total: number }>;
  abstract persist(plot: Plot): void;
  abstract persistMany(plots: Plot[]): void;
  abstract remove(plot: Plot): void;
  abstract flush(): Promise<void>;
}
