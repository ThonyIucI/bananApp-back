import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateSubPlotDto {
  @IsOptional()
  @IsString()
  @Length(2, 200, { message: 'El nombre debe tener entre 2 y 200 caracteres' })
  name?: string;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(9999.9999)
  areaHectares?: number;
}
