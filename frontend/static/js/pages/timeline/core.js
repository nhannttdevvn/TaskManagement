(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.app = document.getElementById("timelineApp");
  if (!Timeline.app) return;

  Timeline.timelineApi = window.TaskFlow.timelineApi;
  Timeline.toast = window.TaskFlow.toast;
  Timeline.allowDemoFallback = Timeline.app.dataset.allowDemoFallback === "true";

  Timeline.scale = 142;
  Timeline.timelineStart = 0;
  Timeline.timelineEnd = 23;

  Timeline.tasks = [];
  Timeline.notifications = [
    "Web Visual Design moved to high priority.",
    "Development is scheduled for 9:30 AM.",
    "UX Copywrite has 4 new comments.",
  ];
  Timeline.workspaces = [];

  Timeline.wasDraggedOrResized = false;
  Timeline.activeDragTaskId = null;
  Timeline.isDragging = false;
  Timeline.isResizing = false;
  Timeline.dragStartX = 0;
  Timeline.dragStartY = 0;
  Timeline.dragStartTaskX = 0;
  Timeline.dragStartWidth = 0;
  Timeline.dragStartRow = 0;

  Timeline.state = {
    filteredTasks: [],
    view: "calendar",
    activeWorkspaceId: window.localStorage.getItem("taskflow-active-workspace") || "",
    activeProjectName: window.localStorage.getItem("taskflow-active-project") || "",
    mode: window.location.hash.startsWith("#project-") ? "detail" : "overview",
    kanbanQuery: "",
    kanbanPriority: "all",
    kanbanSort: "status",
    kanbanDayFilter: window.localStorage.getItem("taskflow-kanban-day-filter") || "all",
    favoriteFirst: true,
    favoriteIds: [],
    draggedTaskId: null,
    editorStatus: "To Do",
  };

  Timeline.selectors = {
    sidebar: document.getElementById("timelineSidebar"),
    sidebarOverlay: document.getElementById("timelineSidebarOverlay"),
    sidebarToggle: document.getElementById("timelineSidebarToggle"),
    workspaceToggle: document.getElementById("workspaceToggle"),
    workspaceItems: document.getElementById("workspaceItems"),
    workspaceCurrentTitle: document.getElementById("workspaceCurrentTitle"),
    workspaceList: document.getElementById("workspaceList"),
    kanbanDayPicker: document.getElementById("kanbanDayPicker"),
    clearKanbanDayFilter: document.getElementById("clearKanbanDayFilter"),
    addWorkspaceButton: document.getElementById("addWorkspaceButton"),
    themeToggle: document.getElementById("timelineThemeToggle"),
    searchInput: document.getElementById("timelineSearch"),
    searchCount: document.getElementById("timelineSearchCount"),
    notificationToggle: document.getElementById("timelineNotificationToggle"),
    notificationDropdown: document.getElementById("timelineNotificationDropdown"),
    notificationList: document.getElementById("timelineNotificationList"),
    projectOverviewPanel: document.getElementById("projectOverviewPanel"),
    projectOverviewStats: document.getElementById("projectOverviewStats"),
    projectOverviewCards: document.getElementById("projectOverviewCards"),
    projectOverviewRows: document.getElementById("projectOverviewRows"),
    overviewWorkspaceCount: document.getElementById("overviewWorkspaceCount"),
    overviewAddWorkspace: document.getElementById("overviewAddWorkspace"),
    projectDetailHeader: document.getElementById("projectDetailHeader"),
    workspace: document.getElementById("timelineWorkspace"),
    skeleton: document.getElementById("timelineSkeleton"),
    scroll: document.getElementById("timelineScroll"),
    viewTabs: Array.from(document.querySelectorAll(".timeline-view-tab")),
    viewTitle: document.getElementById("timelineViewTitle"),
    viewMeta: document.getElementById("timelineViewMeta"),
    addTaskButton: document.getElementById("timelineAddTask"),
    favoriteSortButton: document.getElementById("projectFavoriteSort"),
    kanbanView: document.getElementById("kanbanView"),
    kanbanColumns: document.getElementById("kanbanColumns"),
    kanbanSearch: document.getElementById("kanbanSearch"),
    kanbanPriorityFilter: document.getElementById("kanbanPriorityFilter"),
    kanbanSort: document.getElementById("kanbanSort"),
    kanbanAddTask: document.getElementById("kanbanAddTask"),
    listView: document.getElementById("listView"),
    listRows: document.getElementById("listRows"),
    canvas: document.getElementById("timelineCanvas"),
    header: document.getElementById("timelineHeader"),
    grid: document.getElementById("timelineGrid"),
    taskLayer: document.getElementById("taskLayer"),
    progressLine: document.getElementById("progressLine"),
    status: document.getElementById("timelineStatus"),
    projectBreadcrumb: document.getElementById("projectBreadcrumb"),
    projectCategory: document.getElementById("projectCategory"),
    projectTitle: document.getElementById("projectTitle"),
    projectCompany: document.getElementById("projectCompany"),
    projectDate: document.getElementById("projectDate"),
    projectPermissionBadge: document.getElementById("projectPermissionBadge"),
    timelinePermissionHint: document.getElementById("timelinePermissionHint"),
    projectActionHint: document.getElementById("projectActionHint"),
    projectMemberStack: document.getElementById("projectMemberStack"),
    workspaceInviteButton: document.getElementById("workspaceInviteButton"),
    helpToggle: document.getElementById("timelineHelpToggle"),
    helpModal: document.getElementById("timelineHelpModal"),
    profileToggle: document.getElementById("timelineProfileToggle"),
    profileDropdown: document.getElementById("timelineProfileDropdown"),
    modal: document.getElementById("timelineTaskModal"),
    detail: document.getElementById("timelineTaskDetail"),
    editorModal: document.getElementById("taskEditorModal"),
    editorForm: document.getElementById("taskEditorForm"),
    editorTitle: document.getElementById("taskEditorTitle"),
    editorProgressValue: document.getElementById("taskProgressValue"),
    workspaceEditorModal: document.getElementById("workspaceEditorModal"),
    workspaceEditorForm: document.getElementById("workspaceEditorForm"),
    projectEditorModal: document.getElementById("projectEditorModal"),
    projectEditorForm: document.getElementById("projectEditorForm"),
    projectInviteModal: document.getElementById("projectInviteModal"),
    projectInviteForm: document.getElementById("projectInviteForm"),
    projectInviteSubmit: document.getElementById("projectInviteSubmit"),
    toast: document.getElementById("timelineToast"),
  };
})();
