import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Plot } from './domain/plot.entity';
import { SubPlot } from './domain/sub-plot.entity';
import { UserPlot } from './domain/user-plot.entity';
import { IPlotRepository } from './domain/plot.repository';
import { ISubPlotRepository } from './domain/sub-plot.repository';
import { IUserPlotRepository } from './domain/user-plot.repository';
import { MikroOrmPlotRepository } from './infrastructure/mikro-orm-plot.repository';
import { MikroOrmSubPlotRepository } from './infrastructure/mikro-orm-sub-plot.repository';
import { MikroOrmUserPlotRepository } from './infrastructure/mikro-orm-user-plot.repository';
import { CreatePlotHandler } from './commands/create-plot.handler';
import { UpdatePlotHandler } from './commands/update-plot.handler';
import { DeletePlotHandler } from './commands/delete-plot.handler';
import { CreateSubPlotHandler } from './commands/create-sub-plot.handler';
import { UpdateSubPlotHandler } from './commands/update-sub-plot.handler';
import { DeleteSubPlotHandler } from './commands/delete-sub-plot.handler';
import { AssignUserPlotsHandler } from './commands/assign-user-plots.handler';
import { UnassignUserPlotsHandler } from './commands/unassign-user-plots.handler';
import { FindPlotByIdHandler } from './queries/find-plot-by-id.handler';
import { ListPlotsHandler } from './queries/list-plots.handler';
import { FindSubPlotByIdHandler } from './queries/find-sub-plot-by-id.handler';
import { ListSubPlotsHandler } from './queries/list-sub-plots.handler';
import { ListUserPlotsHandler } from './queries/list-user-plots.handler';
import { ListPlotUsersHandler } from './queries/list-plot-users.handler';
import { PlotsController } from './http/plots.controller';
import { UserPlotsController } from './http/user-plots.controller';
import {
  SubPlotsByPlotController,
  SubPlotsByIdController,
} from './http/sub-plots.controller';
import { SectorsModule } from '../sectors/sectors.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Plot, SubPlot, UserPlot]),
    SectorsModule,
    UsersModule,
  ],
  providers: [
    { provide: IPlotRepository, useClass: MikroOrmPlotRepository },
    { provide: ISubPlotRepository, useClass: MikroOrmSubPlotRepository },
    { provide: IUserPlotRepository, useClass: MikroOrmUserPlotRepository },
    CreatePlotHandler,
    UpdatePlotHandler,
    DeletePlotHandler,
    CreateSubPlotHandler,
    UpdateSubPlotHandler,
    DeleteSubPlotHandler,
    AssignUserPlotsHandler,
    UnassignUserPlotsHandler,
    FindPlotByIdHandler,
    ListPlotsHandler,
    FindSubPlotByIdHandler,
    ListSubPlotsHandler,
    ListUserPlotsHandler,
    ListPlotUsersHandler,
  ],
  controllers: [
    PlotsController,
    UserPlotsController,
    SubPlotsByPlotController,
    SubPlotsByIdController,
  ],
  exports: [IPlotRepository, ISubPlotRepository, IUserPlotRepository],
})
export class PlotsModule {}
