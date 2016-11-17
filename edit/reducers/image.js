'use strict';

var snake = require('snake-case');

var defaultState = '';

var placeholder = '/images/set1/c0_nothing.jpg';

var re = /^\/(.*)\/(.*)\/([^_]*)_([^\.]*)(.*)$/;

function image(state, action) {
  state = state || defaultState;

  var card = action.payload;

  switch(action.type) {
    case 'update_card_number':
      return state.replace(re, `/$1/$2/${snake(card.card_number)}_$4$5`);
    case 'update_title':
      return state.replace(re, `/$1/$2/$3_${snake(card.title)}$5`);
    case 'update_set_number':
      return state.replace(re, `/$1/set${card.set_number}/$3_$4$5`);
    case 'update_image_file':
      return placeholder;
    case 'update_image':
      return card.image;
    case 'load_form':
      return card.image || defaultState;
    case 'reset_form':
      return defaultState;
    default:
      return state;
  }
}

module.exports = image;