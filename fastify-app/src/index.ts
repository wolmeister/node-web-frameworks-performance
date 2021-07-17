import fastify from 'fastify';

const app = fastify();

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(3000, (error, address) => {
  if (error) {
    throw error;
  }
  console.log('Fastify listening on ' + address);
});
