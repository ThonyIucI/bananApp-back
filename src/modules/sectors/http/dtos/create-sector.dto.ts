import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SectorPlotDto {
  @IsString()
  @Length(2, 200, {
    message: 'El nombre de la parcela debe tener entre 2 y 200 caracteres',
  })
  name: string;

  @IsUUID()
  ownerUserId: string;

  @IsOptional()
  @IsUUID()
  workerUserId?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001, { message: 'El área debe ser mayor a 0' })
  @Max(9999.9999)
  areaHectares: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  cadastralCode?: string;
}

export class CreateSectorDto {
  @IsString()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectorPlotDto)
  plots?: SectorPlotDto[];
}
