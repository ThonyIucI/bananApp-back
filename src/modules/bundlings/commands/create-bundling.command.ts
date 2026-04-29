export interface SubPlotEntryCommand {
  subPlotId: string;
  enfundadorUserId: string;
  quantity: number;
  localUuid: string;
  ribbonCalendarId?: string;
  ribbonColorFree?: string;
  notes?: string;
}

export interface CreateBundlingCommand {
  plotId: string;
  bundledAt: Date;
  /** Single-mode fields — required when subPlotEntries is absent. */
  enfundadorUserId?: string;
  quantity?: number;
  localUuid?: string;
  subPlotId?: string;
  ribbonCalendarId?: string;
  ribbonColorFree?: string;
  notes?: string;
  /** Multi-mode: when present, single-mode fields are ignored. */
  subPlotEntries?: SubPlotEntryCommand[];
}
