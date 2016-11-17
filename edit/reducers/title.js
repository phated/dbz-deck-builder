'use strict';

var defaultState = '';

function title(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_title':
      return card.title;
    case 'load_form':
      return card.title || card.card_name;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = title;