// plot.mapper.ts
import { Sector } from '../../sectors/domain/sector.entity';
import { User } from '../../users/domain/user.entity';
import { Plot } from '../domain/plot.entity';

export interface PlotLookupDto {
  id: string;
  name: string;
  sector: Sector | null;
  ownerUser: User;
  areaHectares: number;
  subPlotsQuantity: number;
}

export class PlotMapper {
  static toListDto(plot: Plot): PlotLookupDto {
    return {
      id: plot.id,
      name: plot.name,
      sector: plot?.sector,
      ownerUser: plot?.ownerUser,
      areaHectares: Number(plot?.areaHectares ?? 0),
      subPlotsQuantity: plot?.subPlots?.length ?? 0,
    };
  }
}
