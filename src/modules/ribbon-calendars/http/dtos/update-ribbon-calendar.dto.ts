import { IsInt, Max, Min } from 'class-validator';

export class UpdateRibbonCalendarDto {
  @IsInt()
  @Min(0)
  @Max(7)
  startColorIndex: number;
}
