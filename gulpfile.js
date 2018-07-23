// gulp
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');
const {join} = require('path'); // only need this for non gulp things

// karma
const {Server} = require('karma');

// postcss plugins
const noEmpty = require('postcss-discard-empty');
const noComments = require('postcss-discard-comments');
const px2rem = require('postcss-pxtorem');
const nesting = require('postcss-nesting');
const customProps = require('postcss-custom-properties');
const autoprefixer = require('autoprefixer');

// app defined config
const config = require('./config.js');

const workboxBuild = require('workbox-build');
const {normalize} = require('upath');

const JS_DEPS = [
  'node_modules/handlebars/dist/handlebars.runtime.min.js',
  'node_modules/tether/dist/js/tether.min.js',
  'node_modules/jquery/dist/jquery.slim.min.js',
  'node_modules/babel-polyfill/dist/polyfill.min.js',
  'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  'node_modules/dayjs/dayjs.min.js',
];
const CSS_DEPS = [
  'node_modules/font-awesome/css/font-awesome.min.css',
  'node_modules/bootstrap/dist/css/bootstrap.min.css',
];
const WORKBOX_SW = 'node_modules/workbox-sw/build/workbox-sw.js';
const FONTS = 'node_modules/font-awesome/fonts/*';

// bundle directory
const BUNDLE_DEST = 'public/';

gulp.task(function clean(done) {
  return del(['public'], done);
});

gulp.task('lintJs', gulp.parallel(...config.jsBundles.map(function(bundle) {
  const {name, src} = bundle;
  return Object.defineProperty(function() {
    return gulp.src(src)
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format());
  }, 'name', {value: name + '_js_lint'});
})));

gulp.task('lintCss', gulp.parallel(...config.cssBundles.map(function(bundle) {
  const {name, src} = bundle;
  return Object.defineProperty(function() {
    return gulp.src(src)
      .pipe(plugins.stylelint({
        reporters: [
          {formatter: 'string', console: true},
        ],
      }));
  }, 'name', {value: name + '_css_lint'});
})));

gulp.task('lint', gulp.series('lintJs', 'lintCss'));

gulp.task('bundleStatic', gulp.parallel(...config.staticFiles.map(function(bundle) {
  const {context = 'static', src} = bundle;
  return Object.defineProperty(function() {
    return gulp.src(src)
      .pipe(plugins.rename({dirname: ''})) // How is this not a OOTB gulp feature??
      .pipe(gulp.dest(BUNDLE_DEST + `${context}/`))
      .pipe(plugins.livereload());
  }, 'name', {value: context + '_static_bundle'});
})));

gulp.task('bundleJs', gulp.parallel(...config.jsBundles.map(function(bundle = {}) {
  const {name, context = 'js', src, babel = true, sourcemaps = true, uglify = true} = bundle;
  // we only do this so the console can be more verbose about the task
  return Object.defineProperty(function() {
    return gulp.src(src)
      .pipe(sourcemaps ? plugins.sourcemaps.init() : plugins.noop())
      .pipe(babel ? plugins.babel({presets: ['env']}) : plugins.noop())
      .pipe(plugins.wrap(';(function(){"use strict"; <%= contents %> })();'))
      .pipe(plugins.concat(`${name}.js`))
      .pipe(uglify ? plugins.uglify() : plugins.noop())
      .pipe(process.env.DEVEL && sourcemaps ? plugins.sourcemaps.write() : plugins.noop())
      .pipe(gulp.dest(BUNDLE_DEST + `${context}/`))
      .pipe(plugins.livereload());
  }, 'name', {value: name + '_js_bundle'});
})));

gulp.task(function bundleJsDeps() {
  return gulp.src(JS_DEPS)
    .pipe(plugins.stripComments())
    .pipe(plugins.concat('deps.js'))
    .pipe(gulp.dest(BUNDLE_DEST + 'js/'));
});

