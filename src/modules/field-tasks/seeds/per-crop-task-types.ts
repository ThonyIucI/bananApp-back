import { EDetailValueType } from '../domain/task-type-detail-schema.entity';
import { TSeedTaskType } from './seed-types';

/** Task types specific to individual crop types (rice, mango, lemon, maize, chili, cacao, coffee, grape, passion_fruit, onion). */
export const PER_CROP_TASK_TYPES: TSeedTaskType[] = [
  // --- Rice ---
  {
    key: 'rice_dry_cycle',
    label: 'Ciclo de secas (arroz)',
    cropTypeKeys: ['rice'],
    details: [
      {
        detailKey: 'dry_days',
        label: 'Días en seco',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'flood_days',
        label: 'Días inundado',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'water_depth_cm',
        label: 'Lámina de agua (cm)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'seed_pregermination',
    label: 'Pregerminación de semilla',
    cropTypeKeys: ['rice'],
    details: [
      {
        detailKey: 'soak_hours',
        label: 'Horas de remojo',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'inoculant',
        label: 'Inoculante utilizado',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

  // --- Mango ---
  {
    key: 'floral_induction',
    label: 'Inducción floral',
    cropTypeKeys: ['mango'],
    details: [
      {
        detailKey: 'inductor',
        label: 'Inductor utilizado',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'dose',
        label: 'Dosis',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'primordium_pct',
        label: '% de primordios',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },
  {
    key: 'agoste',
    label: 'Agoste (estrés hídrico)',
    cropTypeKeys: ['mango'],
    details: [
      {
        detailKey: 'weeks_stress',
        label: 'Semanas de estrés',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
    ],
  },
  {
    key: 'fruit_bagging',
    label: 'Empapelado',
    cropTypeKeys: ['mango'],
    details: [
      {
        detailKey: 'fruits_bagged',
        label: 'Frutos empapelados',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'paper_type',
        label: 'Tipo de papel / bolsa',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'descole',
    label: 'Descole',
    cropTypeKeys: ['mango'],
    details: [
      {
        detailKey: 'rachis_removed',
        label: 'Raquis eliminados',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
    ],
  },

  // --- Lemon ---
  {
    key: 'grafting',
    label: 'Injerto / patrón',
    cropTypeKeys: ['lemon'],
    details: [
      {
        detailKey: 'rootstock',
        label: 'Portainjerto',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'scion',
        label: 'Variedad injertada',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'biological_release',
    label: 'Liberación de control biológico',
    cropTypeKeys: ['lemon', 'maize'],
    details: [
      {
        detailKey: 'agent',
        label: 'Agente liberado',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'release_points',
        label: 'Puntos de liberación',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'viability_checked',
        label: 'Viabilidad verificada',
        valueType: EDetailValueType.BOOLEAN,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },

  // --- Maize ---
  {
    key: 'hilling',
    label: 'Aporque',
    cropTypeKeys: ['maize'],
    details: [
      {
        detailKey: 'plant_height_cm',
        label: 'Altura de planta al aporcar (cm)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
    ],
  },

  // --- Chili ---
  {
    key: 'ethological_trap',
    label: 'Control etológico (trampas)',
    cropTypeKeys: ['chili'],
    details: [
      {
        detailKey: 'trap_type',
        label: 'Tipo de trampa',
        valueType: EDetailValueType.ENUM,
        isRequired: false,
        options: [
          { key: 'yellow_sticky', label: 'Amarilla pegajosa', sortOrder: 1 },
          { key: 'blue_sticky', label: 'Azul pegajosa', sortOrder: 2 },
          { key: 'pheromone', label: 'Feromona', sortOrder: 3 },
          { key: 'food_bait', label: 'Cebo alimenticio', sortOrder: 4 },
        ],
        sortOrder: 1,
      },
      {
        detailKey: 'target_pest',
        label: 'Plaga objetivo',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'pest_count',
        label: 'Conteo de plagas capturadas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
    ],
  },

  // --- Cacao ---
  {
    key: 'fermentation',
    label: 'Fermentación (beneficio)',
    cropTypeKeys: ['cacao'],
    details: [
      {
        detailKey: 'box_type',
        label: 'Tipo de caja',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'turn_frequency',
        label: 'Frecuencia de volteo (días)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
      {
        detailKey: 'mass_temperature',
        label: 'Temperatura de masa (°C)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 3,
      },
      {
        detailKey: 'total_days',
        label: 'Total de días',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 4,
      },
    ],
  },
  {
    key: 'shade_regulation',
    label: 'Regulación de sombra',
    cropTypeKeys: ['cacao', 'coffee'],
    details: [
      {
        detailKey: 'shade_pct',
        label: '% de sombra resultante',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'species_pruned',
        label: 'Especie de árbol podada',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'monilia_control',
    label: 'Control de moniliasis',
    cropTypeKeys: ['cacao'],
    details: [
      {
        detailKey: 'diseased_pods_removed',
        label: 'Mazorcas enfermas retiradas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'disposal_method',
        label: 'Método de eliminación',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

  // --- Coffee ---
  {
    key: 'stumping',
    label: 'Recepa',
    cropTypeKeys: ['coffee'],
    details: [
      {
        detailKey: 'cut_height_cm',
        label: 'Altura de corte (cm)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'shoots_left',
        label: 'Brotes dejados',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'floating',
    label: 'Boyado',
    cropTypeKeys: ['coffee'],
    details: [
      {
        detailKey: 'floating_volume',
        label: 'Volumen flotante (kg)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'sound_volume',
        label: 'Volumen sano (kg)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'borer_trap',
    label: 'Trampa de broca',
    cropTypeKeys: ['coffee'],
    details: [
      {
        detailKey: 'traps_installed',
        label: 'Trampas instaladas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'attractant',
        label: 'Atrayente utilizado',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

  // --- Grape ---
  {
    key: 'cluster_thinning',
    label: 'Raleo de racimos',
    cropTypeKeys: ['grape'],
    details: [
      {
        detailKey: 'labor_type',
        label: 'Tipo de labor',
        valueType: EDetailValueType.ENUM,
        isRequired: false,
        options: [
          { key: 'tipping', label: 'Despunte', sortOrder: 1 },
          { key: 'thinning', label: 'Raleo', sortOrder: 2 },
        ],
        sortOrder: 1,
      },
    ],
  },

  // --- Passion fruit ---
  {
    key: 'manual_pollination',
    label: 'Polinización manual',
    cropTypeKeys: ['passion_fruit'],
    details: [
      {
        detailKey: 'light_hours_window',
        label: 'Ventana de horas luz',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'flowers_treated',
        label: 'Flores tratadas',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },

  // --- Onion ---
  {
    key: 'seedbed',
    label: 'Almácigo',
    cropTypeKeys: ['onion'],
    details: [
      {
        detailKey: 'area_m2',
        label: 'Área de almácigo (m²)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'seed_quantity',
        label: 'Cantidad de semilla (kg)',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
  {
    key: 'bulb_curing',
    label: 'Curado / secado de bulbo',
    cropTypeKeys: ['onion'],
    details: [
      {
        detailKey: 'method',
        label: 'Método de curado',
        valueType: EDetailValueType.TEXT,
        isRequired: false,
        sortOrder: 1,
      },
      {
        detailKey: 'final_moisture_pct',
        label: '% humedad final',
        valueType: EDetailValueType.NUMERIC,
        isRequired: false,
        sortOrder: 2,
      },
    ],
  },
];
