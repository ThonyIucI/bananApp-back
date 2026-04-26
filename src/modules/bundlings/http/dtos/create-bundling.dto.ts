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

export class CreateBundlingDto {
  @IsUUID()
  plotId: string;

  @IsUUID()
  enfundadorUserId: string;

  @IsInt()
  @Min(1)
  @Max(9999)
  quantity: number;

  @IsDateString()
  bundledAt: string;

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
