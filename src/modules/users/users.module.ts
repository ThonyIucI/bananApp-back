import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './domain/user.entity';
import { IUserRepository } from './domain/user.repository';
import { MikroOrmUserRepository } from './infrastructure/mikro-orm-user.repository';
import { CreateUserHandler } from './commands/create-user.handler';
import { UpdateUserHandler } from './commands/update-user.handler';
import { DeleteUserHandler } from './commands/delete-user.handler';
import { ListUsersHandler } from './queries/list-users.handler';
import { UsersController } from './http/users.controller';
import { CooperativesModule } from '../cooperatives/cooperatives.module';
import { AssignUserCooperativeHandler } from '../cooperatives/commands/assign-user-cooperative.handler';

@Module({
  imports: [MikroOrmModule.forFeature([User]), CooperativesModule],
  providers: [
    { provide: IUserRepository, useClass: MikroOrmUserRepository },
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    ListUsersHandler,
    AssignUserCooperativeHandler,
  ],
  controllers: [UsersController],
  exports: [MikroOrmModule, IUserRepository, AssignUserCooperativeHandler],
})
export class UsersModule {}
