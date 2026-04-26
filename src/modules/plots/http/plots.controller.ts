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
import { CreatePlotHandler } from '../commands/create-plot.handler';
import { UpdatePlotHandler } from '../commands/update-plot.handler';
import { DeletePlotHandler } from '../commands/delete-plot.handler';
import { FindPlotByIdHandler } from '../queries/find-plot-by-id.handler';
import { ListPlotsHandler } from '../queries/list-plots.handler';
import { CreatePlotDto } from './dtos/create-plot.dto';
import { UpdatePlotDto } from './dtos/update-plot.dto';
import { ListPlotsDto } from './dtos/list-plots.dto';

@Controller('plots')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PlotsController {
  constructor(
    private readonly createHandler: CreatePlotHandler,
    private readonly updateHandler: UpdatePlotHandler,
    private readonly deleteHandler: DeletePlotHandler,
    private readonly findByIdHandler: FindPlotByIdHandler,
    private readonly listHandler: ListPlotsHandler,
  ) {}

  @Post()
  @RequirePermission('plot_manage')
  create(@Body() dto: CreatePlotDto) {
    return this.createHandler.execute({
      name: dto.name,
      sectorId: dto.sectorId,
      ownerUserId: dto.ownerUserId,
      workerUserId: dto.workerUserId,
      areaHectares: dto.areaHectares,
      cadastralCode: dto.cadastralCode,
      subPlots: dto.subPlots,
    });
  }

  @Get()
  @RequirePermission('plot_read')
  findAll(@Query() query: ListPlotsDto) {
    return this.listHandler.execute(query);
  }

  @Get(':id')
  @RequirePermission('plot_read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.findByIdHandler.execute(id);
    console.log('this.findByIdHandler.execute(id);', data);

    return data;
  }

  @Patch(':id')
  @RequirePermission('plot_manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlotDto) {
    return this.updateHandler.execute({
      id,
      name: dto.name,
      sectorId: dto.sectorId,
      ownerUserId: dto.ownerUserId,
      workerUserId: dto.workerUserId,
      areaHectares: dto.areaHectares,
      cadastralCode: dto.cadastralCode,
      subPlots: dto.subPlots,
    });
  }

  @Delete(':id')
  @RequirePermission('plot_manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }
}
