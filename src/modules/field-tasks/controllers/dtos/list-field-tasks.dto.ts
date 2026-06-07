import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListFieldTasksDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  plotIds?: string[];

  @IsOptional()
  @IsUUID()
  subPlotId?: string;

  @IsOptional()
  @IsString()
  taskTypeKey?: string;

  @IsOptional()
  @IsUUID()
  performedByUserId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
