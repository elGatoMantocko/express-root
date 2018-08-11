const {join} = require('path');

// application name and context path
const appName = 'app';

// globs of server code
const serverJs = {
  src: ['src/server/**/*.js'],
  test: ['test/server/**/*.js'],
};

// bundle parent directory
const bundleDir = 'public';

// array of js bundles. files in src are transpiled and concated to <name>.js
const jsBundles = [{
  name: 'app',
  src: [
    'src/assets/js/libs/*.js',
    'src/assets/js/presenters/*.js',
    'src/assets/js/vendors/*.js',
  ],
  test: ['test/assets/spec/**/*.js'],
  testHelpers: ['test/assets/helpers/**/*.js'],
}];

// array of css bundles. files in src are transpiled and concated to <name>.css
const cssBundles = [{
  name: 'styles',
  src: [
    'src/assets/css/app-core.css',
    'src/assets/css/*.css',
  ],
}];

// list of static file bundles. files in src globs are placed in the directory <name>
const staticFiles = [{
  src: ['src/assets/static/**/*'],
}];

// service worker config. omit if not required
const serviceWorker = {
  globDirectory: 'public/',
  globPatterns: [
    'css/*.css',
    'fonts/*.{eot,svg,ttf,woff,woff2,otf}',
    'js/*.js',
    'static/*',
  ],
  globIgnores: [
    '**/node_modules',
    '**/sw.js',
    'js/workbox-sw.js',
  ],
  swDest: 'public/sw.js',
  swSrc: 'src/assets/sw.js',
};

// all handlebars related context info (these paths should be os readable)
const handlebars = {
  // base dir for all hbs views
  viewsDir: join('src', 'assets', 'views'),

  // partials would be included here

  // templates are for "pages" and routes
  templatesContext: join(appName, 'templates'),
};

// export object of configs for gulp and the server to read
module.exports = {
  // paths for server code and views
  serverJs,
  handlebars,

  // path for bundles to go
  bundleDir,

  // bundles
  jsBundles,
  cssBundles,
  staticFiles,

  // service worker config
  serviceWorker,
};
