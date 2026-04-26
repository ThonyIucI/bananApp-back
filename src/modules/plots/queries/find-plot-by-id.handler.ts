import { Injectable } from '@nestjs/common';
import { IPlotRepository } from '../domain/plot.repository';
import { Plot } from '../domain/plot.entity';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class FindPlotByIdHandler {
  constructor(private readonly plotRepo: IPlotRepository) {}

  async execute(id: string): Promise<Plot> {
    const plot = await this.plotRepo.findById(id);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    return plot;
  }
}
