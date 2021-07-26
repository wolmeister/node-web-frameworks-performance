import convict from 'convict';

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  db: {
    host: {
      doc: 'Database host',
      format: String,
      default: '192.168.0.3',
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
