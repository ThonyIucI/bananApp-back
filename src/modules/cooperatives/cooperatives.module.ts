import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Cooperative } from './domain/cooperative.entity';
import { UserCooperative } from './domain/user-cooperative.entity';
import { UserCooperativeRole } from './domain/user-cooperative-role.entity';
import { ICooperativeRepository } from './domain/cooperative.repository';
import { MikroOrmCooperativeRepository } from './infrastructure/mikro-orm-cooperative.repository';
import { CreateCooperativeHandler } from './commands/create-cooperative.handler';
import { UpdateCooperativeHandler } from './commands/update-cooperative.handler';
import { DeleteCooperativeHandler } from './commands/delete-cooperative.handler';
import { ListCooperativesHandler } from './queries/list-cooperatives.handler';
import { FindCooperativeByIdHandler } from './queries/find-cooperative-by-id.handler';
import { CooperativesController } from './http/cooperatives.controller';
import { User } from '../users/domain/user.entity';
import { Sector } from '../sectors/domain/sector.entity';
import { ISectorRepository } from '../sectors/domain/sector.repository';
import { MikroOrmSectorRepository } from '../sectors/infrastructure/mikro-orm-sector.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Cooperative,
      User,
      UserCooperative,
      UserCooperativeRole,
      Sector,
    ]),
  ],
  providers: [
    {
      provide: ICooperativeRepository,
      useClass: MikroOrmCooperativeRepository,
    },
    {
      provide: ISectorRepository,
      useClass: MikroOrmSectorRepository,
    },
    CreateCooperativeHandler,
    UpdateCooperativeHandler,
    DeleteCooperativeHandler,
    ListCooperativesHandler,
    FindCooperativeByIdHandler,
  ],
  controllers: [CooperativesController],
  exports: [ICooperativeRepository, ISectorRepository, MikroOrmModule],
})
export class CooperativesModule {}
