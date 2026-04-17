import { OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
export declare class MigrationRunnerService implements OnModuleInit {
    private readonly orm;
    private readonly logger;
    constructor(orm: MikroORM);
    onModuleInit(): Promise<void>;
}
