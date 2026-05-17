import { Injectable } from '@nestjs/common';
import { IBundlingRepository } from '../domain/bundling.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IRibbonCalendarRepository } from '../../ribbon-calendars/domain/ribbon-calendar.repository';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import { Bundling } from '../domain/bundling.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import { RibbonCalendar } from '../../ribbon-calendars/domain/ribbon-calendar.entity';

export interface UpdateBundlingCommand {
  id: string;
  subPlotId?: string | null;
  quantity?: number;
  ribbonCalendarId?: string | null;
  ribbonColorFree?: string | null;
  bundledAt?: Date;
  notes?: string | null;
}

@Injectable()
export class UpdateBundlingHandler {
  constructor(
    private readonly bundlingRepo: IBundlingRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly ribbonCalendarRepo: IRibbonCalendarRepository,
  ) {}

  /** Updates mutable fields of an existing bundling. */
  async execute(cmd: UpdateBundlingCommand): Promise<Bundling> {
    const bundling = await this.bundlingRepo.findById(cmd.id);
    if (!bundling) throw new NotFoundException('Enfunde no encontrado');

    const plot = await this.plotRepo.findById(
      (bundling.plot as unknown as { id: string }).id,
    );

    let subPlot: SubPlot | null | undefined = undefined;
    if (cmd.subPlotId !== undefined) {
      if (cmd.subPlotId === null) {
        const hasSubPlots = plot?.subPlots?.length ?? 0;
        if (hasSubPlots > 0) {
          throw new ValidationException(
            'Debe seleccionar una subparcela para esta parcela',
            'subPlotId',
          );
        }
        subPlot = null;
      } else {
        const found = await this.subPlotRepo.findById(cmd.subPlotId);
        if (!found) throw new NotFoundException('Subparcela no encontrada');

        const subPlotPlotId = (found.plot as unknown as { id: string }).id;
        if (plot && subPlotPlotId !== plot.id) {
          throw new ValidationException(
            'La subparcela no pertenece a la parcela del enfunde',
            'subPlotId',
          );
        }
        subPlot = found;
      }
    }

    let ribbonCalendar: RibbonCalendar | null | undefined = undefined;
    if (cmd.ribbonCalendarId !== undefined) {
      if (cmd.ribbonCalendarId === null) {
        ribbonCalendar = null;
      } else {
        ribbonCalendar = await this.ribbonCalendarRepo.findById(
          cmd.ribbonCalendarId,
        );
        if (!ribbonCalendar)
          throw new NotFoundException('Calendario de cinta no encontrado');
      }
    }

    bundling.set({
      subPlot,
      quantity: cmd.quantity,
      ribbonCalendar,
      ribbonColorFree: cmd.ribbonColorFree,
      bundledAt: cmd.bundledAt,
      notes: cmd.notes,
    });

    await this.bundlingRepo.flush();
    return bundling;
  }
}
