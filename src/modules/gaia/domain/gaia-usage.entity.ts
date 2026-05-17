import { defineEntity, p } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { User } from '../../users/domain/user.entity';

const GaiaUsageSchema = defineEntity({
  name: 'GaiaUsage',
  tableName: 'gaia_usage',
  properties: {
    id: p.uuid().primary().onCreate(() => uuidv7()),
    user: () => p.manyToOne(User).deleteRule('cascade'),
    usageDate: p.dateString(),
    interactionCount: p.integer().default(0),
    tokenEstimate: p.integer().nullable(),
  },
  indexes: [{ properties: ['user', 'usageDate'], unique: true }],
});

export class GaiaUsage extends GaiaUsageSchema.class {}

GaiaUsageSchema.setClass(GaiaUsage);
