import { JwtPayload } from '@node-web-frameworks-performance/shared';

declare module '@hapi/hapi' {
  interface PluginsStates {
    /**
     * Prometheus plugin state.
     */
    prometheus: {
      /**
       * The timer used to measure request duration.
       */
      requestTimer: (labels?: { method: string; path: string; code: number }) => number;
    };
  }

  interface AuthCredentials extends JwtPayload {}
}
