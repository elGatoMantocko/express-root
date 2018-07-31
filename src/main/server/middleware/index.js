const {join} = require('path');
const {readdirSync} = require('fs');

exports = module.exports = readdirSync(__dirname)
  .filter((file) => !file.includes('index') && /\.js$/g.test(file))
  .map((file) => require(join(__dirname, file)));
