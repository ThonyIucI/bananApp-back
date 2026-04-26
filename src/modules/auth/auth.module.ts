import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/domain/user.entity';
import { UserCooperative } from '../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../cooperatives/domain/user-cooperative-role.entity';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { LoginHandler } from './queries/login.handler';
import { GetMeHandler } from './queries/get-me.handler';
import { GetProfileHandler } from './queries/get-profile.handler';
import { AuthController } from './http/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MikroOrmModule.forFeature([User, UserCooperative, UserCooperativeRole]),
  ],
  providers: [JwtStrategy, LoginHandler, GetMeHandler, GetProfileHandler],
  controllers: [AuthController],
  exports: [JwtStrategy, LoginHandler],
})
export class AuthModule {}
