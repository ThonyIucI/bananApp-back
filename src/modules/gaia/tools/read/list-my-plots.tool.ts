import { Injectable } from '@nestjs/common';
import { Type } from '@google/genai';
import { EGaiaToolName } from '../gaia-tool.types';
import type {
  IGaiaTool,
  IGaiaToolContext,
  TGaiaToolResult,
} from '../gaia-tool.types';
import { ListPlotsHandler } from '../../../plots/queries/list-plots.handler';

@Injectable()
export class ListMyPlotsTool implements IGaiaTool {
  readonly name = EGaiaToolName.LIST_MY_PLOTS;

  readonly declaration = {
    name: EGaiaToolName.LIST_MY_PLOTS,
    description:
      'Lista las parcelas del agricultor autenticado con su nombre, área y sector. Úsalo cuando el usuario pregunte por sus parcelas o lotes.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  };

  constructor(private readonly listPlotsHandler: ListPlotsHandler) {}

  async execute(
    _args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<TGaiaToolResult> {
    const { items } = await this.listPlotsHandler.execute({
      ownerUserId: ctx.currentUser.sub,
    });

    return items.map((p) => ({
      id: p.id,
      name: p.name,
      areaHa: p.areaHectares,
      sectorName: p.sector?.name ?? null,
      cropType: p.cropType?.label ?? null,
    }));
  }
}
