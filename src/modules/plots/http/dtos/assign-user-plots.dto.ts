import { IsArray, ArrayNotEmpty, IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignUserPlotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  plotIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class UnassignUserPlotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  plotIds: string[];
}
