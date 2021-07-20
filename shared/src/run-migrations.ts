import { join } from 'path';
import { migrate, MigrateDBConfig } from 'postgres-migrations';

type MigrationsConfig = {
  database: string;
  user: string;
  password: string;
  host: string;
  port?: number;
};

export async function runMigrations(config: MigrationsConfig) {
  const dbConfig: MigrateDBConfig = {
    database: config.database,
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port || 5432,
    ensureDatabaseExists: true,
  };

  await migrate(dbConfig, join(__dirname, '..', 'migrations'));
}
