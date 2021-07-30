import { DatabaseError } from 'pg';
import sql from 'sql-template-strings';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

import { dbPool } from '../db';
import { HttpError } from '../http-error';
import { JwtPayload } from '../jwt';

type Page<T> = {
  items: T[];
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type Product = {
  id: number;
  ownerId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
};

type NewProduct = {
  name: string;
  description?: string | null;
};

type UpdateProduct = {
  name: string;
  description?: string | null;
};

type ProductFilter = {
  page: number;
  pageSize: number;
};

const newProductSchema = Joi.object<NewProduct>({
  name: Joi.string().required(),
  description: Joi.string(),
}).required();

const updateProductSchema = Joi.object<UpdateProduct>({
  name: Joi.string().required(),
  description: Joi.string(),
}).required();

const productFilterSchema = Joi.object<ProductFilter>({
  page: Joi.number().integer().default(0).min(0),
  pageSize: Joi.number().integer().default(25).min(1),
});

const productIdPathSchema = Joi.object<{ id: number }>({
  id: Joi.number().integer().required().min(1),
}).required();

/**
 * Adds a new product.
 *
 * @param product The product to add
 * @param authContext The authentication context
 * @returns The new product
 */
async function addProduct(product: NewProduct, authContext: JwtPayload): Promise<Product> {
  const result = await dbPool.query<Product>(sql`
    INSERT INTO products ("ownerId", name, description)
    VALUES (${authContext.userId}, ${product.name}, ${product.description})
    RETURNING *
  `);
  return result.rows[0];
}

/**
 * Updates a product.
 *
 * @param id The product id to update
 * @param product The product data to update
 * @param authContext The authentication context
 * @returns The updated product
 */
async function updateProduct(id: number, product: UpdateProduct, authContext: JwtPayload): Promise<Product> {
  const existsResult = await dbPool.query<Product>(sql`
    SELECT 1 FROM products
    WHERE
      id = ${id}
  `);

  if (existsResult.rowCount === 0) {
    throw new HttpError(StatusCodes.NOT_FOUND);
  }

  const updateResult = await dbPool.query<Product>(sql`
    UPDATE products
    SET
      name = ${product.name},
      description = ${product.description}
    WHERE
      id = ${id} AND
      "ownerId" = ${authContext.userId}
    RETURNING *
  `);

  if (updateResult.rowCount === 0) {
    throw new HttpError(StatusCodes.FORBIDDEN);
  }

  return updateResult.rows[0];
}

/**
 * Deletes a product.
 *
 * @param id The product id to delete
 * @param authContext The authentication context
 */
async function deleteProduct(id: number, authContext: JwtPayload): Promise<void> {
  const existsResult = await dbPool.query<Product>(sql`
    SELECT 1 FROM products
    WHERE
      id = ${id}
  `);

  if (existsResult.rowCount === 0) {
    throw new HttpError(StatusCodes.NOT_FOUND);
  }

  const deleteResult = await dbPool.query(sql`
    DELETE FROM products
    WHERE
      id = ${id} AND
      "ownerId" = ${authContext.userId}
  `);

  if (deleteResult.rowCount === 0) {
    throw new HttpError(StatusCodes.FORBIDDEN);
  }
}

/**
 * Retrieves a product.
 *
 * @param id The product id to retrieve
 * @returns The product
 */
async function getProduct(id: number): Promise<Product> {
  const result = await dbPool.query<Product>(sql`
    SELECT * FROM products
    WHERE
      id = ${id}
  `);

  if (result.rowCount === 0) {
    throw new HttpError(StatusCodes.NOT_FOUND);
  }

  return result.rows[0];
}

/**
 * Retrieves a page of products.
 *
 * @param filter The page filter
 * @returns The page of products.
 */
async function getProducts(filter: ProductFilter): Promise<Page<Product>> {
  const result = await dbPool.query<Product & { totalCount: number }>(sql`
    SELECT *, COUNT(*) OVER() as "totalCount" FROM products
    OFFSET ${filter.page * filter.pageSize}
    LIMIT ${filter.pageSize}
  `);

  const page: Page<Product> = {
    items: [],
    pageSize: filter.pageSize,
    totalItems: 0,
    totalPages: 0,
  };

  if (result.rowCount) {
    page.totalItems = result.rows[0].totalCount;
    page.totalPages = Math.ceil(page.totalItems / page.pageSize);

    page.items = result.rows.map((pagedProduct) => {
      const { totalCount, ...product } = pagedProduct;
      return product;
    });
  }

  return page;
}

export type { Product, NewProduct, UpdateProduct, ProductFilter };
export { newProductSchema, updateProductSchema, productFilterSchema, productIdPathSchema };
export const ProductApi = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
};
