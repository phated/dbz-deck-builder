'use strict';

var yo = require('yo-yo');

function Textarea(props) {
  var id = props.id;
  var label = props.label;
  var value = props.value;
  var onInput = props.onInput || props.oninput;

  return [
    yo`<label for="${id}">${label}:</label>`,
    yo`<textarea id="${id}" name="${id}" oninput=${onInput}>${value}</textarea>`
  ];
}

module.exports = Textarea;