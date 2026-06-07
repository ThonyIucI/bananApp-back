import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { CreateFieldTaskService } from '../services/create-field-task.service';
import { UpdateFieldTaskService } from '../services/update-field-task.service';
import { DeleteFieldTaskService } from '../services/delete-field-task.service';
import { ListFieldTasksService } from '../services/list-field-tasks.service';
import { GetFieldTaskService } from '../services/get-field-task.service';
import { ListTaskTypesService } from '../services/list-task-types.service';
import { CreateFieldTaskDto } from './dtos/create-field-task.dto';
import { UpdateFieldTaskDto } from './dtos/update-field-task.dto';
import { ListFieldTasksDto } from './dtos/list-field-tasks.dto';
import {
  fieldTaskResource,
  IFieldTaskResource,
} from '../resources/field-task.resource';
import {
  ITaskTypeResource,
  taskTypeResource,
} from '../resources/task-type.resource';
import { IPaginatedData } from '../../shared/resources/pagination.interface';

const FIELD_TASK_ROUTES = {
  TASK_TYPES: 'task-types',
  CREATE: 'plots/:plotId/field-tasks',
  LIST_BY_PLOT: 'plots/:plotId/field-tasks',
  LIST_ALL: 'field-tasks',
  DETAIL: 'field-tasks/:id',
};

const FIELD_TASK_LIST_DEFAULTS = { limit: 20, offset: 0 };

// TODO(permisos): centralizar los keys en una constante `PERMISSIONS` cuando se resuelva el
// formato en migración (`field_task_*` vs `field_task:*`). Por ahora se mantienen como string.
@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FieldTasksController {
  constructor(
    private readonly createService: CreateFieldTaskService,
    private readonly updateService: UpdateFieldTaskService,
    private readonly deleteService: DeleteFieldTaskService,
    private readonly listService: ListFieldTasksService,
    private readonly getService: GetFieldTaskService,
    private readonly listTaskTypesService: ListTaskTypesService,
  ) {}

  @Get(FIELD_TASK_ROUTES.TASK_TYPES)
  @RequirePermission('field_task_list')
  async listTaskTypes(
    @Query('cropTypeKey') cropTypeKey?: string,
  ): Promise<ITaskTypeResource[]> {
    const taskTypes = await this.listTaskTypesService.execute(cropTypeKey);
    return taskTypeResource.toList(taskTypes);
  }

  @Post(FIELD_TASK_ROUTES.CREATE)
  @RequirePermission('field_task_create')
  async create(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Body() dto: CreateFieldTaskDto,
  ): Promise<IFieldTaskResource> {
    const fieldTask = await this.createService.execute({
      plotId,
      taskTypeKey: dto.taskTypeKey,
      performedAt: new Date(dto.performedAt),
      performedByUserId: dto.performedByUserId,
      subPlotId: dto.subPlotId,
      areaCoveredHa: dto.areaCoveredHa,
      cost: dto.cost,
      laborDays: dto.laborDays,
      notes: dto.notes,
      localUuid: dto.localUuid,
      details: (dto.details ?? []).map((detail) => ({
        detailKey: detail.detailKey,
        value: detail.value,
      })),
    });
    return fieldTaskResource.toItem(fieldTask);
  }

  @Get(FIELD_TASK_ROUTES.LIST_ALL)
  @RequirePermission('field_task_list')
  async listAll(
    @Query() query: ListFieldTasksDto,
  ): Promise<IPaginatedData<IFieldTaskResource>> {
    const limit = query.limit ?? FIELD_TASK_LIST_DEFAULTS.limit;
    const offset = query.offset ?? FIELD_TASK_LIST_DEFAULTS.offset;

    const [fieldTasks, total] = await this.listService.execute({
      plotIds: query.plotIds,
      subPlotId: query.subPlotId,
      taskTypeKey: query.taskTypeKey,
      performedByUserId: query.performedByUserId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit,
      offset,
    });

    return fieldTaskResource.toPaginated(fieldTasks, { total, limit, offset });
  }

  @Get(FIELD_TASK_ROUTES.LIST_BY_PLOT)
  @RequirePermission('field_task_list')
  async list(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Query() query: ListFieldTasksDto,
  ): Promise<IPaginatedData<IFieldTaskResource>> {
    const limit = query.limit ?? FIELD_TASK_LIST_DEFAULTS.limit;
    const offset = query.offset ?? FIELD_TASK_LIST_DEFAULTS.offset;

    const [fieldTasks, total] = await this.listService.execute({
      plotId,
      subPlotId: query.subPlotId,
      taskTypeKey: query.taskTypeKey,
      performedByUserId: query.performedByUserId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit,
      offset,
    });

    return fieldTaskResource.toPaginated(fieldTasks, { total, limit, offset });
  }

  @Get(FIELD_TASK_ROUTES.DETAIL)
  @RequirePermission('field_task_list')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IFieldTaskResource> {
    const fieldTask = await this.getService.execute(id);
    return fieldTaskResource.toItem(fieldTask);
  }

  @Patch(FIELD_TASK_ROUTES.DETAIL)
  @RequirePermission('field_task_update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldTaskDto,
  ): Promise<IFieldTaskResource> {
    const fieldTask = await this.updateService.execute({
      id,
      subPlotId: dto.subPlotId,
      performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
      areaCoveredHa: dto.areaCoveredHa,
      cost: dto.cost,
      laborDays: dto.laborDays,
      notes: dto.notes,
      details: dto.details?.map((detail) => ({
        detailKey: detail.detailKey,
        value: detail.value,
      })),
    });
    return fieldTaskResource.toItem(fieldTask);
  }

  @Delete(FIELD_TASK_ROUTES.DETAIL)
  @RequirePermission('field_task_delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteService.execute(id);
  }
}
