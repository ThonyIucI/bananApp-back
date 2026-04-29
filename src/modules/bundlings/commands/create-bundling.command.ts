export interface CreateBundlingCommand {
  plotId: string;
  enfundadorUserId: string;
  quantity: number;
  bundledAt: Date;
  localUuid: string;
  subPlotId?: string;
  ribbonCalendarId?: string;
  ribbonColorFree?: string;
  notes?: string;
}
