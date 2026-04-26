import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { CreateRibbonCalendarHandler } from '../commands/create-ribbon-calendar.handler';
import { UpdateRibbonCalendarHandler } from '../commands/update-ribbon-calendar.handler';
import { GetRibbonCalendarHandler } from '../queries/get-ribbon-calendar.handler';
import { GetCurrentWeekHandler } from '../queries/get-current-week.handler';
import { CreateRibbonCalendarDto } from './dtos/create-ribbon-calendar.dto';
import { UpdateRibbonCalendarDto } from './dtos/update-ribbon-calendar.dto';

@Controller('cooperatives/:cooperativeId/ribbon-calendar')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RibbonCalendarsController {
  constructor(
    private readonly createHandler: CreateRibbonCalendarHandler,
    private readonly updateHandler: UpdateRibbonCalendarHandler,
    private readonly getHandler: GetRibbonCalendarHandler,
    private readonly currentWeekHandler: GetCurrentWeekHandler,
  ) {}

  // Must be before /:year to avoid "current-week" matching as year param
  @Get('current-week')
  @RequirePermission('ribbon_calendar_read')
  currentWeek(@Param('cooperativeId', ParseUUIDPipe) cooperativeId: string) {
    return this.currentWeekHandler.execute(cooperativeId);
  }

  @Post()
  @RequirePermission('ribbon_calendar_manage')
  create(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
    @Body() dto: CreateRibbonCalendarDto,
  ) {
    return this.createHandler.execute({
      cooperativeId,
      year: dto.year,
      startColorIndex: dto.startColorIndex,
    });
  }

  @Get(':year')
  @RequirePermission('ribbon_calendar_read')
  get(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.getHandler.execute(cooperativeId, year);
  }

  @Patch(':year')
  @RequirePermission('ribbon_calendar_manage')
  update(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Body() dto: UpdateRibbonCalendarDto,
  ) {
    return this.updateHandler.execute({
      cooperativeId,
      year,
      startColorIndex: dto.startColorIndex,
    });
  }
}
