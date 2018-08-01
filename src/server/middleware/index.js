const {join} = require('path');
const {readdirSync} = require('fs');

const middleware = readdirSync(__dirname)
  .filter((file) => !file.includes('index') && /\.js$/g.test(file))
  .map((file) => require(join(__dirname, file)));

exports = module.exports = {middleware};
