export interface IEmailService {
  sendEmailVerificationCode(
    to: string,
    firstName: string,
    code: string,
  ): Promise<void>;
}

export const EMAIL_SERVICE_TOKEN = 'IEmailService';
