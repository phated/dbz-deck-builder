'use strict';

var pull = require('pull-stream');
var Notify = require('pull-notify');
var through = require('pull-through');

function fork(throughs) {
  var notify = Notify();

  if (!Array.isArray(throughs)) {
    throughs = [throughs];
  }

  throughs.forEach(function(stream) {
    var queue;

    pull(
      notify.listen(),
      pull.map(function(event) {
        queue = event.queue;
        return event.data;
      }),
      stream,
      pull.drain(function(data) {
        if (queue) {
          queue(data);
        }
      }, function() {
        queue = null;
      })
    );
  });

  return through(function(data) {
    notify({ data: data, queue: this.queue });
  }, function() {
    notify.end();
    this.queue(null);
  });
}

module.exports = fork;