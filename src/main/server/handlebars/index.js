// if this file gets too big, split into respective functions
const {readdir, readFile} = require('fs').promises;
const {join} = require('path');

// paths for layouts
const viewsDir = join('src', 'main', 'assets', 'views');
const layoutsDir = join(viewsDir, 'layouts');
const partialsDir = join(viewsDir, 'app', 'partials');

/**
 * Registers the default set of partials for the application
 * @param {Object} Handlebars - Handlebars runtime instance
 * @return {Promise} - Resolves to the handlebars runtime
 */
async function registerDefaultLayouts(Handlebars) {
  try {
    const layouts = await readdir(layoutsDir);

    return layouts.reduce(async function(hbsP, fileName = '') {
      // get the layout's name and start getting the file's contents right away
      const layoutName = `layouts/${fileName.replace(/\.hbs$/ig, '')}`;
      const data = await readFile(join(layoutsDir, fileName));

      // need to wait for the promise to be resolved
      const hbs = await hbsP;
      hbs.registerPartial(layoutName, data.toString());
      return hbs;
    }, Promise.resolve(Handlebars));
  } catch (error) {
    console.error(new Error(error));
  }
}

/**
 * Registers a default set of helpers for the application
 * @param {Object} Handlebars - Handlebars runtime instance
 * @return {Promise} - Resolves to the handlebars runtime
 */
async function registerAppPartials(Handlebars) {
  try {
    const partials = await readdir(partialsDir);

    return partials.reduce(async function(hbsP, fileName = '') {
      // get the layout's name and start getting the file's contents right away
      const layoutName = `app/partials/${fileName.replace(/\.hbs$/ig, '')}`;
      const data = await readFile(join(partialsDir, fileName));

      // need to wait for the promise to be resolved
      const hbs = await hbsP;
      hbs.registerPartial(layoutName, data.toString());
      return hbs;
    }, Promise.resolve(Handlebars));
  } catch (error) {
    console.error(new Error(error));
  }
};

/**
 * Registers our default set of handlebars helpers
 * @param {Object} Handlebars - Handlebars runtime instance
 * @return {Promise} - Resolves to handlebars runtime
 */
async function registerDefaultHelpers(Handlebars) {
  try {
    // #range block helper takes a number n as an arg and renders the block n times
    Handlebars.registerHelper('range', function(length, options) {
      return new Handlebars.SafeString(Array.from({length}, (value, index) => {
        return options.fn({length, value}, {data: {index}});
      }).join(''));
    });

    // json helper to stringify json in the view
    Handlebars.registerHelper('json', function(object) {
      return new Handlebars.SafeString(JSON.stringify(object));
    });

    Handlebars.registerHelper('includeJsBundle', function(options = {}) {
      const {contextPath = '/assets', bundleName} = options.hash;
      return new Handlebars.SafeString(
        `<script type="text/javascript" src="${contextPath}/${bundleName}.js"></script>`
      );
    });

    Handlebars.registerHelper('includeCssBundle', function(options = {}) {
      const {contextPath = '/assets', bundleName} = options.hash;
      return new Handlebars.SafeString(
        `<link rel="stylesheet" href="${contextPath}/${bundleName}.css">`
      );
    });
  } catch (error) {
    console.error(new Error(error));
  } finally {
    return Handlebars;
  }
}

module.exports = {registerAppPartials, registerDefaultHelpers, registerDefaultLayouts};
