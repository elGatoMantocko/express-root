const {readdir, readFile} = require('fs').promises;
const {join} = require('path');
const helpers = require('@mantocko/handlebars-helpers');

/**
 * Class that builds a handlebars instance
 * @class
 */
class HandlebarsRuntimeBuilder {
  /**
   * Constructor initializes the Handlebars instance and returns self
   * @param {Object} [opts] - options passed to the runtime builder
   * @param {String} [opts.viewsDir] - path for views
   * @param {String} [opts.layoutsContext] - context path for layouts
   * @param {String} [opts.partialsContext] - context path for partials
   * @return {HandlebarsRuntimeBuilder} - self
   */
  constructor(opts = {}) {
    const viewsDir = opts.viewsDir || join('src', 'main', 'assets', 'views');
    const layoutsContext = opts.layoutsContext || 'layouts';
    const partialsContext = opts.partialsContext || join('app', 'partials');

    // paths for layouts
    this.viewsDir = viewsDir;
    this.layoutsDir = join(this.viewsDir, layoutsContext);
    this.partialsDir = join(this.viewsDir, partialsContext);

    this.hbs = require('handlebars');
    return this;
  }

  /**
   * Build the default set of hbs options for our apps
   * @param {Object} [options] - Params to allow disabling of settings
   * @param {Boolean} [options.includeLayouts=true] - Keep layouts on or off the shelves
   * @param {Boolean} [options.includeHelpers=true] - Keep helpers on or off the shelves
   * @param {Boolean} [options.includePartials=true] - Keep partials on or off the shelves
   * @return {Promise} - Promise that resolves to the hbs runtime instance
   */
  async build(options = {
    includeLayouts: true,
    includeHelpers: true,
    includePartials: true,
  }) {
    if (!options.includelayouts) await this.registerDefaultLayouts();
    if (!options.includehelpers) await this.registerDefaultHelpers();
    if (!options.includepartials) await this.registerAppPartials();
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
      layouts = await readdir(this.layoutsDir);
    } catch (dir_err) {
      // if there is an error reading the directory, layouts will reduce to just this.hbs
      console.error(`Could not read directory ${this.layoutsDir}`, new Error(dir_err));
      layouts = [];
    }

    // resolve with a reduce on the Handlebars instance
    return await layouts.reduce(async (hbsP, fileName = '') => {
      // get the layout's name and start getting the file's contents right away
      const layoutName = `layouts/${fileName.replace(/\.hbs$/ig, '')}`;
      let data;

      try {
        data = await readFile(join(this.layoutsDir, fileName));
      } catch (file_err) {
        console.error(`Could not read file ${this.layoutsDir}/${fileName}`, new Error(file_err));
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
      partials = await readdir(this.partialsDir);
    } catch (dir_err) {
      console.error(`Could not read dir ${this.partialsDir}`, new Error(dir_err));
      partials = [];
    }

    return await partials.reduce(async (hbsP, fileName = '') => {
      // get the partial's name and start getting the file's contents right away
      const partialName = `app/partials/${fileName.replace(/\.hbs$/ig, '')}`;
      let data;

      try {
        data = await readFile(join(this.partialsDir, fileName));
      } catch (file_err) {
        console.error(`Could not read file ${this.partialsDir}/${fileName}`, new Error(file_err));
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
      Object.entries(helpers)
        .forEach(([name, func]) => this.hbs.registerHelper(name, func));
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
module.exports = {HandlebarsRuntimeBuilder};
