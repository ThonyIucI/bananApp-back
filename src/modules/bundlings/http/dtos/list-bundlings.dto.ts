import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListBundlingsDto {
  @IsOptional()
  @IsUUID()
  plotId?: string;

  /** Filter by multiple plot IDs. Supports repeated query: ?plotIds=a&plotIds=b */
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsUUID('all', { each: true })
  plotIds?: string[];

  @IsOptional()
  @IsUUID()
  enfundadorUserId?: string;

  @IsOptional()
  @IsUUID()
  subPlotId?: string;

  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

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
