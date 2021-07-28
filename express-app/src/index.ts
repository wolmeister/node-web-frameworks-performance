import express, { ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ValidationError } from 'joi';
import {
  HttpError,
  runMigrations,
} from '@node-web-frameworks-performance/shared';

import { isAuthenticated } from './common/auth-middleware';
import { authRouter } from './modules/auth';
import { userRouter } from './modules/user';

const start = async () => {
  // Run databaes migrations
  await runMigrations();

  // Run express
  const app = express();
  app.use(express.json());

  app.get('/health', isAuthenticated, (req, res) => {
    res.json({
      message: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/', authRouter);
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
