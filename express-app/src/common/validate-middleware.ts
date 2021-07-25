import { RequestHandler, Request } from 'express';
import { Schema, ValidationOptions } from 'joi';

type ValidateSchemas<B, Q, P> = {
  body?: Schema<B>;
  query?: Schema<Q>;
  params?: Schema<P>;
};

const joiOptions: ValidationOptions = {
  stripUnknown: true,
  abortEarly: false,
};

// RequestHandler type order:
// Params, Res Body, Req Body, Query
export function validate<B, Q, P>(
  schemas: ValidateSchemas<B, Q, P>,
  handler: RequestHandler<P, any, B, Q>
): RequestHandler {
  return (req, res, next) => {
    // Validate body
    if (schemas.body) {
      const bodyResult = schemas.body.validate(req.body, joiOptions);

      if (bodyResult.error) {
        next(bodyResult.error);
        return;
      }

      req.body = bodyResult.value;
    }

    // Validate query params
    if (schemas.query) {
      const queryResult = schemas.query.validate(req.query, joiOptions);

      if (queryResult.error) {
        next(queryResult.error);
        return;
      }

      req.query = queryResult.value;
    }

    // Validate path params
    if (schemas.params) {
      const paramsResult = schemas.params.validate(req.params, joiOptions);

      if (paramsResult.error) {
        next(paramsResult.error);
        return;
      }

      req.params = paramsResult.value;
    }

    return Promise.resolve(handler(req as any, res, next)).catch(next);
  };
}
