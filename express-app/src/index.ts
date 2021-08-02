import express, { ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ValidationError } from 'joi';
import prometheus from 'prom-client';
import { HttpError, runMigrations } from '@node-web-frameworks-performance/shared';

import { handle } from './common/handle-async-middleware';
import { authRouter } from './modules/auth';
import { productRouter } from './modules/product';
import { userRouter } from './modules/user';

const start = async () => {
  // Run databaes migrations
  await runMigrations();

  // Run express
  const app = express();
  app.use(express.json());

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

  app.get(
    '/metrics',
    handle(async (req, res) => {
      res.header('Content-Type', prometheusRegister.contentType);
      res.send(await prometheusRegister.metrics());
    })
  );

  app.use((req, res, next) => {
    const endTimer = httpRequestTimer.startTimer();
    res.on('finish', () => {
      endTimer({ path: req.path, code: res.statusCode, method: req.method });
    });
    next();
  });

  // Setup routes
  app.get('/health', (req, res) => {
    res.json({
      message: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/', authRouter);
  app.use('/', productRouter);
  app.use('/', userRouter);

  // Setup error handling
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else if (err instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST).send({
        message: err.message,
        status: StatusCodes.BAD_REQUEST,
        errors: err.details,
      });
    } else {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };

  app.use(errorHandler);

  app.listen(3000, () => {
    console.log('Express listening on http://localhost:3000');
  });
};

start();
