import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Type } from '@google/genai';
import type {
  IGaiaTool,
  IGaiaToolContext,
  TGaiaToolResult,
} from '../gaia-tool.types';
import { Plot } from '../../../plots/domain/plot.entity';

@Injectable()
export class ListMyPlotsTool implements IGaiaTool {
  readonly name = 'list_my_plots';

  readonly declaration = {
    name: 'list_my_plots',
    description:
      'Lista las parcelas del agricultor autenticado con su nombre, área y sector. Úsalo cuando el usuario pregunte por sus parcelas o lotes.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  };

  constructor(private readonly em: EntityManager) {}

  async execute(
    _args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<TGaiaToolResult> {
    const plots = await this.em.find(
      Plot,
      { ownerUser: { id: ctx.currentUser.sub } },
      { populate: ['sector', 'cropType'] },
    );

    return plots.map((p) => ({
      id: p.id,
      name: p.name,
      areaHa: p.areaHectares,
      sectorName: p.sector?.name ?? null,
      cropType: p.cropType?.label ?? null,
    }));
  }
}
