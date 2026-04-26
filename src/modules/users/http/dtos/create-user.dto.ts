import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100)
  lastName: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  password: string;

  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni?: string;

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}
