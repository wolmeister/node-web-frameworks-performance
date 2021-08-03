import { onRequestAsyncHookHandler } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { HttpError, verifyJwt } from '@node-web-frameworks-performance/shared';

export const isAuthenticatedHook: onRequestAsyncHookHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = await verifyJwt(token);
    req.authContext = payload;
  } catch (err) {
    throw new HttpError(StatusCodes.UNAUTHORIZED);
  }
};
