import convict from 'convict';

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  redis: {
    host: {
      doc: 'Redis host',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'Database port',
      format: Number,
      default: 6379,
      env: 'REDIS_PORT',
    },
  },
  db: {
    host: {
      doc: 'Database host',
      format: String,
      default: 'localhost',
      env: 'PGHOST',
    },
    port: {
      doc: 'Database port',
      format: Number,
      default: 5432,
      env: 'PGPORT',
    },
    database: {
      doc: 'Database name',
      default: '',
      format: String,
      env: 'PGDATABASE',
    },
    user: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'PGUSER',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'postgres',
      env: 'PGPASSWORD',
    },
  },
});

config.validate({ allowed: 'strict' });

export { config };
