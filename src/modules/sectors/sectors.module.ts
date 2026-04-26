import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Sector } from './domain/sector.entity';
import { ISectorRepository } from './domain/sector.repository';
import { MikroOrmSectorRepository } from './infrastructure/mikro-orm-sector.repository';
import { CreateSectorHandler } from './commands/create-sector.handler';
import { UpdateSectorHandler } from './commands/update-sector.handler';
import { DeleteSectorHandler } from './commands/delete-sector.handler';
import { ListSectorsHandler } from './queries/list-sectors.handler';
import { FindSectorByIdHandler } from './queries/find-sector-by-id.handler';
import {
  SectorsController,
  SectorsByIdController,
} from './http/sectors.controller';
import { CooperativesModule } from '../cooperatives/cooperatives.module';

@Module({
  imports: [MikroOrmModule.forFeature([Sector]), CooperativesModule],
  providers: [
    {
      provide: ISectorRepository,
      useClass: MikroOrmSectorRepository,
    },
    CreateSectorHandler,
    UpdateSectorHandler,
    DeleteSectorHandler,
    ListSectorsHandler,
    FindSectorByIdHandler,
  ],
  controllers: [SectorsController, SectorsByIdController],
  exports: [ISectorRepository],
})
export class SectorsModule {}
