import { Injectable } from '@nestjs/common';
import { EmailProvider } from './email.provider';
import type { IEmailService } from './email.service.interface';

/**
 * Adapter de producción.
 * Solo conoce IEmailService + EmailProvider — nunca importa Resend directamente.
 */
@Injectable()
export class EmailAdapter implements IEmailService {
  constructor(private readonly provider: EmailProvider) {}

  async sendEmailVerificationCode(
    to: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    await this.provider.send({
      to,
      subject: 'Tu código de verificación — CultivApp',
      html: buildVerificationHtml(firstName, code),
    });
  }
}

function buildVerificationHtml(firstName: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body style="font-family:system-ui,sans-serif;background:#f0fdf4;padding:32px 16px;margin:0;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px 32px;border:1px solid #dcfce7;">
        <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">
          Hola, ${firstName} 👋
        </h1>
        <p style="color:#475569;font-size:15px;margin:0 0 24px;">
          Usa este código para verificar tu correo en CultivApp:
        </p>

        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
          <span style="font-size:30px;font-weight:800;letter-spacing:12px;color:#166534;">
            ${code}
          </span>
        </div>

        <p style="color:#64748b;font-size:13px;margin:0 0 6px;">⏱ Expira en 15 minutos.</p>
        <p style="color:#64748b;font-size:13px;margin:0;">
          Si no solicitaste esto, puedes ignorar este correo.
        </p>
      </div>
    </body>
    </html>
  `.trim();
}
