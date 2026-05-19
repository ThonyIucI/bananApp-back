import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SeedCropTypesService } from '../modules/crop-types/seed-crop-types.service';
import { SeedTaskTypesService } from '../modules/field-tasks/seed-task-types.service';

/** Runs reference-data seeds in dependency order after migrations complete. */
@Injectable()
export class SeedReferenceDataService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedReferenceDataService.name);

  constructor(
    private readonly seedCropTypes: SeedCropTypesService,
    private readonly seedTaskTypes: SeedTaskTypesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Seeding reference data...');
    await this.seedCropTypes.run();
    await this.seedTaskTypes.run();
    this.logger.log('Reference data seeded.');
  }
}
