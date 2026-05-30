(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  window.TaskFlow.dashboardApi = {
    loadData(root) {
      return window.TaskFlow.api.get(root.dataset.dashboardUrl);
    },
    createProject(payload, root) {
      return window.TaskFlow.api.post("/api/projects/", payload, { root });
    },
  };
})();
