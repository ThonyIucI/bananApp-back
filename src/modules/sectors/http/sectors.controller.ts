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
import { CreateSectorHandler } from '../commands/create-sector.handler';
import { UpdateSectorHandler } from '../commands/update-sector.handler';
import { DeleteSectorHandler } from '../commands/delete-sector.handler';
import { ListSectorsHandler } from '../queries/list-sectors.handler';
import { FindSectorByIdHandler } from '../queries/find-sector-by-id.handler';
import { CreateSectorDto } from './dtos/create-sector.dto';
import { UpdateSectorDto } from './dtos/update-sector.dto';

class ListSectorsQuery {
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

/** Routes scoped under a cooperative: GET/POST /cooperatives/:cooperativeId/sectors */
@Controller('cooperatives/:cooperativeId/sectors')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SectorsController {
  constructor(
    private readonly createHandler: CreateSectorHandler,
    private readonly listHandler: ListSectorsHandler,
  ) {}

  @Post()
  @RequirePermission('sector_manage')
  create(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
    @Body() dto: CreateSectorDto,
  ) {
    return this.createHandler.execute({
      cooperativeId,
      name: dto.name,
      plots: dto.plots,
    });
  }

  @Get()
  @RequirePermission('sector_read')
  findAll(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
    @Query() query: ListSectorsQuery,
  ) {
    return this.listHandler.execute({ cooperativeId, plotIds: query.plotIds });
  }
}

/** Routes scoped by sector id: GET/PATCH/DELETE /sectors/:id */
@Controller('sectors')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SectorsByIdController {
  constructor(
    private readonly findByIdHandler: FindSectorByIdHandler,
    private readonly updateHandler: UpdateSectorHandler,
    private readonly deleteHandler: DeleteSectorHandler,
  ) {}

  @Get(':id')
  @RequirePermission('sector_read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findByIdHandler.execute(id);
  }

  @Patch(':id')
  @RequirePermission('sector_manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSectorDto) {
    return this.updateHandler.execute({ id, name: dto.name });
  }

  @Delete(':id')
  @RequirePermission('sector_manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteHandler.execute(id);
  }
}
