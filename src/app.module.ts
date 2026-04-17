import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Controller, Get } from '@nestjs/common';
import mikroOrmConfig from './database/mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { MigrationRunnerService } from './database/migration-runner.service';
import { SeedSuperadminService } from './database/seed-superadmin.service';

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MikroOrmModule.forRoot(mikroOrmConfig as any),
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [MigrationRunnerService, SeedSuperadminService],
})
export class AppModule {}
