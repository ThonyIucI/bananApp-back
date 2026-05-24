import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, type IAuthModuleOptions } from '@nestjs/passport';
import type { Request } from 'express';

/**
 * Google OAuth guard that forwards `login_hint` and `prompt` query params
 * to Passport, enabling "Continuar como [usuario]" silent login when the
 * frontend passes the hint of the previously authenticated account.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const req = context.switchToHttp().getRequest<Request>();
    const options: IAuthModuleOptions & {
      loginHint?: string;
      prompt?: string;
    } = {};

    const loginHint = req.query?.login_hint;
    if (typeof loginHint === 'string' && loginHint.length > 0) {
      options.loginHint = loginHint;
    }

    const prompt = req.query?.prompt;
    if (typeof prompt === 'string' && prompt.length > 0) {
      options.prompt = prompt;
    }

    return options;
  }
}
