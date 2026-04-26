import { User } from './user.entity';

export interface UserFilters {
  cooperativeId?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export abstract class IUserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByIds(ids: string[]): Promise<User[]>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(
    filters?: UserFilters,
  ): Promise<{ items: User[]; total: number }>;
  abstract persist(user: User): void;
  abstract flush(): Promise<void>;
}
