import { EDetailValueType } from '../entities/task-type-detail-schema.entity';

export type TSeedOption = {
  key: string;
  label: string;
  sortOrder: number;
};

export type TSeedDetail = {
  detailKey: string;
  label: string;
  valueType: EDetailValueType;
  isRequired: boolean;
  options?: TSeedOption[];
  /**
   * Widget hint for the frontend. e.g. `widget: 'ribbon_color'`, `widget: 'time'`,
   * `widget: 'input_select'`.
   */
  validationRules?: Record<string, unknown>;
  sortOrder: number;
};

export type TSeedTaskType = {
  key: string;
  label: string;
  /** `['*']` = all crop types */
  cropTypeKeys: string[];
  details: TSeedDetail[];
};
