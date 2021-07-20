import express from 'express';
import { runMigrations } from '@node-web-frameworks-performance/shared';

const start = async () => {
  // Run databaes migrations
  // @TODO: Add .env
  await runMigrations({
    database: 'benchmark-express-app',
    user: 'postgres',
    password: 'postgres',
    host: '192.168.0.3',
  });

  // Run express
  const app = express();

  app.get('/health', (req, res) => {
    res.json({
      message: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(3000, () => {
    console.log('Express listening on http://localhost:3000');
  });
};

start();
