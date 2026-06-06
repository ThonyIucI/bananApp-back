/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment -- proxy mock de MikroORM (ESM) */
// MikroORM es ESM puro — se mockea antes de importar entidades.
jest.mock('@mikro-orm/postgresql', () => ({
  EntityManager: class EntityManager {},
}));
jest.mock('@mikro-orm/core', () => {
  const proxy: any = new Proxy(
    function () {
      return proxy;
    },
    {
      get: (_target, prop) => (typeof prop === 'symbol' ? undefined : proxy),
      apply: () => proxy,
    },
  );
  return {
    EntityManager: class EntityManager {},
    Collection: class Collection {},
    defineEntity: () => ({ class: class {}, setClass: () => {} }),
    p: proxy,
  };
});

import { validateAndEncodeDetails } from '../utils/validate-and-encode-details.util';
import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../entities/task-type-detail-schema.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';

interface IFakeOption {
  key: string;
  isActive: boolean;
}

const makeSchema = (overrides: {
  detailKey?: string;
  label?: string;
  valueType?: EDetailValueType;
  isRequired?: boolean;
  options?: IFakeOption[];
}): TaskTypeDetailSchema =>
  ({
    detailKey: overrides.detailKey ?? 'note',
    label: overrides.label ?? 'Nota',
    valueType: overrides.valueType ?? EDetailValueType.TEXT,
    isRequired: overrides.isRequired ?? false,
    detailOptions: { getItems: () => overrides.options ?? [] },
  }) as unknown as TaskTypeDetailSchema;

describe('validateAndEncodeDetails', () => {
  it('lanza si falta un detail requerido', () => {
    const schema = makeSchema({ detailKey: 'qty', isRequired: true });
    expect(() => validateAndEncodeDetails([], [schema])).toThrow(
      ValidationException,
    );
  });

  it('lanza si el detailKey no está definido en el schema', () => {
    expect(() =>
      validateAndEncodeDetails([{ detailKey: 'unknown', value: 'x' }], []),
    ).toThrow(ValidationException);
  });

  it('lanza si un valor numérico no es número', () => {
    const schema = makeSchema({
      detailKey: 'qty',
      valueType: EDetailValueType.NUMERIC,
    });
    expect(() =>
      validateAndEncodeDetails([{ detailKey: 'qty', value: 'abc' }], [schema]),
    ).toThrow(ValidationException);
  });

  it('lanza si un valor ENUM no es una opción activa', () => {
    const schema = makeSchema({
      detailKey: 'color',
      valueType: EDetailValueType.ENUM,
      options: [{ key: 'red', isActive: true }],
    });
    expect(() =>
      validateAndEncodeDetails(
        [{ detailKey: 'color', value: 'blue' }],
        [schema],
      ),
    ).toThrow(ValidationException);
  });

  it('codifica valores válidos según su valueType', () => {
    const schemas = [
      makeSchema({ detailKey: 'flag', valueType: EDetailValueType.BOOLEAN }),
      makeSchema({ detailKey: 'qty', valueType: EDetailValueType.NUMERIC }),
    ];

    const result = validateAndEncodeDetails(
      [
        { detailKey: 'flag', value: true },
        { detailKey: 'qty', value: 5 },
      ],
      schemas,
    );

    expect(result).toEqual([
      { detailKey: 'flag', encodedValue: '1' },
      { detailKey: 'qty', encodedValue: '5' },
    ]);
  });

  it('permite omitir details opcionales', () => {
    const schema = makeSchema({ detailKey: 'note', isRequired: false });
    expect(validateAndEncodeDetails([], [schema])).toEqual([]);
  });
});
