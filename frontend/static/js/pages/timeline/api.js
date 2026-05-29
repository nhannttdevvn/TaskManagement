(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  window.TaskFlow.timelineApi = {
    loadProjectData(root) {
      return window.TaskFlow.api.get(root.dataset.projectUrl);
    },
    sendInvite(root, form, payload) {
      return window.TaskFlow.api.post(form.dataset.inviteUrl || root.dataset.inviteUrl, payload, { root: form });
    },
  };
})();
