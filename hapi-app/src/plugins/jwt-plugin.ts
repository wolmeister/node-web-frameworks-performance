import { Plugin } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { verifyJwt } from '@node-web-frameworks-performance/shared';

export const jwtPlugin: Plugin<{}> = {
  name: 'jwt-plugin',
  register: (server) => {
    server.auth.scheme('jwt', () => {
      return {
        authenticate: async (request, h) => {
          const authHeader = request.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return h.unauthenticated(Boom.unauthorized('Token not provided'));
          }

          const token = authHeader.substring('Bearer '.length);

          try {
            const payload = await verifyJwt(token);
            return h.authenticated({ credentials: payload });
          } catch (err) {
            return h.unauthenticated(Boom.unauthorized('Invalid token'));
          }
        },
      };
    });
  },
};
