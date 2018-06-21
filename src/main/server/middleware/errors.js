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
   * Checks if an express request object should return a 404
   * @param {Object} req
   * @return {Boolean} - 404 status
   */
  function is404(req) {
    return !readdirSync('src/main/assets/views/app/templates')
      .some(function(file) {
        return req.path.indexOf(file.replace(/\.hbs$/, '')) > -1;
      });
  }

  /**
   * Identifies the error and renders a response
   * @param {Error} err - Error passed by express
   * @param {Object} req - Request object passed by express
   * @param {Object} res - Response object passed by express
   * @param {Function} next - Next function to signal done here
   * @return {Null} - Return if error is null/undefined
   */
  return function({message, stack, status}, req, res, next) {
    if (!stack) return next();

    // in case anything goes wrong in this function make sure to log right away
    console.error(stack);

    // error conditions
    if (is404(req)) {
      status = 404;
    } else {
      status = 500;
    }

    // get display values for the error codes reported
    const {http_errors} = require('../messages/messages.json');
    const {displayValue, verboseDisplayValue} = http_errors[status];

    // this should get logged to the browsers console
    //  which means we need to add extra escaping
    message = message
      .replace(/\\/g, '\\\\')
      .replace(/\"/g, '\\\"');
    const error = {status, message, displayValue, verboseDisplayValue};

    res.status(status).render('app/templates/error', Object.assign({error}, res.locals.model));
  };
}

module.exports = exports = {appErrorHandler};
