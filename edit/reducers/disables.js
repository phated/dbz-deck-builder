'use strict';

var defaultState = {
  mppv: false
};

function disables(state, action) {
  state = state || Object.assign({}, defaultState);

  var props = action.payload;

  switch(action.type) {
    case 'update_disables':
      return Object.assign({}, state, props);
    case 'load_form':
      return Object.assign({}, props.disables);
    case 'reset_form':
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}

module.exports = disables;