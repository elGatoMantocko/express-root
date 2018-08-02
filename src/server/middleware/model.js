/**
 * Middleware function for building the model onto res.locals.model
 * @return {Function} - Middleware function that handles the model
 */
function extendModel() {
  return function(req, res, next) {
    if (res.locals && res.locals.model && res.locals.model.App) {
      Object.assign(res.locals.model.App, {
        Models: {},
        Presenters: {},
        bootstrapped: {
          malicious: [
            '<script>alert("test");</script>',
            '<script>console.log("hello world!");</script>',
          ],
        },
      });
    }

    next();
  };
}

exports = module.exports = extendModel;
