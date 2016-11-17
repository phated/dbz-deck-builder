'use strict';

var defaultState = '';

function level(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_level':
      return card.level;
    case 'load_form':
      return card.level || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = level;