import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RibbonCalendar } from './domain/ribbon-calendar.entity';
import { IRibbonCalendarRepository } from './domain/ribbon-calendar.repository';
import { MikroOrmRibbonCalendarRepository } from './infrastructure/mikro-orm-ribbon-calendar.repository';
import { CreateRibbonCalendarHandler } from './commands/create-ribbon-calendar.handler';
import { UpdateRibbonCalendarHandler } from './commands/update-ribbon-calendar.handler';
import { GetRibbonCalendarHandler } from './queries/get-ribbon-calendar.handler';
import { GetCurrentWeekHandler } from './queries/get-current-week.handler';
import { RibbonCalendarsController } from './http/ribbon-calendars.controller';
import { CooperativesModule } from '../cooperatives/cooperatives.module';

@Module({
  imports: [MikroOrmModule.forFeature([RibbonCalendar]), CooperativesModule],
  providers: [
    {
      provide: IRibbonCalendarRepository,
      useClass: MikroOrmRibbonCalendarRepository,
    },
    CreateRibbonCalendarHandler,
    UpdateRibbonCalendarHandler,
    GetRibbonCalendarHandler,
    GetCurrentWeekHandler,
  ],
  controllers: [RibbonCalendarsController],
  exports: [IRibbonCalendarRepository, GetCurrentWeekHandler],
})
export class RibbonCalendarsModule {}
