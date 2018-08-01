process.env.CHROME_BIN = require('puppeteer').executablePath();
const {jsBundles = []} = require('./config.js');

module.exports = exports = function(config) {
  config.set({
    files: [
      // setup css
      'public/css/deps.css',
      'public/css/styles.css',

      // setup testing environment
      'src/assets/js/unit-tests/helpers/**/*.js',

      // setup defined on page
      'public/js/deps.js',
      'public/js/templates.js',
      ...jsBundles.reduce(function(files, bundle) {
        return files.concat(bundle.src);
      }, []),

      // unit tests
      'src/assets/js/unit-tests/spec/**/*.js',
    ],

    browsers: ['PhantomJS'],
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
