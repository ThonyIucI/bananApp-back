import { Bundling } from './bundling.entity';

export interface BundlingFilters {
  plotId?: string;
  subPlotId?: string;
  enfundadorUserId?: string;
  cooperativeId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export abstract class IBundlingRepository {
  abstract findById(id: string): Promise<Bundling | null>;
  abstract findAll(
    filters?: BundlingFilters,
  ): Promise<{ items: Bundling[]; total: number }>;
  abstract sumQuantityByPlot(
    plotId: string,
    from?: Date,
    to?: Date,
  ): Promise<number>;
  abstract persist(bundling: Bundling): void;
  abstract flush(): Promise<void>;
}
