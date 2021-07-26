import { Pool } from 'pg';

import { config } from './config';

export const dbPool = new Pool({
  database: config.get('db.database'),
  user: config.get('db.user'),
  password: config.get('db.password'),
  host: config.get('db.host'),
  port: config.get('db.port'),
});
