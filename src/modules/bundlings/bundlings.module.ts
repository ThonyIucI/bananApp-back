import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Bundling } from './domain/bundling.entity';
import { IBundlingRepository } from './domain/bundling.repository';
import { MikroOrmBundlingRepository } from './infrastructure/mikro-orm-bundling.repository';
import { CreateBundlingHandler } from './commands/create-bundling.handler';
import { UpdateBundlingHandler } from './commands/update-bundling.handler';
import { DeleteBundlingHandler } from './commands/delete-bundling.handler';
import { ListBundlingsHandler } from './queries/list-bundlings.handler';
import { BundlingSummaryHandler } from './queries/bundling-summary.handler';
import { HarvestPredictionHandler } from './queries/harvest-prediction.handler';
import { StatsMonthlyHandler } from './queries/stats-monthly.handler';
import { StatsWeeklyHandler } from './queries/stats-weekly.handler';
import { StatsOverviewHandler } from './queries/stats-overview.handler';
import { BundlingsController } from './http/bundlings.controller';
import { PlotsModule } from '../plots/plots.module';
import { UsersModule } from '../users/users.module';
import { RibbonCalendarsModule } from '../ribbon-calendars/ribbon-calendars.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Bundling]),
    PlotsModule,
    UsersModule,
    RibbonCalendarsModule,
  ],
  providers: [
    { provide: IBundlingRepository, useClass: MikroOrmBundlingRepository },
    CreateBundlingHandler,
    UpdateBundlingHandler,
    DeleteBundlingHandler,
    ListBundlingsHandler,
    BundlingSummaryHandler,
    HarvestPredictionHandler,
    StatsMonthlyHandler,
    StatsWeeklyHandler,
    StatsOverviewHandler,
  ],
  controllers: [BundlingsController],
})
export class BundlingsModule {}
