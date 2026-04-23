import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class MigrationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Running pending migrations...');
    try {
      const migrator = this.orm.migrator;
      const pending = await migrator.getPending();

      if (pending.length === 0) {
        this.logger.log('No pending migrations.');
        return;
      }

      this.logger.log(`Applying ${pending.length} migration(s)...`);
      await migrator.up();
      this.logger.log('Migrations applied successfully.');
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    }
  }
}
