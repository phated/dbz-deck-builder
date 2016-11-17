'use strict';

var defaultState = '';

function _id(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'load_form':
      return card._id;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = _id;