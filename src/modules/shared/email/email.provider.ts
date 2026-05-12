import { Injectable, Logger } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Driver de email — ÚNICO archivo que importa la librería de envío.
 * Para cambiar de proveedor (Resend → Gmail → Postmark):
 *   1. Actualiza esta clase internamente.
 *   2. Ajusta EmailModule para inyectar el nuevo proveedor.
 *   3. Sin tocar EmailAdapter ni ningunos de los handlers.
 */
@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  constructor(private readonly resend: ResendService) {}

  async send(options: SendEmailOptions): Promise<void> {
    const from =
      process.env.RESEND_FROM_EMAIL ?? 'CultivApp <noreply@cultivapp.com>';

    const { error } = await this.resend.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      this.logger.error(
        `Email delivery failed to ${options.to}: ${JSON.stringify(error)}`,
      );
      throw new Error(`Email delivery failed: ${(error as Error).message}`);
    }
  }
}
