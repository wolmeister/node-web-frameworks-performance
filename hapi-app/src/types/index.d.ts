declare module '@hapi/hapi' {
  interface Request {
    /**
     * The prometheus timer used to measure request duration.
     */
    prometheusTimer: (labels?: { method: string; path: string; code: number }) => number;
  }
}

export {};
