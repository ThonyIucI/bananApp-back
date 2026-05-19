import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CropType } from './domain/crop-type.entity';
import { SeedCropTypesService } from './seed-crop-types.service';

@Module({
  imports: [MikroOrmModule.forFeature([CropType])],
  providers: [SeedCropTypesService],
  exports: [SeedCropTypesService],
})
export class CropTypesModule {}
