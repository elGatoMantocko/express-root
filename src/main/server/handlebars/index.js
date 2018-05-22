const {readdir, readFile} = require('fs').promises;
const {join} = require('path');

// paths for layouts
const VIEWS_DIR = join('src', 'main', 'assets', 'views');
const LAYOUTS_DIR = join(VIEWS_DIR, 'layouts');
const PARTIALS_DIR = join(VIEWS_DIR, 'app', 'partials');

/**
 * Class that builds a handlebars instance
 * @class
 */
class HandlebarsBuilder {
  /**
   * Constructor initializes the Handlebars instance and returns self
   * @return {HandlebarsBuilder} - self
   */
  constructor() {
    this.hbs = require('handlebars');
    return this;
  }

  /**
   * Build the default set of hbs options for our apps
   * @param {Object} options - Params to allow disabling of settings
   * @return {Promise} - Promise that resolves to the hbs runtime instance
   */
  async build(options = {}) {
    if (!options.layouts) await this.registerDefaultLayouts();
    if (!options.helpers) await this.registerDefaultHelpers();
    if (!options.partials) await this.registerAppPartials();
    return this.hbs;
  }

  /**
   * Registers the default set of partials for the application
   * @return {Promise} - Resolves to the handlebars runtime
   */
  async registerDefaultLayouts() {
    let layouts;

    // get layouts from the layouts directory
    try {
      layouts = await readdir(LAYOUTS_DIR);
    } catch (dir_err) {
      // if there is an error reading the directory, layouts will reduce to just this.hbs
      console.error(`Could not read directory ${LAYOUTS_DIR}`, new Error(dir_err));
      layouts = [];
    }

    // resolve with a reduce on the Handlebars instance
    return await layouts.reduce(async function(hbsP, fileName = '') {
      // get the layout's name and start getting the file's contents right away
      const layoutName = `layouts/${fileName.replace(/\.hbs$/ig, '')}`;
      let data;

      try {
        data = await readFile(join(LAYOUTS_DIR, fileName));
      } catch (file_err) {
        console.error(`Could not read file ${LAYOUTS_DIR}/${fileName}`, new Error(file_err));
        data = '';
      } finally {
        // need to wait for the promise to be resolved
        const hbs = await hbsP;
        hbs.registerPartial(layoutName, data.toString());
        return hbs;
      }
    }, Promise.resolve(this.hbs));
  }

  /**
   * Registers a default set of helpers for the application
   * @return {Promise} - Resolves to the handlebars runtime
   */
  async registerAppPartials() {
    let partials;

    // get partials from the partials directory
    try {
      partials = await readdir(PARTIALS_DIR);
    } catch (dir_err) {
      console.error(`Could not read dir ${PARTIALS_DIR}`, new Error(dir_err));
      partials = [];
    }

    return await partials.reduce(async function(hbsP, fileName = '') {
      // get the partial's name and start getting the file's contents right away
      const partialName = `app/partials/${fileName.replace(/\.hbs$/ig, '')}`;
      let data;

      try {
        data = await readFile(join(PARTIALS_DIR, fileName));
      } catch (file_err) {
        console.error(`Could not read file ${PARTIALS_DIR}/${fileName}`, new Error(file_err));
        data = '';
      } finally {
        // need to wait for the promise to be resolved
        const hbs = await hbsP;
        hbs.registerPartial(partialName, data.toString());
        return hbs;
      }
    }, Promise.resolve(this.hbs));
  }

  /**
   * Registers our default set of handlebars helpers
   * @return {Promise} - Resolves to handlebars runtime
   */
  async registerDefaultHelpers() {
    try {
      // #range block helper takes a number n as an arg and renders the block n times
      this.hbs.registerHelper('range', (length, options) => {
        return new this.hbs.SafeString(Array.from({length}, (value, index) => {
          return options.fn({length, value}, {data: {index}});
        }).join(''));
      });

      // json helper to stringify json in the view
      this.hbs.registerHelper('json', (object) => {
        return new this.hbs.SafeString(JSON.stringify(object));
      });

      this.hbs.registerHelper('includeJsBundle', (options = {}) => {
        const {contextPath = '/assets', bundleName} = options.hash;
        return new this.hbs.SafeString(
          `<script type="text/javascript" src="${contextPath}/${bundleName}.js"></script>`
        );
      });

      this.hbs.registerHelper('includeCssBundle', (options = {}) => {
        const {contextPath = '/assets', bundleName} = options.hash;
        return new this.hbs.SafeString(
          `<link rel="stylesheet" href="${contextPath}/${bundleName}.css">`
        );
      });
    } catch (error) {
      console.error(new Error(error));
    } finally {
      return this.hbs;
    }
  }
}

/**
 * module.exports
 */
module.exports = {HandlebarsBuilder};
