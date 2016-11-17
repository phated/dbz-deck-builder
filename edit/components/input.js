'use strict';

var yo = require('yo-yo');

function Input(props) {
  var id = props.id;
  var label = props.label;
  var value = props.value;
  var onInput = props.onInput || props.oninput;

  return [
    yo`<label for="${id}">${label}:</label>`,
    yo`<input id="${id}" name="${id}" value=${value} oninput=${onInput} />`
  ];
}

module.exports = Input;