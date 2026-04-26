import {
  IsString,
  Length,
  Matches,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
} from 'class-validator';

export class CreateCooperativeDto {
  @IsString({ message: 'El nombre es requerido' })
  @Length(3, 200, { message: 'El nombre debe tener entre 3 y 200 caracteres' })
  name: string;

  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe tener exactamente 11 dígitos numéricos',
  })
  ruc: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  district?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsString({ each: true })
  @Length(2, 100, { each: true })
  sectors?: string[];
}
