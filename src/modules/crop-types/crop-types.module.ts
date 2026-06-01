import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CropType } from './domain/crop-type.entity';
import { SeedCropTypesService } from './seed-crop-types.service';
import { ListCropTypesHandler } from './queries/list-crop-types.handler';
import { CropTypesController } from './http/crop-types.controller';

@Module({
  imports: [MikroOrmModule.forFeature([CropType])],
  providers: [SeedCropTypesService, ListCropTypesHandler],
  controllers: [CropTypesController],
  exports: [SeedCropTypesService],
})
export class CropTypesModule {}
