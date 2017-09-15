"use strict";

module.exports = function () {
  return JSON.parse(window.localStorage.ccs || JSON.stringify({}));
};