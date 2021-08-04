import { JwtPayload } from '@node-web-frameworks-performance/shared';

declare module '@hapi/hapi' {
  interface Request {
    /**
     * The prometheus timer used to measure request duration.
     */
    prometheusTimer: (labels?: { method: string; path: string; code: number }) => number;
  }

  interface AuthCredentials extends JwtPayload {}
}
