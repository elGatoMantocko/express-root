// express
const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const https = require('https');

// node based requirements
const {readFileSync} = require('fs');
const {join} = require('path');

// view engine
const Handlebars = require('handlebars');
const hbsUtils = require('./handlebars/index.js');
const {handlebars} = require('consolidate');

// app bundles
const bundleDir = join('dist', 'bundle');

// middleware to make life easier
const {commonModelProvider} = require('./model/index.js');
const localeResolver = require('express-locale');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// details for logging
const {hostname} = require('os');
const {name: application_name, version: build_version} = require(join(__dirname, '..', '..', '..', 'package.json'));
const build_date = (new Date()).toISOString();
const machine_name = hostname();

// TEMPLATING
const viewsDir = join('src', 'main', 'assets', 'views');
hbsUtils.registerDefaultLayouts(Handlebars);
hbsUtils.registerAppPartials(Handlebars);
hbsUtils.registerDefaultHelpers(Handlebars);

// tell the app about the views and view engine
app.engine('hbs', handlebars);
app.set('views', viewsDir);
app.set('view engine', 'hbs');
// \TEMPLATING

// MIDDLEWARE - TODO move to another file
app.use(localeResolver({
  priority: ['query', 'accept-language', 'cookie', 'default'],
  default: 'en_US',
}));
app.use(commonModelProvider());
app.use(helmet());
app.use(cookieParser());

// log incoming requests
app.use(function(req, res, next) {
  const {originalUrl, body, method, ip, protocol} = req;
  console.log(`INFO - ${(new Date()).toUTCString()} - ${method} - ${originalUrl} - ${ip} - ${protocol} - ${JSON.stringify(body)}`);
  next();
});

// static assets
app.use('/resources', express.static('node_modules'));
app.use('/assets', express.static(bundleDir));
app.use('/favicon.ico', express.static(join(bundleDir, 'favicon.ico')));
app.use('/manifest.json', express.static(join(bundleDir, 'manifest.json')));

// error handling
app.use(function(err, req, res, next) {
  console.error(err);
  next();
});
// \MIDDLEWARE

// CONTROLLERS - TODO move to another file
// version endpoint
app.get('/base/version', function(req, res) {
  res.jsonp({machine_name, build_date, build_version, application_name});
});

// client side logging endpoint
app.post('/logger/:loggerPath', bodyParser.json(), function(req, res) {
  const {
    params: {loggerPath = 'log'},
    body: {
      message = 'No message provided',
      page_url = 'No URL provided',
      page_title = 'App',
      user_agent = 'No user agent provided',
    },
  } = req;

  // end the response if sent something other than log, debug, warning, or error
  if (!console.hasOwnProperty(loggerPath)) {
    res.status(404).send('Bad request.');
    return;
  }

  console[loggerPath](`CLIENT ${loggerPath.toUpperCase()} - ${(new Date()).toUTCString()} - ${page_url} - ${page_title} - ${message} - ${user_agent}`);
  res.send('DONE');
});

// controller
app.get(/\w*$/, function(req, res) {
  if (req.path === '/') res.status(302).redirect('/home');
  else res.render(`app/templates${req.path}`, res.locals.model);
});

// basic registration endpoint
app.post('/register', bodyParser.urlencoded({extended: true}), function(req, res) {
  // index user into database and redirect to /login with the userid as a parameter
  res.send(req.body);
});
// \CONTROLLERS

// APP START
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
// \APP START
