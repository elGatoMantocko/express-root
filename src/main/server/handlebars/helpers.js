const hbs = require('handlebars');

/**
 * @param {Object} opts - Handlebars options object
 * @param {Object} opts.hash - Options passed to the helper
 * @param {String} [opts.hash.contextPath=/css] - Context path for link src
 * @param {String} opts.hash.bundleName - Name of bundle that comes before .css extention
 * @return {SafeString} - Handlebars safestring with link stylesheet tag
 */
function includeCssBundle(opts = {}) {
  const {contextPath = '/css', bundleName} = opts.hash;
  return new hbs.SafeString(
    `<link rel="stylesheet" href="${contextPath}/${bundleName}.css">`
  );
}

/**
 * @param {Object} opts - Handlebars options object
 * @param {Object} opts.hash - Options passed to the helper
 * @param {String} [opts.hash.contextPath=/js] - Context path for script src
 * @param {String} opts.hash.bundleName - Name of bundle that comes before .js extention
 * @return {SafeString} - Handlebars safestring with script tag
 */
function includeJsBundle(opts = {}) {
  const {contextPath = '/js', bundleName} = opts.hash;
  return new hbs.SafeString(
    `<script type="text/javascript" src="${contextPath}/${bundleName}.js"></script>`
  );
}

/**
 * @param {Object} object - Object to convert to safestring
 * @return {SafeString} - Handlebars safestring containing the json
 */
function json(object) {
  return new hbs.SafeString(JSON.stringify(object));
}

/**
 * @param {Number} length - number of times to render the block helper
 * @param {Object} opts - Handlebars options object
 * @return {SafeString} - Handlebars safestring rendering the block <length> times
 */
function range(length, opts = {}) {
  return new hbs.SafeString(Array.from({length}, (value, index) => {
    return opts.fn({length, value}, {data: {index}});
  }).join(''));
}

module.exports = {
  includeCssBundle,
  includeJsBundle,
  json,
  range,
};
