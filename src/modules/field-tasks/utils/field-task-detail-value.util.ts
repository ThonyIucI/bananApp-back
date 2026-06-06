import { EDetailValueType } from '../entities/task-type-detail-schema.entity';

export type TDetailValue = string | number | boolean | null;

/**
 * Encodes a raw JS value to the string stored in `field_task_details.value`.
 * All types are stored as text; the valueType acts as the codec key.
 */
export const encodeDetailValue = (
  valueType: EDetailValueType,
  raw: TDetailValue,
): string | null => {
  if (raw === null || raw === undefined) return null;

  switch (valueType) {
    case EDetailValueType.TEXT:
      return String(raw);
    case EDetailValueType.NUMERIC:
      return String(raw);
    case EDetailValueType.DATE:
      return String(raw);
    case EDetailValueType.BOOLEAN:
      return raw ? '1' : '0';
    case EDetailValueType.ENUM:
      return String(raw);
    default:
      return String(raw);
  }
};

/**
 * Decodes the stored string from `field_task_details.value` back to a typed JS value.
 * Returns null when stored is null or cannot be parsed.
 */
export const decodeDetailValue = (
  valueType: EDetailValueType,
  stored: string | null,
): TDetailValue => {
  if (stored === null || stored === undefined) return null;

  switch (valueType) {
    case EDetailValueType.TEXT:
      return stored;
    case EDetailValueType.NUMERIC: {
      const n = Number(stored);
      return isNaN(n) ? null : n;
    }
    case EDetailValueType.DATE:
      return stored;
    case EDetailValueType.BOOLEAN:
      return stored === '1';
    case EDetailValueType.ENUM:
      return stored;
    default:
      return stored;
  }
};
