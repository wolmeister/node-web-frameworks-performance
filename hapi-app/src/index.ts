import Hapi from '@hapi/hapi';
import prometheus from 'prom-client';

const start = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  // Setup prometheus
  const prometheusRegister = new prometheus.Registry();
  prometheus.collectDefaultMetrics({ register: prometheusRegister });

  const httpRequestTimer = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  });
  prometheusRegister.registerMetric(httpRequestTimer);

  server.ext('onRequest', (request, h) => {
    request.prometheusTimer = httpRequestTimer.startTimer();
    return h.continue;
  });

  server.ext('onPreResponse', (request, h) => {
    request.prometheusTimer({
      path: request.path,
      code: (request.response as Hapi.ResponseObject).statusCode,
      method: request.method,
    });
    return h.continue;
  });

  server.route({
    method: 'GET',
    path: '/metrics',
    handler: async (request, h) => {
      const response = h.response(await prometheusRegister.metrics());
      response.header('Content-Type', prometheusRegister.contentType);
      return response;
    },
  });

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