gulp.task('bundleCss', gulp.parallel(...config.cssBundles.map(function(bundle = {}) {
  const {name, context = 'css', src, sourcemaps = true} = bundle;
  // we only do this so the console can be more verbose about the task
  return Object.defineProperty(function() {
    return gulp.src(src)
    .pipe(sourcemaps ? plugins.sourcemaps.init() : plugins.noop())
    .pipe(plugins.concat(`${name}.css`))
    .pipe(plugins.postcss([
      px2rem({
        rootValue: 16,
        unitPrecision: 2,
        minPixelValue: 4,
        propList: ['--*', 'padding*', 'margin*', 'border*', 'font', 'font-size', 'letter-spacing'],
      }),
      noComments(),
      noEmpty(),
      nesting(),
      customProps({preserve: 'computed'}),
      autoprefixer({browsers: ['extends browserslist-config-google']}),
    ]))
    .pipe(plugins.uglifycss())
    .pipe(process.env.DEVEL && sourcemaps ? plugins.sourcemaps.write() : plugins.noop())
    .pipe(gulp.dest(BUNDLE_DEST + `${context}/`))
    .pipe(plugins.livereload());
  }, 'name', {value: name + '_css_bundle'});
})));

gulp.task(function bundleCssDeps() {
  return gulp.src(CSS_DEPS)
    .pipe(plugins.concat('deps.css'))
    .pipe(plugins.stripCssComments())
    .pipe(gulp.dest(BUNDLE_DEST + 'css/'));
});

gulp.task(function bundleFonts() {
  return gulp.src(FONTS).pipe(gulp.dest(BUNDLE_DEST + '/fonts'));
});

gulp.task(function bundleHbs() {
  const processPartialName = (file) => normalize(file.relative.replace(/\.\w+$/, ''));
  const {viewsDir, partialsContext} = config.handlebars;
  const partials = join(viewsDir, partialsContext);
  return gulp.src(partials + '**/*.hbs')
    .pipe(plugins.handlebars({handlebars: require('handlebars')}))
    .pipe(plugins.wrap('Handlebars.registerPartial(\'<%= processPartialName(file) %>\', Handlebars.template(<%= contents %>));', {}, {
      imports: {processPartialName},
    }))
    .pipe(plugins.concat('templates.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(BUNDLE_DEST + 'js/'))
    .pipe(plugins.livereload());
});

gulp.task('bundleSw', gulp.series(
  function bundleWorkbox(done) {
    const {serviceWorker = {}} = config;
    if (serviceWorker.swSrc) {
      return gulp.src(WORKBOX_SW)
        .pipe(plugins.stripComments())
        .pipe(gulp.dest(BUNDLE_DEST + 'js/'));
    } else done();
  },

  function buildSwPrecache(done) {
    const {serviceWorker = {}} = config;
    if (serviceWorker.swSrc) {
      return workboxBuild.injectManifest(serviceWorker)
        .then(({count, size, warnings}) => {
          warnings.forEach(console.warn);
          console.log(`${count} files will be precached, totaling ${size} bytes.`);
        });
    } else done();
  },
));

gulp.task('build',
  gulp.series(
    gulp.parallel(
      'bundleJs',
      'bundleCss',
      'bundleHbs',
      'bundleStatic',
      // the following are dependencies from 'node_modules'
      'bundleJsDeps',
      'bundleCssDeps',
      'bundleFonts'
    ),
    'bundleSw',
  )
);

gulp.task(function test(done) {
  new Server({
    configFile: join(__dirname, 'karma.conf.js'),
    browsers: ['ChromeHeadless'],
    singleRun: true,
  }, done).start();
});

gulp.task('watch', gulp.parallel('build', function listen() {
  plugins.livereload.listen();

  // watch js, css, hbs, and static
  const {jsBundles = [], cssBundles = [], serviceWorker = {}, handlebars = {}} = config;
  jsBundles.forEach(function(bundle = {}) {
    gulp.watch(bundle.src, gulp.parallel('bundleJs'));
  });

  cssBundles.forEach(function(bundle) {
    gulp.watch(bundle.src, gulp.parallel('bundleCss'));
  });

  staticFiles.forEach(function(bundle) {
    gulp.watch(bundle.src, gulp.parallel('bundleStatic'));
  });

  const {viewsDir, partialsContext} = handlebars;
  const partials = join(viewsDir, partialsContext);
  gulp.watch(partials + '**/*.hbs', gulp.parallel('bundleHbs'));
  gulp.watch(serviceWorker.swSrc, gulp.parallel('bundleSw'));
}));
