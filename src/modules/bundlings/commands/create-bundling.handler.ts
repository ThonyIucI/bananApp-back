import { Injectable } from '@nestjs/common';
import { Bundling } from '../domain/bundling.entity';
import { IBundlingRepository } from '../domain/bundling.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { IRibbonCalendarRepository } from '../../ribbon-calendars/domain/ribbon-calendar.repository';
import {
  BusinessRuleException,
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import { CreateBundlingCommand } from './create-bundling.command';
import { RibbonCalendar } from '../../ribbon-calendars/domain/ribbon-calendar.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';

@Injectable()
export class CreateBundlingHandler {
  constructor(
    private readonly bundlingRepo: IBundlingRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly userRepo: IUserRepository,
    private readonly ribbonCalendarRepo: IRibbonCalendarRepository,
  ) {}

  async execute(cmd: CreateBundlingCommand): Promise<Bundling> {
    if (!cmd.ribbonCalendarId && !cmd.ribbonColorFree) {
      throw new BusinessRuleException(
        'Debe indicar el calendario de cinta o un color de cinta libre',
      );
    }

    const [plot, enfundadorUser] = await Promise.all([
      this.plotRepo.findById(cmd.plotId),
      this.userRepo.findById(cmd.enfundadorUserId),
    ]);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    if (!enfundadorUser)
      throw new NotFoundException('Enfundador no encontrado');

    const hasSubPlots = plot.subPlots.length > 0;
    if (hasSubPlots && !cmd.subPlotId) {
      throw new ValidationException(
        'Debe seleccionar una subparcela para esta parcela',
        'subPlotId',
      );
    }

    let subPlot: SubPlot | undefined = undefined;
    if (cmd.subPlotId) {
      subPlot = await this.subPlotRepo.findById(cmd.subPlotId);
      if (!subPlot) throw new NotFoundException('Subparcela no encontrada');

      const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
      if (subPlotPlotId !== cmd.plotId) {
        throw new ValidationException(
          'La subparcela no pertenece a la parcela seleccionada',
          'subPlotId',
        );
      }
    }

    let ribbonCalendar: RibbonCalendar | undefined = undefined;
    if (cmd.ribbonCalendarId) {
      ribbonCalendar = await this.ribbonCalendarRepo.findById(
        cmd.ribbonCalendarId,
      );
      if (!ribbonCalendar)
        throw new NotFoundException('Calendario de cinta no encontrado');
    }

    const bundling = Bundling.make({
      plot,
      subPlot,
      enfundadorUser,
      quantity: cmd.quantity,
      bundledAt: cmd.bundledAt,
      localUuid: cmd.localUuid,
      ribbonCalendar,
      ribbonColorFree: cmd.ribbonColorFree,
      notes: cmd.notes,
    });

    this.bundlingRepo.persist(bundling);
    await this.bundlingRepo.flush();
    return bundling;
  }
}
