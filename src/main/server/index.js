const express = require('@mantocko/express');
const app = express();

const argv = require('minimist')(process.argv.slice(2));
const https = require('https');

const {join} = require('path');
const {bundleDir} = require(join(process.cwd(), 'config.js'));

app.use('/favicon.ico', express.static(join(bundleDir, 'static', 'favicon.ico')));
app.use('/manifest.json', express.static(join(bundleDir, 'static', 'manifest.json')));
app.use('/robots.txt', express.static(join(bundleDir, 'static', 'robots.txt')));

// Need to extend model here

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
