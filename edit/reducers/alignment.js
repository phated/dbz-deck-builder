'use strict';

var defaultState = 'neutral'

function alignment(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_alignment':
      return card.alignment;
    case 'load_form':
      return card.alignment || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = alignment;