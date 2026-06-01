import {
  Allow,
  IsArray,
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

  /** Raw value — the handler validates and encodes it according to the detail schema's valueType. */
  @Allow()
  value: string | number | boolean | null;
}

export class CreateFieldTaskDto {
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
  @IsNumber()
  @Min(0)
  laborDays?: number | null;

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
