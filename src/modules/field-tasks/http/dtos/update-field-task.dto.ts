import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldTaskDetailDto } from './create-field-task.dto';

export class UpdateFieldTaskDto {
  @IsOptional()
  @IsUUID()
  subPlotId?: string | null;

  @IsOptional()
  @IsDateString()
  performedAt?: string;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldTaskDetailDto)
  details?: FieldTaskDetailDto[];
}
