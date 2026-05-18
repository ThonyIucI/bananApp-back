import { IsBoolean } from 'class-validator';

export class SubmitGaiaFeedbackDto {
  @IsBoolean()
  helpful!: boolean;
}
