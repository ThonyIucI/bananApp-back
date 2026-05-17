import { Injectable } from '@nestjs/common';
import type { IEmailService } from './email.service.interface';

@Injectable()
export class ConsoleEmailAdapter implements IEmailService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async sendEmailVerificationCode(
    to: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    console.log(
      `[EMAIL-DEV] to: ${to} | subject: Código de verificación CultivApp | firstName: ${firstName} | code: ${code}`,
    );
  }
}
