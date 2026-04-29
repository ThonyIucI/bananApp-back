import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateBundlingDto {
  @IsOptional()
  @IsUUID()
  subPlotId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  quantity?: number;

  @IsOptional()
  @IsUUID()
  ribbonCalendarId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ribbonColorFree?: string | null;

  @IsOptional()
  @IsDateString()
  bundledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
