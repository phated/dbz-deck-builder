'use strict';

var defaultState = '';

function _rev(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_rev':
      return card._rev;
    case 'load_form':
      return card._rev;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = _rev;