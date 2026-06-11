(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  window.TaskFlow.timelineApi = {
    loadProjectData(root, options = {}) {
      const url = new URL(root.dataset.projectUrl, window.location.origin);
      if (options.day && options.day !== "all") {
        url.searchParams.set("day", options.day);
      } else {
        url.searchParams.delete("day");
      }
      return window.TaskFlow.api.get(`${url.pathname}${url.search}`);
    },
    createProject(payload, root) {
      return window.TaskFlow.api.post("/api/projects/", payload, { root });
    },
    createTask(projectId, payload, root) {
      return window.TaskFlow.api.post(`/api/projects/${projectId}/tasks/`, payload, { root });
    },
    updateTaskStatus(taskId, status, root) {
      return window.TaskFlow.api.patch(`/api/tasks/${taskId}/status/`, { status }, { root });
    },
    updateTask(taskId, payload, root) {
      return window.TaskFlow.api.patch(`/api/tasks/${taskId}/`, payload, { root });
    },
    deleteTask(taskId, root) {
      return window.TaskFlow.api.delete(`/api/tasks/${taskId}/`, { root });
    },
    sendInvite(root, form, payload) {
      return window.TaskFlow.api.post(form.dataset.inviteUrl || root.dataset.inviteUrl, payload, { root: form });
    },
  };
})();
