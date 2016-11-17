'use strict';

var setNames = require('../mappings').setNames;

var defaultState = 'Premiere';

function set(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_set_number':
      return setNames[`set${card.set_number}`] || state;
    case 'update_set':
      return card.set;
    case 'load_form':
      return setNames[card.set] || card.set;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = set;