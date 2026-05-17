import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GaiaUsage } from './domain/gaia-usage.entity';
import { IGaiaUsageRepository } from './domain/gaia-usage.repository';
import { MikroOrmGaiaUsageRepository } from './infrastructure/repositories/gaia-usage.mikro-orm.repository';
import { ILLM_SERVICE } from './domain/llm/llm.service.interface';
import { GeminiLLMService } from './infrastructure/llm/gemini-llm.service';
import { GaiaQuotaService } from './application/gaia-quota.service';
import { GaiaConversationService } from './application/gaia-conversation.service';
import { GaiaController } from './channels/http/gaia.controller';
import { User } from '../users/domain/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([GaiaUsage, User])],
  providers: [
    { provide: IGaiaUsageRepository, useClass: MikroOrmGaiaUsageRepository },
    { provide: ILLM_SERVICE, useClass: GeminiLLMService },
    GaiaQuotaService,
    GaiaConversationService,
  ],
  controllers: [GaiaController],
})
export class GaiaModule {}
