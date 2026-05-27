(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  window.TaskFlow.teamApi = {
    loadData(root) {
      return window.TaskFlow.api.get(root.dataset.teamUrl);
    },
    sendInvite(root, form, payload) {
      return window.TaskFlow.api.post(form.dataset.inviteUrl || root.dataset.inviteUrl, payload, { root: form });
    },
  };
})();
