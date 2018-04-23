# Base Express App

This branch provides an architecture that is a base express app with a straightforward mvp pattern. All pages are rendered server side with handlebars and each page has it's own template in the `views/app/templates` directory. Template names are the then the name of the page path.

## Development

Start the app with `npm start`.

Build the assets with `npx gulp build`.

Watch for changes on the server with `npm run watch`.

Watch for changes in the assets with `npx gulp watch`.

#### Structure

All javascript is transpiled using the `babel-preset-env` babel preset. So you get the latest ES features. JS should go in the `src/main/assets/js`.

All less should be kept in `src/main/assets/less`.

All hbs should placed appropriately in `src/main/assets/views`.

#### Server

Any server related config and code is located in `src/main/server`.
