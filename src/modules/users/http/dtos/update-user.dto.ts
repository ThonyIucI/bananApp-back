import {
  IsString,
  Length,
  IsOptional,
  IsEmail,
  Matches,
  IsBoolean,
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

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}
