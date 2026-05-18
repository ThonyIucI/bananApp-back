import { IsString, MaxLength, MinLength } from 'class-validator';

export class GaiaTtsRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string;
}

export class GaiaTtsResponseDto {
  /** Base64-encoded audio data. */
  data!: string;
  /** MIME type of the audio (e.g. `audio/pcm;rate=24000` or `audio/wav`). */
  mimeType!: string;
}
