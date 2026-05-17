import { Injectable } from '@nestjs/common';
import { IUserPlotRepository } from '../domain/user-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

export interface UnassignUserPlotsCommand {
  userId: string;
  plotIds: string[];
}

@Injectable()
export class UnassignUserPlotsHandler {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly userPlotRepo: IUserPlotRepository,
  ) {}

  /**
   * Soft-unassigns a user from multiple plots by setting unassignedAt.
   * Silently skips plots that are not currently assigned.
   */
  async execute(cmd: UnassignUserPlotsCommand): Promise<void> {
    const user = await this.userRepo.findById(cmd.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userPlotRepo.bulkUnassign(cmd.userId, cmd.plotIds);
  }
}
