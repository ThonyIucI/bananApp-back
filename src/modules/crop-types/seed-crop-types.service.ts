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
    key: 'mango',
    label: 'Mango',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'lemon',
    label: 'Limón',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'grape',
    label: 'Uva',
    lifecycleType: ELifecycleType.SEASONAL_PERENNIAL,
  },
  {
    key: 'passion_fruit',
    label: 'Maracuyá',
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
    key: 'chili',
    label: 'Ají',
    lifecycleType: ELifecycleType.DETERMINATE_ANNUAL,
  },
  {
    key: 'onion',
    label: 'Cebolla',
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

    await this.backfillPlotsToBanana();
  }

  /**
   * Asigna `banana` como cultivo por defecto a las parcelas legacy que aún no
   * tienen cultivo. Idempotente: no afecta a parcelas que ya tienen `crop_type_id`.
   */
  private async backfillPlotsToBanana(): Promise<void> {
    const em = this.em.fork();
    const banana = await em.findOne(CropType, { key: 'banana' });
    if (!banana) return;

    await em
      .getConnection()
      .execute(
        `UPDATE "plots" SET "crop_type_id" = ? WHERE "crop_type_id" IS NULL AND "deleted_at" IS NULL`,
        [banana.id],
      );
    this.logger.log('Backfill ejecutado: plots sin crop_type ahora son banano');
  }
}
