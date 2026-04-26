import { Injectable } from '@nestjs/common';
import { IRibbonCalendarRepository } from '../domain/ribbon-calendar.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class GetRibbonCalendarHandler {
  constructor(private readonly calendarRepo: IRibbonCalendarRepository) {}

  async execute(cooperativeId: string, year: number) {
    const calendar = await this.calendarRepo.findByCooperativeAndYear(
      cooperativeId,
      year,
    );
    if (!calendar)
      throw new NotFoundException(`Calendario del ${year} no encontrado`);

    return {
      id: calendar.id,
      year: calendar.year,
      startColorIndex: calendar.startColorIndex,
      weeks: calendar.getAllWeeks(),
    };
  }
}
