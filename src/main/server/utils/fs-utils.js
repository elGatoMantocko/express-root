const {readdirSync, statSync} = require('fs');
const {join, normalize, sep} = require('path');

/**
 * Read a directory recursively
 * @param {String} file - Path to directory to read
 * @param {Boolean} includePath - Check to include or exclude the param's path in results
 * @return {String[]} - Array of paths for all files
 */
function readdirRecursiveSync(file, includePath = false) {
  // return the file if it isn't a directory
  if (!statSync(file).isDirectory()) return [file];

  // recursively read all files under directory into the array
  let files = readdirSync(file).reduce((memo, subFile) => {
    const path = join(file, subFile);
    const allSubFiles = readdirRecursiveSync(path, true);
    return memo.concat(allSubFiles);
  }, []);

  // respect the fs api (returns only file paths relative to the dir passed)
  if (!includePath) {
    files = files.map((f) => f.replace(normalize(file) + sep, ''));
  }

  return files;
};

module.exports = exports = {
  readdirRecursiveSync,
};
