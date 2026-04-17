import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/domain/user.entity';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { LoginHandler } from './commands/login.handler';
import { AuthController } from './http/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets passed per-call in handlers
    MikroOrmModule.forFeature([User]),
  ],
  providers: [JwtStrategy, LoginHandler],
  controllers: [AuthController],
  exports: [JwtStrategy, LoginHandler],
})
export class AuthModule {}
