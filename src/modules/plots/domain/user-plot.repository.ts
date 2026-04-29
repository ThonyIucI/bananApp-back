import { UserPlot } from './user-plot.entity';

export abstract class IUserPlotRepository {
  /** All active assignments for a user, optionally scoped to a cooperative. */
  abstract findActiveByUser(
    userId: string,
    cooperativeId?: string,
  ): Promise<UserPlot[]>;

  /** All active assignments for a plot. */
  abstract findActiveByPlot(plotId: string): Promise<UserPlot[]>;

  /**
   * Returns an existing active assignment or null.
   * Used for upsert idempotency checks.
   */
  abstract findActive(userId: string, plotId: string): Promise<UserPlot | null>;

  /** Bulk-assign a user to multiple plots (idempotent). */
  abstract bulkAssign(userId: string, plotIds: string[]): Promise<UserPlot[]>;

  /** Bulk-unassign a user from multiple plots (sets unassignedAt). */
  abstract bulkUnassign(userId: string, plotIds: string[]): Promise<void>;

  abstract persist(userPlot: UserPlot): void;
  abstract flush(): Promise<void>;
}
