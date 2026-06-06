import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../entities/task-type-detail-schema.entity';
import {
  encodeDetailValue,
  TDetailValue,
} from './field-task-detail-value.util';
import { ValidationException } from '../../shared/exceptions/domain.exception';

/** Detalle tal como llega del cliente (valor JS crudo, sin codificar). */
export interface IProvidedDetail {
  detailKey: string;
  value: string | number | boolean | null;
}

/** Detalle ya validado y codificado, listo para persistir en `field_task_details.value`. */
export interface IEncodedDetail {
  detailKey: string;
  encodedValue: string | null;
}

/**
 * Valida una lista de details contra el schema del taskType (requeridos presentes, keys
 * definidas, tipos correctos) y devuelve cada valor codificado para persistir.
 * Fuente única de verdad compartida por create y update.
 */
export const validateAndEncodeDetails = (
  providedDetails: IProvidedDetail[],
  schemas: TaskTypeDetailSchema[],
): IEncodedDetail[] => {
  const providedByKey = new Map(
    providedDetails.map((detail) => [detail.detailKey, detail]),
  );

  for (const schema of schemas) {
    if (!schema.isRequired) continue;
    const provided = providedByKey.get(schema.detailKey);
    if (
      provided === undefined ||
      provided.value === null ||
      provided.value === undefined
    ) {
      throw new ValidationException(
        `El detalle "${schema.label}" es obligatorio para este tipo de labor`,
        schema.detailKey,
      );
    }
  }

  const schemaByKey = new Map(
    schemas.map((schema) => [schema.detailKey, schema]),
  );

  return providedDetails.map((detail) => {
    const schema = schemaByKey.get(detail.detailKey);
    if (!schema) {
      throw new ValidationException(
        `El detalle "${detail.detailKey}" no está definido para este tipo de labor`,
        detail.detailKey,
      );
    }

    if (detail.value !== null && detail.value !== undefined) {
      validateDetailValue(detail.value, schema);
    }

    return {
      detailKey: detail.detailKey,
      encodedValue: encodeDetailValue(
        schema.valueType,
        detail.value as TDetailValue,
      ),
    };
  });
};

/** Valida el tipo de un valor de detail (numérico, opción ENUM activa) contra su schema. */
export const validateDetailValue = (
  raw: string | number | boolean,
  schema: TaskTypeDetailSchema,
): void => {
  if (schema.valueType === EDetailValueType.NUMERIC && isNaN(Number(raw))) {
    throw new ValidationException(
      `El detalle "${schema.label}" debe ser numérico`,
      schema.detailKey,
    );
  }

  if (schema.valueType === EDetailValueType.ENUM) {
    const activeKeys = schema.detailOptions
      .getItems()
      .filter((option) => option.isActive)
      .map((option) => option.key);

    if (activeKeys.length > 0 && !activeKeys.includes(String(raw))) {
      throw new ValidationException(
        `"${raw}" no es una opción válida para "${schema.label}"`,
        schema.detailKey,
      );
    }
  }
};
