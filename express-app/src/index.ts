import express, { ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import {
  HttpError,
  runMigrations,
} from '@node-web-frameworks-performance/shared';

import { isAuthenticated } from './common/auth-middleware';

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

  app.get('/health', isAuthenticated, (req, res) => {
    res.json({
      message: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Setup error handling
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
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
