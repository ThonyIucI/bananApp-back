import { RibbonCalendar } from './ribbon-calendar.entity';

export abstract class IRibbonCalendarRepository {
  abstract findById(id: string): Promise<RibbonCalendar | null>;
  abstract findByCooperativeAndYear(
    cooperativeId: string,
    year: number,
  ): Promise<RibbonCalendar | null>;
  abstract persist(calendar: RibbonCalendar): void;
  abstract flush(): Promise<void>;
}
