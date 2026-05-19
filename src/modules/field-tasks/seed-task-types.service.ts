import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CropType } from '../crop-types/domain/crop-type.entity';
import { TaskType } from './domain/task-type.entity';
import {
  TaskTypeDetailSchema,
  EDetailValueType,
} from './domain/task-type-detail-schema.entity';

type TSeedDetail = {
  detailKey: string;
  label: string;
  valueType: EDetailValueType;
  isRequired: boolean;
  enumOptions?: string[];
  sortOrder: number;
};

type TSeedTaskType = {
  key: string;
  label: string;
  cropTypeKeys: string[];
  details: TSeedDetail[];
};

const ALL = '*';

const TASK_TYPES_SEED: TSeedTaskType[] = [
  {
    key: 'bundling',
    label: 'Enfunde',
    cropTypeKeys: ['banana'],
    details: [
      {
        detailKey: 'ribbon_color',
        label: 'Color de cinta',
        valueType: EDetailValueType.ENUM,
        isRequired: true,
        enumOptions: [
          'azul',
          'rojo',
          'verde',
          'amarillo',
          'blanco',
          'negro',
          'morado',
          'naranja',
        ],
        sortOrder: 1,
      },
      {
        detailKey: 'quantity',
        label: 'Cantidad de fundas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 2,
      },
      {
        detailKey: 'bundled_week',
        label: 'Semana de enfunde',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'harvest',
    label: 'Cosecha',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'harvest_weight_kg',
        label: 'Peso cosechado (kg)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'quality_grade',
        label: 'Grado de calidad',
        valueType: EDetailValueType.ENUM,
        isRequired: false,
        enumOptions: ['A', 'B', 'C', 'descarte'],
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'pruning',
    label: 'Poda',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'pruning_type',
        label: 'Tipo de poda',
        valueType: EDetailValueType.ENUM,
        isRequired: true,
        enumOptions: ['formation', 'sanitation', 'thinning'],
        sortOrder: 1,
      },
      {
        detailKey: 'area_pruned_ha',
        label: 'Área podada (ha)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'irrigation',
    label: 'Riego',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'volume_liters',
        label: 'Volumen de agua (L)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'irrigation_method',
        label: 'Método de riego',
        valueType: EDetailValueType.ENUM,
        isRequired: true,
        enumOptions: ['drip', 'sprinkler', 'flood', 'manual'],
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'fertilization_organic',
    label: 'Abonamiento orgánico',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'input_name',
        label: 'Nombre del insumo',
        valueType: EDetailValueType.TEXT,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'dose_kg_per_ha',
        label: 'Dosis (kg/ha)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 2,
      },
      {
        detailKey: 'application_method',
        label: 'Método de aplicación',
        valueType: EDetailValueType.ENUM,
        isRequired: false,
        enumOptions: ['foliar', 'soil', 'drip'],
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'pest_control_biological',
    label: 'Control biológico de plagas',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'pest_target',
        label: 'Plaga objetivo',
        valueType: EDetailValueType.TEXT,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'biological_agent',
        label: 'Agente biológico',
        valueType: EDetailValueType.TEXT,
        isRequired: true,
        sortOrder: 2,
      },
      {
        detailKey: 'dose',
        label: 'Dosis',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
      {
        detailKey: 'unit',
        label: 'Unidad',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 4,
      },
    ],
  },
  {
    key: 'measurement',
    label: 'Medición',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'measurement_type',
        label: 'Tipo de medición',
        valueType: EDetailValueType.ENUM,
        isRequired: true,
        enumOptions: ['brix', 'ph', 'moisture', 'temperature', 'ec', 'other'],
        sortOrder: 1,
      },
      {
        detailKey: 'value',
        label: 'Valor',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 2,
      },
      {
        detailKey: 'unit',
        label: 'Unidad',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'planting',
    label: 'Siembra / Plantación',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'variety',
        label: 'Variedad',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'plants_per_ha',
        label: 'Plantas por hectárea',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'seed_source',
        label: 'Procedencia de semilla',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'weeding',
    label: 'Deshierbo',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'method',
        label: 'Método',
        valueType: EDetailValueType.ENUM,
        isRequired: true,
        enumOptions: ['manual', 'mechanical', 'mulch'],
        sortOrder: 1,
      },
      {
        detailKey: 'area_ha',
        label: 'Área trabajada (ha)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'mulching',
    label: 'Mulching',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'material',
        label: 'Material utilizado',
        valueType: EDetailValueType.TEXT,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'thickness_cm',
        label: 'Grosor (cm)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'cover_crop_seeding',
    label: 'Siembra de cobertura',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'species',
        label: 'Especie de cobertura',
        valueType: EDetailValueType.TEXT,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'area_ha',
        label: 'Área sembrada (ha)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'soil_analysis',
    label: 'Análisis de suelo',
    cropTypeKeys: [ALL],
    details: [
      {
        detailKey: 'lab_name',
        label: 'Nombre del laboratorio',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'ph',
        label: 'pH',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'organic_matter_pct',
        label: 'Materia orgánica (%)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
];

@Injectable()
export class SeedTaskTypesService {
  private readonly logger = new Logger(SeedTaskTypesService.name);

  constructor(private readonly em: EntityManager) {}

  /** Idempotent — inserts only task types / schemas that don't exist yet. */
  async run(): Promise<void> {
    const em = this.em.fork();
    const allCropTypes = await em.find(CropType, {});
    const cropTypeMap = new Map(allCropTypes.map((ct) => [ct.key, ct]));

    for (const seed of TASK_TYPES_SEED) {
      let taskType = await em.findOne(TaskType, { key: seed.key });

      if (!taskType) {
        taskType = TaskType.make({ key: seed.key, label: seed.label });
        em.persist(taskType);
        await em.flush();
        this.logger.log(`Seeded task type: ${seed.key}`);
      }

      const targetCropTypes =
        seed.cropTypeKeys[0] === ALL
          ? allCropTypes
          : (seed.cropTypeKeys
              .map((k) => cropTypeMap.get(k))
              .filter(Boolean) as CropType[]);

      await em.populate(taskType, ['cropTypes']);
      for (const ct of targetCropTypes) {
        if (!taskType.cropTypes?.contains(ct)) {
          taskType.cropTypes?.add(ct);
        }
      }

      for (const detail of seed.details) {
        const exists = await em.findOne(TaskTypeDetailSchema, {
          taskType,
          detailKey: detail.detailKey,
        });
        if (exists) continue;

        const schema = TaskTypeDetailSchema.make({
          taskType,
          detailKey: detail.detailKey,
          label: detail.label,
          valueType: detail.valueType,
          isRequired: detail.isRequired,
          enumOptions: detail.enumOptions ?? null,
          sortOrder: detail.sortOrder,
        });
        em.persist(schema);
      }

      await em.flush();
    }
  }
}
