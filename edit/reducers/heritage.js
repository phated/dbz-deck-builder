'use strict';

var defaultState = {
  saiyan: false,
  namekian: false
};

function heritage(state, action) {
  state = state || Object.assign({}, defaultState);

  var props = action.payload;

  switch(action.type) {
    case 'update_heritage':
      return Object.assign({}, state, props);
    case 'load_form':
      return Object.assign({}, props.heritage);
    case 'reset_form':
      return Object.assign({}, defaultState);
    default:
      return state;
  }
}

module.exports = heritage;