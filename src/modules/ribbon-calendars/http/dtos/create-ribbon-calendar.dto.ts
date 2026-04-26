import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateRibbonCalendarDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  startColorIndex?: number;
}
