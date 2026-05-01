import { defineEntity, p } from '@mikro-orm/core';
import { BaseSchema } from '../../shared/base.entity';
import { User } from '../../users/domain/user.entity';
import { Plot } from './plot.entity';

const UserPlotSchema = defineEntity({
  name: 'UserPlot',
  tableName: 'user_plot',
  extends: BaseSchema,
  properties: {
    user: () => p.manyToOne(User).deleteRule('cascade'),
    plot: () => p.manyToOne(Plot).deleteRule('cascade'),
    assignedAt: p.datetime().onCreate(() => new Date()),
    unassignedAt: p.datetime().nullable(),
    notes: p.string().length(300).nullable(),
  },
});

export class UserPlot extends UserPlotSchema.class {
  /**
   * Factory: creates an active user-plot assignment.
   */
  static make(props: { user: User; plot: Plot; notes?: string }): UserPlot {
    const up = new UserPlot();
    up.user = props.user;
    up.plot = props.plot;
    up.assignedAt = new Date();
    up.unassignedAt = null;
    up.notes = props.notes?.trim() ?? null;
    return up;
  }

  /** Marks this assignment as inactive (soft unassign). */
  unassign(): void {
    this.unassignedAt = new Date();
  }

  get isActive(): boolean {
    return this.unassignedAt === null;
  }
}

UserPlotSchema.setClass(UserPlot);
