import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserPlot } from '../domain/user-plot.entity';
import { IUserPlotRepository } from '../domain/user-plot.repository';
import { Plot } from '../domain/plot.entity';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class MikroOrmUserPlotRepository extends IUserPlotRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  findActiveByUser(userId: string, cooperativeId?: string): Promise<UserPlot[]> {
    const where: Record<string, unknown> = {
      user: { id: userId },
      unassignedAt: null,
      deletedAt: null,
    };

    if (cooperativeId) {
      where['plot'] = { sector: { cooperative: { id: cooperativeId } } };
    }

    return this.em.find(UserPlot, where, {
      populate: ['plot', 'plot.sector'] as never[],
      orderBy: { plot: { name: 'ASC' } },
    });
  }

  findActiveByPlot(plotId: string): Promise<UserPlot[]> {
    return this.em.find(
      UserPlot,
      { plot: { id: plotId }, unassignedAt: null, deletedAt: null },
      {
        populate: ['user'] as never[],
        orderBy: { assignedAt: 'ASC' },
      },
    );
  }

  findActive(userId: string, plotId: string): Promise<UserPlot | null> {
    return this.em.findOne(UserPlot, {
      user: { id: userId },
      plot: { id: plotId },
      unassignedAt: null,
      deletedAt: null,
    });
  }

  async bulkAssign(userId: string, plotIds: string[]): Promise<UserPlot[]> {
    return this.em.transactional(async (em) => {
      const user = em.getReference(User, userId);
      const results: UserPlot[] = [];

      for (const plotId of plotIds) {
        const existing = await em.findOne(UserPlot, {
          user: { id: userId },
          plot: { id: plotId },
          unassignedAt: null,
          deletedAt: null,
        });

        if (existing) {
          results.push(existing);
          continue;
        }

        const plot = em.getReference(Plot, plotId);
        const up = UserPlot.make({ user, plot });
        em.persist(up);
        results.push(up);
      }

      await em.flush();
      return results;
    });
  }

  async bulkUnassign(userId: string, plotIds: string[]): Promise<void> {
    await this.em.transactional(async (em) => {
      const assignments = await em.find(UserPlot, {
        user: { id: userId },
        plot: { id: { $in: plotIds } },
        unassignedAt: null,
        deletedAt: null,
      });

      for (const assignment of assignments) {
        assignment.unassign();
      }

      await em.flush();
    });
  }

  persist(userPlot: UserPlot): void {
    this.em.persist(userPlot);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
