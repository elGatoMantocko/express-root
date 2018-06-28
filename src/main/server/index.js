// express
const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const https = require('https');

// node based requirements
const {readFileSync} = require('fs');
const {join, sep} = require('path');

// view engine
const {HandlebarsBuilder} = require('./handlebars/index.js');
const engines = require('consolidate');

// utils
const {readdirRecursiveSync} = require('./utils/fs-utils.js');

// app bundles
const bundleDir = 'public';

// middleware to make life easier
const {commonModelProvider} = require('./middleware/model.js');
const {appErrorHandler} = require('./middleware/errors.js');
const session = require('express-session');
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

// get the handlebars runtime and assign it to consolidate
const hbsRuntimeBuilder = new HandlebarsBuilder();
hbsRuntimeBuilder.build() // resolves to hbs runtime
  .then((hbs) => engines.requires.handlebars = hbs)
  .catch((err) => engines.requires.handlebars = require('handlebars'))
  .finally(() => {
    // tell the app about the views and view engine
    app.locals.cache = true;
    app.engine('hbs', engines.handlebars);
    app.set('views', viewsDir);
    app.set('view engine', 'hbs');
  });
// \TEMPLATING

// MIDDLEWARE - TODO move to another file
app.use(localeResolver({
  priority: ['query', 'accept-language', 'cookie', 'default'],
  default: 'en_US',
}));
app.use(session({
  cookie: {maxAge: 60000},
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat',
}));
app.use(commonModelProvider());
app.use(helmet());
app.use(cookieParser());

// log incoming requests
app.use(async function(req, res, next) {
  const {originalUrl, method, ip, protocol} = req;
  console.log(`INFO - ${(new Date()).toUTCString()} - ${method} - ${originalUrl} - ${ip} - ${protocol}`);
  next();
});

// static assets
app.use(express.static(bundleDir));
app.use('/favicon.ico', express.static(join(bundleDir, 'static', 'favicon.ico')));
app.use('/manifest.json', express.static(join(bundleDir, 'static', 'manifest.json')));
app.use('/robots.txt', express.static(join(bundleDir, 'static', 'robots.txt')));
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
const views = readdirRecursiveSync(join(viewsDir, 'app', 'templates'))
  // .split.join is a hacky way to avoid escaping regex control
  .map((file) => '/' + file.split(sep).join('/').replace(/\.hbs$/g, ''))
  // add '/' base route for redirecting purposes
  .concat('/');

app.get(views, function(req, res) {
  if (req.path === '/') res.redirect('/home');
  else res.render(`app/templates${req.path}`, res.locals.model);
});

// basic registration endpoint
app.post('/register', bodyParser.urlencoded({extended: true}), function(req, res) {
  // index user into database and redirect to /login with the userid as a parameter
  res.send(req.body);
});
// \CONTROLLERS

// Request error handling
app.use(appErrorHandler());

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
