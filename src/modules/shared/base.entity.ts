import { p } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';

// Spread these into every entity's properties block
export const BaseProperties = {
  id: p.uuid().primary().onCreate(() => uuidv7()),
  createdAt: p.datetime().onCreate(() => new Date()),
  updatedAt: p.datetime()
    .onCreate(() => new Date())
    .onUpdate(() => new Date()),
  deletedAt: p.datetime().nullable(),
};
