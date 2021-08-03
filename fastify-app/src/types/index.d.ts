import { JwtPayload } from '@node-web-frameworks-performance/shared';

declare module 'fastify' {
  interface FastifyRequest {
    prometheusTimer: (labels?: { method: string; path: string; code: number }) => number;

    /**
     * The auth context.
     *
     * Only available when the request is authenticated
     * through the isAuthenticated middleware.
     */
    authContext: JwtPayload;
  }

  interface FastifyReply {}
}
