'use strict';

var defaultState = '';

function pur(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_pur':
      return card.pur;
    case 'load_form':
      return card.pur || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = pur;