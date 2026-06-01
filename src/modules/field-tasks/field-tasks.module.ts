import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TaskType } from './domain/task-type.entity';
import { TaskTypeDetailSchema } from './domain/task-type-detail-schema.entity';
import { TaskTypeDetailOption } from './domain/task-type-detail-option.entity';
import { FieldTask } from './domain/field-task.entity';
import { FieldTaskDetail } from './domain/field-task-detail.entity';
import { IFieldTaskRepository } from './domain/field-task.repository';
import { ITaskTypeRepository } from './domain/task-type.repository';
import { MikroOrmFieldTaskRepository } from './infrastructure/mikro-orm-field-task.repository';
import { MikroOrmTaskTypeRepository } from './infrastructure/mikro-orm-task-type.repository';
import { CreateFieldTaskHandler } from './commands/create-field-task.handler';
import { UpdateFieldTaskHandler } from './commands/update-field-task.handler';
import { DeleteFieldTaskHandler } from './commands/delete-field-task.handler';
import { ListFieldTasksHandler } from './queries/list-field-tasks.handler';
import { GetFieldTaskHandler } from './queries/get-field-task.handler';
import { ListTaskTypesHandler } from './queries/list-task-types.handler';
import { FieldTasksController } from './http/field-tasks.controller';
import { SeedTaskTypesService } from './seed-task-types.service';
import { PlotsModule } from '../plots/plots.module';
import { UsersModule } from '../users/users.module';
import { CropTypesModule } from '../crop-types/crop-types.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      TaskType,
      TaskTypeDetailSchema,
      TaskTypeDetailOption,
      FieldTask,
      FieldTaskDetail,
    ]),
    PlotsModule,
    UsersModule,
    CropTypesModule,
  ],
  providers: [
    { provide: IFieldTaskRepository, useClass: MikroOrmFieldTaskRepository },
    { provide: ITaskTypeRepository, useClass: MikroOrmTaskTypeRepository },
    CreateFieldTaskHandler,
    UpdateFieldTaskHandler,
    DeleteFieldTaskHandler,
    ListFieldTasksHandler,
    GetFieldTaskHandler,
    ListTaskTypesHandler,
    SeedTaskTypesService,
  ],
  controllers: [FieldTasksController],
  exports: [SeedTaskTypesService, ITaskTypeRepository],
})
export class FieldTasksModule {}
