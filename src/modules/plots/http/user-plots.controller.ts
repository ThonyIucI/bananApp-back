import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { CooperativeScope } from '../../shared/decorators/cooperative-scope.decorator';
import { AssignUserPlotsHandler } from '../commands/assign-user-plots.handler';
import { UnassignUserPlotsHandler } from '../commands/unassign-user-plots.handler';
import { ListUserPlotsHandler } from '../queries/list-user-plots.handler';
import { ListPlotUsersHandler } from '../queries/list-plot-users.handler';
import { AssignUserPlotsDto, UnassignUserPlotsDto } from './dtos/assign-user-plots.dto';
import { IsOptional, IsUUID } from 'class-validator';

class ListUserPlotsQuery {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserPlotsController {
  constructor(
    private readonly assignHandler: AssignUserPlotsHandler,
    private readonly unassignHandler: UnassignUserPlotsHandler,
    private readonly listUserPlotsHandler: ListUserPlotsHandler,
    private readonly listPlotUsersHandler: ListPlotUsersHandler,
  ) {}

  /**
   * Assigns a list of plots to a user (idempotent, validates cooperative membership).
   * Requires cooperativeId in body to scope the permission check.
   */
  @Post('users/:userId/plots')
  @RequirePermission('plot_manage')
  @CooperativeScope('body')
  assign(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignUserPlotsDto,
  ) {
    return this.assignHandler.execute({ userId, plotIds: dto.plotIds, notes: dto.notes });
  }

  /**
   * Soft-unassigns a list of plots from a user.
   * Requires cooperativeId in body to scope the permission check.
   */
  @Delete('users/:userId/plots')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('plot_manage')
  @CooperativeScope('body')
  unassign(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UnassignUserPlotsDto,
  ) {
    return this.unassignHandler.execute({ userId, plotIds: dto.plotIds });
  }

  /**
   * Lists active plot assignments for a user, optionally scoped to a cooperative.
   */
  @Get('users/:userId/plots')
  @RequirePermission('plot_read')
  @CooperativeScope('query')
  listUserPlots(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: ListUserPlotsQuery,
  ) {
    return this.listUserPlotsHandler.execute({
      userId,
      cooperativeId: query.cooperativeId,
    });
  }

  /**
   * Lists users with active access to a specific plot.
   */
  @Get('plots/:plotId/users')
  @RequirePermission('plot_read')
  @CooperativeScope('derive-from-plot')
  listPlotUsers(@Param('plotId', ParseUUIDPipe) plotId: string) {
    return this.listPlotUsersHandler.execute(plotId);
  }
}
