const autocannon = require('autocannon');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MjY1NDU2NzB9.tr3Wrj4IxyJ80AQVvK7cyQm6TA4WH_ufVCA-6Ho97sM';

const instance = autocannon({
  url: 'http://localhost:3000/health',
  headers: {
    authorization: 'Bearer ' + token,
  },
});

autocannon.track(instance, { renderProgressBar: true });

// This is used to kill the instance on CTRL-C
process.once('SIGINT', () => {
  instance.stop();
});
