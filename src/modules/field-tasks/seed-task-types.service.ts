import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CropType } from '../crop-types/domain/crop-type.entity';
import { TaskType } from './entities/task-type.entity';
import { TaskTypeDetailSchema } from './entities/task-type-detail-schema.entity';
import { TaskTypeDetailOption } from './entities/task-type-detail-option.entity';
import { TSeedTaskType } from './seeds/seed-types';
import { TRANSVERSAL_TASK_TYPES } from './seeds/transversal-task-types';
import { BANANA_TASK_TYPES } from './seeds/banana-task-types';
import { PER_CROP_TASK_TYPES } from './seeds/per-crop-task-types';

const ALL = '*';

const TASK_TYPES_SEED: TSeedTaskType[] = [
  ...TRANSVERSAL_TASK_TYPES,
  ...BANANA_TASK_TYPES,
  ...PER_CROP_TASK_TYPES,
];

@Injectable()
export class SeedTaskTypesService {
  private readonly logger = new Logger(SeedTaskTypesService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Upsert + reconciliation. For each task type in the seed:
   * - creates or updates `TaskType` (label),
   * - syncs the `crop_type_task_type` pivot (adds new crop types from seed),
   * - upserts `detail_schemas` by `detailKey`,
   * - removes orphan `detail_schemas`,
   * - upserts `TaskTypeDetailOption` rows for ENUM fields,
   * - removes orphan options (respects `isActive` set manually).
   *
   * Edit the seed files and re-bootstrap — no migration needed.
   */
  async run(): Promise<void> {
    const em = this.em.fork();
    const allCropTypes = await em.find(CropType, {});
    const cropTypeMap = new Map(allCropTypes.map((ct) => [ct.key, ct]));

    const POPULATE = [
      'cropTypes',
      'detailSchemas',
      'detailSchemas.detailOptions',
    ] as const;

    for (const seed of TASK_TYPES_SEED) {
      let taskType = await em.findOne(TaskType, { key: seed.key });

      if (!taskType) {
        const created = TaskType.make({ key: seed.key, label: seed.label });
        em.persist(created);
        await em.flush();
        // Re-fetch so MikroORM wires up Collection proxies properly on the new entity
        taskType =
          (await em.findOne(
            TaskType,
            { key: seed.key },
            { populate: POPULATE },
          )) ?? created;
        this.logger.log(`Seeded task type: ${seed.key}`);
      } else {
        if (taskType.label !== seed.label) {
          taskType.label = seed.label;
        }
        await em.populate(taskType, POPULATE);
      }

      const targetCropTypes =
        seed.cropTypeKeys[0] === ALL
          ? allCropTypes
          : (seed.cropTypeKeys
              .map((k) => cropTypeMap.get(k))
              .filter(Boolean) as CropType[]);

      for (const ct of targetCropTypes) {
        if (!taskType.cropTypes?.contains(ct)) {
          taskType.cropTypes?.add(ct);
        }
      }

      const seedKeys = new Set(seed.details.map((d) => d.detailKey));
      const existingByKey = new Map(
        taskType.detailSchemas.getItems().map((s) => [s.detailKey, s] as const),
      );

      for (const detail of seed.details) {
        let schema = existingByKey.get(detail.detailKey);
        if (schema) {
          schema.label = detail.label;
          schema.valueType = detail.valueType;
          schema.isRequired = detail.isRequired;
          schema.validationRules = detail.validationRules ?? null;
          schema.sortOrder = detail.sortOrder;
        } else {
          schema = TaskTypeDetailSchema.make({
            taskType,
            detailKey: detail.detailKey,
            label: detail.label,
            valueType: detail.valueType,
            isRequired: detail.isRequired,
            validationRules: detail.validationRules ?? null,
            sortOrder: detail.sortOrder,
          });
          em.persist(schema);
          await em.flush();
          this.logger.log(
            `Added detail_schema ${seed.key}.${detail.detailKey}`,
          );
        }

        if (detail.options?.length) {
          await this.reconcileOptions(em, schema, detail.options);
        }
      }

      for (const existing of taskType.detailSchemas.getItems()) {
        if (!seedKeys.has(existing.detailKey)) {
          em.remove(existing);
          this.logger.log(
            `Removed orphan detail_schema ${seed.key}.${existing.detailKey}`,
          );
        }
      }

      await em.flush();
    }
  }

  private async reconcileOptions(
    em: EntityManager,
    schema: TaskTypeDetailSchema,
    seedOptions: NonNullable<TSeedTaskType['details'][number]['options']>,
  ): Promise<void> {
    const existingOptions = schema.detailOptions?.isInitialized()
      ? schema.detailOptions.getItems()
      : await em.find(TaskTypeDetailOption, { detailSchema: schema });

    const existingByKey = new Map(existingOptions.map((o) => [o.key, o]));
    const seedKeys = new Set(seedOptions.map((o) => o.key));

    for (const seedOpt of seedOptions) {
      const existing = existingByKey.get(seedOpt.key);
      if (existing) {
        existing.label = seedOpt.label;
        existing.sortOrder = seedOpt.sortOrder;
        // Never touch isActive — it may have been set manually via admin panel
      } else {
        const opt = TaskTypeDetailOption.make({
          detailSchema: schema,
          key: seedOpt.key,
          label: seedOpt.label,
          sortOrder: seedOpt.sortOrder,
        });
        em.persist(opt);
      }
    }

    for (const existing of existingOptions) {
      if (!seedKeys.has(existing.key)) {
        em.remove(existing);
      }
    }
  }
}
