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
import { SendGaiaMessageDto } from './dtos/send-gaia-message.dto';
import { GaiaMessageResponseDto } from './dtos/gaia-message-response.dto';
const GAIA_ROUTES = {
  MESSAGES: 'messages',
  MESSAGES_AUDIO: 'messages/audio',
} as const;

@Controller('gaia')
@UseGuards(JwtAuthGuard)
export class GaiaController {
  constructor(private readonly conversationService: GaiaConversationService) {}

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

  /** TODO:ProMax — audio transcription via Gemini audio input */
  @Post(GAIA_ROUTES.MESSAGES_AUDIO)
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  sendAudio(): { message: string } {
    return { message: 'Disponible en plan ProMax' };
  }
}
