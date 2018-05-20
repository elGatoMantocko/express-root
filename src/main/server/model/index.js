// TODO: figure out how to make this extendable. Wrap in class?
/**
 * Function that builds the model sent to the client
 *  making async for future proof reasons
 * @return {Promise} - Promise resolving to the model or rejecting an error
 * @async
 */
async function getModel() {
  return {
    App: {
      Models: {},
      Presenters: {},
      libs: {},
    },
  };
};

/**
 * Middleware function for building the model onto res.locals.model
 * @return {Function} - Middleware function that handles the model
 */
function commonModelProvider() {
  return async function(req, res, next) {
    res.locals.model = await getModel().catch((err) => console.error(err));
    next();
  };
}

module.exports = {commonModelProvider};
