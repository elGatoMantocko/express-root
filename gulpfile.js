const mkdirp = require('mkdirp');
const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const exec = require('child_process').exec;
const plugins = require('gulp-load-plugins')();
const {JS_FILES, LESS_FILES} = require('./buildtools/paths');

// src locations
const ASSETS_DIR = 'src/main/assets/';
const CLIENT_JS_SRC = ASSETS_DIR + 'js/';
const CLIENT_HBS_SRC = ASSETS_DIR + 'views/';
const CLIENT_LESS_SRC = ASSETS_DIR + 'less/';
const CLIENT_STATIC_FILES = ASSETS_DIR + 'static/';

// bundle directory
const BUNDLE_DEST = 'dist/bundle/';

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(plugins.clean());
});

gulp.task('lint', function() {
  return gulp.src(JS_FILES.map((file) => CLIENT_JS_SRC + file))
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
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

gulp.task('bundleLess', function() {
  return gulp.src(LESS_FILES.map((file) => CLIENT_LESS_SRC + file))
    .pipe(plugins.less())
    .pipe(plugins.postcss([
      autoprefixer({browsers: ['last 1 versions', 'ie 11']}),
    ]))
    .pipe(plugins.concat('styles.css'))
    .pipe(gulp.dest(BUNDLE_DEST))
    .pipe(plugins.livereload());
});

gulp.task('bundleHbs', function(done) {
  // because we don't use gulp here (gulp-handlebars is out of date)
  //  we need to make sure the bundle directory exists
  mkdirp(BUNDLE_DEST, function(err) {
    if (err) done(err);
    // eslint-disable-next-line max-len
    const command = 'node node_modules/handlebars/bin/handlebars --extension hbs ' + CLIENT_HBS_SRC + ' -f ' + BUNDLE_DEST + 'templates.js';
    exec(command, (err) => {
      plugins.livereload();
      done(err);
    });
  });
});

gulp.task('build',
  gulp.parallel(
    gulp.series('lint', 'bundleJs'),
    'bundleLess',
    'bundleHbs',
    'bundleStatic'
  )
);

gulp.task('watch', gulp.parallel('build', function() {
  plugins.livereload.listen();
  const watchers = [];

  // watch js, less, hbs, and static
  watchers.push(gulp.watch(CLIENT_JS_SRC + '**/*.js', gulp.series('lint', 'bundleJs')));
  watchers.push(gulp.watch(CLIENT_HBS_SRC + '**/*.hbs', gulp.parallel('bundleHbs')));
  watchers.push(gulp.watch(CLIENT_LESS_SRC + '**/*.less', gulp.parallel('bundleLess')));
  watchers.push(gulp.watch(CLIENT_STATIC_FILES + '**/*', gulp.parallel('bundleStatic')));

  watchers.forEach((watcher) => {
    watcher.on('change', function(path, stats) {
      console.log(`File ${path} was changed`);
    });
  });
}));
