import { ServerRoute } from '@hapi/hapi';
import {
  AuthApi,
  AuthRequest,
  authRequestSchema,
  RevokeTokenRequest,
  revokeTokenRequestSchema,
} from '@node-web-frameworks-performance/shared';

const routes: ServerRoute[] = [
  {
    path: '/auth',
    method: 'POST',
    options: {
      validate: { payload: authRequestSchema },
    },
    handler(req) {
      return AuthApi.authenticate(req.payload as AuthRequest);
    },
  },
  {
    path: '/auth/revoke',
    method: 'POST',
    options: {
      validate: { payload: revokeTokenRequestSchema },
    },
    async handler(req, h) {
      await AuthApi.revokeToken(req.payload as RevokeTokenRequest);
      return h.response();
    },
  },
];

export { routes as authRoutes };
