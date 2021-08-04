import { ServerRoute } from '@hapi/hapi';
import {
  ProductApi,
  ProductFilter,
  productFilterSchema,
  NewProduct,
  newProductSchema,
  productIdPathSchema,
  UpdateProduct,
  updateProductSchema,
} from '@node-web-frameworks-performance/shared';

const routes: ServerRoute[] = [
  {
    path: '/products',
    method: 'GET',
    options: {
      validate: { query: productFilterSchema },
      auth: 'jwt',
    },
    handler: (req) => {
      return ProductApi.getProducts(req.query as ProductFilter);
    },
  },
  {
    path: '/products',
    method: 'POST',
    options: {
      validate: { payload: newProductSchema },
      auth: 'jwt',
    },
    handler: (req) => {
      return ProductApi.addProduct(req.payload as NewProduct, req.auth.credentials);
    },
  },
  {
    path: '/products/{id}',
    method: 'GET',
    options: {
      validate: { params: productIdPathSchema },
      auth: 'jwt',
    },
    handler: (req) => {
      const id = (req.params as { id: number }).id;
      return ProductApi.getProduct(id);
    },
  },
  {
    path: '/products/{id}',
    method: 'PUT',
    options: {
      validate: { payload: updateProductSchema, params: productIdPathSchema },
      auth: 'jwt',
    },
    handler: (req) => {
      const id = (req.params as { id: number }).id;
      return ProductApi.updateProduct(id, req.payload as UpdateProduct, req.auth.credentials);
    },
  },
  {
    path: '/products/{id}',
    method: 'DELETE',
    options: {
      validate: { params: productIdPathSchema },
      auth: 'jwt',
    },
    handler: async (req, h) => {
      const id = (req.params as { id: number }).id;
      await ProductApi.deleteProduct(id, req.auth.credentials);
      return h.response();
    },
  },
];

export { routes as productRoutes };
