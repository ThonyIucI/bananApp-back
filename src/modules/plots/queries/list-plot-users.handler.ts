import { Injectable } from '@nestjs/common';
import { IUserPlotRepository } from '../domain/user-plot.repository';
import { UserPlot } from '../domain/user-plot.entity';

export interface PlotUserDto {
  id: string;
  assignedAt: Date;
  notes: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable()
export class ListPlotUsersHandler {
  constructor(private readonly userPlotRepo: IUserPlotRepository) {}

  /**
   * Lists all users with an active assignment to a given plot.
   */
  async execute(plotId: string): Promise<PlotUserDto[]> {
    const assignments = await this.userPlotRepo.findActiveByPlot(plotId);
    return assignments.map((up) => this.toDto(up));
  }

  private toDto(up: UserPlot): PlotUserDto {
    const user = up.user as unknown as {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };

    return {
      id: up.id,
      assignedAt: up.assignedAt,
      notes: up.notes,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
