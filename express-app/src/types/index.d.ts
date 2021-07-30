import { JwtPayload } from '@node-web-frameworks-performance/shared';

declare global {
  namespace Express {
    interface Request {
      /**
       * The auth context.
       *
       * Only available when the request is authenticated
       * through the isAuthenticated middleware.
       */
      authContext: JwtPayload;
    }
  }
}

export {};
