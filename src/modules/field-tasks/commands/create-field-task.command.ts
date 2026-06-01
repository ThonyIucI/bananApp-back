export interface TCreateFieldTaskDetailCommand {
  detailKey: string;
  /** Raw JS value — the handler encodes it via encodeDetailValue before persisting. */
  value: string | number | boolean | null;
}

export interface TCreateFieldTaskCommand {
  plotId: string;
  taskTypeKey: string;
  performedAt: Date;
  performedByUserId: string;
  subPlotId?: string | null;
  areaCoveredHa?: number | null;
  cost?: number | null;
  laborDays?: number | null;
  notes?: string | null;
  localUuid?: string | null;
  details: TCreateFieldTaskDetailCommand[];
}
