import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsMonthlyDto {
  @IsUUID()
  cooperativeId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number;

  @IsOptional()
  @IsUUID()
  scopedUserId?: string;
}

export class StatsWeeklyDto {
  @IsUUID()
  cooperativeId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  weeks?: number;

  @IsOptional()
  @IsUUID()
  enfundadorUserId?: string;

  @IsOptional()
  @IsUUID()
  scopedUserId?: string;
}

export class StatsOverviewDto {
  @IsUUID()
  cooperativeId: string;

  @IsOptional()
  @IsUUID()
  scopedUserId?: string;

  @IsOptional()
  @IsUUID()
  enfundadorUserId?: string;
}
