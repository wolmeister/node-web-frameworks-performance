import { FastifyPluginAsync } from 'fastify';
import {
  NewProduct,
  newProductSchema,
  ProductApi,
  ProductFilter,
  productFilterSchema,
  productIdPathSchema,
  UpdateProduct,
  updateProductSchema,
} from '@node-web-frameworks-performance/shared';
import { isAuthenticatedHook } from '../hooks/auth-hook';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: ProductFilter }>(
    '/products',
    {
      schema: {
        querystring: productFilterSchema,
      },
      onRequest: isAuthenticatedHook,
    },
    async (req, res) => {
      return await ProductApi.getProducts(req.query);
    }
  );

  fastify.post<{ Body: NewProduct }>(
    '/products',
    {
      schema: {
        body: newProductSchema,
      },
      onRequest: isAuthenticatedHook,
    },
    async (req, res) => {
      return await ProductApi.addProduct(req.body, req.authContext);
    }
  );

  fastify.get<{ Params: { id: number } }>(
    '/products/:id',
    {
      schema: {
        params: productIdPathSchema,
      },
      onRequest: isAuthenticatedHook,
    },
    async (req, res) => {
      return await ProductApi.getProduct(req.params.id);
    }
  );

  fastify.put<{ Body: UpdateProduct; Params: { id: number } }>(
    '/products/:id',
    {
      schema: {
        body: updateProductSchema,
        params: productIdPathSchema,
      },
      onRequest: isAuthenticatedHook,
    },
    async (req, res) => {
      return await ProductApi.updateProduct(req.params.id, req.body, req.authContext);
    }
  );

  fastify.delete<{ Params: { id: number } }>(
    '/products/:id',
    {
      schema: {
        params: productIdPathSchema,
      },
      onRequest: isAuthenticatedHook,
    },
    async (req, res) => {
      await ProductApi.deleteProduct(req.params.id, req.authContext);
      res.status(200).send();
    }
  );
};

export { routes as productRoutes };
