import fastify from 'fastify';
import prometheus from 'prom-client';
import { Schema } from 'joi';

import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/user';
import { productRoutes } from './modules/product';

const app = fastify();

// Setup joi
app.setValidatorCompiler<Schema>(({ schema }) => {
  return (data) => schema.validate(data);
});

// Setup prometheus
const prometheusRegister = new prometheus.Registry();
const httpRequestTimer = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

prometheus.collectDefaultMetrics({ register: prometheusRegister });
prometheusRegister.registerMetric(httpRequestTimer);

app.addHook('onRequest', (req, res, done) => {
  req.prometheusTimer = httpRequestTimer.startTimer();
  done();
});

app.addHook('onResponse', (req, res, done) => {
  req.prometheusTimer({ path: req.routerPath, code: res.statusCode, method: req.method });
  done();
});

app.get('/metrics', async (req, res) => {
  res.header('Content-Type', prometheusRegister.contentType);
  res.send(await prometheusRegister.metrics());
});

// Setup routes
app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.register(authRoutes);
app.register(userRoutes);
app.register(productRoutes);

export { app };
