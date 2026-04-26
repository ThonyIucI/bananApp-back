import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Sector } from '../domain/sector.entity';
import { ICooperativeRepository } from '../../cooperatives/domain/cooperative.repository';
import { User } from '../../users/domain/user.entity';
import { Plot } from '../../plots/domain/plot.entity';
import {
  BusinessRuleException,
  NotFoundException,
} from '../../shared/exceptions/domain.exception';

export interface CreateSectorPlotInput {
  name: string;
  ownerUserId: string;
  workerUserId?: string;
  areaHectares: number;
  cadastralCode?: string;
}

export interface CreateSectorCommand {
  cooperativeId: string;
  name: string;
  plots?: CreateSectorPlotInput[];
}

export interface CreateSectorResult {
  sector: Sector;
  plots: Plot[];
}

@Injectable()
export class CreateSectorHandler {
  constructor(
    private readonly cooperativeRepo: ICooperativeRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(cmd: CreateSectorCommand): Promise<CreateSectorResult> {
    const cooperative = await this.cooperativeRepo.findById(cmd.cooperativeId);
    if (!cooperative) throw new NotFoundException('Cooperativa no encontrada');

    const plotInputs = cmd.plots ?? [];

    const allUserIds = [
      ...new Set([
        ...plotInputs.map((p) => p.ownerUserId),
        ...plotInputs.flatMap((p) => (p.workerUserId ? [p.workerUserId] : [])),
      ]),
    ];

    return this.em.transactional(async (tem) => {
      const sector = Sector.make({ name: cmd.name, cooperative });
      tem.persist(sector);

      const plots: Plot[] = [];

      if (plotInputs.length > 0) {
        const users = await tem.find(User, {
          id: { $in: allUserIds },
          deletedAt: null,
        });
        const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

        for (const input of plotInputs) {
          const ownerUser = userMap.get(input.ownerUserId);
          if (!ownerUser) {
            throw new BusinessRuleException(
              `Usuario propietario no encontrado: ${input.ownerUserId}`,
            );
          }

          const workerUser = input.workerUserId
            ? userMap.get(input.workerUserId)
            : undefined;
          if (input.workerUserId && !workerUser) {
            throw new BusinessRuleException(
              `Usuario trabajador no encontrado: ${input.workerUserId}`,
            );
          }

          const plot = Plot.make({
            name: input.name,
            sector,
            ownerUser,
            workerUser,
            areaHectares: input.areaHectares,
            cadastralCode: input.cadastralCode,
          });
          plots.push(plot);
        }

        plots.forEach((p) => tem.persist(p));
      }

      return { sector, plots };
    });
  }
}
