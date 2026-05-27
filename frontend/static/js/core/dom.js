(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  const byId = (id) => document.getElementById(id);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  window.TaskFlow.dom = { byId, all };
})();
