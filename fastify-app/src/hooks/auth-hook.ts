import { onRequestAsyncHookHandler } from 'fastify';
import Boom from '@hapi/boom';
import { verifyJwt } from '@node-web-frameworks-performance/shared';

export const isAuthenticatedHook: onRequestAsyncHookHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Boom.unauthorized('Token not provided');
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = await verifyJwt(token);
    req.authContext = payload;
  } catch (err) {
    throw Boom.unauthorized('Invalid token');
  }
};
