'use strict';

var rarities = require('../mappings').rarities;

var defaultState = 'Common'

function rarity(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_rarity_number':
      return rarities[card.rarity_number] || state;
    case 'update_rarity':
      return card.rarity;
    case 'load_form':
      return rarities[card.rarity] || card.rarity;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = rarity;