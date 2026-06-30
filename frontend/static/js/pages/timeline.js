(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline;
  if (!Timeline || !Timeline.app) return;

  const app = Timeline.app;
  const selectors = Timeline.selectors;

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
    app.classList.toggle("taskflow-sidebar-open", shouldOpen);
  }

  function setTheme(theme) {
    const activeTheme = window.TaskFlow?.theme
      ? window.TaskFlow.theme.apply(theme, { root: app, toggle: selectors.themeToggle, variant: "pill" })
      : theme;
    app.dataset.theme = activeTheme;
    document.documentElement.classList.toggle("dark", activeTheme !== "light");
    Timeline.renderers.refreshIcons();
    return activeTheme;
  }

  function setProjectMode(mode) {
    Timeline.state.mode = mode;
    const isOverview = mode === "overview";
    selectors.projectOverviewPanel.classList.toggle("hidden", !isOverview);
    selectors.projectOverviewPanel.classList.toggle("flex", isOverview);
    selectors.projectDetailHeader.classList.toggle("hidden", isOverview);
    selectors.workspace.classList.toggle("hidden", isOverview);
    selectors.workspace.classList.toggle("flex", !isOverview);
    if (isOverview) {
      selectors.scroll.classList.add("hidden");
      selectors.kanbanView.classList.add("hidden");
      selectors.kanbanView.classList.remove("flex");
      selectors.listView.classList.add("hidden");
      selectors.listView.classList.remove("flex");
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      selectors.skeleton.classList.add("hidden");
      selectors.scroll.classList.toggle("hidden", Timeline.state.view !== "calendar");
      selectors.kanbanView.classList.toggle("hidden", Timeline.state.view !== "kanban");
      selectors.kanbanView.classList.toggle("flex", Timeline.state.view === "kanban");
      selectors.listView.classList.toggle("hidden", Timeline.state.view !== "list");
      selectors.listView.classList.toggle("flex", Timeline.state.view === "list");
    }
  }

  Timeline.setProgressLine = function () {
    const d = new Date();
    const now = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    if (now >= Timeline.timelineStart && now <= Timeline.timelineEnd + 1) {
      const left = (now - Timeline.timelineStart) * Timeline.scale;
      selectors.progressLine.style.left = `${left}px`;
      selectors.progressLine.classList.remove("hidden");
    } else {
      selectors.progressLine.classList.add("hidden");
    }
  };

  Timeline.scrollToCurrentTime = function () {
    if (Timeline.state.view !== "calendar") return;
    const d = new Date();
    const currentHour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    const left = (currentHour - Timeline.timelineStart) * Timeline.scale;
    const containerWidth = selectors.scroll.clientWidth;
    const scrollLeft = left - containerWidth / 2;
    selectors.scroll.scrollLeft = scrollLeft;
  };

  // Listen to cross-module mode changes (like from actions.js workspace switch)
  app.addEventListener("timeline-mode-change", (e) => {
    setProjectMode(e.detail);
  });

  function bindEvents() {
    selectors.sidebarToggle.addEventListener("click", () => toggleSidebar());
    selectors.sidebarOverlay.addEventListener("click", () => toggleSidebar(false));
    document.querySelectorAll(".timeline-nav-link").forEach((link) => {
      link.addEventListener("click", () => toggleSidebar(false));
    });

    selectors.workspaceToggle.addEventListener("click", () => {
      selectors.workspaceItems.classList.toggle("hidden");
    });

    selectors.workspaceList.addEventListener("click", (event) => {
      const addWorkspace = event.target.closest("[data-add-workspace]");
      const workspaceButton = event.target.closest("[data-workspace-id]");
      const workspaceOverview = event.target.closest("[data-workspace-overview]");
      if (addWorkspace) {
        Timeline.modals.openWorkspaceEditor();
        return;
      }
      if (workspaceOverview) {
        Timeline.state.activeWorkspaceId = workspaceOverview.dataset.workspaceOverview;
        const workspaceObj = Timeline.workspaces.find((workspace) => workspace.id === Timeline.state.activeWorkspaceId);
        Timeline.state.activeProjectName = workspaceObj?.projects[0] || "";
        window.localStorage.setItem("taskflow-active-workspace", Timeline.state.activeWorkspaceId);
        window.localStorage.setItem("taskflow-active-project", Timeline.state.activeProjectName);
        if (workspaceObj) {
          window.localStorage.setItem("taskflow-active-workspace-name", workspaceObj.name);
        }
        setProjectMode("overview");
        Timeline.renderers.renderWorkspaceList();
        Timeline.renderers.renderProjectOverview();
        toggleSidebar(false);
        return;
      }
      if (!workspaceButton) return;
      Timeline.actions.switchWorkspace(workspaceButton.dataset.workspaceId, workspaceButton.dataset.projectName || "");
      toggleSidebar(false);
    });

    selectors.addWorkspaceButton.addEventListener("click", Timeline.modals.openWorkspaceEditor);
    selectors.overviewAddWorkspace.addEventListener("click", Timeline.modals.openWorkspaceEditor);
    selectors.workspaceEditorForm.addEventListener("submit", Timeline.actions.saveWorkspaceFromEditor);
    if (selectors.projectEditorForm) {
      selectors.projectEditorForm.addEventListener("submit", Timeline.actions.saveProjectFromEditor);
    }

    selectors.projectOverviewPanel.addEventListener("click", (event) => {
      const clearFilter = event.target.closest("#clearWorkspaceFilter");
      if (clearFilter) {
        Timeline.state.activeWorkspaceId = "";
        Timeline.state.activeProjectName = "";
        window.localStorage.removeItem("taskflow-active-workspace");
        window.localStorage.removeItem("taskflow-active-workspace-name");
        window.localStorage.removeItem("taskflow-active-project");
        setProjectMode("overview");
        Timeline.renderers.renderWorkspaceList();
        Timeline.renderers.renderProjectOverview();
        Timeline.renderers.renderProjectHeader();
        return;
      }

      const workspaceSelect = event.target.closest("[data-workspace-card-select]");
      if (workspaceSelect) {
        Timeline.state.activeWorkspaceId = workspaceSelect.dataset.workspaceCardSelect;
        const workspaceObj = Timeline.workspaces.find((w) => String(w.id) === String(Timeline.state.activeWorkspaceId) || String(w.databaseId) === String(Timeline.state.activeWorkspaceId));
        Timeline.state.activeProjectName = workspaceObj?.projects[0] || "";
        window.localStorage.setItem("taskflow-active-workspace", Timeline.state.activeWorkspaceId);
        window.localStorage.setItem("taskflow-active-project", Timeline.state.activeProjectName);
        if (workspaceObj) {
          window.localStorage.setItem("taskflow-active-workspace-name", workspaceObj.name);
        }
        setProjectMode("overview");
        Timeline.renderers.renderWorkspaceList();
        Timeline.renderers.renderProjectOverview();
        Timeline.renderers.renderProjectHeader();
        return;
      }

      const projectButton = event.target.closest("[data-workspace-id][data-project-name]");
      if (!projectButton) return;
      Timeline.actions.switchWorkspace(projectButton.dataset.workspaceId, projectButton.dataset.projectName || "");
    });

    selectors.workspaceInviteButton.addEventListener("click", () => {
      if (!Timeline.helpers.canManageWorkspace()) {
        Timeline.actions.showToast("Only owners and admins can invite members.");
        return;
      }
      Timeline.modals.openProjectInviteModal();
    });
    selectors.projectInviteForm.addEventListener("submit", Timeline.actions.sendProjectInvite);

    selectors.helpToggle.addEventListener("click", Timeline.modals.openHelpModal);

    selectors.themeToggle.addEventListener("click", () => {
      const activeTheme = setTheme(app.dataset.theme === "light" ? "dark" : "light");
      Timeline.actions.showToast(`${activeTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    selectors.profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.profileDropdown.classList.toggle("hidden");
    });

    if (selectors.searchInput) {
      selectors.searchInput.addEventListener("input", () => {
        Timeline.state.kanbanQuery = selectors.searchInput.value.trim().toLowerCase();
        Timeline.actions.applyTaskFilters();
      });
    }

    if (selectors.kanbanSearch) {
      selectors.kanbanSearch.addEventListener("input", () => {
        Timeline.state.kanbanQuery = selectors.kanbanSearch.value.trim().toLowerCase();
        Timeline.actions.applyTaskFilters();
      });
    }

    if (selectors.kanbanPriorityFilter) {
      selectors.kanbanPriorityFilter.addEventListener("change", () => {
        Timeline.state.kanbanPriority = selectors.kanbanPriorityFilter.value;
        Timeline.actions.applyTaskFilters();
      });
    }

    if (selectors.kanbanSort) {
      selectors.kanbanSort.addEventListener("change", () => {
        Timeline.state.kanbanSort = selectors.kanbanSort.value;
        Timeline.actions.applyTaskFilters();
      });
    }

    if (selectors.kanbanDayPicker) {
      selectors.kanbanDayPicker.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-calendar-day]");
        if (!button) return;
        await Timeline.actions.selectCalendarDay(button.dataset.calendarDay);
      });
    }

    if (selectors.clearKanbanDayFilter) {
      selectors.clearKanbanDayFilter.addEventListener("click", async () => {
        await Timeline.actions.selectCalendarDay("all");
      });
    }

    selectors.addTaskButton.addEventListener("click", () => Timeline.modals.openTaskEditor("To Do"));
    selectors.kanbanAddTask.addEventListener("click", () => Timeline.modals.openTaskEditor("To Do"));
    selectors.editorForm.elements.status.addEventListener("change", () => {
      const status = selectors.editorForm.elements.status.value;
      selectors.editorForm.elements.progress.value = Timeline.helpers.nextProgressForStatus(
        status,
        selectors.editorForm.elements.progress.value,
        Timeline.state.progressWasEdited
      );
      Timeline.actions.syncTaskProgressLabel();
    });
    selectors.editorForm.elements.progress.addEventListener("input", () => {
      if (selectors.editorForm.elements.status.value === "Done") {
        selectors.editorForm.elements.progress.value = 100;
      }
      Timeline.state.progressWasEdited = true;
      Timeline.actions.syncTaskProgressLabel();
    });
    selectors.editorForm.addEventListener("submit", Timeline.actions.saveTaskFromEditor);
    document.addEventListener("submit", async (event) => {
      const attachmentForm = event.target.closest("[data-attachment-form]");
      if (!attachmentForm) return;
      event.preventDefault();
      const taskId = attachmentForm.dataset.attachmentForm;
      const submitButton = attachmentForm.querySelector('button[type="submit"]');
      const originalButton = submitButton?.innerHTML || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i data-lucide="loader-2" class="h-3.5 w-3.5 animate-spin"></i> Saving...';
        Timeline.renderers.refreshIcons();
      }
      try {
        const formData = new FormData(attachmentForm);
        const response = await Timeline.timelineApi.addTaskAttachment(taskId, {
          name: String(formData.get("name") || "").trim(),
          size: String(formData.get("size") || "").trim(),
        }, attachmentForm);
        if (!response.ok) throw new Error(response.message || "Attachment could not be saved");
        const task = Timeline.tasks.find((item) => item.id === taskId);
        if (task) {
          task.attachments = Number(task.attachments || 0) + 1;
        }
        Timeline.actions.applyTaskFilters();
        await Timeline.modals.openTask(taskId);
        Timeline.actions.showToast("Saved");
      } catch (error) {
        Timeline.actions.showToast(error.message || "Failed to save attachment");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButton;
          Timeline.renderers.refreshIcons();
        }
      }
    });
    selectors.favoriteSortButton.addEventListener("click", () => {
      Timeline.state.favoriteFirst = !Timeline.state.favoriteFirst;
      Timeline.actions.saveFavorites();
      Timeline.actions.updateFavoriteSortButton();
      Timeline.actions.applyTaskFilters();
      Timeline.actions.showToast(Timeline.state.favoriteFirst ? "Favorite tasks stay first" : "Favorite sorting disabled");
    });

    selectors.viewTabs.forEach((tab) => {
      tab.addEventListener("click", () => setView(tab.dataset.view));
    });

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (Timeline.wasDraggedOrResized && event.target.closest(".timeline-task")) {
        Timeline.wasDraggedOrResized = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const addStatus = event.target.closest("[data-add-status]");
      if (addStatus) {
        if (!Timeline.helpers.canManageWorkspace()) {
          Timeline.actions.showToast("Only owners and admins can create tasks.");
          return;
        }
        Timeline.modals.openTaskEditor(addStatus.dataset.addStatus);
        return;
      }

      const columnMenu = event.target.closest("[data-column-menu]");
      if (columnMenu) {
        Timeline.actions.showToast(`${columnMenu.dataset.columnMenu} actions ready`);
        return;
      }

      const editTask = event.target.closest("[data-edit-task]");
      if (editTask) {
        const task = Timeline.tasks.find((item) => item.id === editTask.dataset.editTask);
        if (!Timeline.helpers.canEditTask(task)) {
          Timeline.actions.showToast("You do not have permission to edit this task.");
          return;
        }
        Timeline.modals.closeTaskModal();
        Timeline.modals.openTaskEditor("To Do", editTask.dataset.editTask);
        return;
      }

      const deleteTaskButton = event.target.closest("[data-delete-task]");
      if (deleteTaskButton) {
        const task = Timeline.tasks.find((item) => item.id === deleteTaskButton.dataset.deleteTask);
        if (!Timeline.helpers.canEditTask(task)) {
          Timeline.actions.showToast("You do not have permission to delete this task.");
          return;
        }
        Timeline.modals.showDeleteConfirm(deleteTaskButton.dataset.deleteTask);
        return;
      }

      const confirmDeleteTask = event.target.closest("[data-confirm-delete-task]");
      if (confirmDeleteTask) {
        Timeline.actions.deleteTask(confirmDeleteTask.dataset.confirmDeleteTask);
        return;
      }

      const cancelDeleteTask = event.target.closest("[data-cancel-delete-task]");
      if (cancelDeleteTask) {
        Timeline.modals.openTask(cancelDeleteTask.dataset.cancelDeleteTask);
        return;
      }

      if (event.target.closest("[data-close-task-editor]")) {
        Timeline.modals.closeTaskEditor();
        return;
      }

      if (event.target.closest("[data-close-workspace-editor]")) {
        Timeline.modals.closeWorkspaceEditor();
        return;
      }

      const createProjectInWorkspace = event.target.closest("[data-create-project-in-workspace]");
      if (createProjectInWorkspace) {
        const workspace = Timeline.workspaces.find((item) => String(item.id) === String(createProjectInWorkspace.dataset.createProjectInWorkspace));
        if (!Timeline.helpers.canManageWorkspace(workspace)) {
          Timeline.actions.showToast("Only owners and admins can create projects.");
          return;
        }
        Timeline.modals.openProjectEditor(createProjectInWorkspace.dataset.createProjectInWorkspace);
        return;
      }

      const createActiveProj = event.target.closest("[data-create-project-in-workspace-active]");
      if (createActiveProj) {
        const activeWs = Timeline.state.activeWorkspaceId;
        const workspace = Timeline.helpers.activeWorkspace();
        if (!Timeline.helpers.canManageWorkspace(workspace)) {
          Timeline.actions.showToast("Only owners and admins can create projects.");
          return;
        }
        Timeline.modals.openProjectEditor(activeWs);
        return;
      }

      const projectButton = event.target.closest("[data-workspace-id][data-project-name]");
      if (projectButton && !event.target.closest("#workspaceList")) {
        Timeline.actions.switchWorkspace(projectButton.dataset.workspaceId, projectButton.dataset.projectName || "");
        return;
      }

      if (event.target.closest("[data-close-project-editor]")) {
        Timeline.modals.closeProjectEditor();
        return;
      }

      if (event.target.closest("[data-close-project-invite]")) {
        Timeline.modals.closeProjectInviteModal();
        return;
      }

      if (event.target.closest("[data-close-help]")) {
        Timeline.modals.closeHelpModal();
        return;
      }

      const favoriteButton = event.target.closest("[data-favorite-task]");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        Timeline.actions.toggleTaskFavorite(favoriteButton.dataset.favoriteTask);
        return;
      }

      const taskCard = event.target.closest("[data-task-id]");
      if (taskCard) Timeline.modals.openTask(taskCard.dataset.taskId);
      if (event.target.closest("[data-close-task-modal]")) Timeline.modals.closeTaskModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        Timeline.modals.closeTaskModal();
        Timeline.modals.closeTaskEditor();
        Timeline.modals.closeWorkspaceEditor();
        Timeline.modals.closeProjectEditor();
        Timeline.modals.closeProjectInviteModal();
        Timeline.modals.closeHelpModal();
        toggleSidebar(false);
        selectors.profileDropdown.classList.add("hidden");
      }
    });

    // Delegate Kanban drag events and calendar mouse actions
    Timeline.interactions.setupDragAndDrop();
  }

  function setView(view) {
    Timeline.state.view = view;

    const viewConfig = {
      calendar: {
        title: `${Timeline.helpers.getCurrentDateHeaderString()} Timeline`,
        meta: "Scale: 1h = 142px",
      },
      kanban: {
        title: "Kanban Workflow",
        meta: "Grouped by task status",
      },
      list: {
        title: "Task List",
        meta: "Compact ownership view",
      },
      projects: {
        title: "Projects Hub",
        meta: "Workspace project details and schedule",
      }
    };

    selectors.viewTabs.forEach((tab) => {
      const isActive = tab.dataset.view === view;
      tab.setAttribute("aria-selected", String(isActive));
      tab.classList.toggle("border", isActive);
      tab.classList.toggle("border-cyan-300/30", isActive);
      tab.classList.toggle("bg-cyan-400/10", isActive);
      tab.classList.toggle("text-cyan-200", isActive);
      tab.classList.toggle("shadow-[inset_0_-2px_0_rgba(34,211,238,0.9)]", isActive);
      tab.classList.toggle("text-slate-400", !isActive);
    });

    selectors.viewTitle.textContent = viewConfig[view].title;
    if (selectors.viewMeta) {
      selectors.viewMeta.textContent = viewConfig[view].meta;
    }
    selectors.skeleton.classList.add("hidden");
    selectors.scroll.classList.toggle("hidden", view !== "calendar");
    if (view === "calendar") {
      window.setTimeout(Timeline.scrollToCurrentTime, 100);
    }
    selectors.kanbanView.classList.toggle("hidden", view !== "kanban");
    selectors.kanbanView.classList.toggle("flex", view === "kanban");
    selectors.listView.classList.toggle("hidden", view !== "list");
    selectors.listView.classList.toggle("flex", view === "list");

    const projectsViewContainer = document.getElementById("projectsView");
    if (projectsViewContainer) {
      projectsViewContainer.classList.toggle("hidden", view !== "projects");
      projectsViewContainer.classList.toggle("flex", view === "projects");
    }

    if (view === "projects") {
      Timeline.renderers.renderProjectsView();
    }
    Timeline.renderers.renderProjectHeader();

    Timeline.actions.showToast(`${viewConfig[view].title} enabled`);
  }

  function startRealtimeStatus() {
    window.setInterval(() => {
      if (selectors.status) {
        selectors.status.textContent = "Updated now";
      }
      Timeline.setProgressLine();
    }, 10000);

    window.setInterval(async () => {
      try {
        const result = await Timeline.timelineApi.loadProjectData(app, { day: Timeline.state.kanbanDayFilter });
        if (result && result.ok && Array.isArray(result.data.tasks)) {
          Timeline.tasks = result.data.tasks;
          Timeline.actions.normalizeWorkspaceTasks();
          Timeline.actions.applyTaskFilters();
          if (selectors.status) {
            selectors.status.textContent = "Synced now";
          }
        }
      } catch (err) {
        console.warn("Background auto-sync failed:", err);
      }
    }, 30000);
  }

  async function init() {
    setTheme(window.TaskFlow?.theme?.current() || "dark");
    Timeline.actions.loadStoredWorkspaces();
    Timeline.actions.ensureActiveWorkspace();
    Timeline.actions.loadFavorites();
    await Timeline.actions.loadProjectData();
    Timeline.actions.ensureActiveWorkspace();
    setProjectMode(Timeline.state.mode);
    Timeline.renderers.renderWorkspaceList();
    Timeline.renderers.renderProjectOverview();
    Timeline.renderers.renderProjectHeader();
    Timeline.renderers.renderHeader();
    Timeline.renderers.renderDayPicker();
    Timeline.renderers.renderNotifications();
    Timeline.actions.applyTaskFilters();
    Timeline.setProgressLine();
    bindEvents();
    startRealtimeStatus();
    Timeline.renderers.refreshIcons();

    window.setTimeout(() => {
      selectors.skeleton.classList.add("hidden");
      if (Timeline.state.mode === "detail" && Timeline.state.view === "calendar") {
        selectors.scroll.classList.remove("hidden");
        Timeline.scrollToCurrentTime();
      }
    }, 450);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
