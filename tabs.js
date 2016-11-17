'use strict';

var EventEmitter = require('events').EventEmitter;

var hammer = require('hammerjs');

var classes = require('./classes');

function enablePreventScroll(el) {
  el.classList.add(classes.preventScroll.className);
}

function disablePreventScroll(el) {
  el.classList.remove(classes.preventScroll.className);
}

function attach(container) {

  var ee = new EventEmitter();

  var width = container.clientWidth;
  var panes = Array.prototype.slice.call(container.children);
  var tabIndex = 0;
  var isScrolling = false;

  var gestures = new hammer.Manager(container);
  var pan = new hammer.Pan({ threshold: 10 });
  gestures.add(pan);

  gestures.on('panstart', onPanStart);
  gestures.on('panleft', onPanLeft);
  gestures.on('panright', onPanRight);
  gestures.on('panend pancancel', onPanEnd);

  return ee;

  function show(percent, animate){
    tabIndex = Math.max(0, Math.min(tabIndex, panes.length - 1));
    percent = percent || 0;

    if (animate) {
      container.classList.add(classes.animate.className);
    } else {
      container.classList.remove(classes.animate.className);
    }

    if (Math.abs(percent) <= ((panes.length - 1) * 100)) {
      var translate = 'translate3d(' + percent + '%, 0, 0)';
      container.style.transform = translate;
    }

    console.log(tabIndex, animate);
    ee.emit('tab-shown', tabIndex);
  }

  function onPanStart(evt) {
    if (evt.additionalEvent === 'panup' || evt.additionalEvent === 'pandown') {
      isScrolling = true;
      return;
    }

    if (evt.additionalEvent === 'panleft' || evt.additionalEvent === 'panright') {
      panes.forEach(enablePreventScroll);
      return;
    }
  }

  function onPanLeft(evt) {
    if (isScrolling) {
      return;
    }

    if (tabIndex === 1) {
      return;
    }

    var percent = (100 / width) * evt.deltaX;
    var animate = false;

    show(percent, animate);
  }

  function onPanRight(evt) {
    if (isScrolling) {
      return;
    }

    if (tabIndex === 0) {
      return;
    }

    var percent = ((100 / width) * evt.deltaX) - 100;
    var animate = false;

    show(percent, animate);
  }

  function onPanEnd(evt) {
    if (!isScrolling) {
      var percent = (100 / width) * evt.deltaX;
      var animate = true;

      var threshold = evt.overallVelocity * percent;
      // 7 is an arbitrary number that currently feels "right"
      if (threshold > 7 && evt.type == 'panend') {
        tabIndex += (percent < 0) ? 1 : -1;
        if (tabIndex < 0) {
          tabIndex = 0;
        }
      }

      percent = (tabIndex * -100);

      show(percent, animate);
    }

    panes.forEach(disablePreventScroll);
    isScrolling = false;
  }
}

module.exports = attach;