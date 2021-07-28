import { Router } from 'express';
import {
  AuthApi,
  authRequestSchema,
  revokeTokenRequestSchema,
} from '@node-web-frameworks-performance/shared';

import { validate } from '../common/validate-middleware';

const router = Router();

router.post(
  '/auth',
  validate({ body: authRequestSchema }, async (req, res) => {
    res.send(await AuthApi.authenticate(req.body));
  })
);

router.post(
  '/auth/revoke',
  validate({ body: revokeTokenRequestSchema }, async (req, res) => {
    res.send(await AuthApi.revokeToken(req.body));
  })
);

export { router as authRouter };
