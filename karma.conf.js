const {jsBundles = [], cssBundles = []} = require('./config.js');
module.exports = exports = function(config) {
  config.set({
    files: [
      // setup css
      'public/css/deps.css',
      ...cssBundles.reduce((files, bundle) => files.concat(bundle.src), []),

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
    preprocessors: jsBundles.reduce(function(preprocessors, bundle) {
      const {src = [], babel = true} = bundle;
      src.forEach(function(path) {
        let parserOpts = ['sourcemap', 'coverage'];
        if (babel) parserOpts = ['babel', ...parserOpts];
        Object.assign(preprocessors, {[path]: parserOpts});
      });
      return preprocessors;
    }, {}),
    babelPreprocessor: {
      options: {sourceMap: 'inline'},
      sourceFileName: (file) => file.originalPath,
    },

    proxies: {'/sw.js': 'public/sw.js'},

    singleRun: true,
    autoWatch: true,
  });
};
