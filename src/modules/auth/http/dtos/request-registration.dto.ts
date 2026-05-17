import { IsEmail, MaxLength } from 'class-validator';

export class RequestRegistrationDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @MaxLength(150)
  email: string;
}
