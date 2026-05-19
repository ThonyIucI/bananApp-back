import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CropType, ELifecycleType } from './domain/crop-type.entity';

const CROP_TYPES_SEED: Array<{
  key: string;
  label: string;
  lifecycleType: ELifecycleType;
}> = [
  {
    key: 'banana',
    label: 'Banano',
    lifecycleType: ELifecycleType.CONTINUOUS_PERENNIAL,
  },
  {
    key: 'cacao',
    label: 'Cacao',
    lifecycleType: ELifecycleType.CONTINUOUS_PERENNIAL,
  },
  {
    key: 'coffee',
    label: 'Café',
    lifecycleType: ELifecycleType.CONTINUOUS_PERENNIAL,
  },
  {
    key: 'oil_palm',
    label: 'Palma aceitera',
    lifecycleType: ELifecycleType.CONTINUOUS_PERENNIAL,
  },
  {
    key: 'mango',
    label: 'Mango',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'citrus',
    label: 'Cítricos',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'avocado',
    label: 'Palta',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'rice',
    label: 'Arroz',
    lifecycleType: ELifecycleType.DETERMINATE_ANNUAL,
  },
  {
    key: 'maize',
    label: 'Maíz',
    lifecycleType: ELifecycleType.DETERMINATE_ANNUAL,
  },
  {
    key: 'legumes',
    label: 'Legumbres',
    lifecycleType: ELifecycleType.DETERMINATE_ANNUAL,
  },
  {
    key: 'other',
    label: 'Otros',
    lifecycleType: ELifecycleType.DETERMINATE_ANNUAL,
  },
];

@Injectable()
export class SeedCropTypesService {
  private readonly logger = new Logger(SeedCropTypesService.name);

  constructor(private readonly em: EntityManager) {}

  /** Idempotent — inserts only crop types that don't exist yet. */
  async run(): Promise<void> {
    const em = this.em.fork();
    for (const seed of CROP_TYPES_SEED) {
      const exists = await em.findOne(CropType, { key: seed.key });
      if (exists) continue;

      const ct = CropType.make(seed);
      em.persist(ct);
      this.logger.log(`Seeded crop type: ${seed.key}`);
    }
    await em.flush();
  }
}
