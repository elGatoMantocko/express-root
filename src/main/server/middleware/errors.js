const {existsSync} = require('fs');
const {http_errors} = require('../messages/messages.json');

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

  return [
    // 400 handler
    function(req, res, next) {
      const {status = 404} = res.locals;
      const {displayValue, verboseDisplayValue} = http_errors[status];
      res.status(status).render('app/templates/error', Object.assign({
        error: {status, displayValue, verboseDisplayValue},
      }, res.locals.model));
    },
    // 500 handler
    function({message, stack}, req, res, next) {
      if (!stack) return next();

      // in case anything goes wrong in this function make sure to log right away
      console.error(stack);

      const {displayValue, verboseDisplayValue} = http_errors[500];
      res.status(500).render('app/templates/error', Object.assign({
        error: {status: 500, displayValue, verboseDisplayValue},
      }, res.locals.model));
    },
  ];
}

module.exports = exports = appErrorHandler;
