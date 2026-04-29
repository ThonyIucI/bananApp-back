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
import { CooperativeScope } from '../../shared/decorators/cooperative-scope.decorator';
import { CreateBundlingHandler } from '../commands/create-bundling.handler';
import { UpdateBundlingHandler } from '../commands/update-bundling.handler';
import { DeleteBundlingHandler } from '../commands/delete-bundling.handler';
import { ListBundlingsHandler } from '../queries/list-bundlings.handler';
import { BundlingSummaryHandler } from '../queries/bundling-summary.handler';
import { HarvestPredictionHandler } from '../queries/harvest-prediction.handler';
import { StatsMonthlyHandler } from '../queries/stats-monthly.handler';
import { StatsWeeklyHandler } from '../queries/stats-weekly.handler';
import { StatsOverviewHandler } from '../queries/stats-overview.handler';
import { CreateBundlingDto } from './dtos/create-bundling.dto';
import { UpdateBundlingDto } from './dtos/update-bundling.dto';
import { ListBundlingsDto } from './dtos/list-bundlings.dto';
import { BundlingSummaryDto } from './dtos/bundling-summary.dto';
import {
  StatsMonthlyDto,
  StatsOverviewDto,
  StatsWeeklyDto,
} from './dtos/stats.dto';

@Controller('bundlings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BundlingsController {
  constructor(
    private readonly createHandler: CreateBundlingHandler,
    private readonly updateHandler: UpdateBundlingHandler,
    private readonly deleteHandler: DeleteBundlingHandler,
    private readonly listHandler: ListBundlingsHandler,
    private readonly summaryHandler: BundlingSummaryHandler,
    private readonly harvestPredictionHandler: HarvestPredictionHandler,
    private readonly statsMonthlyHandler: StatsMonthlyHandler,
    private readonly statsWeeklyHandler: StatsWeeklyHandler,
    private readonly statsOverviewHandler: StatsOverviewHandler,
  ) {}

  @Post()
  @RequirePermission('bundling_create')
  @CooperativeScope('body')
  async create(@Body() dto: CreateBundlingDto) {
    try {
      const data = await this.createHandler.execute({
        plotId: dto.plotId,
        enfundadorUserId: dto.enfundadorUserId,
        quantity: dto.quantity,
        bundledAt: new Date(dto.bundledAt),
        localUuid: dto.localUuid,
        subPlotId: dto.subPlotId,
        ribbonCalendarId: dto.ribbonCalendarId,
        ribbonColorFree: dto.ribbonColorFree,
        notes: dto.notes,
      });
      console.log(data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  @Patch(':id')
  @RequirePermission('bundling_update')
  @CooperativeScope('query')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBundlingDto,
  ) {
    return this.updateHandler.execute({
      id,
      subPlotId: dto.subPlotId,
      quantity: dto.quantity,
      ribbonCalendarId: dto.ribbonCalendarId,
      ribbonColorFree: dto.ribbonColorFree,
      bundledAt: dto.bundledAt ? new Date(dto.bundledAt) : undefined,
      notes: dto.notes,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('bundling_update')
  @CooperativeScope('query')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }

  @Get()
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  findAll(@Query() query: ListBundlingsDto) {
    return this.listHandler.execute({
      plotId: query.plotId,
      subPlotId: query.subPlotId,
      enfundadorUserId: query.enfundadorUserId,
      cooperativeId: query.cooperativeId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('summary')
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  summary(@Query() query: BundlingSummaryDto) {
    return this.summaryHandler.execute({
      cooperativeId: query.cooperativeId,
      plotId: query.plotId,
      enfundadorUserId: query.enfundadorUserId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Get('harvest-prediction')
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  harvestPrediction(
    @Query() query: { cooperativeId?: string; plotId?: string },
  ) {
    return this.harvestPredictionHandler.execute({
      cooperativeId: query.cooperativeId,
      plotId: query.plotId,
    });
  }

  @Get('stats/monthly')
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  statsMonthly(@Query() query: StatsMonthlyDto) {
    return this.statsMonthlyHandler.execute({
      cooperativeId: query.cooperativeId,
      months: query.months,
    });
  }

  @Get('stats/weekly')
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  statsWeekly(@Query() query: StatsWeeklyDto) {
    return this.statsWeeklyHandler.execute({
      cooperativeId: query.cooperativeId,
      weeks: query.weeks,
      enfundadorUserId: query.enfundadorUserId,
    });
  }

  @Get('stats/overview')
  @RequirePermission('bundling_read')
  @CooperativeScope('query')
  statsOverview(@Query() query: StatsOverviewDto) {
    return this.statsOverviewHandler.execute({
      cooperativeId: query.cooperativeId,
    });
  }
}
