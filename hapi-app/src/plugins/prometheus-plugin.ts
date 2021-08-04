import { Plugin } from '@hapi/hapi';
import { isBoom } from '@hapi/boom';
import prometheus from 'prom-client';

export const prometheusPlugin: Plugin<{}> = {
  name: 'prometheus-plugin',
  register: (server) => {
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
      request.plugins.prometheus = {
        requestTimer: httpRequestTimer.startTimer(),
      };

      return h.continue;
    });

    server.ext('onPreResponse', (request, h) => {
      const { response } = request;
      const statusCode = isBoom(response) ? response.output.statusCode : response.statusCode;

      request.plugins.prometheus.requestTimer({
        path: request.path,
        method: request.method,
        code: statusCode,
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
  },
};
