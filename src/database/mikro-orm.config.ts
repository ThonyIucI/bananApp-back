import 'dotenv/config';
import { defineConfig, UnderscoreNamingStrategy } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

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
import { InternalMark } from '../modules/plots/domain/internal-mark.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 54322),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'postgres',

  entities: [
    User,
    Cooperative,
    UserCooperative,
    UserCooperativeRole,
    Role,
    Permission,
    RolePermission,
    Bundling,
    RibbonCalendar,
    Sector,
    Plot,
    InternalMark,
  ],

  metadataProvider: TsMorphMetadataProvider,
  namingStrategy: UnderscoreNamingStrategy,

  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
    dropTables: false,
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
