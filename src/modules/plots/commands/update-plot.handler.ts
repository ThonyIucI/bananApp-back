import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Plot } from '../domain/plot.entity';
import { SubPlot } from '../domain/sub-plot.entity';
import { IPlotRepository } from '../domain/plot.repository';
import { ISectorRepository } from '../../sectors/domain/sector.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import {
  ConflictException,
  NotFoundException,
} from '../../shared/exceptions/domain.exception';
import { User } from '../../users/domain/user.entity';
import { Sector } from '../../sectors/domain/sector.entity';

export interface UpdatePlotCommand {
  id: string;
  name?: string;
  sectorId?: string;
  ownerUserId?: string;
  workerUserId?: string | null;
  areaHectares?: number;
  cadastralCode?: string | null;
  subPlots?: {
    id?: string;
    name: string;
    responsibleUserId?: string | null;
    areaHectares: number;
  }[];
}

@Injectable()
export class UpdatePlotHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly plotRepo: IPlotRepository,
    private readonly sectorRepo: ISectorRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(cmd: UpdatePlotCommand): Promise<Plot> {
    return await this.em.transactional(async (em) => {
      // 1. Cargar la parcela con sus subplots actuales
      const plot = await this.plotRepo.findById(cmd.id);
      if (!plot) throw new NotFoundException('Parcela no encontrada');

      // 2. Validaciones de Relaciones
      let sector: Sector | undefined = undefined;
      if (cmd.sectorId !== undefined) {
        sector = await this.sectorRepo.findById(cmd.sectorId);
        if (!sector) throw new NotFoundException('Sector no encontrado');
      }

      let ownerUser: User | undefined = undefined;
      if (cmd.ownerUserId !== undefined) {
        ownerUser = await this.userRepo.findById(cmd.ownerUserId);
        if (!ownerUser)
          throw new NotFoundException('Usuario propietario no encontrado');
      }

      let workerUser: User | null | undefined = undefined;
      if (cmd.workerUserId !== undefined) {
        workerUser = cmd.workerUserId
          ? await this.userRepo.findById(cmd.workerUserId)
          : null;
        if (cmd.workerUserId && !workerUser)
          throw new NotFoundException('Usuario arrendatario no encontrado');
      }

      // 3. Actualizar Plot
      plot.set({
        name: cmd.name,
        sector,
        ownerUser,
        workerUser,
        areaHectares: cmd.areaHectares,
        cadastralCode: cmd.cadastralCode,
      });

      // 4. Sincronizar Subplots (SubPlots)
      if (cmd.subPlots !== undefined) {
        const subPlotsArea = cmd.subPlots.reduce(
          (acc, s) => acc + s.areaHectares,
          0,
        );
        if (subPlotsArea !== plot.areaHectares) {
          console.log(subPlotsArea, plot.areaHectares);

          throw new ConflictException(
            'La suma de áreas de los sub-parcelas no coincide con la área total de la parcela',
          );
        }
        // Obtener IDs de los que vienen en el comando para saber cuáles borrar
        const incomingIds = cmd.subPlots.filter((s) => s.id).map((s) => s.id);

        // Cargar subPlots actuales de la DB
        const currentSubPlots = await em.find(SubPlot, { plot: plot.id });

        // Eliminar los que no están en la nueva lista
        for (const current of currentSubPlots) {
          if (!incomingIds.includes(current.id)) {
            em.remove(current);
          }
        }

        // Crear o Actualizar
        for (const subCmd of cmd.subPlots) {
          let responsibleUser: User | null = null;
          if (subCmd.responsibleUserId) {
            responsibleUser = await this.userRepo.findById(
              subCmd.responsibleUserId,
            );
          }

          if (subCmd.id) {
            // Actualizar existente
            const existingSubPlot = currentSubPlots.find(
              (m) => m.id === subCmd.id,
            );
            if (existingSubPlot) {
              existingSubPlot.set({
                name: subCmd.name,
                areaHectares: subCmd.areaHectares,
                responsibleUser,
              });
            }
          } else {
            // Crear nuevo
            const newSubPlot = SubPlot.make({
              name: subCmd.name,
              plot: plot,
              areaHectares: subCmd.areaHectares,
              responsibleUser: responsibleUser ?? undefined,
            });
            em.persist(newSubPlot);
          }
        }
      }

      await em.flush();
      return plot;
    });
  }
}
