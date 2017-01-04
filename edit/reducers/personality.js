'use strict';

var defaultState = null;

function personality(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_personality':
      return card.personality != null ? card.personality : null;
    case 'load_form':
      return card.personality || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = personality;