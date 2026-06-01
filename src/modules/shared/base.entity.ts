import { p, defineEntity } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';

// Returns fresh property builder instances for each entity.
// Do NOT use a shared constant — MikroORM v7 mutates builders during schema
// processing, so reusing the same instances across entities corrupts metadata.
export function baseProperties(props?: { withDeletedAt?: boolean }) {
  if (props?.withDeletedAt) {
    return {
      id: entityIdV7(),
      createdAt: p.datetime().onCreate(() => new Date()),
      updatedAt: p
        .datetime()
        .onCreate(() => new Date())
        .onUpdate(() => new Date()),
      deletedAt: p.datetime().nullable(),
    };
  }
  return {
    id: entityIdV7(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
    deletedAt: p.datetime().nullable(),
  };
}

/** Returns a fresh uuid v7 primary key builder. Call as a function — shared instances get mutated by MikroORM. */
export const entityIdV7 = () =>
  p
    .uuid()
    .primary()
    .onCreate(() => uuidv7());

/**Implement when need id in memory */
export const getNewIdV7 = () => uuidv7();

export const BaseSchema = defineEntity({
  name: 'BaseEntity',
  abstract: true,
  properties: baseProperties(),
});

export const BaseSchemaWithDeletedAt = defineEntity({
  name: 'BaseEntity',
  abstract: true,
  properties: baseProperties({ withDeletedAt: true }),
});
