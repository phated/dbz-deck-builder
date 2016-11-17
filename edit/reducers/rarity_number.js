'use strict';

var reduce = require('object.reduce');

var rarities = require('../mappings').rarities;

var invertedRarities = reduce(rarities, function(acc, val, key) {
  acc[val] = key;
  return acc;
}, {});

var defaultState = '1';

function rarity_number(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_rarity':
      return invertedRarities[card.rarity] || state;
    case 'update_rarity_number':
      return card.rarity_number;
    case 'load_form':
      return card.rarity_number || card.rarity;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = rarity_number;