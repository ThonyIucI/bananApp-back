import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class BundlingSummaryDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsUUID()
  plotId?: string;

  /** Filter by multiple plot IDs. Supports repeated query: ?plotIds=a&plotIds=b */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? (value as string[])
      : value
        ? [value as string]
        : undefined,
  )
  @IsArray()
  @IsUUID('all', { each: true })
  plotIds?: string[];

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
