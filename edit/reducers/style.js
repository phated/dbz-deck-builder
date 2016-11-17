'use strict';

var defaultState = 'black';

function style(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_style':
      return card.style;
    case 'load_form':
      return card.style || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = style;