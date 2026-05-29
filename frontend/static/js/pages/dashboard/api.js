(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  window.TaskFlow.dashboardApi = {
    loadData(root) {
      return window.TaskFlow.api.get(root.dataset.dashboardUrl);
    },
  };
})();
