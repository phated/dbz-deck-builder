'use strict';

var defaultState = '';

function limit(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_limit':
      return card.limit;
    case 'load_form':
      return card.limit;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = limit;