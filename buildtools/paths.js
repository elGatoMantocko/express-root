const {join} = require('path');

module.exports = {
  JS_FILES: [
    // all js files in one include
    join('**', '*.js'),
  ],
  LESS_FILES: [
    // all less files in one include
    join('**', '*.less'),
  ],
};
