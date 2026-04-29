import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IUserPlotRepository } from '../domain/user-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { IPlotRepository } from '../domain/plot.repository';
import { UserCooperative } from '../../cooperatives/domain/user-cooperative.entity';
import { UserPlot } from '../domain/user-plot.entity';
import {
  NotFoundException,
  ConflictException,
} from '../../shared/exceptions/domain.exception';

export interface AssignUserPlotsCommand {
  userId: string;
  plotIds: string[];
  notes?: string;
}

@Injectable()
export class AssignUserPlotsHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly userRepo: IUserRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly userPlotRepo: IUserPlotRepository,
  ) {}

  /**
   * Assigns a user to multiple plots.
   * Validates cooperative membership for each plot.
   * Idempotent: skips plots already assigned.
   */
  async execute(cmd: AssignUserPlotsCommand): Promise<UserPlot[]> {
    const user = await this.userRepo.findById(cmd.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.em.transactional(async (em) => {
      const results: UserPlot[] = [];

      for (const plotId of cmd.plotIds) {
        const plot = await this.plotRepo.findById(plotId);
        if (!plot) throw new NotFoundException('Una de las parcelas no fue encontrada');

        const cooperativeId = (plot.sector as unknown as { cooperative: { id: string } })
          .cooperative?.id;

        if (cooperativeId) {
          const membership = await em.findOne(UserCooperative, {
            user: { id: cmd.userId },
            cooperative: { id: cooperativeId },
            isActive: true,
            deletedAt: null,
          });

          if (!membership) {
            throw new ConflictException(
              `El usuario no pertenece a la cooperativa de la parcela "${plot.name}"`,
            );
          }
        }

        const existing = await this.userPlotRepo.findActive(cmd.userId, plotId);
        if (existing) {
          results.push(existing);
          continue;
        }

        const up = UserPlot.make({ user, plot, notes: cmd.notes });
        em.persist(up);
        results.push(up);
      }

      await em.flush();
      return results;
    });
  }
}
