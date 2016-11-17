'use strict';

var defaultState = {
    hit: false,
  shuffle: false,
  discard_removal: false,
  when_entering: false,
  search: false,
  draw: false,
  anger_raise: false,
  anger_lower: false
};

function has(state, action) {
  state = state || Object.assign({}, defaultState);

  var props = action.payload;

  switch(action.type) {
    case 'update_has':
      return Object.assign({}, state, props);
    case 'load_form':
      return Object.assign({}, props.has);
    case 'reset_form':
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}

module.exports = has;