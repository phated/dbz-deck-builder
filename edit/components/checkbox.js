'use strict';

var yo = require('yo-yo');

function Checkbox(props) {
  var id = props.id;
  var label = props.label;
  var checked = props.checked;
  var onChange = props.onChange;

  return [
    yo`<label for="${id}">${label}</label>`,
    yo`<input type="checkbox" id="${id}" name="${id}" checked=${checked} onchange=${onChange} />`
  ];
}

module.exports = Checkbox;