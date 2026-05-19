export interface TCreateFieldTaskDetailCommand {
  detailKey: string;
  valueText?: string | null;
  valueNumeric?: number | null;
  valueDate?: Date | null;
  valueBoolean?: boolean | null;
}

export interface TCreateFieldTaskCommand {
  plotId: string;
  taskTypeKey: string;
  performedAt: Date;
  performedByUserId: string;
  subPlotId?: string | null;
  areaCoveredHa?: number | null;
  cost?: number | null;
  notes?: string | null;
  localUuid?: string | null;
  details: TCreateFieldTaskDetailCommand[];
}
