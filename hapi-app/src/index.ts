import Hapi from '@hapi/hapi';
import { runMigrations } from '@node-web-frameworks-performance/shared';

import { jwtPlugin } from './plugins/jwt-plugin';
import { prometheusPlugin } from './plugins/prometheus-plugin';
import { userRoutes } from './modules/user';
import { authRoutes } from './modules/auth';
import { productRoutes } from './modules/product';

const start = async () => {
  // Run migrations
  await runMigrations();

  // Create hapi server
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  // Setup jwt
  await server.register(jwtPlugin);
  server.auth.strategy('jwt', 'jwt');

  // Setup prometheus
  await server.register(prometheusPlugin);

  // Setup routes
  server.route({
    method: 'GET',
    path: '/health',
    handler: () => {
      return {
        message: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    },
  });

  server.route(userRoutes);
  server.route(authRoutes);
  server.route(productRoutes);

  await server.start();
  console.log('Server running on ' + server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(-1);
});

start();
