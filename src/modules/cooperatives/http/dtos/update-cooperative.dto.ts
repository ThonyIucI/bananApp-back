import { IsString, Length, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCooperativeDto {
  @IsOptional()
  @IsString()
  @Length(3, 200, { message: 'El nombre debe tener entre 3 y 200 caracteres' })
  name?: string;

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
  @IsBoolean()
  isActive?: boolean;
}
