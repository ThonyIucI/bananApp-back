import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { CreateBundlingHandler } from '../commands/create-bundling.handler';
import { ListBundlingsHandler } from '../queries/list-bundlings.handler';
import { BundlingSummaryHandler } from '../queries/bundling-summary.handler';
import { HarvestPredictionHandler } from '../queries/harvest-prediction.handler';
import { CreateBundlingDto } from './dtos/create-bundling.dto';
import { ListBundlingsDto } from './dtos/list-bundlings.dto';
import { BundlingSummaryDto } from './dtos/bundling-summary.dto';

@Controller('bundlings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BundlingsController {
  constructor(
    private readonly createHandler: CreateBundlingHandler,
    private readonly listHandler: ListBundlingsHandler,
    private readonly summaryHandler: BundlingSummaryHandler,
    private readonly harvestPredictionHandler: HarvestPredictionHandler,
  ) {}

  @Post()
  @RequirePermission('bundling_create')
  create(@Body() dto: CreateBundlingDto) {
    return this.createHandler.execute({
      plotId: dto.plotId,
      enfundadorUserId: dto.enfundadorUserId,
      quantity: dto.quantity,
      bundledAt: new Date(dto.bundledAt),
      localUuid: dto.localUuid,
      ribbonCalendarId: dto.ribbonCalendarId,
      ribbonColorFree: dto.ribbonColorFree,
      notes: dto.notes,
    });
  }

  @Get()
  @RequirePermission('bundling_read')
  findAll(@Query() query: ListBundlingsDto) {
    return this.listHandler.execute({
      plotId: query.plotId,
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
  harvestPrediction(
    @Query() query: { cooperativeId?: string; plotId?: string },
  ) {
    return this.harvestPredictionHandler.execute({
      cooperativeId: query.cooperativeId,
      plotId: query.plotId,
    });
  }
}
