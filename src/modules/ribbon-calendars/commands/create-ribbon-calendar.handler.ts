import { Injectable } from '@nestjs/common';
import { RibbonCalendar } from '../domain/ribbon-calendar.entity';
import { IRibbonCalendarRepository } from '../domain/ribbon-calendar.repository';
import { ICooperativeRepository } from '../../cooperatives/domain/cooperative.repository';
import {
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import { CreateRibbonCalendarCommand } from './create-ribbon-calendar.command';

@Injectable()
export class CreateRibbonCalendarHandler {
  constructor(
    private readonly calendarRepo: IRibbonCalendarRepository,
    private readonly cooperativeRepo: ICooperativeRepository,
  ) {}

  async execute(cmd: CreateRibbonCalendarCommand): Promise<RibbonCalendar> {
    const cooperative = await this.cooperativeRepo.findById(cmd.cooperativeId);
    if (!cooperative) throw new NotFoundException('Cooperativa no encontrada');

    const existing = await this.calendarRepo.findByCooperativeAndYear(
      cmd.cooperativeId,
      cmd.year,
    );
    if (existing) {
      throw new ValidationException(
        `Ya existe un calendario para el año ${cmd.year}`,
        'year',
      );
    }

    const calendar = RibbonCalendar.make({
      cooperative,
      year: cmd.year,
      startColorIndex: cmd.startColorIndex,
    });

    this.calendarRepo.persist(calendar);
    await this.calendarRepo.flush();

    return calendar;
  }
}
