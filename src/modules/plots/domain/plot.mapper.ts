// plot.mapper.ts
import { Sector } from '../../sectors/domain/sector.entity';
import { User } from '../../users/domain/user.entity';
import { CropType } from '../../crop-types/domain/crop-type.entity';
import { Plot } from '../domain/plot.entity';

export interface PlotCropTypeRef {
  id: string;
  key: string;
  label: string;
  lifecycleType: string;
}

export interface PlotLookupDto {
  id: string;
  name: string;
  sector: Sector | null;
  ownerUser: User;
  cropType: PlotCropTypeRef | null;
  areaHectares: number;
  subPlotsQuantity: number;
  latitude: number | null;
  longitude: number | null;
}

const mapCropTypeRef = (
  cropType: CropType | null | undefined,
): PlotCropTypeRef | null => {
  if (!cropType) return null;
  return {
    id: cropType.id,
    key: cropType.key,
    label: cropType.label,
    lifecycleType: cropType.lifecycleType,
  };
};

export class PlotMapper {
  static toListDto(plot: Plot): PlotLookupDto {
    return {
      id: plot.id,
      name: plot.name,
      sector: plot?.sector,
      ownerUser: plot?.ownerUser,
      cropType: mapCropTypeRef(plot?.cropType),
      areaHectares: Number(plot?.areaHectares ?? 0),
      subPlotsQuantity: plot?.subPlots?.length ?? 0,
      latitude: plot.latitude != null ? Number(plot.latitude) : null,
      longitude: plot.longitude != null ? Number(plot.longitude) : null,
    };
  }
}
