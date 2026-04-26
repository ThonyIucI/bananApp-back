import { Injectable } from '@nestjs/common';
import { ICooperativeRepository } from '../domain/cooperative.repository';
import { Cooperative } from '../domain/cooperative.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class FindCooperativeByIdHandler {
  constructor(private readonly repo: ICooperativeRepository) {}

  async execute(id: string): Promise<Cooperative> {
    const cooperative = await this.repo.findById(id);
    if (!cooperative) {
      throw new NotFoundException('Cooperativa no encontrada');
    }
    return cooperative;
  }
}
