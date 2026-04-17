import { OnApplicationBootstrap } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
export declare class SeedSuperadminService implements OnApplicationBootstrap {
    private readonly em;
    private readonly logger;
    constructor(em: EntityManager);
    onApplicationBootstrap(): Promise<void>;
}
