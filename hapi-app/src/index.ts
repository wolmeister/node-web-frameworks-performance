import Hapi from '@hapi/hapi';

import { jwtPlugin } from './plugins/jwt-plugin';
import { prometheusPlugin } from './plugins/prometheus-plugin';

const start = async () => {
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

  await server.start();
  console.log('Server running on ' + server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(-1);
});

start();
