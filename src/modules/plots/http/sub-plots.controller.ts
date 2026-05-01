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
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { CreateSubPlotHandler } from '../commands/create-sub-plot.handler';
import { UpdateSubPlotHandler } from '../commands/update-sub-plot.handler';
import { DeleteSubPlotHandler } from '../commands/delete-sub-plot.handler';
import { ListSubPlotsHandler } from '../queries/list-sub-plots.handler';
import { FindSubPlotByIdHandler } from '../queries/find-sub-plot-by-id.handler';
import { CreateSubPlotDto } from './dtos/create-sub-plot.dto';
import { UpdateSubPlotDto } from './dtos/update-sub-plot.dto';

class ListSubPlotsQuery {
  /** Filter by multiple plot IDs. Supports repeated query: ?plotIds=a&plotIds=b */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? (value as string[])
      : value
        ? [value as string]
        : undefined,
  )
  @IsArray()
  @IsUUID('all', { each: true })
  plotIds?: string[];
}

/** Routes scoped under a plot: GET/POST /plots/:plotId/sub-plots */
@Controller('plots/:plotId/sub-plots')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SubPlotsByPlotController {
  constructor(
    private readonly createHandler: CreateSubPlotHandler,
    private readonly listHandler: ListSubPlotsHandler,
  ) {}

  @Post()
  @RequirePermission('plot_manage')
  create(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Body() dto: CreateSubPlotDto,
  ) {
    return this.createHandler.execute({
      plotId,
      name: dto.name,
      responsibleUserId: dto.responsibleUserId,
      areaHectares: dto.areaHectares,
    });
  }

  @Get()
  @RequirePermission('plot_read')
  findAll(@Param('plotId', ParseUUIDPipe) plotId: string) {
    return this.listHandler.execute({ plotId });
  }
}

/** Routes scoped by internal subPlot id: GET/PATCH/DELETE /sub-plots/:id
 *  Also exposes GET /sub-plots?plotIds[]=... for multi-plot scoping.
 */
@Controller('sub-plots')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SubPlotsByIdController {
  constructor(
    private readonly findByIdHandler: FindSubPlotByIdHandler,
    private readonly updateHandler: UpdateSubPlotHandler,
    private readonly deleteHandler: DeleteSubPlotHandler,
    private readonly listHandler: ListSubPlotsHandler,
  ) {}

  @Get()
  @RequirePermission('plot_read')
  findByPlots(@Query() query: ListSubPlotsQuery) {
    return this.listHandler.execute({ plotIds: query.plotIds });
  }

  @Get(':id')
  @RequirePermission('plot_read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findByIdHandler.execute(id);
  }

  @Patch(':id')
  @RequirePermission('plot_manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubPlotDto,
  ) {
    return this.updateHandler.execute({
      id,
      name: dto.name,
      responsibleUserId: dto.responsibleUserId,
      areaHectares: dto.areaHectares,
    });
  }

  @Delete(':id')
  @RequirePermission('plot_manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }
}
