import fastify from 'fastify';

const app = fastify();

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export { app };
