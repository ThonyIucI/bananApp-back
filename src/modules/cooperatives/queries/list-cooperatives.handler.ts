import { Injectable } from '@nestjs/common';
import {
  ICooperativeRepository,
  CooperativeFilters,
} from '../domain/cooperative.repository';
import { Cooperative } from '../domain/cooperative.entity';

export interface ListCooperativesResult {
  items: Cooperative[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ListCooperativesHandler {
  constructor(private readonly repo: ICooperativeRepository) {}

  async execute(
    filters: CooperativeFilters = {},
  ): Promise<ListCooperativesResult> {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const { items, total } = await this.repo.findAll({
      ...filters,
      limit,
      offset,
    });

    return { items, total, limit, offset };
  }
}
