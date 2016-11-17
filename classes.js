'use strict';

var csjs = require('csjs-inject');

var black = '#303030';
var gray = '#808080';
var lightgray = '#d3d3d3';
var navbarHeight = '50px';

var classes = csjs`
  body {
    display: block;
    margin: 0;
  }

  .navbar {
    box-sizing: border-box;
    padding: 10px 8px 5px;
    background: ${black};
    height: ${navbarHeight};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: 0 -10px 10px 10px ${gray};
    color: #fff;
    font-size: 20px;
    line-height: 25px;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .dotbar {
    width: 100%;
    height: 10px;
    line-height: 10px;
    font-size: 35px;
    color: #989898;
  }

  .dotSelected {
    color: white;
  }

  .paneRoot {
    overflow: hidden;
  }

  .paneContainer {
    display: flex;
    will-change: transform;
    transform: translate3d(0%, 0, 0);
    padding-top: ${navbarHeight};
    height: 100vh;
    box-sizing: border-box;
  }

  .pane {
    width: 100%;
    flex-shrink: 0;
    overflow: auto;
    align-self: flex-start;
    height: 100%;
    padding: 0 8px;
    box-sizing: border-box;
  }

  .preventScroll {
    overflow: hidden;
  }

  .listItem {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    min-height: 70px;
    border-bottom: 1px solid ${lightgray};
  }

  .cardThumbnail {
    border-radius: 3px;
    max-width: 100%;
    max-height: 53px;
  }

  .cardDetails {
    padding: 0 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    transition: max-height 2s;
  }

  .moreDetails {
    padding-bottom: 5px;
  }

  .cardTitle {
    flex-grow: 1;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .cardDetailLine {
    margin-bottom: 5px;
    white-space: pre-wrap;
  }

  .cardCounts {
    display: flex;
    justify-content: space-between;
  }

  .addToDeckButton,
  .removeFromDeckButton {
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: 50% 50%;
    background-position: center;
    border: 0;
    border-left: 1px solid ${lightgray};
    width: 50px;
    outline: none;
    flex-shrink: 0;
  }

  .addToDeckButton {
    background-image: url(https://rawgit.com/driftyco/ionicons/master/src/plus-round.svg);
  }

  .removeFromDeckButton {
    background-image: url(https://rawgit.com/driftyco/ionicons/master/src/minus-round.svg)
  }

  .deckInfo {
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 10px;
    background: ${black};
    color: #fff;
    border-top-right-radius: 10px;
    z-index: 10;
    // box-shadow: 0 10px 10px 10px ${gray};
  }

  .animate {
    transition: transform .3s;
  }

  /* From h5bp */
  .visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }
`;

module.exports = classes;