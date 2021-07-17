import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(3000, () => {
  console.log('Express listening on http://localhost:3000');
});
