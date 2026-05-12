import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/domain/user.entity';
import { UserCooperative } from '../cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../cooperatives/domain/user-cooperative-role.entity';
import { Role } from '../roles/domain/role.entity';
import { UserRole } from '../roles/domain/user-role.entity';
import { EmailVerificationCode } from './domain/email-verification-code.entity';
import { RegistrationChallenge } from './domain/registration-challenge.entity';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { GoogleStrategy } from './infrastructure/google.strategy';
import { LoginHandler } from './queries/login.handler';
import { GetMeHandler } from './queries/get-me.handler';
import { GetProfileHandler } from './queries/get-profile.handler';
import { GoogleAuthHandler } from './queries/google-auth.handler';
import { RegisterHandler } from './commands/register.handler';
import { VerifyEmailHandler } from './commands/verify-email.handler';
import { ResendVerificationHandler } from './commands/resend-verification.handler';
import { RequestRegistrationHandler } from './commands/request-registration.handler';
import { CompleteRegistrationHandler } from './commands/complete-registration.handler';
import { ValidateRegistrationCodeHandler } from './commands/validate-registration-code.handler';
import { AuthController } from './http/auth.controller';
import { EmailModule } from '../shared/email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    EmailModule,
    MikroOrmModule.forFeature([
      User,
      UserCooperative,
      UserCooperativeRole,
      Role,
      UserRole,
      EmailVerificationCode,
      RegistrationChallenge,
    ]),
  ],
  providers: [
    JwtStrategy,
    GoogleStrategy,
    LoginHandler,
    GetMeHandler,
    GetProfileHandler,
    GoogleAuthHandler,
    RegisterHandler,
    VerifyEmailHandler,
    ResendVerificationHandler,
    RequestRegistrationHandler,
    CompleteRegistrationHandler,
    ValidateRegistrationCodeHandler,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, LoginHandler],
})
export class AuthModule {}
