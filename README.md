# An example Express app [![Build Status](https://travis-ci.org/elGatoMantocko/express-root.svg?branch=master)](https://travis-ci.org/elGatoMantocko/express-root)

This is a pretty basic webapp that uses [@mantocko/express](https://www.npmjs.com/package/@mantocko/express) to generate an [express](https://www.npmjs.com/package/express) runtime.

It is not required, but this app has a `config.js` file to indicate where js and css bundles, static assets, [mocha](https://www.npmjs.com/package/mocha) tests, server code, and [handlebars](https://www.npmjs.com/package/handlebars) templates are. Also included is a service worker config. The gulp pipeline optionally takes a [workbox service worker](https://developers.google.com/web/tools/workbox/modules/workbox-sw) and bundles it into the distribution directory.

## Bundles

Bundles as a whole are considered interfaces and should implement a few basic things to be functional.

Bundle Property | Type | Description | Default value | Example Value
--- | --- | --- | --- | ---
*name* | `String` | Name of the bundle. This gets transformed into a `<name>.js` file in the context directory. | `undefined` | `'app'`
*src* | `String\|String[]` | The globs/paths for source files in the bundle. | `[]` | `'src/assets/js/file.js'` or `['assets/**/libs/*.js', 'assets/**/presenters/*.js']`
*context* | `String` | Context directory to put the bundle in within the distribution directory. | `js` for `jsBundles`, `css` for `cssBundles`, `static` for `staticFiles` | `myjs` or `js/special`
*babel* | `Boolean` | JS bundle property to allow babel transpilation on assets. | `true` | `false`
*sourcemaps* | `Boolean` | JS and CSS bundle property to allow sourcemaps in bundle write. Additionally, sourcemaps will only be written if environment variable `DEVEL` is present. | `true` | `false`
*minify* | `Boolean` | JS and CSS bundle property to allow minify of assets. | `true` | `false`


## Development

Start the app with `npm start` and access it at [http://localhost:3000](http://localhost:3000).

Build the assets with `npx gulp build`.

Watch for changes on the server with `npm run watch`.

Watch for changes in the assets with `npx gulp watch`.

#### Structure

All javascript is transpiled using the `babel-preset-env` babel preset. So you get the latest ES features. JS should go in the `src/assets/js`.

All css should be kept in `src/assets/css`.

All hbs should placed appropriately in `src/assets/views`.

#### Server

Any server related config and code is located in `src/server`.
