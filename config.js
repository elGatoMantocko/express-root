const {join} = require('path');

// application name and context path
const appName = 'app';
const appSlug = '';

// globs of server code
const serverJs = ['src/main/server/**/*.js'];

// array of js bundles. files in src are transpiled and concated to <name>.js
const jsBundles = [{
  name: 'app',
  src: [
    'src/main/assets/js/libs/*.js',
    'src/main/assets/js/presenters/*.js',
    'src/main/assets/js/vendors/*.js',
  ],
}];

// array of css bundles. files in src are transpiled and concated to <name>.css
const cssBundles = [{
  name: 'styles',
  src: [
    'src/main/assets/css/app-core.css',
    'src/main/assets/css/input.css',
    'src/main/assets/css/carousel.css',
    'src/main/assets/css/*.css',
  ],
}];

// list of static file bundles. files in src globs are placed in the directory <name>
const staticFiles = [{
  context: 'static',
  src: ['src/main/assets/static/**/*'],
}];

// service worker config. omit if not required
const serviceWorker = {
  globDirectory: 'public/',
  globPatterns: [
    'css/*.css',
    'fonts/*.{eot,svg,ttf,woff,woff2,otf}',
    'js/*.js',
    'static/*.{json,txt,ico}',
  ],
  globIgnores: [
    '**/node_modules',
    '**/sw.js',
    'js/workbox-sw.js',
  ],
  swDest: 'public/sw.js',
  swSrc: 'src/main/assets/sw.js',
};

// all handlebars related context info (these paths should be os readable)
const handlebars = {
  viewsDir: join('src', 'main', 'assets', 'views'),
  layoutsContext: 'layouts',
  partialsContext: join('app', 'partials'),
};

// export object of configs for gulp and the server to read
module.exports = {
  appName,
  appSlug,
  serverJs,
  jsBundles,
  cssBundles,
  staticFiles,
  serviceWorker,
  handlebars,
};
