import { defineConfig, UnderscoreNamingStrategy } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { User } from '../modules/users/domain/user.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'bananero_dev',
  entities: [User],
  namingStrategy: UnderscoreNamingStrategy, // camelCase code → snake_case DB
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV === 'development',
});
