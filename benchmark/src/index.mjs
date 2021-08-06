import autocannon from 'autocannon';
import got from 'got';
import ora from 'ora';
import chalk from 'chalk';
import crypto from 'crypto';

const spinner = ora();

// Create a user
spinner.start('Creating user');

const userEmail = `user${crypto.randomUUID()}@test.com`;
const userPassword = '123456';

await got.post('http://localhost:3000/users', {
  json: {
    name: 'User Name Test',
    email: userEmail,
    password: userPassword,
  },
  responseType: 'json',
});

spinner.succeed();

// Get auth token
spinner.start('Retrieving auth token');

const authResponse = await got.post('http://localhost:3000/auth', {
  json: {
    email: userEmail,
    password: userPassword,
  },
  responseType: 'json',
});

const token = authResponse.body.token;

spinner.succeed();

// Populate the database
spinner.start('Populating the database');

const productIds = [];

await Promise.all(
  Array.from({ length: 7500 }).map(async () => {
    const res = await got.post('http://localhost:3000/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: {
        name: 'Product name',
        description: 'Product description',
      },
      responseType: 'json',
    });
    productIds.push(res.body.id);
  })
);

spinner.succeed();

// Benchmark POST /products
spinner.start('Benchmarking POST /products');

const postProductsResults = await autocannon({
  url: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  requests: [
    {
      method: 'POST',
      path: '/products',
      body: JSON.stringify({
        name: 'Product name',
        description: 'Product description',
      }),
      onResponse: (status, body, context) => {
        const product = JSON.parse(body);
        productIds.push(product.id);
      },
    },
  ],
});

spinner.succeed();

// Benchmark GET /products
spinner.start('Benchmarking GET /products');

const getProductsResults = await autocannon({
  url: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  requests: [{ path: '/products' }],
});

spinner.succeed();

// Benchmark GET /products/:id
spinner.start('Benchmarking GET /products/:id');

const getProductResults = await autocannon({
  url: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  requests: [
    {
      path: '/products',
      setupRequest: (req, context) => ({
        ...req,
        path: `/products/${productIds[Math.floor(Math.random() * productIds.length)]}`,
      }),
    },
  ],
});

spinner.succeed();

// Benchmark PUT /products/:id
spinner.start('Benchmarking PUT /products/:id');

const putProductResults = await autocannon({
  url: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  requests: [
    {
      method: 'POST',
      path: '/products',
      setupRequest: (req, context) => ({
        ...req,
        path: `/products/${productIds[Math.floor(Math.random() * productIds.length)]}`,
        body: JSON.stringify({
          name: 'Product name - edited',
          description: 'Product description - edited',
        }),
      }),
    },
  ],
});

spinner.succeed();

// Benchmark DELETE /products/:id
spinner.start('Benchmarking DELETE /products/:id');

const deleteProductResults = await autocannon({
  url: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  requests: [
    {
      method: 'DELETE',
      path: '/products',
      setupRequest: (req, context) => ({
        ...req,
        path: `/products/${productIds.pop()}`,
      }),
    },
  ],
});

spinner.succeed();

// Compute metrics
console.log(chalk.blue('POST /products'));
console.log('avg,latency');
console.log(`${postProductsResults.requests.average},${postProductsResults.latency.average}\n`);

console.log(chalk.blue('GET /products'));
console.log('avg,latency');
console.log(`${getProductsResults.requests.average},${getProductsResults.latency.average}\n`);

console.log(chalk.blue('GET /products/:id'));
console.log('avg,latency');
console.log(`${getProductResults.requests.average},${getProductResults.latency.average}\n`);

console.log(chalk.blue('PUT /products/:id'));
console.log('avg,latency');
console.log(`${putProductResults.requests.average},${putProductResults.latency.average}\n`);

console.log(chalk.blue('DELETE /products/:id'));
console.log('avg,latency');
console.log(`${deleteProductResults.requests.average},${deleteProductResults.latency.average}\n`);

// End benchmark
spinner.stop();
