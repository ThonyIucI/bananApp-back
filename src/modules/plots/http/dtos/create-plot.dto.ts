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

class CreateSubPlotInlineDto {
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

export class CreatePlotDto {
  @IsString()
  @Length(2, 200, { message: 'El nombre debe tener entre 2 y 200 caracteres' })
  name: string;

  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @IsUUID()
  ownerUserId: string;

  @IsOptional()
  @IsUUID()
  workerUserId?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001, { message: 'El área debe ser mayor a 0' })
  @Max(9999.9999, { message: 'El área no puede exceder 9999.9999 hectáreas' })
  areaHectares: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  cadastralCode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubPlotInlineDto)
  subPlots?: CreateSubPlotInlineDto[];
}
