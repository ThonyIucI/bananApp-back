import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Controller, Get } from '@nestjs/common';
import mikroOrmConfig from './database/mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CooperativesModule } from './modules/cooperatives/cooperatives.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BundlingsModule } from './modules/bundlings/bundlings.module';
import { RibbonCalendarsModule } from './modules/ribbon-calendars/ribbon-calendars.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { PlotsModule } from './modules/plots/plots.module';
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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    RolesModule,
    UsersModule,
    CooperativesModule,
    BundlingsModule,
    RibbonCalendarsModule,
    SectorsModule,
    PlotsModule,
  ],
  controllers: [HealthController],
  // TODO: mejorar la configuración de seeders con @mikro-orm/seeder
  providers: [
    MigrationRunnerService,
    SeedSuperadminService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
