import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ValidateRegistrationCodeDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}
