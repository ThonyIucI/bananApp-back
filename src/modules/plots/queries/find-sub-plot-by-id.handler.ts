import { Injectable } from '@nestjs/common';
import { ISubPlotRepository } from '../domain/sub-plot.repository';
import { SubPlot } from '../domain/sub-plot.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class FindSubPlotByIdHandler {
  constructor(private readonly subPlotRepo: ISubPlotRepository) {}

  async execute(id: string): Promise<SubPlot> {
    const subPlot = await this.subPlotRepo.findById(id);
    if (!subPlot) throw new NotFoundException('Lote interno no encontrado');
    return subPlot;
  }
}
