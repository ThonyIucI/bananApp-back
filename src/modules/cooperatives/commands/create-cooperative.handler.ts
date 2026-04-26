import { Injectable } from '@nestjs/common';
import { Cooperative } from '../domain/cooperative.entity';
import { ICooperativeRepository } from '../domain/cooperative.repository';
import { CreateCooperativeCommand } from './create-cooperative.command';
import { ConflictException } from '../../shared/exceptions/domain.exception';
import { Sector } from '../../sectors/domain/sector.entity';
import { ISectorRepository } from '../../sectors/domain/sector.repository';

@Injectable()
export class CreateCooperativeHandler {
  constructor(
    private readonly repo: ICooperativeRepository,
    private readonly sectorRepo: ISectorRepository,
  ) {}

  async execute(command: CreateCooperativeCommand): Promise<Cooperative> {
    const existing = await this.repo.findByRuc(command.ruc);
    if (existing) {
      throw new ConflictException(
        `Ya existe una cooperativa con el RUC ${command.ruc}`,
      );
    }

    const cooperative = Cooperative.make(command);
    this.repo.persist(cooperative);

    if (command.sectors?.length) {
      const sectors = command.sectors.map((name) =>
        Sector.make({ name, cooperative }),
      );
      this.sectorRepo.persistMany(sectors);
    }

    await this.repo.flush();
    return cooperative;
  }
}
