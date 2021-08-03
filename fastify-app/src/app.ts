import fastify from 'fastify';
import prometheus from 'prom-client';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Schema, ValidationError } from 'joi';
import { HttpError } from '@node-web-frameworks-performance/shared';

import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/user';
import { productRoutes } from './modules/product';

const app = fastify();

// Setup joi
app.setValidatorCompiler<Schema>(({ schema }) => {
  return (data) => schema.validate(data);
});

// Setup prometheus
const prometheusRegister = new prometheus.Registry();
const httpRequestTimer = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

prometheus.collectDefaultMetrics({ register: prometheusRegister });
prometheusRegister.registerMetric(httpRequestTimer);

app.addHook('onRequest', (req, res, done) => {
  req.prometheusTimer = httpRequestTimer.startTimer();
  done();
});

app.addHook('onResponse', (req, res, done) => {
  req.prometheusTimer({ path: req.routerPath, code: res.statusCode, method: req.method });
  done();
});

app.get('/metrics', async (req, res) => {
  res.header('Content-Type', prometheusRegister.contentType);
  res.send(await prometheusRegister.metrics());
});

// Setup routes
app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.register(authRoutes);
app.register(userRoutes);
app.register(productRoutes);

// Setup error handling
app.setErrorHandler((error, request, res) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).send({
      message: error.message,
      status: error.statusCode,
    });
  } else if (error instanceof ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).send({
      message: error.message,
      status: StatusCodes.BAD_REQUEST,
      errors: error.details,
    });
  } else {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

export { app };
