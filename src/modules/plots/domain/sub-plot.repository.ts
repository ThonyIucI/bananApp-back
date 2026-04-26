import { SubPlot } from './sub-plot.entity';

export abstract class ISubPlotRepository {
  abstract findById(id: string): Promise<SubPlot | null>;
  abstract findByPlot(plotId: string): Promise<SubPlot[]>;
  abstract sumAreaByPlot(plotId: string): Promise<number>;
  abstract persist(subPlot: SubPlot): void;
  abstract remove(subPlot: SubPlot): void;
  abstract flush(): Promise<void>;
}
