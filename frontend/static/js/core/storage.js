(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  function readJson(key, fallback) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      window.localStorage.removeItem(key);
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  window.TaskFlow.storage = { readJson, writeJson };
})();
