// express
const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const https = require('https');

// node based requirements
const {readFile, readFileSync, readdirSync} = require('fs');
const {join} = require('path');

// view engine
const Handlebars = require('handlebars');

// app bundles
const bundleDir = join('dist', 'bundle');

// middleware to make life easier
const localeResolver = require('express-locale');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const upload = require('multer')();
const helmet = require('helmet');

// details for logging
const {hostname} = require('os');
const {name: application_name, version: build_version} = require(join(__dirname, '..', '..', '..', 'package.json'));
const build_date = (new Date()).toISOString();
const machine_name = hostname();

// TEMPLATING - TODO move to another file
// details for presenting
const viewsDir = join('src', 'main', 'assets', 'views');
const layoutsDir = join(viewsDir, 'layouts');
const partialsDir = join(viewsDir, 'app', 'partials');

// register the main partials that app templates use
Handlebars.registerPartial('layouts/default', readFileSync(join(layoutsDir, 'default.hbs')).toString());
Handlebars.registerPartial('layouts/header', readFileSync(join(layoutsDir, 'header.hbs')).toString());
Handlebars.registerPartial('layouts/footer', readFileSync(join(layoutsDir, 'footer.hbs')).toString());
readdirSync(partialsDir).forEach((file) => {
  // partials are registered under the app/partials directory the joined by the partial name
  Handlebars.registerPartial(`app/partials/${file.slice(0, -4)}`, readFileSync(join(partialsDir, file)).toString());
});

// #range block helper takes a number n as an arg and renders the block n times
Handlebars.registerHelper('range', function(length, options) {
  return new Handlebars.SafeString(Array.from({length}, (value, index) => {
    return options.fn({length, value}, {data: {index}});
  }).join(''));
});

// json helper to stringify json in the view
Handlebars.registerHelper('json', function(object) {
  return new Handlebars.SafeString(JSON.stringify(object));
});

// app view engine
app.engine('hbs', function(path, opts, cb) {
  try {
    readFile(path, function(err, data) {
      if (err) return cb(err);
      const template = Handlebars.compile(data.toString());
      return cb(null, template(opts));
    });
  } catch (e) {
    console.error(e);
    return cb(null, '');
  }
});

// tell the app about the views and view engine
app.set('views', viewsDir);
app.set('view engine', 'hbs');
// \TEMPLATING

// MIDDLEWARE - TODO move to another file
app.use(localeResolver({
  priority: ['query', 'accept-language', 'cookie', 'default'],
  default: 'en_US',
}));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
app.post('/logger/:loggerPath', upload.array(), function(req, res) {
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
  // build the model skeleton
  const model = {
    App: {
      Models: {},
      Presenters: {},
      libs: {},
    },
  };

  if (req.path === '/') res.status(302).redirect('/home');
  else res.render(`app/templates${req.path}`, model);
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
