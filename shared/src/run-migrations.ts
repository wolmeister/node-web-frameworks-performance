import { join } from 'path';
import { migrate } from 'postgres-migrations';

import { dbPool } from './db';

export async function runMigrations() {
  await migrate({ client: dbPool }, join(__dirname, '..', 'migrations'));
}
