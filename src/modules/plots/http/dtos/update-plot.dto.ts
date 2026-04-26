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
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(9999.9999)
  areaHectares?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  cadastralCode?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubPlotInlineDto)
  subPlots?: UpdateSubPlotInlineDto[];
}
