import Boom from '@hapi/boom';
import { verifyJwt } from '@node-web-frameworks-performance/shared';

import { handle } from './handle-async-middleware';

export const isAuthenticated = handle(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Boom.unauthorized('Token not provided');
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = await verifyJwt(token);
    req.authContext = payload;
    next();
  } catch (err) {
    throw Boom.unauthorized('Invalid token');
  }
});
