import { IsString, Length } from 'class-validator';

export class UpdateSectorDto {
  @IsString()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;
}
