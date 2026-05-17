import { Module } from '@nestjs/common';
import { ResendModule } from 'nestjs-resend';
import { ConsoleEmailAdapter } from './console-email.adapter';
import { EmailAdapter } from './email.adapter';
import { EmailProvider } from './email.provider';
import { EMAIL_SERVICE_TOKEN } from './email.service.interface';

const useRealEmail = !!process.env.RESEND_API_KEY;

@Module({
  imports: [
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY ?? '',
    }),
  ],
  providers: [
    EmailProvider,
    EmailAdapter,
    ConsoleEmailAdapter,
    {
      provide: EMAIL_SERVICE_TOKEN,
      inject: [EmailAdapter, ConsoleEmailAdapter],
      useFactory: (real: EmailAdapter, dev: ConsoleEmailAdapter) =>
        useRealEmail ? real : dev,
    },
  ],
  exports: [EMAIL_SERVICE_TOKEN],
})
export class EmailModule {}
