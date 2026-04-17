import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class MigrationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Running schema update...');
    // updateSchema is safe for dev: creates tables that don't exist, adds missing columns
    // For production use migrations instead
    // orm.schema returns ISchemaGenerator (base interface). The concrete PostgreSQL
    // implementation exposes update() — cast is safe, method verified at runtime.
    const generator = this.orm.schema as unknown as { update: () => Promise<void> };
    await generator.update();
    this.logger.log('Schema up to date.');
  }
}
