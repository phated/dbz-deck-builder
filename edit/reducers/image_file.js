'use strict';

var defaultState = null;

function image(state, action) {
  state = state || defaultState;

  var imageFile = action.payload;

  switch(action.type) {
    case 'update_image_file':
      return imageFile;
    case 'load_form':
      return defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = image;