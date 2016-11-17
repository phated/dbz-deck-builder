'use strict';

var defaultState = '';

function id(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'load_form':
      return card.id;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = id;