import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { Cooperative } from '../../cooperatives/domain/cooperative.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

export const RIBBON_COLORS_CYCLE = [
  'red',
  'brown',
  'black',
  'green',
  'blue',
  'white',
  'yellow',
  'lilac',
] as const;

export const RIBBON_COLOR_SPECIAL = 'orange' as const;

export const RIBBON_COLORS = [
  ...RIBBON_COLORS_CYCLE,
  RIBBON_COLOR_SPECIAL,
] as const;

export type RibbonColor = (typeof RIBBON_COLORS)[number];

export function getRibbonColorForWeek(week: number): RibbonColor {
  if (week === 53) return RIBBON_COLOR_SPECIAL;
  return RIBBON_COLORS_CYCLE[(week - 1) % RIBBON_COLORS_CYCLE.length];
}

export interface WeekEntry {
  week: number;
  color: RibbonColor;
}
console.log('asd');

const RibbonCalendarSchema = defineEntity({
  name: 'RibbonCalendar',
  tableName: 'ribbon_calendars',
  extends: BaseSchema,
  properties: {
    cooperative: () => p.manyToOne(Cooperative).deleteRule('cascade'),
    year: p.integer(),
    // Index into RIBBON_COLORS_CYCLE for week 1 (0 = red, 1 = brown, …)
    startColorIndex: p.integer().default(0),
  },
});

export class RibbonCalendar extends RibbonCalendarSchema.class {
  static make(props: {
    cooperative: Cooperative;
    year: number;
    startColorIndex?: number;
  }): RibbonCalendar {
    const cal = new RibbonCalendar();
    cal.cooperative = props.cooperative;
    cal.year = props.year;
    cal.startColorIndex = props.startColorIndex ?? 0;
    cal.validate();
    return cal;
  }

  getColorForWeek(week: number): RibbonColor {
    if (week === 53) return RIBBON_COLOR_SPECIAL;
    return RIBBON_COLORS_CYCLE[
      (this.startColorIndex + week - 1) % RIBBON_COLORS_CYCLE.length
    ];
  }

  getAllWeeks(): WeekEntry[] {
    const weeks = 52;
    return Array.from({ length: weeks }, (_, i) => {
      const week = i + 1;
      return { week, color: this.getColorForWeek(week) };
    });
  }

  update(props: { startColorIndex: number }): void {
    this.startColorIndex = props.startColorIndex;
    this.validate();
  }

  private validate(): void {
    if (this.year !== undefined && (this.year < 2000 || this.year > 2100)) {
      throw new ValidationException(
        'El año debe estar entre 2000 y 2100',
        'year',
      );
    }
    if (
      this.startColorIndex !== undefined &&
      (this.startColorIndex < 0 ||
        this.startColorIndex > RIBBON_COLORS_CYCLE.length - 1)
    ) {
      throw new ValidationException(
        `El índice de color inicial debe estar entre 0 y ${RIBBON_COLORS_CYCLE.length - 1}`,
        'startColorIndex',
      );
    }
  }
}

RibbonCalendarSchema.setClass(RibbonCalendar);
