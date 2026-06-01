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
import { Type } from 'class-transformer';

class UpdateSubPlotInlineDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @Length(2, 200)
  name: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(9999.9999)
  areaHectares: number;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;
}

export class UpdatePlotDto {
  @IsOptional()
  @IsString()
  @Length(2, 200, { message: 'El nombre debe tener entre 2 y 200 caracteres' })
  name?: string;

  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @IsUUID()
  workerUserId?: string | null;

  @IsOptional()
  @IsUUID()
  cropTypeId?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(9999.9999)
  areaHectares?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  cadastralCode?: string | null;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 6 },
    { message: 'La latitud debe ser un número válido' },
  )
  @Min(-90, { message: 'La latitud debe ser mayor o igual a -90' })
  @Max(90, { message: 'La latitud debe ser menor o igual a 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 6 },
    { message: 'La longitud debe ser un número válido' },
  )
  @Min(-180, { message: 'La longitud debe ser mayor o igual a -180' })
  @Max(180, { message: 'La longitud debe ser menor o igual a 180' })
  longitude?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La altitud debe ser un número válido' },
  )
  @Min(-500, { message: 'La altitud debe ser mayor o igual a -500' })
  @Max(9000, { message: 'La altitud debe ser menor o igual a 9000' })
  altitude?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubPlotInlineDto)
  subPlots?: UpdateSubPlotInlineDto[];
}
