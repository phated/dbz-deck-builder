'use strict';

var defaultState = 'non-styled';

function style(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_style':
      return card.style;
    case 'load_form':
      if (card.style === 'namek') {
        return 'namekian';
      }
      return card.style || card.color || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = style;