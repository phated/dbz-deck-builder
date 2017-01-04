'use strict';

var defaultState = {
  named: false,
  styled: false
};

function considered(state, action) {
  state = state || Object.assign({}, defaultState);

  var props = action.payload;

  switch(action.type) {
    case 'update_considered':
      return Object.assign({}, state, props);
    case 'load_form':
      return Object.assign({}, props.considered);
    case 'reset_form':
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}

module.exports = considered;