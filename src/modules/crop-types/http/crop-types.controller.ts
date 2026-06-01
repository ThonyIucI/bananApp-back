import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ListCropTypesHandler } from '../queries/list-crop-types.handler';

@Controller('crop-types')
@UseGuards(JwtAuthGuard)
export class CropTypesController {
  constructor(private readonly listHandler: ListCropTypesHandler) {}

  @Get()
  list() {
    return this.listHandler.execute();
  }
}
