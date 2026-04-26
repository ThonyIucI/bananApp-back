import { Injectable } from '@nestjs/common';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteSubPlotHandler {
  constructor(private readonly subPlotRepo: ISubPlotRepository) {}

  async execute(id: string): Promise<void> {
    const subPlot = await this.subPlotRepo.findById(id);
    if (!subPlot) throw new NotFoundException('Lote interno no encontrado');
    subPlot.deletedAt = new Date();
    await this.subPlotRepo.flush();
  }
}
