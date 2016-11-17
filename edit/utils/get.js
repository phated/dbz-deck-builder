'use strict';

function get(obj, path) {
  var paths = path.split('.');

  return paths.reduce(function(result, key) {
    if (result === false) {
      return result;
    }

    return result[key] || false;
  }, obj);
}

module.exports = get;