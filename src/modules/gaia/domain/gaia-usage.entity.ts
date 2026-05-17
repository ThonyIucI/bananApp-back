import { defineEntity, p } from '@mikro-orm/core';
import { User } from '../../users/domain/user.entity';
import { entityIdV7 } from '../../shared/base.entity';

const GaiaUsageSchema = defineEntity({
  name: 'GaiaUsage',
  tableName: 'gaia_usages',
  properties: {
    id: entityIdV7,
    user: () => p.manyToOne(User).deleteRule('cascade'),
    /** ISO date string YYYY-MM-DD — one row per user per day */
    usageDate: p.string().length(10),
    interactionCount: p.integer().default(0),
    tokenEstimate: p.integer().nullable(),
  },
  indexes: [{ properties: ['user', 'usageDate'], type: 'unique' }],
});

export class GaiaUsage extends GaiaUsageSchema.class {}

GaiaUsageSchema.setClass(GaiaUsage);
