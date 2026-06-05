import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PlotsModule } from '../plots/plots.module';
import { GaiaUsage } from './domain/gaia-usage.entity';
import { GaiaQuery } from './domain/gaia-query.entity';
import { IGaiaUsageRepository } from './domain/gaia-usage.repository';
import { MikroOrmGaiaUsageRepository } from './infrastructure/repositories/gaia-usage.mikro-orm.repository';
import { ILLM_SERVICE } from './domain/llm/llm.service.interface';
import { GeminiLLMService } from './infrastructure/llm/gemini-llm.service';
import { GeminiTtsService } from './infrastructure/llm/gemini-tts.service';
import { GaiaQuotaService } from './application/gaia-quota.service';
import { GaiaConversationService } from './application/gaia-conversation.service';
import { GaiaQueryAnalyticsListener } from './application/gaia-query-analytics.listener';
import { GaiaFeedbackService } from './application/gaia-feedback.service';
import { GaiaController } from './channels/http/gaia.controller';
import { GaiaLiveGateway } from './channels/ws/gaia-live.gateway';
import { User } from '../users/domain/user.entity';
import { ListMyPlotsTool } from './tools/read/list-my-plots.tool';
import { GetFieldTasksTool } from './tools/read/get-field-tasks.tool';
import { RegisterFieldTaskTool } from './tools/write/register-field-task.tool';
import { WsJwtGuard } from '../shared/guards/ws-jwt.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([GaiaUsage, GaiaQuery, User]),
    JwtModule.register({}),
    PlotsModule,
  ],
  providers: [
    { provide: IGaiaUsageRepository, useClass: MikroOrmGaiaUsageRepository },
    { provide: ILLM_SERVICE, useClass: GeminiLLMService },
    GaiaQuotaService,
    GaiaConversationService,
    GaiaQueryAnalyticsListener,
    GaiaFeedbackService,
    GeminiTtsService,
    // Tools
    ListMyPlotsTool,
    GetFieldTasksTool,
    RegisterFieldTaskTool,
    // WebSocket
    WsJwtGuard,
    GaiaLiveGateway,
  ],
  controllers: [GaiaController],
})
export class GaiaModule {}
