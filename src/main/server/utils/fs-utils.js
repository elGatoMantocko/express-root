const {readdirSync, statSync} = require('fs');
const {join} = require('path');

/**
 * Read a directory recursively
 * @param {String} file - Path to directory to read
 * @return {String[]} - Array of paths for all files
 */
function readdirRecursiveSync(file) {
  // return the file if it isn't a directory
  if (!statSync(file).isDirectory()) return [file];

  return readdirSync(file)
    // recursively read all files under directory into the array
    .reduce((memo, subFile) => {
      const path = join(file, subFile);
      const allSubFiles = readdirRecursiveSync(path);
      return memo.concat(allSubFiles);
    }, [])
    // respect the fs api (returns only file paths relative to the dir passed)
    .map((file) => file.replace(/^.*\/app\/templates\//g, ''));
};

module.exports = exports = {
  readdirRecursiveSync,
};
