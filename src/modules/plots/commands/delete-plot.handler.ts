import { Injectable } from '@nestjs/common';
import { IPlotRepository } from '../domain/plot.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeletePlotHandler {
  constructor(private readonly plotRepo: IPlotRepository) {}

  async execute(id: string): Promise<void> {
    const plot = await this.plotRepo.findById(id);
    if (!plot) throw new NotFoundException('Parcela no encontrada');
    plot.deletedAt = new Date();
    await this.plotRepo.flush();
  }
}
