'use strict';

var reduce = require('object.reduce');

var setNames = require('../mappings').setNames;

var invertedSetNames = reduce(setNames, function(acc, val, key) {
  acc[val] = key.replace('set', '');
  return acc;
}, {});

var defaultState = '1';

function set_number(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_set':
      return invertedSetNames[card.set] || state;
    case 'update_set_number':
      return card.set_number;
    case 'load_form':
      return card.set_number || card.set.replace('set', '');
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = set_number;