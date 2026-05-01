import {
  Allow,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** One subplot entry when submitting multiple bundlings in a single request. */
export class SubPlotEntryDto {
  @IsUUID()
  subPlotId: string;

  @IsUUID()
  enfundadorUserId: string;

  @IsInt()
  @Min(1)
  @Max(9999)
  quantity: number;

  @IsUUID()
  localUuid: string;

  @IsOptional()
  @IsUUID()
  ribbonCalendarId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ribbonColorFree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateBundlingDto {
  @IsUUID()
  plotId: string;

  @IsDateString()
  bundledAt: string;

  /** Single-mode: required when subPlotEntries is absent. */
  @IsOptional()
  @IsUUID()
  enfundadorUserId?: string;

  /** Single-mode: required when subPlotEntries is absent. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  quantity?: number;

  /** Single-mode: required when subPlotEntries is absent. */
  @IsOptional()
  @IsUUID()
  localUuid?: string;

  @IsOptional()
  @IsUUID()
  subPlotId?: string;

  @IsOptional()
  @IsUUID()
  ribbonCalendarId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ribbonColorFree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  /** Multi-mode: when present, top-level single fields are ignored for per-entry data. */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubPlotEntryDto)
  subPlotEntries?: SubPlotEntryDto[];

  @Allow()
  cooperativeId?: string;
}
