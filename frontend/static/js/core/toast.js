(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  function show(element, message, options = {}) {
    if (!element) return;
    const duration = options.duration || 2400;
    element.textContent = message;
    element.classList.remove("hidden");
    window.clearTimeout(element.__taskFlowToastTimeout);
    element.__taskFlowToastTimeout = window.setTimeout(() => {
      element.classList.add("hidden");
    }, duration);
  }

  window.TaskFlow.toast = { show };
})();
