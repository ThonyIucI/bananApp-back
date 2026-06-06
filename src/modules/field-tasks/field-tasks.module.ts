import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TaskType } from './entities/task-type.entity';
import { TaskTypeDetailSchema } from './entities/task-type-detail-schema.entity';
import { TaskTypeDetailOption } from './entities/task-type-detail-option.entity';
import { FieldTask } from './entities/field-task.entity';
import { FieldTaskDetail } from './entities/field-task-detail.entity';
import { IFieldTaskRepository } from './repositories/field-task.repository';
import { ITaskTypeRepository } from './repositories/task-type.repository';
import { MikroOrmFieldTaskRepository } from './repositories/field-task.mikro-orm.repository';
import { MikroOrmTaskTypeRepository } from './repositories/task-type.mikro-orm.repository';
import { CreateFieldTaskService } from './services/create-field-task.service';
import { UpdateFieldTaskService } from './services/update-field-task.service';
import { DeleteFieldTaskService } from './services/delete-field-task.service';
import { ListFieldTasksService } from './services/list-field-tasks.service';
import { GetFieldTaskService } from './services/get-field-task.service';
import { ListTaskTypesService } from './services/list-task-types.service';
import { FieldTasksController } from './controllers/field-tasks.controller';
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
    CreateFieldTaskService,
    UpdateFieldTaskService,
    DeleteFieldTaskService,
    ListFieldTasksService,
    GetFieldTaskService,
    ListTaskTypesService,
    SeedTaskTypesService,
  ],
  controllers: [FieldTasksController],
  exports: [SeedTaskTypesService, ITaskTypeRepository, CreateFieldTaskService],
})
export class FieldTasksModule {}
