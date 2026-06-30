(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.helpers = {
    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },

    getCurrentDateHeaderString() {
      const d = Timeline.helpers.selectedDayDate() || new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    },

    toIsoDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    parseIsoDate(value) {
      const parts = String(value || "").split("-");
      if (parts.length !== 3) return null;
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (!year || month < 0 || month > 11 || !day) return null;
      return new Date(year, month, day);
    },

    selectedDayDate() {
      if (!Timeline.state.kanbanDayFilter || Timeline.state.kanbanDayFilter === "all") return null;
      return Timeline.helpers.parseIsoDate(Timeline.state.kanbanDayFilter);
    },

    dayPickerOptions() {
      const base = Timeline.helpers.selectedDayDate() || new Date();
      const start = new Date(base);
      start.setDate(base.getDate() - 3);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
          iso: Timeline.helpers.toIsoDate(date),
          weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
          day: String(date.getDate()),
        };
      });
    },

    timeLabel(hour) {
      const wholeHour = Math.floor(hour);
      const minutes = Math.round((hour - wholeHour) * 60);
      const period = wholeHour >= 12 ? "PM" : "AM";
      let displayHour = wholeHour % 12;
      if (displayHour === 0) displayHour = 12;
      return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
    },

    statusTone(status) {
      const tones = {
        "To Do": "border-slate-400/20 bg-slate-400/10 text-slate-200",
        "In Progress": "border-cyan-300/30 bg-cyan-400/15 text-cyan-100",
        Review: "border-violet-300/30 bg-violet-400/15 text-violet-100",
        Done: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
      };
      return tones[status] || tones["To Do"];
    },

    priorityTone(priority) {
      const tones = {
        High: "bg-rose-400/15 text-rose-100 border-rose-300/25",
        Medium: "bg-amber-400/15 text-amber-100 border-amber-300/25",
        Low: "bg-emerald-400/15 text-emerald-100 border-emerald-300/25",
      };
      return tones[priority] || tones.Medium;
    },

    priorityRank(priority) {
      return { High: 3, Medium: 2, Low: 1 }[priority] || 0;
    },

    createSlug(value) {
      return String(value || "workspace")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 48) || `workspace-${Date.now().toString(36)}`;
    },

    activeWorkspace() {
      return Timeline.workspaces.find((w) => w.id === Timeline.state.activeWorkspaceId) || Timeline.workspaces[1] || Timeline.workspaces[0];
    },

    activeProjectName() {
      const workspace = Timeline.helpers.activeWorkspace();
      if (!workspace) return "";
      return Timeline.state.activeProjectName || (workspace.projects && workspace.projects[0]) || workspace.name;
    },

    isFavorite(taskId) {
      return Timeline.state.favoriteIds.includes(taskId);
    },

    favoriteIndex(taskId) {
      const index = Timeline.state.favoriteIds.indexOf(taskId);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    },

    compareFavorites(a, b) {
      if (!Timeline.state.favoriteFirst) return 0;
      const favoriteA = Timeline.helpers.isFavorite(a.id);
      const favoriteB = Timeline.helpers.isFavorite(b.id);
      if (favoriteA !== favoriteB) return favoriteA ? -1 : 1;
      if (favoriteA && favoriteB) return Timeline.helpers.favoriteIndex(a.id) - Timeline.helpers.favoriteIndex(b.id);
      return 0;
    },

    createTaskId(title) {
      const slug = String(title || "task")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 42);
      return `${slug || "task"}-${Date.now().toString(36)}`;
    },

    taskMatchesDayFilter(task, filterVal) {
      if (!filterVal || filterVal === "all") return true;
      if (task.dueDate) return task.dueDate === filterVal;
      if (!task.due || task.due === "No date") return false;

      const parts = filterVal.split("-");
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

      const taskDueLower = task.due.toLowerCase();
      const targetMonth = months[d.getMonth()];
      const targetDay = d.getDate();

      if (taskDueLower.includes(targetMonth)) {
        const dayStrPattern1 = `0${targetDay}`;
        const dayStrPattern2 = `${targetDay}`;
        const words = taskDueLower.split(/\s+/);
        return words.includes(dayStrPattern1) || words.includes(dayStrPattern2) || words.includes(String(targetDay));
      }
      return false;
    },

    taskMatchesQuery(task, query) {
      if (!query) return true;
      return [task.title, task.subtitle, task.category, task.priority, task.status, task.owner, task.due]
        .join(" ")
        .toLowerCase()
        .includes(query);
    },

    workspaceTasks(workspaceId) {
      return Timeline.tasks.filter((task) => task.workspaceId === workspaceId);
    },

    projectTasks(workspaceId, projectName) {
      return Timeline.tasks.filter((task) => task.workspaceId === workspaceId && task.projectName === projectName);
    },

    statusProgress(status) {
      return {
        "To Do": 0,
        "In Progress": 50,
        Review: 75,
        Done: 100,
      }[status] ?? 0;
    },

    progressValue(value, fallback = 0) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) {
        return Math.min(100, Math.max(0, Number.parseInt(fallback, 10) || 0));
      }
      return Math.min(100, Math.max(0, parsed));
    },

    taskProgress(task) {
      if (!task) return 0;
      if (task.status === "Done") return 100;
      return Timeline.helpers.progressValue(task.progress, 0);
    },

    nextProgressForStatus(status, currentProgress = 0, progressWasEdited = false) {
      if (status === "Done") return 100;
      if (status === "To Do" && !progressWasEdited) return 0;
      return Timeline.helpers.progressValue(currentProgress, 0);
    },

    completionMeta(items) {
      const total = items.length;
      const done = items.filter((task) => task.status === "Done").length;
      return {
        total,
        done,
        active: Math.max(total - done, 0),
        progress: total ? Math.round((done / total) * 100) : 0,
      };
    },

    projectStatusFromProgress(progress) {
      const value = Timeline.helpers.progressValue(progress, 0);
      if (value === 100) return "Done";
      if (value > 0) return "In Progress";
      return "To Do";
    },

    formatScheduleDate(value) {
      if (!value) return "No date";
      const date = Timeline.helpers.parseIsoDate(String(value).slice(0, 10));
      if (!date) return "No date";
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    },

    scheduleDateRange(startDate, dueDate) {
      const startLabel = Timeline.helpers.formatScheduleDate(startDate);
      const dueLabel = Timeline.helpers.formatScheduleDate(dueDate);
      if (startLabel === "No date" && dueLabel === "No date") return "No date";
      if (startLabel === "No date") return dueLabel;
      if (dueLabel === "No date" || startLabel === dueLabel) return startLabel;
      return `${startLabel} - ${dueLabel}`;
    },

    projectScheduleDates(workspace, projectName, tasks = []) {
      const schedule = workspace?.projectSchedule?.[projectName] || {};
      let startDate = schedule.startDate || schedule.start || "";
      let dueDate = schedule.dueDate || schedule.endDate || schedule.due || "";
      const taskDates = tasks
        .map((task) => task.dueDate)
        .filter(Boolean)
        .sort();

      if (!startDate && taskDates.length) {
        startDate = taskDates[0];
      }
      if (!dueDate && taskDates.length) {
        dueDate = taskDates[taskDates.length - 1];
      }

      return {
        startDate,
        dueDate,
        label: Timeline.helpers.scheduleDateRange(startDate, dueDate),
      };
    },

    completionFor(items) {
      return Timeline.helpers.completionMeta(items).progress;
    },

    currentUserName() {
      return String(Timeline.app.dataset.userName || "").trim().toLowerCase();
    },

    baseRole() {
      return String(Timeline.app.dataset.userRole || "viewer").trim().toLowerCase();
    },

    workspaceRole(workspace = Timeline.helpers.activeWorkspace()) {
      return String(workspace?.role || Timeline.helpers.baseRole() || "viewer").toLowerCase();
    },

    roleLabel(role = Timeline.helpers.workspaceRole()) {
      return {
        owner: "Owner",
        admin: "Admin",
        manager: "Manager",
        member: "Member",
        viewer: "Viewer",
      }[role] || "Viewer";
    },

    roleCanManage(role = Timeline.helpers.baseRole()) {
      return ["owner", "admin"].includes(String(role || "").toLowerCase());
    },

    canManageWorkspace(workspace = Timeline.helpers.activeWorkspace()) {
      if (!workspace) return Timeline.helpers.roleCanManage();
      if (typeof workspace.canManage === "boolean") return workspace.canManage;
      return Timeline.helpers.roleCanManage(Timeline.helpers.workspaceRole(workspace));
    },

    canEditTask(task) {
      if (!task) return false;
      if (Timeline.helpers.canManageWorkspace()) return true;
      const currentUserName = Timeline.helpers.currentUserName();
      return Boolean(currentUserName && task.owner && String(task.owner).trim().toLowerCase() === currentUserName);
    },

    permissionSummary(workspace = Timeline.helpers.activeWorkspace()) {
      const role = Timeline.helpers.roleLabel(Timeline.helpers.workspaceRole(workspace));
      if (Timeline.helpers.canManageWorkspace(workspace)) {
        return `${role} - can create projects, invite members, and move tasks.`;
      }
      return `${role} - read-only for project creation; you can only edit tasks assigned to you.`;
    }
  };
})();
