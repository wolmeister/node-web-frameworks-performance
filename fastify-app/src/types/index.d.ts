declare module 'fastify' {
  interface FastifyRequest {
    prometheusTimer: (labels?: { method: string; path: string; code: number }) => number;
  }

  interface FastifyReply {}
}

export {};
