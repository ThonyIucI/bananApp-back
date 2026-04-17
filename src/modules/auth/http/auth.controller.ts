import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { LoginHandler } from '../commands/login.handler';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../infrastructure/jwt.strategy';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth/refresh',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

@Controller('auth')
export class AuthController {
  constructor(private readonly loginHandler: LoginHandler) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginHandler.execute({
      email: dto.email,
      password: dto.password,
    });

    // Refresh token goes in httpOnly cookie — never exposed to JS
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
