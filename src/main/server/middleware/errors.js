const {existsSync, readdirSync} = require('fs');
/**
 * @param {Object} opts - Options passed to the middleware
 * @param {String} opts.errorPath - Path defined for the error template
 * @return {Function} Middleware function
 */
function appErrorHandler(opts = {errorPath: 'app/templates/error.hbs'}) {
  if (!existsSync('src/main/assets/views/' + opts.errorPath)) {
    console.warn('[ERROR HANDLING] You haven\'t set up a error handlebars view!');

    /**
     *  Only calls next because the file for error handling doesn't exist
     * @param {Error} err
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    return function(err, req, res, next) {
      next();
    };
  }

  /**
   * Identifies the error and renders a response
   * @param {Error} err - Error passed by express
   * @param {Object} req - Request object passed by express
   * @param {Object} res - Response object passed by express
   * @param {Function} next - Next function to signal done here
   * @return {Null} - Return if error is null/undefined
   */
  return function(err, req, res, next) {
    if (!err) return next();

    // in case anything goes wrong in this function make sure to log right away
    console.error(err.stack);

    // error conditions
    const is404 = readdirSync('src/main/assets/views/app/templates')
      .some((file) => req.path.indexOf(file.replace(/\.hbs$/, '')));

    // apply error conditions
    err.status = 500;
    if (is404) err.status = 404;

    // this should get logged to the browsers console
    //  which means we need to add extra escaping
    err.message = err.message
      .replace(/\\/g, '\\\\')
      .replace(/\"/g, '\\\"');
    res.status(err.status).render('app/templates/error', Object.assign({err}, res.locals.model));
  };
}

module.exports = exports = {appErrorHandler};
