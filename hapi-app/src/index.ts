import Hapi from '@hapi/hapi';

const start = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

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
