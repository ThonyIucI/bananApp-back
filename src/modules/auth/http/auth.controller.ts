import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { RequestRegistrationDto } from './dtos/request-registration.dto';
import { CompleteRegistrationDto } from './dtos/complete-registration.dto';
import { ValidateRegistrationCodeDto } from './dtos/validate-registration-code.dto';
import { LoginHandler } from '../queries/login.handler';
import { GetMeHandler } from '../queries/get-me.handler';
import { GetProfileHandler } from '../queries/get-profile.handler';
import { RegisterHandler } from '../commands/register.handler';
import { VerifyEmailHandler } from '../commands/verify-email.handler';
import { ResendVerificationHandler } from '../commands/resend-verification.handler';
import { RequestRegistrationHandler } from '../commands/request-registration.handler';
import { CompleteRegistrationHandler } from '../commands/complete-registration.handler';
import { ValidateRegistrationCodeHandler } from '../commands/validate-registration-code.handler';
import { GoogleAuthHandler } from '../queries/google-auth.handler';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../infrastructure/jwt.strategy';
import type { GoogleProfile } from '../infrastructure/google.strategy';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth/refresh',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const CONTROLLER_ROUTES = {
  LOGIN: 'login',
  ME: 'me',
  PROFILE: 'profile',
  REGISTER: 'register',
  VERIFY_EMAIL: 'verify-email',
  RESEND_VERIFICATION: 'resend-verification',
  REQUEST_REGISTRATION: 'request-registration',
  COMPLETE_REGISTRATION: 'complete-registration',
  VALIDATE_REGISTRATION_CODE: 'validate-registration-code',
  GOOGLE: 'google',
  GOOGLE_CALLBACK: 'google/callback',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly getMeHandler: GetMeHandler,
    private readonly getProfileHandler: GetProfileHandler,
    private readonly registerHandler: RegisterHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
    private readonly resendVerificationHandler: ResendVerificationHandler,
    private readonly requestRegistrationHandler: RequestRegistrationHandler,
    private readonly completeRegistrationHandler: CompleteRegistrationHandler,
    private readonly validateRegistrationCodeHandler: ValidateRegistrationCodeHandler,
    private readonly googleAuthHandler: GoogleAuthHandler,
  ) {}

  @Post(CONTROLLER_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginHandler.execute({
      email: dto.email,
      password: dto.password,
    });

    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @SkipThrottle()
  @Get(CONTROLLER_ROUTES.ME)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.getMeHandler.execute(user.sub);
  }

  @SkipThrottle()
  @Get(CONTROLLER_ROUTES.PROFILE)
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: JwtPayload) {
    return this.getProfileHandler.execute(user.sub);
  }

  @Post(CONTROLLER_ROUTES.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  register(@Body() dto: RegisterDto) {
    console.log(dto);
    return this.registerHandler.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
    });
  }

  @Post(CONTROLLER_ROUTES.REQUEST_REGISTRATION)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  requestRegistration(@Body() dto: RequestRegistrationDto) {
    return this.requestRegistrationHandler.execute({ email: dto.email });
  }

  @Post(CONTROLLER_ROUTES.COMPLETE_REGISTRATION)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async completeRegistration(
    @Body() dto: CompleteRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.completeRegistrationHandler.execute({
      email: dto.email,
      code: dto.code,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
    });

    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post(CONTROLLER_ROUTES.VALIDATE_REGISTRATION_CODE)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  validateRegistrationCode(@Body() dto: ValidateRegistrationCodeDto) {
    return this.validateRegistrationCodeHandler.execute({
      email: dto.email,
      code: dto.code,
    });
  }

  @Post(CONTROLLER_ROUTES.VERIFY_EMAIL)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailHandler.execute({
      userId: dto.userId,
      code: dto.code,
    });
  }

  @Post(CONTROLLER_ROUTES.RESEND_VERIFICATION)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.resendVerificationHandler.execute({ userId: dto.userId });
  }

  @Get(CONTROLLER_ROUTES.GOOGLE)
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirige a Google — sin implementación necesaria
  }

  @Get(CONTROLLER_ROUTES.GOOGLE_CALLBACK)
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: { user: GoogleProfile },
    @Res() res: Response, // Inyectamos la respuesta de Express
  ) {
    const result = await this.googleAuthHandler.execute(req.user);
    console.log(result);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    return res.redirect(
      `${frontendUrl}/auth/google/success?token=${result.accessToken}`,
    );
  }
}
