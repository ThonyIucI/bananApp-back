import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateSubPlotDto {
  @IsString()
  @Length(2, 200, { message: 'El nombre debe tener entre 2 y 200 caracteres' })
  name: string;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001, { message: 'El área debe ser mayor a 0' })
  @Max(9999.9999)
  areaHectares: number;
}
