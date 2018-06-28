// gulp
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');

// postcss plugins
const noEmpty = require('postcss-discard-empty');
const noComments = require('postcss-discard-comments');
const px2rem = require('postcss-pxtorem');
const nesting = require('postcss-nesting');
const customProps = require('postcss-custom-properties');
const autoprefixer = require('autoprefixer');

const workboxBuild = require('workbox-build');
const {normalize} = require('upath');
const serviceWorkerConfig = {
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
const {JS_FILES, CSS_FILES} = require('./buildtools/paths.js');

// src locations
const ASSETS_DIR = 'src/main/assets/';
const CLIENT_JS_SRC = ASSETS_DIR + 'js/';
const CLIENT_HBS_SRC = ASSETS_DIR + 'views/**/partials/';
const CLIENT_CSS_SRC = ASSETS_DIR + 'css/';
const CLIENT_STATIC_FILES = ASSETS_DIR + 'static/';

// bundle directory
const BUNDLE_DEST = 'public/';

gulp.task(function clean(done) {
  return del(['public'], done);
});

gulp.task(function lintJs() {
  return gulp.src(JS_FILES.map((file) => CLIENT_JS_SRC + file))
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task(function lintCss() {
  return gulp.src(CSS_FILES.map((file) => CLIENT_CSS_SRC + file))
    .pipe(plugins.stylelint({
      reporters: [
        {formatter: 'string', console: true},
      ],
    }));
});

gulp.task('lint', gulp.series('lintJs', 'lintCss'));

gulp.task(function bundleStatic() {
  return gulp.src(CLIENT_STATIC_FILES + '**/*')
    .pipe(plugins.rename({dirname: ''})) // How is this not a OOTB gulp feature??
    .pipe(gulp.dest(BUNDLE_DEST + 'static/'))
    .pipe(plugins.livereload());
});

gulp.task(function bundleJs() {
  return gulp.src(JS_FILES.map((file) => CLIENT_JS_SRC + file))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({presets: ['env']}))
    .pipe(plugins.wrap(';(function(){"use strict"; <%= contents %> })();'))
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.uglify())
    .pipe(process.env.DEVEL ? plugins.sourcemaps.write() : plugins.noop())
    .pipe(gulp.dest(BUNDLE_DEST + 'js/'))
    .pipe(plugins.livereload());
});

gulp.task(function bundleJsDeps() {
  return gulp.src(JS_DEPS)
    .pipe(plugins.stripComments())
    .pipe(plugins.concat('deps.js'))
    .pipe(gulp.dest(BUNDLE_DEST + 'js/'));
});

gulp.task(function bundleCss() {
  return gulp.src(CSS_FILES.map((file) => CLIENT_CSS_SRC + file))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('styles.css'))
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
    .pipe(process.env.DEVEL ? plugins.sourcemaps.write() : plugins.noop())
    .pipe(gulp.dest(BUNDLE_DEST + 'css/'))
    .pipe(plugins.livereload());
});

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
  return gulp.src(CLIENT_HBS_SRC + '**/*.hbs')
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
  function bundleWorkbox() {
    return gulp.src(WORKBOX_SW)
      .pipe(plugins.stripComments())
      .pipe(gulp.dest(BUNDLE_DEST + 'js/'));
  },

  function buildSwPrecache() {
    return workboxBuild.injectManifest(serviceWorkerConfig)
      .then(({count, size, warnings}) => {
        warnings.forEach(console.warn);
        console.log(`${count} files will be precached, totaling ${size} bytes.`);
      });
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

gulp.task('watch', gulp.parallel('build', function() {
  plugins.livereload.listen();
  const watchers = [];

  // watch js, css, hbs, and static
  watchers.push(gulp.watch(CLIENT_JS_SRC + '**/*.js', gulp.parallel('bundleJs')));
  watchers.push(gulp.watch(CLIENT_HBS_SRC + '**/*.hbs', gulp.parallel('bundleHbs')));
  watchers.push(gulp.watch(CLIENT_CSS_SRC + '**/*.css', gulp.parallel('bundleCss')));
  watchers.push(gulp.watch(CLIENT_STATIC_FILES + '**/*', gulp.parallel('bundleStatic')));
  watchers.push(gulp.watch(serviceWorkerConfig.swSrc, gulp.parallel('bundleSw')));

  watchers.forEach((watcher) => {
    watcher.on('change', function(path, stats) {
      console.log(`File ${path} was changed`);
    });
  });
}));
