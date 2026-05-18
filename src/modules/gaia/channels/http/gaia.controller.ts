import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/infrastructure/jwt.strategy';
import { GaiaConversationService } from '../../application/gaia-conversation.service';
import { GeminiTtsService } from '../../infrastructure/llm/gemini-tts.service';
import { SendGaiaMessageDto } from './dtos/send-gaia-message.dto';
import { GaiaMessageResponseDto } from './dtos/gaia-message-response.dto';
import { GaiaTtsRequestDto, GaiaTtsResponseDto } from './dtos/gaia-tts.dto';

const GAIA_ROUTES = {
  MESSAGES: 'messages',
  MESSAGES_AUDIO: 'messages/audio',
  TTS: 'tts',
} as const;

@Controller('gaia')
@UseGuards(JwtAuthGuard)
export class GaiaController {
  constructor(
    private readonly conversationService: GaiaConversationService,
    private readonly geminiTtsService: GeminiTtsService,
  ) {}

  @Post(GAIA_ROUTES.MESSAGES)
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() dto: SendGaiaMessageDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<GaiaMessageResponseDto> {
    return this.conversationService.handleMessage({
      userId: user.sub,
      text: dto.text,
      history: dto.history ?? [],
    });
  }

  /** Synthesizes a text segment to audio using Gemini TTS. Requires Pro plan or higher. */
  @Post(GAIA_ROUTES.TTS)
  @HttpCode(HttpStatus.OK)
  async synthesizeTts(
    @Body() dto: GaiaTtsRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<GaiaTtsResponseDto> {
    return this.geminiTtsService.synthesize(dto.text, user.sub);
  }

  /** TODO:ProMax — audio transcription via Gemini audio input */
  @Post(GAIA_ROUTES.MESSAGES_AUDIO)
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  sendAudio(): { message: string } {
    return { message: 'Disponible en plan ProMax' };
  }
}
