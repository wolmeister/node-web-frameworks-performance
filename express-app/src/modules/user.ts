import { Router } from 'express';
import {
  newUserSchema,
  UserApi,
} from '@node-web-frameworks-performance/shared';

import { validate } from '../common/validate-middleware';

const router = Router();

router.post(
  '/users',
  validate({ body: newUserSchema }, async (req, res) => {
    const user = await UserApi.addUser(req.body);
    res.send({
      ...user,
      password: undefined,
    });
  })
);

export { router as userRouter };
