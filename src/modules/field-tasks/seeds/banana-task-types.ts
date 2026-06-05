import { EDetailValueType } from '../domain/task-type-detail-schema.entity';
import { TSeedTaskType } from './seed-types';

/** Task types specific to banana and other perennial crops (labores culturales + calidad preventiva + resiembra). */
export const BANANA_TASK_TYPES: TSeedTaskType[] = [
  {
    key: 'desuckering',
    label: 'Deshije',
    cropTypeKeys: ['banana'],
    details: [
      {
        detailKey: 'plants_attended',
        label: 'Plantas atendidas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'suckers_left',
        label: 'Hijos dejados',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

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
        // Keys must match RIBBON_COLORS in the frontend (ribbon-colors.ts)
        options: [
          { key: 'red', label: 'Rojo', sortOrder: 1 },
          { key: 'brown', label: 'Marrón', sortOrder: 2 },
          { key: 'black', label: 'Negro', sortOrder: 3 },
          { key: 'green', label: 'Verde', sortOrder: 4 },
          { key: 'blue', label: 'Azul', sortOrder: 5 },
          { key: 'white', label: 'Blanco', sortOrder: 6 },
          { key: 'yellow', label: 'Amarillo', sortOrder: 7 },
          { key: 'lilac', label: 'Lila', sortOrder: 8 },
          { key: 'orange', label: 'Naranja', sortOrder: 9 },
        ],
        validationRules: { widget: 'ribbon_color' },
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
    key: 'neck_protector',
    label: 'Cuello de monje',
    cropTypeKeys: ['banana'],
    details: [
      {
        detailKey: 'quantity',
        label: 'Cuellos colocados',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'bunches_attended',
        label: 'Racimos atendidos',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

  {
    key: 'replanting',
    label: 'Resiembra',
    cropTypeKeys: ['banana'],
    details: [
      {
        detailKey: 'plants_replanted',
        label: 'N° plantas resembradas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: true,
        sortOrder: 1,
      },
      {
        detailKey: 'sucker_treatment',
        label: 'Tratamiento de hijuelo / origen',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
];
