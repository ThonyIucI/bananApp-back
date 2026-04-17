"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const migrations_1 = require("@mikro-orm/migrations");
const user_entity_1 = require("../modules/users/domain/user.entity");
exports.default = (0, postgresql_1.defineConfig)({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    dbName: process.env.DB_NAME ?? 'bananero_dev',
    entities: [user_entity_1.User],
    namingStrategy: postgresql_1.UnderscoreNamingStrategy,
    migrations: {
        path: 'dist/database/migrations',
        pathTs: 'src/database/migrations',
        glob: '!(*.d).{js,ts}',
    },
    extensions: [migrations_1.Migrator],
    debug: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=mikro-orm.config.js.map