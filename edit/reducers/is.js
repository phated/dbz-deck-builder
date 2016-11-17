'use strict';

var defaultState = {
  attack: false,
  block: false,
  prevention: false,
  instant: false,
  constant: false
};

function is(state, action) {
  state = state || Object.assign({}, defaultState);

  var props = action.payload;

  switch(action.type) {
    case 'update_is':
      return Object.assign({}, state, props);
    case 'load_form':
      return Object.assign({}, props.is);
    case 'reset_form':
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}

module.exports = is;