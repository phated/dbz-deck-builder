'use strict';

var defaultState = '';

function card_number(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_card_number':
      return card.card_number;
    case 'load_form':
      return card.card_number;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = card_number;