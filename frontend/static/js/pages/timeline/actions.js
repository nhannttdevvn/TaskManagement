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
      try {
        const stored = JSON.parse(window.localStorage.getItem("taskflow-workspaces") || "[]");
        const existingIds = new Set(Timeline.workspaces.map((workspace) => workspace.id));
        stored.forEach((workspace) => {
          if (workspace?.id && !existingIds.has(workspace.id)) {
            Timeline.workspaces.push(workspace);
            existingIds.add(workspace.id);
          }
        });
      } catch {
        window.localStorage.removeItem("taskflow-workspaces");
      }
    },

    saveCustomWorkspaces() {
      const defaultIds = new Set(["design-sprint", "fintask-landing-page", "checkout-flow", "brand-refresh"]);
      const custom = Timeline.workspaces.filter((workspace) => !defaultIds.has(workspace.id));
      window.localStorage.setItem("taskflow-workspaces", JSON.stringify(custom));
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
        Timeline.state.favoriteIds = JSON.parse(window.localStorage.getItem("taskflow-project-favorites") || "[]");
        Timeline.state.favoriteFirst = window.localStorage.getItem("taskflow-project-favorite-first") !== "false";
      } catch {
        Timeline.state.favoriteIds = [];
        Timeline.state.favoriteFirst = true;
      }
    },

    saveFavorites() {
      window.localStorage.setItem("taskflow-project-favorites", JSON.stringify(Timeline.state.favoriteIds));
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

    toggleTaskFavorite(taskId) {
      const index = Timeline.state.favoriteIds.indexOf(taskId);
      if (index >= 0) {
        Timeline.state.favoriteIds.splice(index, 1);
        showToast("Removed from favorites");
      } else {
        Timeline.state.favoriteIds.push(taskId);
        showToast("Saved to favorites");
      }
      Timeline.actions.saveFavorites();
      Timeline.actions.applyTaskFilters();
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
      try {
        if ((/^\d+$/).test(taskId)) {
          const response = await Timeline.timelineApi.deleteTask(taskId, Timeline.app);
          if (!response.ok) throw new Error(response.message);
        }
        const index = Timeline.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          Timeline.tasks.splice(index, 1);
        }
        Timeline.modals.closeTaskModal();
        Timeline.actions.applyTaskFilters();
        showToast("Task deleted");
      } catch (err) {
        showToast(err.message || "Failed to delete task");
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
        const data = response.data;
        const workspace = {
          id: data.id,
          databaseId: data.databaseId,
          name: data.name,
          breadcrumb: `/ Workspaces`,
          category: data.category || "Active",
          company: data.company || "My Workspace",
          date: data.date || "No date",
          members: data.members || [],
          projects: data.projects || [],
          progress: data.progress || 0,
          tasks: data.tasks || 0,
          done: data.done || 0,
        };

        Timeline.workspaces.push(workspace);
        Timeline.modals.closeWorkspaceEditor();
        
        Timeline.state.activeWorkspaceId = workspace.id;
        window.localStorage.setItem("taskflow-active-workspace", workspace.id);
        Timeline.app.dispatchEvent(new CustomEvent("timeline-mode-change", { detail: "overview" }));
        Timeline.renderers.renderWorkspaceList();
        Timeline.renderers.renderProjectOverview();
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
          if (!workspace.projects.includes(data.title)) {
            workspace.projects.push(data.title);
          }
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
      if (!title) return;

      const payload = {
        title,
        subtitle: String(formData.get("subtitle") || "New kanban task").trim(),
        status: String(formData.get("status") || "To Do"),
        priority: String(formData.get("priority") || "Medium"),
        owner: String(formData.get("owner") || "Sarah Nguyen").trim(),
        due: String(formData.get("due") || "Nov 18").trim(),
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
            Object.assign(existing, payload);
          }
          showToast("Task updated");
        } else {
          if (Timeline.state.activeWorkspaceId) {
            const workspace = Timeline.workspaces.find((w) => w.id === Timeline.state.activeWorkspaceId);
            if (workspace && workspace.databaseId) {
              const response = await Timeline.timelineApi.createTask(workspace.databaseId, payload, Timeline.app);
              if (!response.ok) throw new Error(response.message);
              Timeline.tasks.push(response.data);
            } else {
              Timeline.tasks.push({
                id: Timeline.helpers.createTaskId(payload.title),
                ...payload,
                workspaceId: Timeline.state.activeWorkspaceId,
                projectName: Timeline.helpers.activeProjectName(),
                start: 10,
                duration: 1.25,
                row: 0,
                color: "bg-cyan-200 border-cyan-300",
                text: "text-slate-950",
                members: ["SN", "MS"],
                category: "Kanban",
                comments: 0,
                attachments: 0,
                kanbanOnly: true,
              });
            }
          }
          showToast("Task added");
        }
        Timeline.modals.closeTaskEditor();
        Timeline.actions.applyTaskFilters();
      } catch (err) {
        showToast(err.message || "Failed to save task");
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
        await Timeline.timelineApi.sendInvite(Timeline.app, Timeline.selectors.projectInviteForm, payload);
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

    async loadProjectData() {
      try {
        const result = await Timeline.timelineApi.loadProjectData(Timeline.app, { day: Timeline.state.kanbanDayFilter });

        if (result && result.ok && result.data.projects) {
          Timeline.workspaces = result.data.projects;
        }
        Timeline.tasks = result.data.tasks || Timeline.tasks;
        Timeline.actions.normalizeWorkspaceTasks();
        Timeline.notifications = result.data.notifications || Timeline.notifications;
        Timeline.state.filteredTasks = Timeline.tasks.slice();
      } catch (error) {
        showToast(error.message || "Project data could not be loaded");
        if (!Timeline.allowDemoFallback) {
          throw error;
        }
        console.warn("Using project demo fallback data:", error);
        Timeline.actions.normalizeWorkspaceTasks();
      }
    }
  };
})();
