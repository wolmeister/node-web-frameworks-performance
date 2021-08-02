import { runMigrations } from '@node-web-frameworks-performance/shared';
import { app } from './app';

const start = async () => {
  // Run migrations
  await runMigrations();

  // Start fastify
  app.listen(3000, (error, address) => {
    if (error) {
      throw error;
    }
    console.log('Fastify listening on ' + address);
  });
};

start();
