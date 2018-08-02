const {jsBundles = []} = require('./config.js');
module.exports = exports = function(config) {
  config.set({
    files: [
      // setup css
      'public/css/deps.css', 'public/css/styles.css',

      // setup testing environment
      'test/assets/helpers/**/*.js',

      // setup defined on page
      'public/js/deps.js', 'public/js/templates.js',

      // include defined js bundle src
      ...jsBundles.reduce((files, bundle) => files.concat(bundle.src), []),

      // unit tests
      'test/assets/spec/**/*.js',
    ],

    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'chai'],

    // test reporters
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [{type: 'text'}],
    },

    // test src preprocessors
    preprocessors: {
      '**/js/libs/**/*.js': ['babel', 'sourcemap', 'coverage'],
      '**/js/presenters/**/*.js': ['babel', 'sourcemap', 'coverage'],
    },
    babelPreprocessor: {
      options: {sourceMap: 'inline'},
      sourceFileName: (file) => file.originalPath,
    },

    proxies: {'/sw.js': 'public/sw.js'},

    singleRun: true,
    autoWatch: true,
  });
};
