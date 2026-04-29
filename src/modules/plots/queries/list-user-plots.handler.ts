import { Injectable } from '@nestjs/common';
import { IUserPlotRepository } from '../domain/user-plot.repository';
import { UserPlot } from '../domain/user-plot.entity';

export interface ListUserPlotsQuery {
  userId: string;
  cooperativeId?: string;
}

export interface UserPlotDto {
  id: string;
  assignedAt: Date;
  notes: string | null;
  plot: {
    id: string;
    name: string;
    areaHectares: number;
    sector: {
      id: string;
      name: string;
    };
  };
}

@Injectable()
export class ListUserPlotsHandler {
  constructor(private readonly userPlotRepo: IUserPlotRepository) {}

  /**
   * Lists all active plot assignments for a user, optionally scoped to a cooperative.
   */
  async execute(query: ListUserPlotsQuery): Promise<UserPlotDto[]> {
    const assignments = await this.userPlotRepo.findActiveByUser(
      query.userId,
      query.cooperativeId,
    );

    return assignments.map((up) => this.toDto(up));
  }

  private toDto(up: UserPlot): UserPlotDto {
    const plot = up.plot as unknown as {
      id: string;
      name: string;
      areaHectares: number;
      sector: { id: string; name: string };
    };

    return {
      id: up.id,
      assignedAt: up.assignedAt,
      notes: up.notes,
      plot: {
        id: plot.id,
        name: plot.name,
        areaHectares: plot.areaHectares,
        sector: {
          id: plot.sector.id,
          name: plot.sector.name,
        },
      },
    };
  }
}
