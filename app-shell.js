'use strict';

var yo = require('yo-yo');

var classes = require('./classes');

function appShell(panes) {
  var currentIndex = 0;

  var titles = _.pick(panes, 'title');
  var pane
  panes = [
    {
      title: 'Deck List',
      render: deckListView
    }
  ]
  var paneCount = panes.length;

  var tabTitle = tabs[currentIndex];

  function dotbar(paneCount, selected) {
    var dots = [];
    for (var x = 0; x < paneCount; x++) {
      var dot;
      if (x === selected) {
        dot = yo`<span className="${classes.dotSelected}"></span>`;
      } else {
        dot = yo`<span></span>`;
      }
      dot.innerHTML = '&middot;';
      dots.push(dot);
    }
    var dotbar = yo`<div className="${classes.dotbar}">
      ${dots}
    </div>`;

    return dotbar;
  }

  function render() {
    return yo`<div className=${classes.paneRoot}>
      <nav className="${classes.navbar}">
        <div>${tabTitle}</div>
        ${dotbar()}
      </nav>
      <div className="${classes.paneContainer}">
        ${panes}
      </div>
    </div>`;
  }
}

module.exports = appShell;