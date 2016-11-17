'use strict';

var yo = require('yo-yo');

function Select(props) {
  var id = props.id;
  var label = props.label;
  var value = props.value;
  var options = props.options;
  var onChange = props.onChange;

  var opts = options.map(function(option){
    if (option === value) {
      return yo`<option value=${option} selected>${option}</option>`;
    }

    return yo`<option value=${option}>${option}</option>`
  });
  return [
    yo`<label for="${id}">${label}:</label>`,
    yo`<select id="${id}" name="${id}" onchange=${onChange} value=${value}>${opts}</select>`
  ];
}

module.exports = Select;