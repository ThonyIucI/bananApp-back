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
import { CreateFieldTaskHandler } from '../commands/create-field-task.handler';
import { UpdateFieldTaskHandler } from '../commands/update-field-task.handler';
import { DeleteFieldTaskHandler } from '../commands/delete-field-task.handler';
import { ListFieldTasksHandler } from '../queries/list-field-tasks.handler';
import { GetFieldTaskHandler } from '../queries/get-field-task.handler';
import { ListTaskTypesHandler } from '../queries/list-task-types.handler';
import { CreateFieldTaskDto } from './dtos/create-field-task.dto';
import { UpdateFieldTaskDto } from './dtos/update-field-task.dto';
import { ListFieldTasksDto } from './dtos/list-field-tasks.dto';

@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FieldTasksController {
  constructor(
    private readonly createHandler: CreateFieldTaskHandler,
    private readonly updateHandler: UpdateFieldTaskHandler,
    private readonly deleteHandler: DeleteFieldTaskHandler,
    private readonly listHandler: ListFieldTasksHandler,
    private readonly getHandler: GetFieldTaskHandler,
    private readonly listTaskTypesHandler: ListTaskTypesHandler,
  ) {}

  @Get('task-types')
  @RequirePermission('field_task_list')
  listTaskTypes(@Query('cropTypeKey') cropTypeKey?: string) {
    return this.listTaskTypesHandler.execute(cropTypeKey);
  }

  @Post('plots/:plotId/field-tasks')
  @RequirePermission('field_task_create')
  create(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Body() dto: CreateFieldTaskDto,
  ) {
    return this.createHandler.execute({
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
      details: (dto.details ?? []).map((d) => ({
        detailKey: d.detailKey,
        value: d.value,
      })),
    });
  }

  @Get('plots/:plotId/field-tasks')
  @RequirePermission('field_task_list')
  list(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Query() query: ListFieldTasksDto,
  ) {
    return this.listHandler.execute({
      plotId,
      subPlotId: query.subPlotId,
      taskTypeKey: query.taskTypeKey,
      performedByUserId: query.performedByUserId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('field-tasks/:id')
  @RequirePermission('field_task_list')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getHandler.execute(id);
  }

  @Patch('field-tasks/:id')
  @RequirePermission('field_task_update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldTaskDto,
  ) {
    return this.updateHandler.execute({
      id,
      subPlotId: dto.subPlotId,
      performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
      areaCoveredHa: dto.areaCoveredHa,
      cost: dto.cost,
      laborDays: dto.laborDays,
      notes: dto.notes,
      details: dto.details?.map((d) => ({
        detailKey: d.detailKey,
        value: d.value,
      })),
    });
  }

  @Delete('field-tasks/:id')
  @RequirePermission('field_task_delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }
}
