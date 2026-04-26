import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { RibbonCalendar } from '../domain/ribbon-calendar.entity';
import { IRibbonCalendarRepository } from '../domain/ribbon-calendar.repository';

@Injectable()
export class MikroOrmRibbonCalendarRepository extends IRibbonCalendarRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findById(id: string): Promise<RibbonCalendar | null> {
    return this.em.findOne(RibbonCalendar, { id, deletedAt: null });
  }

  findByCooperativeAndYear(
    cooperativeId: string,
    year: number,
  ): Promise<RibbonCalendar | null> {
    return this.em.findOne(RibbonCalendar, {
      cooperative: { id: cooperativeId },
      year,
      deletedAt: null,
    });
  }

  persist(calendar: RibbonCalendar): void {
    this.em.persist(calendar);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
