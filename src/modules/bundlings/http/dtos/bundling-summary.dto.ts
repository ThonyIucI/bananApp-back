import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class BundlingSummaryDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsUUID()
  plotId?: string;

  @IsOptional()
  @IsUUID()
  enfundadorUserId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
