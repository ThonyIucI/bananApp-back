import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FieldTaskDetailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  detailKey: string;

  @IsOptional()
  @IsString()
  valueText?: string | null;

  @IsOptional()
  @IsNumber()
  valueNumeric?: number | null;

  @IsOptional()
  @IsDateString()
  valueDate?: string | null;

  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean | null;
}

export class CreateFieldTaskDto {
  @IsUUID()
  plotId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  taskTypeKey: string;

  @IsDateString()
  performedAt: string;

  @IsUUID()
  performedByUserId: string;

  @IsOptional()
  @IsUUID()
  subPlotId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  areaCoveredHa?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  localUuid?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldTaskDetailDto)
  details: FieldTaskDetailDto[];
}
