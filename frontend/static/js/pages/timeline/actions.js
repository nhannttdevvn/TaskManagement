(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  function showToast(message) {
    if (Timeline.toast) {
      Timeline.toast.show(Timeline.selectors.toast, message, { duration: 2400 });
      return;
    }
    Timeline.selectors.toast.textContent = message;
    Timeline.selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => Timeline.selectors.toast.classList.add("hidden"), 2400);
  }

  Timeline.actions = {
    showToast,

    loadStoredWorkspaces() {
      window.localStorage.removeItem("taskflow-workspaces");
    },

    saveCustomWorkspaces() {
      window.localStorage.removeItem("taskflow-workspaces");
    },

    ensureActiveWorkspace() {
      if (Timeline.workspaces.length === 0) {
        Timeline.state.activeWorkspaceId = "";
        Timeline.state.activeProjectName = "";
        return;
      }
      if (!Timeline.workspaces.some((workspace) => workspace.id === Timeline.state.activeWorkspaceId)) {
        Timeline.state.activeWorkspaceId = Timeline.workspaces.length > 0 ? Timeline.workspaces[0].id : "";
        window.localStorage.setItem("taskflow-active-workspace", Timeline.state.activeWorkspaceId);
      }
      const workspace = Timeline.helpers.activeWorkspace();
      if (workspace) {
        window.localStorage.setItem("taskflow-active-workspace-name", workspace.name);
        if (!Timeline.state.activeProjectName || !workspace.projects.includes(Timeline.state.activeProjectName)) {
          Timeline.state.activeProjectName = (workspace.projects && workspace.projects[0]) || workspace.name;
          window.localStorage.setItem("taskflow-active-project", Timeline.state.activeProjectName);
        }
      }
    },

    normalizeWorkspaceTasks() {
      Timeline.tasks = Timeline.tasks.map((task, index) => {
        let workspace = null;
        if (task.projectId) {
          workspace = Timeline.workspaces.find((w) => String(w.databaseId) === String(task.projectId) || w.id === String(task.projectId));
        }
        if (!workspace && task.workspaceId) {
          workspace = Timeline.workspaces.find((w) => w.id === task.workspaceId || String(w.databaseId) === String(task.workspaceId));
        }
        if (!workspace) {
          workspace = Timeline.workspaces.find((w) => w.id === Timeline.state.activeWorkspaceId) || Timeline.workspaces[0] || Timeline.workspaces[index % Timeline.workspaces.length];
        }
        if (!workspace) {
          return task;
        }
        const projectName = task.projectName || (workspace.projects && workspace.projects[0]) || workspace.name;
        return {
          ...task,
          workspaceId: workspace.id,
          projectName,
        };
      });
    },

    switchWorkspace(workspaceId, projectName = "") {
      if (!Timeline.workspaces.some((workspace) => workspace.id === workspaceId)) return;
      Timeline.state.activeWorkspaceId = workspaceId;
      const workspace = Timeline.helpers.activeWorkspace();
      Timeline.state.activeProjectName = projectName || workspace.projects[0] || workspace.name;
      window.localStorage.setItem("taskflow-active-workspace", workspaceId);
      window.localStorage.setItem("taskflow-active-project", Timeline.state.activeProjectName);
      if (workspace) {
        window.localStorage.setItem("taskflow-active-workspace-name", workspace.name);
      }
      Timeline.app.dispatchEvent(new CustomEvent("timeline-mode-change", { detail: "detail" }));
      Timeline.renderers.renderWorkspaceList();
      Timeline.renderers.renderProjectHeader();
      Timeline.actions.applyTaskFilters();
      window.history.replaceState(null, "", `#project-${Timeline.helpers.createSlug(Timeline.state.activeProjectName)}`);
      Timeline.selectors.workspace.scrollIntoView({ block: "nearest", behavior: "smooth" });
      showToast(`${Timeline.state.activeProjectName} opened`);
    },

    loadFavorites() {
      try {
        Timeline.state.favoriteFirst = window.localStorage.getItem("taskflow-project-favorite-first") !== "false";
      } catch {
        Timeline.state.favoriteIds = [];
        Timeline.state.favoriteFirst = true;
      }
    },

    saveFavorites() {
      window.localStorage.setItem("taskflow-project-favorite-first", String(Timeline.state.favoriteFirst));
    },

    updateFavoriteSortButton() {
      if (!Timeline.selectors.favoriteSortButton) return;
      Timeline.selectors.favoriteSortButton.setAttribute("aria-pressed", String(Timeline.state.favoriteFirst));
      Timeline.selectors.favoriteSortButton.classList.toggle("border-amber-300/25", Timeline.state.favoriteFirst);
      Timeline.selectors.favoriteSortButton.classList.toggle("bg-amber-300/10", Timeline.state.favoriteFirst);
      Timeline.selectors.favoriteSortButton.classList.toggle("text-amber-200", Timeline.state.favoriteFirst);
      Timeline.selectors.favoriteSortButton.classList.toggle("border-white/10", !Timeline.state.favoriteFirst);
      Timeline.selectors.favoriteSortButton.classList.toggle("bg-white/10", !Timeline.state.favoriteFirst);
      Timeline.selectors.favoriteSortButton.classList.toggle("text-slate-300", !Timeline.state.favoriteFirst);
    },

    async toggleTaskFavorite(taskId) {
      const index = Timeline.state.favoriteIds.indexOf(taskId);
      const nextFavorite = index < 0;
      if (index >= 0) {
        Timeline.state.favoriteIds.splice(index, 1);
        showToast("Removed from favorites");
      } else {
        Timeline.state.favoriteIds.push(taskId);
        showToast("Saved to favorites");
      }
      Timeline.actions.saveFavorites();
      Timeline.actions.applyTaskFilters();
      if ((/^\d+$/).test(taskId)) {
        try {
          await Timeline.timelineApi.setTaskFavorite(taskId, nextFavorite, Timeline.app);
        } catch (error) {
          if (nextFavorite) {
            Timeline.state.favoriteIds = Timeline.state.favoriteIds.filter((id) => id !== taskId);
          } else if (!Timeline.state.favoriteIds.includes(taskId)) {
            Timeline.state.favoriteIds.push(taskId);
          }
          Timeline.actions.applyTaskFilters();
          showToast(error.message || "Favorite could not be saved");
        }
      }
    },

    applyTaskFilters() {
      const query = Timeline.state.kanbanQuery.trim().toLowerCase();
      const priority = Timeline.state.kanbanPriority;
      const sorted = Timeline.tasks
        .filter((task) => task.workspaceId === Timeline.state.activeWorkspaceId)
        .filter((task) => task.projectName === Timeline.helpers.activeProjectName())
        .filter((task) => Timeline.helpers.taskMatchesQuery(task, query))
        .filter((task) => priority === "all" || task.priority === priority)
        .filter((task) => Timeline.helpers.taskMatchesDayFilter(task, Timeline.state.kanbanDayFilter))
        .slice();

      const sorters = {
        status: (a, b) => Timeline.helpers.compareFavorites(a, b) || a.status.localeCompare(b.status) || Timeline.helpers.priorityRank(b.priority) - Timeline.helpers.priorityRank(a.priority),
        priority: (a, b) => Timeline.helpers.compareFavorites(a, b) || Timeline.helpers.priorityRank(b.priority) - Timeline.helpers.priorityRank(a.priority) || a.title.localeCompare(b.title),
        progress: (a, b) => Timeline.helpers.compareFavorites(a, b) || b.progress - a.progress,
        due: (a, b) => Timeline.helpers.compareFavorites(a, b) || String(a.due).localeCompare(String(b.due)) || a.title.localeCompare(b.title),
      };

      sorted.sort(sorters[Timeline.state.kanbanSort] || sorters.status);
      Timeline.state.filteredTasks = sorted;
      Timeline.renderers.renderTaskViews(Timeline.state.filteredTasks);
      Timeline.renderers.renderProjectOverview();
      Timeline.renderers.renderProjectsView();
      Timeline.actions.updateFavoriteSortButton();
    },

    async selectCalendarDay(day) {
      Timeline.state.kanbanDayFilter = day || "all";
      window.localStorage.setItem("taskflow-kanban-day-filter", Timeline.state.kanbanDayFilter);
      Timeline.renderers.renderDayPicker();
      await Timeline.actions.loadProjectData();
      Timeline.actions.ensureActiveWorkspace();
      Timeline.renderers.renderWorkspaceList();
      Timeline.renderers.renderProjectHeader();
      Timeline.actions.applyTaskFilters();
      Timeline.renderers.renderHeader();
      Timeline.actions.showToast(Timeline.state.kanbanDayFilter === "all" ? "Showing all days" : `Showing ${Timeline.state.kanbanDayFilter}`);
    },

    async deleteTask(taskId) {
      const index = Timeline.tasks.findIndex((task) => task.id === taskId);
      const snapshot = index !== -1 ? { ...Timeline.tasks[index] } : null;
      showToast("Deleting...");
      if (index !== -1) {
        Timeline.tasks.splice(index, 1);
        Timeline.actions.applyTaskFilters();
      }
      try {
        if ((/^\d+$/).test(taskId)) {
          const response = await Timeline.timelineApi.deleteTask(taskId, Timeline.app);
          if (!response.ok) throw new Error(response.message);
        }
        Timeline.modals.closeTaskModal();
        showToast("Deleted");
      } catch (err) {
        if (snapshot && !Timeline.tasks.some((task) => task.id === taskId)) {
          Timeline.tasks.splice(Math.max(index, 0), 0, snapshot);
          Timeline.actions.applyTaskFilters();
        }
        showToast(err.message || "Failed, restored");
      }
    },

    async saveWorkspaceFromEditor(event) {
      event.preventDefault();
      const formData = new FormData(Timeline.selectors.workspaceEditorForm);
      const name = String(formData.get("name") || "").trim();
      if (!name) return;

      try {
        const response = await Timeline.timelineApi.createWorkspace({ name: name }, Timeline.app);
        if (!response.ok) {
          throw new Error(response.message || "Failed to create workspace");
        }
        const createdWorkspaceId = String(response.data.id || response.data.databaseId || "");
        Timeline.modals.closeWorkspaceEditor();

        await Timeline.actions.loadProjectData({ ignoreWorkspaceFilter: true });
        const workspace = Timeline.workspaces.find((item) => (
          String(item.id) === createdWorkspaceId ||
          String(item.databaseId) === createdWorkspaceId
        )) || Timeline.workspaces[0];

        if (workspace) {
          Timeline.state.activeWorkspaceId = workspace.id;
          Timeline.state.activeProjectName = "";
          window.localStorage.setItem("taskflow-active-workspace", workspace.id);
          window.localStorage.setItem("taskflow-active-workspace-name", workspace.name);
          window.localStorage.removeItem("taskflow-active-project");
        }

        Timeline.app.dispatchEvent(new CustomEvent("timeline-mode-change", { detail: "overview" }));
        Timeline.renderers.renderWorkspaceList();
        Timeline.renderers.renderProjectOverview();
        Timeline.renderers.renderProjectHeader();
        showToast("Workspace created");
      } catch (error) {
        showToast(error.message || "Could not create workspace");
      }
    },

    async saveProjectFromEditor(event) {
      event.preventDefault();
      const formData = new FormData(Timeline.selectors.projectEditorForm);
      const name = String(formData.get("name") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const workspaceId = String(formData.get("workspace_id") || "").trim();
      if (!name) return;

      try {
        const payload = {
          title: name,
          description: description,
          workspace_id: workspaceId
        };
        const response = await Timeline.timelineApi.createProject(payload, Timeline.app);
        if (!response.ok) {
          throw new Error(response.message || "Failed to create project");
        }
        const data = response.data;
        
        const workspace = Timeline.workspaces.find((w) => String(w.id) === workspaceId || String(w.databaseId) === workspaceId);
        if (workspace) {
          if (!workspace.projects) {
            workspace.projects = [];
          }
          if (!workspace.projectIds) {
            workspace.projectIds = {};
          }
          if (!workspace.projects.includes(data.title)) {
            workspace.projects.push(data.title);
          }
          workspace.projectIds[data.title] = data.databaseId;
        }
        
        Timeline.modals.closeProjectEditor();
        Timeline.actions.switchWorkspace(workspaceId, data.title);
        showToast("Project created successfully");
      } catch (error) {
        showToast(error.message || "Could not create project");
      }
    },

    async saveTaskFromEditor(event) {
      event.preventDefault();
      const formData = new FormData(Timeline.selectors.editorForm);
      const id = String(formData.get("id") || "");
      const title = String(formData.get("title") || "").trim();
      if (!title) {
        showToast("Task title is required");
        return;
      }
      const submitButton = event.submitter || Timeline.selectors.editorForm.querySelector('button[type="submit"]');
      const originalButton = submitButton?.innerHTML || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i data-lucide="loader-2" class="h-3.5 w-3.5 animate-spin"></i> Saving...';
        Timeline.renderers.refreshIcons();
      }

      const payload = {
        title,
        subtitle: String(formData.get("subtitle") || "New kanban task").trim(),
        status: String(formData.get("status") || "To Do"),
        priority: String(formData.get("priority") || "Medium"),
        owner: String(formData.get("owner") || "Sarah Nguyen").trim(),
        due_date: String(formData.get("due_date") || "").trim(),
        progress: Number(formData.get("progress") || 20),
      };

      const existing = Timeline.tasks.find((task) => task.id === id);
      try {
        if (existing) {
          if ((/^\d+$/).test(id)) {
            const response = await Timeline.timelineApi.updateTask(id, payload, Timeline.app);
            if (!response.ok) throw new Error(response.message);
            Object.assign(existing, response.data);
          } else {
            throw new Error("This task is not stored in the database.");
          }
        } else {
          if (Timeline.state.activeWorkspaceId) {
            const workspace = Timeline.workspaces.find((w) => w.id === Timeline.state.activeWorkspaceId);
            const activeProjectName = Timeline.helpers.activeProjectName();
            const projectId = workspace?.projectIds?.[activeProjectName] || workspace?.projectIds?.[payload.projectName];
            if (workspace && projectId) {
              const response = await Timeline.timelineApi.createTask(projectId, payload, Timeline.app);
              if (!response.ok) throw new Error(response.message);
              Timeline.tasks.push(response.data);
            } else {
              throw new Error("Create or select a saved project first.");
            }
          } else {
            throw new Error("Create or select a workspace first.");
          }
        }
        Timeline.modals.closeTaskEditor();
        Timeline.actions.applyTaskFilters();
        showToast("Saved");
      } catch (err) {
        showToast(err.message || "Failed to save task");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButton;
          Timeline.renderers.refreshIcons();
        }
      }
    },

    async sendProjectInvite(event) {
      event.preventDefault();
      const formData = new FormData(Timeline.selectors.projectInviteForm);
      const workspace = Timeline.helpers.activeWorkspace();
      const payload = {
        email: String(formData.get("email") || "").trim(),
        role: String(formData.get("role") || "member").trim(),
        positions: String(formData.get("positions") || "Member").trim(),
        projects: [workspace.name],
        message: String(formData.get("message") || `You have been invited to ${workspace.name}.`).trim(),
      };

      Timeline.selectors.projectInviteSubmit.disabled = true;
      Timeline.selectors.projectInviteSubmit.innerHTML = '<i data-lucide="loader-2" class="h-3.5 w-3.5 animate-spin"></i> Sending...';
      Timeline.renderers.refreshIcons();

      try {
        await Timeline.timelineApi.sendInvite(Timeline.app, Timeline.selectors.projectInviteForm, payload, workspace?.databaseId || workspace?.id || "");
        Timeline.modals.closeProjectInviteModal();
        showToast("Invitation sent");
      } catch (error) {
        showToast(error.message || "Could not send invitation");
      } finally {
        Timeline.selectors.projectInviteSubmit.disabled = false;
        Timeline.selectors.projectInviteSubmit.innerHTML = '<i data-lucide="mail" class="h-3.5 w-3.5"></i> Send Invitation';
        Timeline.renderers.refreshIcons();
      }
    },

    async loadProjectData(options = {}) {
      try {
        const result = await Timeline.timelineApi.loadProjectData(Timeline.app, {
          day: Timeline.state.kanbanDayFilter,
          ignoreWorkspaceFilter: Boolean(options.ignoreWorkspaceFilter),
        });

        if (result && result.ok && result.data.projects) {
          if (
            !options.ignoreWorkspaceFilter &&
            result.data.projects.length === 0 &&
            window.localStorage.getItem("taskflow-active-workspace")
          ) {
            window.localStorage.removeItem("taskflow-active-workspace");
            window.localStorage.removeItem("taskflow-active-workspace-name");
            window.localStorage.removeItem("taskflow-active-project");
            return Timeline.actions.loadProjectData({ ...options, ignoreWorkspaceFilter: true });
          }
          Timeline.workspaces = result.data.projects;
        }
        Timeline.tasks = result.data.tasks || Timeline.tasks;
        if (Array.isArray(result.data.favoriteTaskIds)) {
          Timeline.state.favoriteIds = result.data.favoriteTaskIds.map(String);
        }
        Timeline.actions.normalizeWorkspaceTasks();
        Timeline.notifications = (result.data.notifications || Timeline.notifications).map((item) => item.body || item);
        Timeline.state.filteredTasks = Timeline.tasks.slice();
      } catch (error) {
        showToast(error.message || "Project data could not be loaded");
        if (!Timeline.allowDemoFallback) {
          Timeline.workspaces = [];
          Timeline.tasks = [];
          Timeline.notifications = [];
          Timeline.state.filteredTasks = [];
          Timeline.state.lastLoadError = error.message || "Project data could not be loaded";
          return;
        }
        console.warn("Using project demo fallback data:", error);
        Timeline.actions.normalizeWorkspaceTasks();
      }
    }
  };
})();
