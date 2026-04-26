import { Injectable } from '@nestjs/common';
import { IRibbonCalendarRepository } from '../domain/ribbon-calendar.repository';
import {
  RIBBON_COLORS_CYCLE,
  RIBBON_COLOR_SPECIAL,
} from '../domain/ribbon-calendar.entity';
import { getCurrentISOWeek } from '../../shared/utils/iso-week.util';

@Injectable()
export class GetCurrentWeekHandler {
  constructor(private readonly calendarRepo: IRibbonCalendarRepository) {}

  async execute(cooperativeId: string) {
    const { week, year } = getCurrentISOWeek();

    const calendar = await this.calendarRepo.findByCooperativeAndYear(
      cooperativeId,
      year,
    );

    const startColorIndex = calendar?.startColorIndex ?? 0;
    const color =
      week === 53
        ? RIBBON_COLOR_SPECIAL
        : RIBBON_COLORS_CYCLE[
            (startColorIndex + week - 1) % RIBBON_COLORS_CYCLE.length
          ];

    return { week, year, color };
  }
}
