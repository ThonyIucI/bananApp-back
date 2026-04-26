import { Injectable } from '@nestjs/common';
import { RibbonCalendar } from '../domain/ribbon-calendar.entity';
import { IRibbonCalendarRepository } from '../domain/ribbon-calendar.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';
import { UpdateRibbonCalendarCommand } from './update-ribbon-calendar.command';

@Injectable()
export class UpdateRibbonCalendarHandler {
  constructor(private readonly calendarRepo: IRibbonCalendarRepository) {}

  async execute(cmd: UpdateRibbonCalendarCommand): Promise<RibbonCalendar> {
    const calendar = await this.calendarRepo.findByCooperativeAndYear(
      cmd.cooperativeId,
      cmd.year,
    );
    if (!calendar)
      throw new NotFoundException(`Calendario del ${cmd.year} no encontrado`);

    calendar.update({ startColorIndex: cmd.startColorIndex });
    await this.calendarRepo.flush();

    return calendar;
  }
}
