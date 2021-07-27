import { Router } from 'express';
import {
  createUserSchema,
  addUser,
} from '@node-web-frameworks-performance/shared';

import { validate } from '../../common/validate-middleware';

const router = Router();

router.post(
  '/users',
  validate({ body: createUserSchema }, async (req, res) => {
    const user = await addUser(req.body);
    res.send({
      ...user,
      password: undefined,
    });
  })
);

export { router as userRouter };
