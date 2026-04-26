import { Cooperative } from './cooperative.entity';

export interface CooperativeFilters {
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export abstract class ICooperativeRepository {
  abstract findById(id: string): Promise<Cooperative | null>;
  abstract findByRuc(ruc: string): Promise<Cooperative | null>;
  abstract findAll(
    filters?: CooperativeFilters,
  ): Promise<{ items: Cooperative[]; total: number }>;
  abstract persist(cooperative: Cooperative): void;
  abstract flush(): Promise<void>;
}
