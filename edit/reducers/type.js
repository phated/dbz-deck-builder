'use strict';

var typeTranslations = require('../mappings').typeTranslations;

var defaultState = 'main_personality';

function type(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_type':
      return card.type;
    case 'load_form':
      return typeTranslations[card.type] || card.type;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = type;