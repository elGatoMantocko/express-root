const express = require('@mantocko/express');
const app = express(require('./middleware'));

const argv = require('minimist')(process.argv.slice(2));
const https = require('https');

// basic registration endpoint
app.post('/register', express.bodyParser.urlencoded({extended: true}), function(req, res) {
  // index user into database and redirect to /login with the userid as a parameter
  res.send(req.body);
});

// this is something all apps have to do
app.use(express.errorHandler());

if (argv.key && argv.cert) {
  const key = readFileSync(argv.key);
  const cert = readFileSync(argv.cert);
  const allowHTTP1 = true;

  // eventually pindrop http2 here when express supports it
  //  track: https://github.com/expressjs/express/issues/3388
  https.createServer({allowHTTP1, key, cert}, app).listen(argv.port || 3443);
} else {
  app.listen(argv.port || 3000);
}
