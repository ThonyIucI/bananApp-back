import { Injectable } from '@nestjs/common';
import {
  IBundlingRepository,
  BundlingFilters,
} from '../domain/bundling.repository';
import { Bundling } from '../domain/bundling.entity';

export interface ListBundlingsResult {
  items: Bundling[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ListBundlingsHandler {
  constructor(private readonly bundlingRepo: IBundlingRepository) {}

  async execute(filters: BundlingFilters = {}): Promise<ListBundlingsResult> {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const { items, total } = await this.bundlingRepo.findAll({
      ...filters,
      limit,
      offset,
    });
    return { items, total, limit, offset };
  }
}
