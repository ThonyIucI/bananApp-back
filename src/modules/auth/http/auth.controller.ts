import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { LoginHandler } from '../queries/login.handler';
import { GetMeHandler } from '../queries/get-me.handler';
import { GetProfileHandler } from '../queries/get-profile.handler';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../infrastructure/jwt.strategy';

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
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly getMeHandler: GetMeHandler,
    private readonly getProfileHandler: GetProfileHandler,
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

  @Get(CONTROLLER_ROUTES.ME)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.getMeHandler.execute(user.sub);
  }

  @Get(CONTROLLER_ROUTES.PROFILE)
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: JwtPayload) {
    return this.getProfileHandler.execute(user.sub);
  }
}
