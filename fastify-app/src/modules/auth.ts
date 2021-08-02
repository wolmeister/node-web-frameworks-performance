import { FastifyPluginAsync } from 'fastify';
import {
  AuthApi,
  AuthRequest,
  authRequestSchema,
  RevokeTokenRequest,
  revokeTokenRequestSchema,
} from '@node-web-frameworks-performance/shared';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: AuthRequest }>(
    '/auth',
    {
      schema: {
        body: authRequestSchema,
      },
    },
    async (req, res) => {
      return AuthApi.authenticate(req.body);
    }
  );

  fastify.post<{ Body: RevokeTokenRequest }>(
    '/auth/revoke',
    {
      schema: {
        body: revokeTokenRequestSchema,
      },
    },
    async (req, res) => {
      res.send(await AuthApi.revokeToken(req.body));
    }
  );
};

export { routes as authRoutes };
