# An example Express app [![Build Status](https://travis-ci.org/elGatoMantocko/express-root.svg?branch=master)](https://travis-ci.org/elGatoMantocko/express-root)

This is a pretty basic webapp that uses [@mantocko/express](https://www.npmjs.com/package/@mantocko/express) to generate an [express](https://www.npmjs.com/package/express) runtime.

# Configuration

It is not required, but this app has a `config.js` file to indicate where js and css bundles, static assets, [mocha](https://www.npmjs.com/package/mocha) tests, server code, and [handlebars](https://www.npmjs.com/package/handlebars) templates are. Also included is a service worker config. The gulp pipeline optionally takes a [workbox service worker](https://developers.google.com/web/tools/workbox/modules/workbox-sw) and bundles it into the distribution directory.

### Bundles

The first requirement of the bundles is to include a `bundleDir` in your `config.js`, however if not provided, it will default to "public".

Bundles as a whole are considered interfaces and should implement a few basic things to be functional. There are three types of bundles `jsBundles`, `cssBundles`, and `staticFiles`. The `config.js` file should export those three properties. However, it is entirely possible that an app could be built without any extra js or css, using only what is bundled in the dependencies ([bootstrap](https://www.npmjs.com/package/bootstrap) and a few others) with some handlebars.

Bundle Property | Type | Description | Default value | Example Value
--- | --- | --- | --- | ---
*name* | `String` | Name of the bundle. This gets transformed into a `<name>.js` file in the context directory. | `undefined` | `'app'`
*src* | `String\|String[]` | The globs/paths for source files in the bundle. | `[]` | `'src/assets/js/file.js'` or `['assets/**/libs/*.js', 'assets/**/presenters/*.js']`
*context* | `String` | Context directory to put the bundle in within the `bundleDir` directory. | `js` for `jsBundles`, `css` for `cssBundles`, `static` for `staticFiles` | `myjs` or `js/special`
*babel* | `Boolean` | JS bundle property to allow babel transpilation on assets. | `true` | `false`
*sourcemaps* | `Boolean` | JS and CSS bundle property to allow sourcemaps in bundle write. Additionally, sourcemaps will only be written if environment variable `DEVEL` is present. | `true` | `false`
*minify* | `Boolean` | JS and CSS bundle property to allow minify of assets. | `true` | `false`

### Development

This project is heavily dependent on [gulp@^4.0.0](https://github.com/gulpjs/gulp/blob/4.0/docs/README.md). You can get a list of top level tasks with `npx gulp --tasks`, but many build tasks are generated on the fly because of how configurable the stack is. For more info check out the [configuration](https://github.com/elGatoMantocko/express-root/tree/master#configuration) section.

The app is ultimately just a node script, so it can be started by running node on the `package.json` main file. This particular app starts up express on port 3000.
