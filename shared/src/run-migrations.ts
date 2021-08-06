import { join } from 'path';
import { migrate } from 'postgres-migrations';

import { config } from './config';

export async function runMigrations() {
  await migrate(
    {
      database: config.get('db.database'),
      user: config.get('db.user'),
      password: config.get('db.password'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      ensureDatabaseExists: true,
    },
    join(__dirname, '..', 'migrations')
  );
}
