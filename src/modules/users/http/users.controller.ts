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
import { SuperadminGuard } from '../../shared/guards/superadmin.guard';
import { CreateUserHandler } from '../commands/create-user.handler';
import { UpdateUserHandler } from '../commands/update-user.handler';
import { DeleteUserHandler } from '../commands/delete-user.handler';
import { ListUsersHandler } from '../queries/list-users.handler';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ListUsersDto } from './dtos/list-users.dto';
import { AssignUserCooperativeHandler } from '../../cooperatives/commands/assign-user-cooperative.handler';
import { AssignUserCooperativeDto } from './dtos/assign-user-cooperative.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, SuperadminGuard)
export class UsersController {
  constructor(
    private readonly createHandler: CreateUserHandler,
    private readonly updateHandler: UpdateUserHandler,
    private readonly deleteHandler: DeleteUserHandler,
    private readonly listHandler: ListUsersHandler,
    private readonly assignHandler: AssignUserCooperativeHandler,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createHandler.execute(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.updateHandler.execute({ id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }

  @Get()
  findAll(@Query() query: ListUsersDto) {
    return this.listHandler.execute(query);
  }

  @Post(':id/cooperatives')
  assignToCooperative(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: AssignUserCooperativeDto,
  ) {
    return this.assignHandler.execute({ userId, ...dto });
  }
}
