# Base Express App

[![Build Status](https://travis-ci.org/elGatoMantocko/express-root.svg?branch=master)](https://travis-ci.org/elGatoMantocko/express-root)

This branch provides an architecture that is a base express app with a straightforward mvp pattern. All pages are rendered server side with handlebars and each page has it's own template in the `views/app/templates` directory. Template names are the then the name of the page path.

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
