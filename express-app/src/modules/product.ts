import { Router } from 'express';
import {
  newProductSchema,
  updateProductSchema,
  productFilterSchema,
  productIdPathSchema,
  ProductApi,
} from '@node-web-frameworks-performance/shared';

import { validate } from '../common/validate-middleware';
import { isAuthenticated } from '../common/auth-middleware';

const router = Router();

router.get(
  '/products',
  isAuthenticated,
  validate({ query: productFilterSchema }, async (req, res) => {
    res.send(await ProductApi.getProducts(req.query));
  })
);

router.post(
  '/products',
  isAuthenticated,
  validate({ body: newProductSchema }, async (req, res) => {
    res.send(await ProductApi.addProduct(req.body, req.authContext));
  })
);

router.get(
  '/products/:id',
  isAuthenticated,
  validate({ params: productIdPathSchema }, async (req, res) => {
    res.send(await ProductApi.getProduct(req.params.id));
  })
);

router.put(
  '/products/:id',
  isAuthenticated,
  validate({ params: productIdPathSchema, body: updateProductSchema }, async (req, res) => {
    res.send(await ProductApi.updateProduct(req.params.id, req.body, req.authContext));
  })
);

router.delete(
  '/products/:id',
  isAuthenticated,
  validate({ params: productIdPathSchema }, async (req, res) => {
    await ProductApi.deleteProduct(req.params.id, req.authContext);
    res.status(200).send();
  })
);

export { router as productRouter };
