const {jsBundles = [], cssBundles = []} = require('./config.js');
module.exports = exports = function(config) {
  config.set({
    files: [
      // setup css
      'public/css/deps.css',
      ...cssBundles.reduce((files, bundle) => files.concat(bundle.src), []),

      // setup defined on page
      'public/js/deps.js', 'public/js/templates.js',

      // include defined js bundle src and helpers
      ...jsBundles.reduce(function(files, bundle) {
        const {src = [], test = [], testHelpers = []} = bundle;
        return files.concat(testHelpers).concat(src).concat(test);
      }, []),
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
      return src.reduce(function(memo, path) {
        let parserOpts = ['sourcemap', 'coverage'];
        if (babel) parserOpts = ['babel', ...parserOpts];
        return Object.assign(memo, {[path]: parserOpts});
      }, preprocessors);
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
