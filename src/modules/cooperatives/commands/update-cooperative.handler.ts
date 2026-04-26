import { Injectable } from '@nestjs/common';
import { ICooperativeRepository } from '../domain/cooperative.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

export interface UpdateCooperativeCommand {
  id: string;
  name?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
}

@Injectable()
export class UpdateCooperativeHandler {
  constructor(private readonly repo: ICooperativeRepository) {}

  async execute(command: UpdateCooperativeCommand) {
    const cooperative = await this.repo.findById(command.id);
    if (!cooperative) throw new NotFoundException('Cooperativa no encontrada');

    cooperative.set({
      name: command.name,
      address: command.address,
      department: command.department,
      province: command.province,
      district: command.district,
    });

    await this.repo.flush();
    return cooperative;
  }
}
