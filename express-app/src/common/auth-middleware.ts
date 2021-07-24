import { StatusCodes } from 'http-status-codes';
import { HttpError, verifyJwt } from '@node-web-frameworks-performance/shared';

import { handle } from './handle-async-middleware';

export const isAuthenticated = handle(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    await verifyJwt(token);
    next();
  } catch (err) {
    throw new HttpError(StatusCodes.UNAUTHORIZED);
  }
});
