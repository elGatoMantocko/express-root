const Handlebars = require('handlebars');
const requiredHelpers = require('@mantocko/handlebars-helpers');
const {readdirSync, readFileSync} = require('fs');
const {join} = require('path');

const {appName, handlebars: {viewsDir, layoutsContext, partialsContext, helpers = {}}} = require(join(process.cwd() + '/config.js'));

const layoutsDir = join(viewsDir, layoutsContext);
const partialsDir = join(viewsDir, partialsContext);

console.log(layoutsDir, partialsDir);

// get layouts from the layouts directory
let layouts;
try {
  layouts = readdirSync(layoutsDir);
} catch (err) {
  if (err instanceof Error && err.code === 'ENOENT') {
    console.error(`Directory ${layoutsDir} wasn't found. Make sure you have properties {viewsDir, layoutsContext} defined in your config.js file`);
  }
  layouts = [];
} finally {
  layouts.forEach(function(fileName) {
    const data = readFileSync(join(layoutsDir, fileName));
    const layoutName = `layouts/${fileName.replace(/\.hbs$/ig, '')}`;
    if (!data) return;
    Handlebars.registerPartial(layoutName, data.toString());
  });
}

// get partials from the partials directory
let partials;
try {
  partials = readdirSync(partialsDir);
} catch (err) {
  if (err instanceof Error && err.code === 'ENOENT') {
    console.error(`Directory ${partialsDir} wasn't found. Make sure you have properties {viewsDir, partialsContext} defined in your config.js file`);
  }
  partials = [];
} finally {
  partials.forEach(function(fileName) {
    const data = readFileSync(join(partialsDir, fileName));
    const partialName = `${appName}/partials/${fileName.replace(/\.hbs$/ig, '')}`;
    if (!data) return;
    Handlebars.registerPartial(partialName, data.toString());
  });
}

// register all helpers defined in @mantocko/handlebars-helpers. you can add extentions to the required helpers, but can't override them.
Object.assign(helpers, requiredHelpers);
Object.entries(helpers).forEach(function([name, func]) {
  Handlebars.registerHelper(name, func);
});

/**
 * Make this module syncronous so that the runtime can return with a single call
 * module.exports
 */
module.exports = Handlebars;
