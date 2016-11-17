'use strict';

var csjs = require('csjs-inject');

var classes = csjs`
  body {
    margin: 0;
  }

  .container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .formContainer {
    width: 100%;
    display: flex;
    align-items: flex-start;
  }

  .list {
    overflow: auto;
  }

  .cardImage {
    margin-top: 10px;
    max-width: 400px;
  }

  .form {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    overflow: auto;
    height: 100%;
  }

  .form label,
  .form input,
  .form textarea {
    display: block;
    min-width: 70%;
  }

  .form input,
  .form textarea,
  .form select {
    margin-bottom: 10px;
  }

  .form textarea {
    min-height: 80px;
  }
`;

module.exports = classes;