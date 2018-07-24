process.env.CHROME_BIN = require('puppeteer').executablePath();
const {JS_FILES} = require('./buildtools/paths.js');
const {join} = require('path');

module.exports = exports = function(config) {
  config.set({
    files: [
      // setup css
      'public/css/deps.css',
      'public/css/styles.css',

      // setup testing environment
      'src/main/assets/js/unit-tests/helpers/**/*.js',

      // setup defined on page
      'public/js/deps.js',
      'public/js/templates.js',
      ...JS_FILES.map((path) => join('src', 'main', 'assets', 'js', path)),

      // unit tests
      'src/main/assets/js/unit-tests/spec/**/*.js',
    ],

    browsers: ['PhantomJS', 'ChromeHeadless'],
    frameworks: ['mocha', 'chai'],

    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        {type: 'text'},
      ],
    },
    preprocessors: {
      '**/js/libs/**/*.js': ['babel', 'sourcemap', 'coverage'],
      '**/js/presenters/**/*.js': ['babel', 'sourcemap', 'coverage'],
    },
    babelPreprocessor: {
      options: {
        sourceMap: 'inline',
      },
      sourceFileName: function(file) {
        return file.originalPath;
      },
    },

    proxies: {
      '/sw.js': 'public/sw.js',
    },

    singleRun: true,
    autoWatch: true,
  });
};
