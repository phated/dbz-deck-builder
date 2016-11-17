'use strict';

var defaultState = '';

function ability(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_ability':
      return card.ability;
    case 'load_form':
      return card.ability;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = ability;