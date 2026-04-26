import { Injectable } from '@nestjs/common';
import { Bundling } from '../domain/bundling.entity';
import { IBundlingRepository } from '../domain/bundling.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { IRibbonCalendarRepository } from '../../ribbon-calendars/domain/ribbon-calendar.repository';
import {
  BusinessRuleException,
  NotFoundException,
} from '../../shared/exceptions/domain.exception';
import { CreateBundlingCommand } from './create-bundling.command';
import { RibbonCalendar } from '../../ribbon-calendars/domain/ribbon-calendar.entity';

@Injectable()
export class CreateBundlingHandler {
  constructor(
    private readonly bundlingRepo: IBundlingRepository,
    private readonly plotRepo: IPlotRepository,
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
