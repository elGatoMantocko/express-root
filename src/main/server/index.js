// express
const express = require('express');
const app = express();

// view engine
const Handlebars = require('handlebars');

// middleware to make life easier
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const upload = require('multer')();

// node based requirements
const {readFile, readFileSync, readdirSync} = require('fs');
const {join} = require('path');
const {hostname} = require('os');

// details for presenting
const viewsDir = join('src', 'main', 'assets', 'views');
const layoutsDir = join(viewsDir, 'layouts');
const partialsDir = join(viewsDir, 'app', 'partials');
const bundleDir = join('dist', 'bundle');

// details for logging
const {name: application_name, version: build_version} = require(join(__dirname, '..', '..', '..', 'package.json'));
const build_date = (new Date()).toISOString();
const machine_name = hostname();

// register the main partials that app templates use
Handlebars.registerPartial('layouts/default', readFileSync(join(layoutsDir, 'default.hbs')).toString());
Handlebars.registerPartial('header', readFileSync(join(layoutsDir, 'header.hbs')).toString());
Handlebars.registerPartial('footer', readFileSync(join(layoutsDir, 'footer.hbs')).toString());
readdirSync(partialsDir).forEach((file) => {
  // partials are registered under the app/partials directory the joined by the partial name
  Handlebars.registerPartial(`app/partials/${file.slice(0, -4)}`, readFileSync(join(partialsDir, file)).toString());
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

// helpful middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// log incoming requests
app.use(function(req, res, next) {
  const {originalUrl, body, method, ip, protocol} = req;
  // INFO - declare info to the server
  // time of request
  // request method
  // full path
  // source ip address
  // protocol (should always be https)
  console.log(`INFO - ${(new Date()).toUTCString()} - ${method} - ${originalUrl} - ${ip} - ${protocol} - ${JSON.stringify(body)}`);
  next();
});

// static assets
app.use('/resources', express.static('node_modules'));
app.use('/assets', express.static(bundleDir));

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
app.get(/\/\w*/, function(req, res) {
  if (req.path === '/') res.status(302).redirect('/home');
  else res.render(`app/templates${req.path}`);
});

app.listen(3000);
