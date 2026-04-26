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
import { CreateCooperativeHandler } from '../commands/create-cooperative.handler';
import { UpdateCooperativeHandler } from '../commands/update-cooperative.handler';
import { DeleteCooperativeHandler } from '../commands/delete-cooperative.handler';
import { ListCooperativesHandler } from '../queries/list-cooperatives.handler';
import { FindCooperativeByIdHandler } from '../queries/find-cooperative-by-id.handler';
import { CreateCooperativeDto } from './dtos/create-cooperative.dto';
import { UpdateCooperativeDto } from './dtos/update-cooperative.dto';
import { ListCooperativesDto } from './dtos/list-cooperatives.dto';

@Controller('cooperatives')
@UseGuards(JwtAuthGuard)
export class CooperativesController {
  constructor(
    private readonly createHandler: CreateCooperativeHandler,
    private readonly updateHandler: UpdateCooperativeHandler,
    private readonly deleteHandler: DeleteCooperativeHandler,
    private readonly listHandler: ListCooperativesHandler,
    private readonly findByIdHandler: FindCooperativeByIdHandler,
  ) {}

  @Post()
  @UseGuards(SuperadminGuard)
  create(@Body() dto: CreateCooperativeDto) {
    return this.createHandler.execute(dto);
  }

  @Patch(':id')
  @UseGuards(SuperadminGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCooperativeDto,
  ) {
    return this.updateHandler.execute({ id, ...dto });
  }

  @Delete(':id')
  @UseGuards(SuperadminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }

  @Get()
  findAll(@Query() query: ListCooperativesDto) {
    return this.listHandler.execute(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findByIdHandler.execute(id);
  }
}
