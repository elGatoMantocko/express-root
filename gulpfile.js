const {join} = require('path');
const mkdirp = require('mkdirp');
const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const exec = require('child_process').exec;
const plugins = require('gulp-load-plugins')();
const {JS_FILES} = require('./buildtools/paths');

// src locations
const ASSETS_DIR = join('src', 'main', 'assets');
const CLIENT_JS_SRC = join(ASSETS_DIR, 'js');
const CLIENT_HBS_SRC = join(ASSETS_DIR, 'views');
const CLIENT_LESS_SRC = join(ASSETS_DIR, 'less');
const CLIENT_STATIC_FILES = join(ASSETS_DIR, 'static');

// bundle directory
const BUNDLE_DEST = join('dist', 'bundle');

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(plugins.clean());
});

gulp.task('bundleStatic', function() {
  return gulp.src(join(CLIENT_STATIC_FILES, '*'))
    .pipe(gulp.dest(BUNDLE_DEST));
});

gulp.task('bundleJs', function() {
  return gulp.src(JS_FILES.map((file) => join(CLIENT_JS_SRC, '**', file)))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({presets: ['env']}))
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(BUNDLE_DEST));
});

gulp.task('bundleLess', function() {
  return gulp.src(join(CLIENT_LESS_SRC, '*.less'))
    .pipe(plugins.less())
    .pipe(plugins.postcss([
      autoprefixer({browsers: ['last 1 versions', 'ie 11']}),
    ]))
    .pipe(plugins.concat('styles.css'))
    .pipe(gulp.dest(BUNDLE_DEST));
});

gulp.task('bundleHbs', function(done) {
  // because we don't use gulp here (gulp-handlebars is out of date)
  //  we need to make sure the bundle directory exists
  mkdirp(BUNDLE_DEST, function(err) {
    if (err) done(err);
    // eslint-disable-next-line max-len
    let command = 'node node_modules/handlebars/bin/handlebars --extension hbs ' + CLIENT_HBS_SRC + ' -f ' + join(BUNDLE_DEST, 'templates.js');
    exec(command, (err) => done(err));
  });
});

gulp.task('build', ['bundleJs', 'bundleLess', 'bundleHbs', 'bundleStatic']);

gulp.task('watch', function() {
  gulp.watch(join(CLIENT_JS_SRC, '**', '*.js'), ['bundleJs']);
  gulp.watch(join(CLIENT_HBS_SRC, '**', '*.hbs'), ['bundleHbs']);
  gulp.watch(join(CLIENT_LESS_SRC, '*.less'), ['bundleLess']);
  gulp.watch(join(CLIENT_STATIC_FILES, '*'), ['bundleStatic']);
});
