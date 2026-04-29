import 'dotenv/config';
import { defineConfig, UnderscoreNamingStrategy } from '@mikro-orm/postgresql';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { MetadataProvider } from '@mikro-orm/core';

import { User } from '../modules/users/domain/user.entity';
import { Cooperative } from '../modules/cooperatives/domain/cooperative.entity';
import { UserCooperative } from '../modules/cooperatives/domain/user-cooperative.entity';
import { UserCooperativeRole } from '../modules/cooperatives/domain/user-cooperative-role.entity';
import { Role } from '../modules/roles/domain/role.entity';
import { Permission } from '../modules/roles/domain/permission.entity';
import { RolePermission } from '../modules/roles/domain/role-permission.entity';
import { Bundling } from '../modules/bundlings/domain/bundling.entity';
import { RibbonCalendar } from '../modules/ribbon-calendars/domain/ribbon-calendar.entity';
import { Sector } from '../modules/sectors/domain/sector.entity';
import { Plot } from '../modules/plots/domain/plot.entity';
import { SubPlot } from '../modules/plots/domain/sub-plot.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 54322),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'postgres',

  entities: [
    User,
    Cooperative,
    Role,
    Permission,
    UserCooperative,
    UserCooperativeRole,
    RolePermission,
    Sector,
    Plot,
    SubPlot,
    Bundling,
    RibbonCalendar,
  ],

  metadataProvider: MetadataProvider,
  namingStrategy: UnderscoreNamingStrategy,

  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
    dropTables: false,
    transactional: true,
    // ESTO ES LO QUE BUSCAS:
    snapshot: true,
    emit: 'ts',
    generator: class extends TSMigrationGenerator {
      /**
       * Esto obliga al generador a usar saltos de línea y tabulaciones
       */
      override createStatement(sql: string, padLeft: number): string {
        // Formateo básico: saltos de línea después de las comas en el CREATE TABLE
        const formattedSql = sql.replace(/, /g, ',\n    ');
        return super.createStatement(formattedSql, padLeft);
      }
    },
  },

  extensions: [Migrator],

  schemaGenerator: {
    ignoreSchema: [
      'auth',
      'storage',
      'realtime',
      '_realtime',
      'supabase_functions',
      'net',
      'vault',
      'graphql_public',
      'pgbouncer',
      'pgsodium',
      'pgsodium_masks',
      'cron',
      'pgtle',
      'information_schema',
      'pg_catalog',
    ],
  },

  debug: process.env.NODE_ENV === 'development',
});
