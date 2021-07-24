import { RequestHandler } from 'express';

export function handle(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}
