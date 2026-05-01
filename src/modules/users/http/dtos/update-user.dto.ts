import {
  IsString,
  Length,
  IsOptional,
  IsEmail,
  Matches,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100, {
    message: 'El apellido debe tener entre 2 y 100 caracteres',
  })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no tiene formato válido' })
  @Length(1, 150)
  email?: string;

  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}
