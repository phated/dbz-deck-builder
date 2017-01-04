'use strict';

var defaultState = null;

function endurance(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_endurance':
      return card.endurance != null && card.endurance !== '' ? card.endurance : defaultState;
    case 'load_form':
      return card.endurance != null && card.endurance !== '0' ? card.endurance : defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = endurance;