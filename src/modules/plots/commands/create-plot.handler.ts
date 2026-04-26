import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Plot } from '../domain/plot.entity';
import { SubPlot } from '../domain/sub-plot.entity';
import { ISectorRepository } from '../../sectors/domain/sector.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';
import { User } from '../../users/domain/user.entity';

export interface CreatePlotCommand {
  name: string;
  sectorId: string;
  ownerUserId: string;
  workerUserId?: string;
  areaHectares: number;
  cadastralCode?: string;
  subPlots?: {
    name: string;
    responsibleUserId?: string;
    areaHectares: number;
  }[];
}

@Injectable()
export class CreatePlotHandler {
  subPlotsArea = 0;

  clearSubPlotsArea() {
    this.subPlotsArea = 0;
  }
  addSubPlotsArea(area: number) {
    this.subPlotsArea += area;
  }

  constructor(
    private readonly em: EntityManager,
    private readonly sectorRepo: ISectorRepository,
    private readonly userRepo: IUserRepository,
  ) {}
  async execute(cmd: CreatePlotCommand): Promise<Plot> {
    return await this.em.transactional(async (em) => {
      const sector = await this.sectorRepo.findById(cmd.sectorId);
      if (!sector) throw new NotFoundException('Sector no encontrado');

      const ownerUser = await this.userRepo.findById(cmd.ownerUserId);
      if (!ownerUser)
        throw new NotFoundException('Usuario propietario no encontrado');

      let workerUser: User | undefined = undefined;
      if (cmd.workerUserId) {
        workerUser = await this.userRepo.findById(cmd.workerUserId);
        if (!workerUser)
          throw new NotFoundException('Usuario trabajador no encontrado');
      }

      const plot = Plot.make({
        name: cmd.name,
        sector,
        ownerUser,
        workerUser,
        areaHectares: cmd.areaHectares,
        cadastralCode: cmd.cadastralCode,
      });

      em.persist(plot);

      // Manejo de Subplots (SubPlots)
      if (cmd.subPlots && cmd.subPlots.length > 0) {
        for (const sub of cmd.subPlots) {
          let responsibleUser: User | undefined = undefined;
          if (sub.responsibleUserId) {
            responsibleUser = await this.userRepo.findById(
              sub.responsibleUserId,
            );
          }

          const subPlot = SubPlot.make({
            name: sub.name,
            plot: plot,
            areaHectares: sub.areaHectares,
            responsibleUser,
          });
          em.persist(subPlot);
          this.addSubPlotsArea(sub.areaHectares);
        }
        if (this.subPlotsArea !== plot.areaHectares) {
          throw new Error(
            'La suma de áreas de los sub-parcelas no coincide con la área total de la parcela',
          );
        }
      }
      await em.flush();
      return plot;
    });
  }
}
