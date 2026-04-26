import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Plot } from './domain/plot.entity';
import { SubPlot } from './domain/sub-plot.entity';
import { IPlotRepository } from './domain/plot.repository';
import { ISubPlotRepository } from './domain/sub-plot.repository';
import { MikroOrmPlotRepository } from './infrastructure/mikro-orm-plot.repository';
import { MikroOrmSubPlotRepository } from './infrastructure/mikro-orm-sub-plot.repository';
import { CreatePlotHandler } from './commands/create-plot.handler';
import { UpdatePlotHandler } from './commands/update-plot.handler';
import { DeletePlotHandler } from './commands/delete-plot.handler';
import { CreateSubPlotHandler } from './commands/create-sub-plot.handler';
import { UpdateSubPlotHandler } from './commands/update-sub-plot.handler';
import { DeleteSubPlotHandler } from './commands/delete-sub-plot.handler';
import { FindPlotByIdHandler } from './queries/find-plot-by-id.handler';
import { ListPlotsHandler } from './queries/list-plots.handler';
import { FindSubPlotByIdHandler } from './queries/find-sub-plot-by-id.handler';
import { ListSubPlotsHandler } from './queries/list-sub-plots.handler';
import { PlotsController } from './http/plots.controller';
import {
  SubPlotsByPlotController,
  SubPlotsByIdController,
} from './http/sub-plots.controller';
import { SectorsModule } from '../sectors/sectors.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Plot, SubPlot]),
    SectorsModule,
    UsersModule,
  ],
  providers: [
    { provide: IPlotRepository, useClass: MikroOrmPlotRepository },
    {
      provide: ISubPlotRepository,
      useClass: MikroOrmSubPlotRepository,
    },
    CreatePlotHandler,
    UpdatePlotHandler,
    DeletePlotHandler,
    CreateSubPlotHandler,
    UpdateSubPlotHandler,
    DeleteSubPlotHandler,
    FindPlotByIdHandler,
    ListPlotsHandler,
    FindSubPlotByIdHandler,
    ListSubPlotsHandler,
  ],
  controllers: [
    PlotsController,
    SubPlotsByPlotController,
    SubPlotsByIdController,
  ],
  exports: [IPlotRepository, ISubPlotRepository],
})
export class PlotsModule {}
