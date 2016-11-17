'use strict';

var defaultState = ['0', '', '', '', '', '', '', '', '', '', ''];

function stages(state, action) {
  state = state || [].concat(defaultState);

  var card = action.payload;

  switch(action.type) {
    case 'update_stages':
      return card.stages;
    case 'load_form':
      return card.stages || [].concat(defaultState);
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = stages;