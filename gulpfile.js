const gulp = require('gulp');
const postcssPresetEnv = require('postcss-preset-env');
const {normalize} = require('upath');
const plugins = require('gulp-load-plugins')();
const {JS_FILES, CSS_FILES} = require('./buildtools/paths');

// src locations
const ASSETS_DIR = 'src/main/assets/';
const CLIENT_JS_SRC = ASSETS_DIR + 'js/';
const CLIENT_HBS_SRC = ASSETS_DIR + 'views/';
const CLIENT_CSS_SRC = ASSETS_DIR + 'css/';
const CLIENT_STATIC_FILES = ASSETS_DIR + 'static/';

// bundle directory
const BUNDLE_DEST = 'dist/bundle/';

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(plugins.clean());
});

gulp.task('lintJs', function() {
  return gulp.src(JS_FILES.map((file) => CLIENT_JS_SRC + file))
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('lintCss', function() {
  return gulp.src(CSS_FILES.map((file) => CLIENT_CSS_SRC + file))
    .pipe(plugins.stylelint({
      reporters: [
        {formatter: 'string', console: true},
      ],
    }));
});

gulp.task('bundleStatic', function() {
  return gulp.src(CLIENT_STATIC_FILES + '**/*')
    .pipe(plugins.rename({dirname: ''})) // How is this not a OOTB gulp feature??
    .pipe(gulp.dest(BUNDLE_DEST))
    .pipe(plugins.livereload());
});

gulp.task('bundleJs', function() {
  return gulp.src(JS_FILES.map((file) => CLIENT_JS_SRC + file))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({presets: ['env']}))
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(BUNDLE_DEST))
    .pipe(plugins.livereload());
});

gulp.task('bundleCss', function() {
  return gulp.src(CSS_FILES.map((file) => CLIENT_CSS_SRC + file))
    .pipe(plugins.postcss([
      postcssPresetEnv({
        stage: 0,
        browsers: ['last 2 versions', 'ie 11'],
      }),
    ]))
    .pipe(plugins.concat('styles.css'))
    .pipe(gulp.dest(BUNDLE_DEST))
    .pipe(plugins.livereload());
});

gulp.task('bundleHbs', function(done) {
  const processPartialName = (file) => normalize(file.relative.replace(/\.\w+$/, ''));
  return gulp.src(CLIENT_HBS_SRC + '**/*.hbs')
    .pipe(plugins.handlebars({handlebars: require('handlebars')}))
    .pipe(plugins.wrap('Handlebars.registerPartial(\'<%= processPartialName(file) %>\', Handlebars.template(<%= contents %>));', {}, {
      imports: {processPartialName},
    }))
    .pipe(plugins.concat('templates.js'))
    .pipe(gulp.dest(BUNDLE_DEST))
    .pipe(plugins.livereload());
});

gulp.task('build',
  gulp.parallel(
    gulp.series('lintJs', 'bundleJs'),
    gulp.series('lintCss', 'bundleCss'),
    'bundleHbs',
    'bundleStatic'
  )
);

gulp.task('watch', gulp.parallel('build', function() {
  plugins.livereload.listen();
  const watchers = [];

  // watch js, less, hbs, and static
  watchers.push(gulp.watch(CLIENT_JS_SRC + '**/*.js', gulp.series('lintJs', 'bundleJs')));
  watchers.push(gulp.watch(CLIENT_HBS_SRC + '**/*.hbs', gulp.parallel('bundleHbs')));
  watchers.push(gulp.watch(CLIENT_CSS_SRC + '**/*.css', gulp.series('lintCss', 'bundleCss')));
  watchers.push(gulp.watch(CLIENT_STATIC_FILES + '**/*', gulp.parallel('bundleStatic')));

  watchers.forEach((watcher) => {
    watcher.on('change', function(path, stats) {
      console.log(`File ${path} was changed`);
    });
  });
}));
