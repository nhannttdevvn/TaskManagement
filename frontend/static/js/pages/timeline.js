(function () {
  "use strict";

  const app = document.getElementById("timelineApp");
  if (!app) return;

  const timelineApi = window.TaskFlow?.timelineApi;
  const toast = window.TaskFlow?.toast;
  const allowDemoFallback = app.dataset.allowDemoFallback === "true";

  const scale = 142;
  const timelineStart = 9;
  const timelineEnd = 17;

  let tasks = [
    {
      id: "development",
      title: "Development",
      subtitle: "Hero section build",
      start: 9.5,
      duration: 2.25,
      row: 0,
      color: "bg-sky-200 border-sky-300",
      text: "text-slate-950",
      members: ["MS", "RA", "DN"],
      category: "Frontend",
      priority: "Medium",
      status: "In Progress",
      owner: "Mostafa",
      due: "Nov 15",
      progress: 64,
      comments: 8,
      attachments: 3,
    },
    {
      id: "ux-copywrite",
      title: "UX Copywrite",
      subtitle: "Landing page messaging",
      start: 10.2,
      duration: 1.75,
      row: 1,
      color: "bg-violet-200 border-violet-300",
      text: "text-slate-950",
      members: ["AN", "LM"],
      category: "Content",
      priority: "Low",
      status: "To Do",
      owner: "Anna Lee",
      due: "Nov 15",
      progress: 28,
      comments: 4,
      attachments: 1,
    },
    {
      id: "bug-fix",
      title: "Bug Fix",
      subtitle: "Responsive issue sweep",
      start: 12.15,
      duration: 1.35,
      row: 2,
      color: "bg-rose-200 border-rose-300",
      text: "text-slate-950",
      members: ["DN", "QA"],
      category: "QA",
      priority: "High",
      status: "Review",
      owner: "Duy Nguyen",
      due: "Nov 15",
      progress: 78,
      comments: 6,
      attachments: 2,
    },
    {
      id: "web-visual-design",
      title: "Web Visual Design",
      subtitle: "Final visual direction",
      start: 13.25,
      duration: 2.85,
      row: 1,
      color: "bg-emerald-200 border-emerald-300",
      text: "text-slate-950",
      members: ["MS", "YL", "AK", "SN"],
      category: "Web Design",
      priority: "High",
      status: "Done",
      owner: "Sarah Nguyen",
      due: "Nov 15",
      progress: 96,
      comments: 15,
      attachments: 7,
      featured: true,
    },
    {
      id: "design-system-audit",
      title: "Design System Audit",
      subtitle: "Review spacing and button states",
      start: 9.25,
      duration: 1,
      row: 0,
      color: "bg-cyan-200 border-cyan-300",
      text: "text-slate-950",
      members: ["SN", "YL"],
      category: "Design",
      priority: "Medium",
      status: "To Do",
      owner: "Sarah Nguyen",
      due: "Nov 16",
      progress: 18,
      comments: 3,
      attachments: 1,
      kanbanOnly: true,
    },
    {
      id: "analytics-copy-review",
      title: "Analytics Copy Review",
      subtitle: "Polish chart labels and empty states",
      start: 11,
      duration: 1.2,
      row: 1,
      color: "bg-violet-200 border-violet-300",
      text: "text-slate-950",
      members: ["AN", "MS"],
      category: "Content",
      priority: "Low",
      status: "To Do",
      owner: "Anna Lee",
      due: "Nov 16",
      progress: 12,
      comments: 2,
      attachments: 0,
      kanbanOnly: true,
    },
    {
      id: "component-cleanup",
      title: "Component Cleanup",
      subtitle: "Reduce visual weight in cards",
      start: 11.4,
      duration: 1.5,
      row: 2,
      color: "bg-sky-200 border-sky-300",
      text: "text-slate-950",
      members: ["RA", "DN"],
      category: "Frontend",
      priority: "Medium",
      status: "In Progress",
      owner: "Ravi Anand",
      due: "Nov 16",
      progress: 52,
      comments: 5,
      attachments: 2,
      kanbanOnly: true,
    },
    {
      id: "mobile-breakpoints",
      title: "Mobile Breakpoints",
      subtitle: "Check dashboard and timeline widths",
      start: 12.6,
      duration: 1.1,
      row: 0,
      color: "bg-emerald-200 border-emerald-300",
      text: "text-slate-950",
      members: ["DN", "QA"],
      category: "QA",
      priority: "High",
      status: "In Progress",
      owner: "Duy Nguyen",
      due: "Nov 17",
      progress: 46,
      comments: 7,
      attachments: 1,
      kanbanOnly: true,
    },
    {
      id: "modal-accessibility",
      title: "Modal Accessibility",
      subtitle: "Keyboard and focus states",
      start: 14.1,
      duration: 1,
      row: 1,
      color: "bg-rose-200 border-rose-300",
      text: "text-slate-950",
      members: ["QA", "LM"],
      category: "QA",
      priority: "High",
      status: "Review",
      owner: "Linh Mai",
      due: "Nov 17",
      progress: 84,
      comments: 9,
      attachments: 3,
      kanbanOnly: true,
    },
    {
      id: "kanban-density-pass",
      title: "Kanban Density Pass",
      subtitle: "Tune card height and spacing",
      start: 15.2,
      duration: 1.1,
      row: 2,
      color: "bg-amber-200 border-amber-300",
      text: "text-slate-950",
      members: ["MS", "SN"],
      category: "UX",
      priority: "Medium",
      status: "Review",
      owner: "Mostafa",
      due: "Nov 17",
      progress: 72,
      comments: 4,
      attachments: 2,
      kanbanOnly: true,
    },
    {
      id: "chart-label-fix",
      title: "Chart Label Fix",
      subtitle: "Connector labels balanced",
      start: 10.8,
      duration: 1.35,
      row: 0,
      color: "bg-emerald-200 border-emerald-300",
      text: "text-slate-950",
      members: ["AK", "SN"],
      category: "Dashboard",
      priority: "Medium",
      status: "Done",
      owner: "An Khoa",
      due: "Nov 14",
      progress: 100,
      comments: 6,
      attachments: 1,
      kanbanOnly: true,
    },
    {
      id: "invite-flow-check",
      title: "Invite Flow Check",
      subtitle: "Validate modal and MySQL save",
      start: 16,
      duration: 0.9,
      row: 1,
      color: "bg-violet-200 border-violet-300",
      text: "text-slate-950",
      members: ["QA", "VN"],
      category: "Team",
      priority: "Low",
      status: "Done",
      owner: "Van Nguyen",
      due: "Nov 14",
      progress: 100,
      comments: 3,
      attachments: 0,
      kanbanOnly: true,
    },
  ];

  let notifications = [
    "Web Visual Design moved to high priority.",
    "Development is scheduled for 9:30 AM.",
    "UX Copywrite has 4 new comments.",
  ];

  let workspaces = [
    {
      id: "design-sprint",
      name: "Design Sprint",
      breadcrumb: "/ Product Discovery",
      category: "Sprint",
      company: "TaskFlow Studio",
      date: "Nov 12, 2026",
      members: ["SN", "MS", "DN", "AK", "YL"],
      projects: ["Research Plan", "Design System", "Sprint Review"],
    },
    {
      id: "fintask-landing-page",
      name: "Fintask Landing Page",
      breadcrumb: "/ Landing Page",
      category: "Web Design",
      company: "Fintask Inc.",
      date: "Nov 15, 2026",
      members: ["SN", "MS", "DN", "AK", "YL", "RA", "LM", "QA"],
      projects: ["Hero Section", "UX Copy", "Visual Design"],
    },
    {
      id: "checkout-flow",
      name: "Checkout Flow",
      breadcrumb: "/ Product Flow",
      category: "E-commerce",
      company: "FlowPay Team",
      date: "Nov 22, 2026",
      members: ["RA", "DN", "QA", "VN"],
      projects: ["Cart Review", "Payment States", "Error Handling"],
    },
    {
      id: "brand-refresh",
      name: "Brand Refresh",
      breadcrumb: "/ Creative",
      category: "Branding",
      company: "Northstar Labs",
      date: "Dec 04, 2026",
      members: ["AK", "YL", "SN", "LM", "TH"],
      projects: ["Logo Cleanup", "Color System", "Launch Assets"],
    },
  ];

  const state = {
    filteredTasks: tasks.slice(),
    view: "calendar",
    activeWorkspaceId: window.localStorage.getItem("taskflow-active-workspace") || "fintask-landing-page",
    activeProjectName: window.localStorage.getItem("taskflow-active-project") || "",
    mode: window.location.hash.startsWith("#project-") ? "detail" : "overview",
    kanbanQuery: "",
    kanbanPriority: "all",
    kanbanSort: "status",
    favoriteFirst: true,
    favoriteIds: [],
    draggedTaskId: null,
    editorStatus: "To Do",
  };

  const selectors = {
    sidebar: document.getElementById("timelineSidebar"),
    sidebarOverlay: document.getElementById("timelineSidebarOverlay"),
    sidebarToggle: document.getElementById("timelineSidebarToggle"),
    workspaceToggle: document.getElementById("workspaceToggle"),
    workspaceItems: document.getElementById("workspaceItems"),
    workspaceCurrentTitle: document.getElementById("workspaceCurrentTitle"),
    workspaceList: document.getElementById("workspaceList"),
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
    workspaceEditorModal: document.getElementById("workspaceEditorModal"),
    workspaceEditorForm: document.getElementById("workspaceEditorForm"),
    projectInviteModal: document.getElementById("projectInviteModal"),
    projectInviteForm: document.getElementById("projectInviteForm"),
    projectInviteSubmit: document.getElementById("projectInviteSubmit"),
    toast: document.getElementById("timelineToast"),
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function timeLabel(hour) {
    const wholeHour = Math.floor(hour);
    const minutes = Math.round((hour - wholeHour) * 60);
    const period = wholeHour >= 12 ? "PM" : "AM";
    const displayHour = wholeHour > 12 ? wholeHour - 12 : wholeHour;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  function statusTone(status) {
    const tones = {
      "To Do": "border-slate-400/20 bg-slate-400/10 text-slate-200",
      "In Progress": "border-cyan-300/30 bg-cyan-400/15 text-cyan-100",
      Review: "border-violet-300/30 bg-violet-400/15 text-violet-100",
      Done: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
    };
    return tones[status] || tones["To Do"];
  }

  function priorityTone(priority) {
    const tones = {
      High: "bg-rose-400/15 text-rose-100 border-rose-300/25",
      Medium: "bg-amber-400/15 text-amber-100 border-amber-300/25",
      Low: "bg-emerald-400/15 text-emerald-100 border-emerald-300/25",
    };
    return tones[priority] || tones.Medium;
  }

  function priorityRank(priority) {
    return { High: 3, Medium: 2, Low: 1 }[priority] || 0;
  }

  function createSlug(value) {
    return String(value || "workspace")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || `workspace-${Date.now().toString(36)}`;
  }

  function loadStoredWorkspaces() {
    try {
      const stored = JSON.parse(window.localStorage.getItem("taskflow-workspaces") || "[]");
      const existingIds = new Set(workspaces.map((workspace) => workspace.id));
      stored.forEach((workspace) => {
        if (workspace?.id && !existingIds.has(workspace.id)) {
          workspaces.push(workspace);
          existingIds.add(workspace.id);
        }
      });
    } catch {
      window.localStorage.removeItem("taskflow-workspaces");
    }
  }

  function saveCustomWorkspaces() {
    const defaultIds = new Set(["design-sprint", "fintask-landing-page", "checkout-flow", "brand-refresh"]);
    const custom = workspaces.filter((workspace) => !defaultIds.has(workspace.id));
    window.localStorage.setItem("taskflow-workspaces", JSON.stringify(custom));
  }

  function activeWorkspace() {
    return workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) || workspaces[1] || workspaces[0];
  }

  function activeProjectName() {
    const workspace = activeWorkspace();
    return state.activeProjectName || workspace.projects[0] || workspace.name;
  }

  function ensureActiveWorkspace() {
    if (!workspaces.some((workspace) => workspace.id === state.activeWorkspaceId)) {
      state.activeWorkspaceId = "fintask-landing-page";
      window.localStorage.setItem("taskflow-active-workspace", state.activeWorkspaceId);
    }
    const workspace = activeWorkspace();
    if (!state.activeProjectName || !workspace.projects.includes(state.activeProjectName)) {
      state.activeProjectName = workspace.projects[0] || workspace.name;
      window.localStorage.setItem("taskflow-active-project", state.activeProjectName);
    }
  }

  function normalizeWorkspaceTasks() {
    tasks = tasks.map((task, index) => {
      const workspace = task.workspaceId
        ? workspaces.find((item) => item.id === task.workspaceId) || workspaces[index % workspaces.length]
        : workspaces[index % workspaces.length];
      const projectName = task.projectName || workspace.projects[index % Math.max(workspace.projects.length, 1)] || workspace.name;
      return {
        ...task,
        workspaceId: workspace.id,
        projectName,
      };
    });
  }

  function renderWorkspaceMembers(members = []) {
    const visible = members.slice(0, 3);
    const remaining = Math.max(members.length - visible.length, 0);
    return `
      ${visible
        .map(
          (member) => `
            <span class="inline-grid h-6 w-6 place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.56rem] font-black text-white">
              ${escapeHtml(member)}
            </span>
          `
        )
        .join("")}
      ${remaining ? `<span class="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-white/10 text-[0.56rem] font-black text-slate-200">+${remaining}</span>` : ""}
    `;
  }

  function renderWorkspaceList() {
    if (!selectors.workspaceList) return;
    selectors.workspaceCurrentTitle.textContent = state.mode === "overview" ? "Project Overview" : activeWorkspace().name;
    selectors.workspaceList.innerHTML = workspaces
      .map((workspace) => {
        const isActive = workspace.id === state.activeWorkspaceId;
        const count = tasks.filter((task) => task.workspaceId === workspace.id).length;
        return `
          <div class="rounded-2xl px-2.5 py-2 transition ${isActive ? "border border-white/12 bg-white/12 text-white shadow-[0_0_20px_rgba(34,211,238,0.08)]" : "text-slate-300"}">
            <button
              class="flex w-full items-center justify-between gap-2 text-left"
              type="button"
              data-workspace-overview="${workspace.id}"
            >
              <span class="truncate text-sm font-bold">${escapeHtml(workspace.name)}</span>
              <span class="rounded-full bg-slate-950/35 px-1.5 py-0.5 text-[0.58rem] font-black text-cyan-100">${count}</span>
            </button>
            <div class="mt-2 space-y-1">
              ${workspace.projects
                .map((project) => {
                  const isProjectActive = state.mode === "detail" && isActive && activeProjectName() === project;
                  const projectCount = tasks.filter((task) => task.workspaceId === workspace.id && task.projectName === project).length;
                  return `
                    <button
                      class="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-[0.72rem] font-bold transition hover:bg-white/10 ${isProjectActive ? "bg-cyan-300/14 text-cyan-100" : "text-slate-400"}"
                      type="button"
                      data-workspace-id="${workspace.id}"
                      data-project-name="${escapeHtml(project)}"
                    >
                      <span class="truncate">${escapeHtml(project)}</span>
                      <span class="text-[0.58rem] text-slate-500">${projectCount}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderProjectHeader() {
    const workspace = activeWorkspace();
    const projectName = activeProjectName();
    selectors.projectBreadcrumb.textContent = `${workspace.breadcrumb} / ${workspace.name}`;
    selectors.projectCategory.textContent = workspace.category;
    selectors.projectTitle.textContent = projectName;
    selectors.projectCompany.innerHTML = `<i data-lucide="building-2" class="h-3 w-3"></i> ${escapeHtml(workspace.company)}`;
    selectors.projectDate.innerHTML = `<i data-lucide="calendar-days" class="h-3 w-3"></i> ${escapeHtml(workspace.date)}`;
    selectors.projectMemberStack.innerHTML = renderWorkspaceMembers(workspace.members);
    refreshIcons();
  }

  function workspaceTasks(workspaceId) {
    return tasks.filter((task) => task.workspaceId === workspaceId);
  }

  function projectTasks(workspaceId, projectName) {
    return tasks.filter((task) => task.workspaceId === workspaceId && task.projectName === projectName);
  }

  function completionFor(items) {
    if (!items.length) return 0;
    const total = items.reduce((sum, task) => sum + Number(task.progress || 0), 0);
    return Math.round(total / items.length);
  }

  function renderProjectOverview() {
    if (!selectors.projectOverviewPanel) return;
    const totalProjects = workspaces.reduce((sum, workspace) => sum + workspace.projects.length, 0);
    const doneTasks = tasks.filter((task) => task.status === "Done").length;
    const activeTasks = tasks.filter((task) => task.status !== "Done").length;
    const members = new Set(workspaces.flatMap((workspace) => workspace.members));
    const statCards = [
      { label: "Workspaces", value: workspaces.length, icon: "layers-3", tone: "text-cyan-200 bg-cyan-400/15" },
      { label: "Projects", value: totalProjects, icon: "folder-kanban", tone: "text-violet-200 bg-violet-400/15" },
      { label: "Active Tasks", value: activeTasks, icon: "list-checks", tone: "text-amber-200 bg-amber-400/15" },
      { label: "Team Members", value: members.size, icon: "users-round", tone: "text-emerald-200 bg-emerald-400/15" },
    ];

    selectors.projectOverviewStats.innerHTML = statCards
      .map(
        (card) => `
          <article class="rounded-xl border border-white/10 bg-white/[0.055] p-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="grid h-8 w-8 place-items-center rounded-xl ${card.tone}">
                <i data-lucide="${card.icon}" class="h-3.5 w-3.5"></i>
              </span>
              <strong class="text-xl font-black text-white">${card.value}</strong>
            </div>
            <p class="mt-1.5 text-[0.68rem] font-bold text-slate-400">${card.label}</p>
          </article>
        `
      )
      .join("");

    selectors.overviewWorkspaceCount.textContent = `${workspaces.length} groups`;
    selectors.projectOverviewCards.innerHTML = workspaces
      .map((workspace) => {
        const items = workspaceTasks(workspace.id);
        const progress = completionFor(items);
        return `
          <article class="rounded-xl border border-white/10 bg-white/[0.052] p-2.5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.075] motion-reduce:transform-none">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-[0.6rem] font-black uppercase tracking-[0.14em] text-cyan-200">${escapeHtml(workspace.category)}</p>
                <h3 class="mt-0.5 truncate text-sm font-black text-white">${escapeHtml(workspace.name)}</h3>
                <p class="mt-0.5 truncate text-[0.66rem] font-semibold text-slate-400">${escapeHtml(workspace.company)} · ${escapeHtml(workspace.date)}</p>
              </div>
              <div class="-space-x-2 whitespace-nowrap scale-90 origin-right">${renderWorkspaceMembers(workspace.members)}</div>
            </div>
            <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <span class="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500 transition-all duration-700" style="width:${progress}%"></span>
            </div>
            <div class="mt-2 grid gap-1">
              ${workspace.projects
                .map((project) => {
                  const count = projectTasks(workspace.id, project).length;
                  return `
                    <button class="flex h-8 items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-slate-950/25 px-2 text-left transition hover:border-cyan-300/25 hover:bg-cyan-300/10" type="button" data-workspace-id="${workspace.id}" data-project-name="${escapeHtml(project)}">
                      <span class="truncate text-[0.72rem] font-black text-white">${escapeHtml(project)}</span>
                      <span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.56rem] font-black text-slate-400">${count}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </article>
        `;
      })
      .join("");

    selectors.projectOverviewRows.innerHTML = workspaces
      .flatMap((workspace) => workspace.projects.map((project) => ({ workspace, project, items: projectTasks(workspace.id, project) })))
      .map(
        ({ workspace, project, items }) => `
          <button class="flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.045] px-2.5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.075] motion-reduce:transform-none" type="button" data-workspace-id="${workspace.id}" data-project-name="${escapeHtml(project)}">
            <span class="min-w-0">
              <span class="block truncate text-[0.8rem] font-black text-white">${escapeHtml(project)}</span>
              <span class="block truncate text-[0.66rem] font-semibold text-slate-400">${escapeHtml(workspace.name)}</span>
            </span>
            <span class="shrink-0 text-right">
              <span class="block text-xs font-black text-cyan-200">${completionFor(items)}%</span>
              <span class="block text-[0.62rem] font-bold text-slate-500">${items.length} tasks</span>
            </span>
          </button>
        `
      )
      .join("");

    refreshIcons();
  }

  function setProjectMode(mode) {
    state.mode = mode;
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
      selectors.scroll.classList.toggle("hidden", state.view !== "calendar");
      selectors.kanbanView.classList.toggle("hidden", state.view !== "kanban");
      selectors.kanbanView.classList.toggle("flex", state.view === "kanban");
      selectors.listView.classList.toggle("hidden", state.view !== "list");
      selectors.listView.classList.toggle("flex", state.view === "list");
    }
  }

  function switchWorkspace(workspaceId, projectName = "") {
    if (!workspaces.some((workspace) => workspace.id === workspaceId)) return;
    state.activeWorkspaceId = workspaceId;
    const workspace = activeWorkspace();
    state.activeProjectName = projectName || workspace.projects[0] || workspace.name;
    window.localStorage.setItem("taskflow-active-workspace", workspaceId);
    window.localStorage.setItem("taskflow-active-project", state.activeProjectName);
    setProjectMode("detail");
    renderWorkspaceList();
    renderProjectHeader();
    applyTaskFilters();
    window.history.replaceState(null, "", `#project-${createSlug(state.activeProjectName)}`);
    selectors.workspace.scrollIntoView({ block: "nearest", behavior: "smooth" });
    showToast(`${state.activeProjectName} opened`);
  }

  function loadFavorites() {
    try {
      state.favoriteIds = JSON.parse(window.localStorage.getItem("taskflow-project-favorites") || "[]");
      state.favoriteFirst = window.localStorage.getItem("taskflow-project-favorite-first") !== "false";
    } catch {
      state.favoriteIds = [];
      state.favoriteFirst = true;
    }
  }

  function saveFavorites() {
    window.localStorage.setItem("taskflow-project-favorites", JSON.stringify(state.favoriteIds));
    window.localStorage.setItem("taskflow-project-favorite-first", String(state.favoriteFirst));
  }

  function isFavorite(taskId) {
    return state.favoriteIds.includes(taskId);
  }

  function favoriteIndex(taskId) {
    const index = state.favoriteIds.indexOf(taskId);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }

  function updateFavoriteSortButton() {
    if (!selectors.favoriteSortButton) return;
    selectors.favoriteSortButton.setAttribute("aria-pressed", String(state.favoriteFirst));
    selectors.favoriteSortButton.classList.toggle("border-amber-300/25", state.favoriteFirst);
    selectors.favoriteSortButton.classList.toggle("bg-amber-300/10", state.favoriteFirst);
    selectors.favoriteSortButton.classList.toggle("text-amber-200", state.favoriteFirst);
    selectors.favoriteSortButton.classList.toggle("border-white/10", !state.favoriteFirst);
    selectors.favoriteSortButton.classList.toggle("bg-white/10", !state.favoriteFirst);
    selectors.favoriteSortButton.classList.toggle("text-slate-300", !state.favoriteFirst);
  }

  function toggleTaskFavorite(taskId) {
    const index = state.favoriteIds.indexOf(taskId);
    if (index >= 0) {
      state.favoriteIds.splice(index, 1);
      showToast("Removed from favorites");
    } else {
      state.favoriteIds.push(taskId);
      showToast("Saved to favorites");
    }
    saveFavorites();
    applyTaskFilters();
  }

  function compareFavorites(a, b) {
    if (!state.favoriteFirst) return 0;
    const favoriteA = isFavorite(a.id);
    const favoriteB = isFavorite(b.id);
    if (favoriteA !== favoriteB) return favoriteA ? -1 : 1;
    if (favoriteA && favoriteB) return favoriteIndex(a.id) - favoriteIndex(b.id);
    return 0;
  }

  function createTaskId(title) {
    const slug = String(title || "task")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 42);
    return `${slug || "task"}-${Date.now().toString(36)}`;
  }

  function taskMatchesQuery(task, query) {
    if (!query) return true;
    return [task.title, task.subtitle, task.category, task.priority, task.status, task.owner, task.due]
      .join(" ")
      .toLowerCase()
      .includes(query);
  }

  function applyTaskFilters() {
    const query = state.kanbanQuery.trim().toLowerCase();
    const priority = state.kanbanPriority;
    const sorted = tasks
      .filter((task) => task.workspaceId === state.activeWorkspaceId)
      .filter((task) => task.projectName === activeProjectName())
      .filter((task) => taskMatchesQuery(task, query))
      .filter((task) => priority === "all" || task.priority === priority)
      .slice();

    const sorters = {
      status: (a, b) => compareFavorites(a, b) || a.status.localeCompare(b.status) || priorityRank(b.priority) - priorityRank(a.priority),
      priority: (a, b) => compareFavorites(a, b) || priorityRank(b.priority) - priorityRank(a.priority) || a.title.localeCompare(b.title),
      progress: (a, b) => compareFavorites(a, b) || b.progress - a.progress,
      due: (a, b) => compareFavorites(a, b) || String(a.due).localeCompare(String(b.due)) || a.title.localeCompare(b.title),
    };

    sorted.sort(sorters[state.kanbanSort] || sorters.status);
    state.filteredTasks = sorted;
    renderTaskViews(state.filteredTasks);
    renderProjectOverview();
    updateFavoriteSortButton();
  }

  function renderAvatarStack(members, size = "h-6 w-6") {
    return members
      .slice(0, 4)
      .map(
        (member, index) => `
          <span class="grid ${size} place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-300 to-violet-500 text-[0.58rem] font-black text-white ${index ? "-ml-2" : ""}">
            ${escapeHtml(member)}
          </span>
        `
      )
      .join("");
  }

  function renderHeader() {
    const hours = [];
    for (let hour = timelineStart; hour <= timelineEnd; hour += 1) {
      hours.push(hour);
    }

    selectors.header.style.gridTemplateColumns = `repeat(${hours.length}, ${scale}px)`;
    selectors.header.innerHTML = hours
      .map(
        (hour) => `
          <div class="flex flex-col justify-center border-r border-white/10 px-3">
            <span class="text-xs font-extrabold uppercase text-cyan-200">Nov 15</span>
            <span class="text-xs font-bold text-white">${timeLabel(hour)}</span>
          </div>
        `
      )
      .join("");

    selectors.grid.innerHTML = hours
      .map((_, index) => {
        const left = index * scale;
        return `<div class="absolute top-0 bottom-0 border-r border-white/10" style="left:${left}px"></div>`;
      })
      .join("");
  }

  function renderTasks(items = state.filteredTasks) {
    const timelineItems = items.filter((task) => !task.kanbanOnly);
    selectors.taskLayer.innerHTML = timelineItems.length
      ? timelineItems
        .map((task) => {
          const left = (task.start - timelineStart) * scale;
          const width = task.duration * scale;
          const top = task.row * 70 + 8;
          const avatars = renderAvatarStack(task.members);
          const featuredMeta = task.featured
            ? `
            <div class="mt-3 flex flex-wrap items-center gap-1.5">
              <span class="rounded-full bg-white/55 px-2 py-0.5 text-[0.68rem] font-black">${escapeHtml(task.category)}</span>
              <span class="rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.68rem] font-black text-rose-700">${escapeHtml(task.priority)}</span>
              <span class="inline-flex items-center gap-1 rounded-full bg-white/45 px-2 py-0.5 text-[0.68rem] font-black"><i data-lucide="message-square" class="h-3 w-3"></i>${task.comments}</span>
              <span class="inline-flex items-center gap-1 rounded-full bg-white/45 px-2 py-0.5 text-[0.68rem] font-black"><i data-lucide="paperclip" class="h-3 w-3"></i>${task.attachments}</span>
            </div>
          `
            : "";

          return `
          <button
            class="timeline-task absolute rounded-2xl border ${task.color} ${task.text} p-2.5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.3)] motion-reduce:transform-none"
            type="button"
            draggable="true"
            data-task-id="${task.id}"
            style="left:${left}px; top:${top}px; width:${width}px; min-height:${task.featured ? 96 : 72}px"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-base font-black">${escapeHtml(task.title)}</h3>
                <p class="mt-0.5 truncate text-xs font-semibold opacity-70">${escapeHtml(task.subtitle)}</p>
              </div>
              <i data-lucide="grip" class="h-4 w-4 shrink-0 opacity-45"></i>
            </div>
            <div class="mt-2.5 flex items-center justify-between gap-3">
              <div class="flex items-center">${avatars}</div>
              <span class="text-[0.68rem] font-black opacity-65">${timeLabel(task.start)}</span>
            </div>
            ${featuredMeta}
          </button>
        `;
        })
        .join("")
      : `
        <div class="absolute left-6 top-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm font-semibold text-slate-400">
          No timeline tasks match your search.
        </div>
      `;

    if (selectors.searchCount) {
      selectors.searchCount.textContent = `${items.length} task${items.length === 1 ? "" : "s"}`;
    }
    refreshIcons();
  }

  function renderKanban(items = state.filteredTasks) {
    const columns = [
      { name: "To Do", icon: "circle" },
      { name: "In Progress", icon: "loader-circle" },
      { name: "Review", icon: "scan-eye" },
      { name: "Done", icon: "circle-check" },
    ];

    selectors.kanbanColumns.innerHTML = columns
      .map((column) => {
        const columnTasks = items.filter((task) => task.status === column.name);
        return `
          <section class="kanban-column flex min-h-0 flex-col rounded-2xl border border-white/[0.07] bg-white/[0.032] p-2.5 transition duration-200" data-column-status="${column.name}">
            <div class="mb-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-lg border ${statusTone(column.name)}">
              <i data-lucide="${column.icon}" class="h-3 w-3"></i>
            </span>
            <h3 class="text-sm font-black text-white">${column.name}</h3>
          </div>
              <div class="flex items-center gap-1">
                <span class="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-black text-slate-300">${columnTasks.length}</span>
                <button class="grid h-6 w-6 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" data-add-status="${column.name}" aria-label="Add task to ${column.name}">
                  <i data-lucide="plus" class="h-3.5 w-3.5"></i>
                </button>
                <button class="grid h-6 w-6 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" data-column-menu="${column.name}" aria-label="${column.name} actions">
                  <i data-lucide="more-horizontal" class="h-3.5 w-3.5"></i>
                </button>
              </div>
            </div>
            <div class="kanban-dropzone min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" data-drop-status="${column.name}">
              ${columnTasks.length
            ? columnTasks
              .map(
                        (task) => `
                          <article
                            class="group w-full rounded-xl border border-white/[0.07] bg-slate-950/35 p-2.5 text-left shadow-[0_6px_18px_rgba(2,6,23,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.055] motion-reduce:transform-none"
                            role="button"
                            tabindex="0"
                            draggable="true"
                            data-task-id="${task.id}"
                          >
                            <div class="flex items-start justify-between gap-2">
                              <div class="min-w-0">
                                <h4 class="truncate text-[0.82rem] font-black text-white">${escapeHtml(task.title)}</h4>
                                <p class="mt-0.5 truncate text-[0.68rem] font-semibold text-slate-400">${escapeHtml(task.subtitle)}</p>
                              </div>
                              <div class="flex shrink-0 items-center gap-1">
                                <button class="grid h-6 w-6 place-items-center rounded-lg border transition ${isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${escapeHtml(task.title)}">
                                  <i data-lucide="star" class="h-3.5 w-3.5 ${isFavorite(task.id) ? "fill-current" : ""}"></i>
                                </button>
                                <span class="rounded-full border px-1.5 py-0.5 text-[0.56rem] font-black ${priorityTone(task.priority)}">${escapeHtml(task.priority)}</span>
                              </div>
                            </div>
                            <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                              <span class="block h-full rounded-full bg-cyan-300/55 transition-all duration-700" style="width:${task.progress}%"></span>
                            </div>
                            <div class="mt-2.5 flex items-center justify-between gap-2">
                              <div class="flex items-center">${renderAvatarStack(task.members, "h-4 w-4")}</div>
                              <div class="flex items-center gap-2 text-[0.62rem] font-bold text-slate-500">
                                <span class="inline-flex items-center gap-1"><i data-lucide="message-square" class="h-3 w-3"></i>${task.comments}</span>
                                <span class="inline-flex items-center gap-1"><i data-lucide="paperclip" class="h-3 w-3"></i>${task.attachments}</span>
                                <span>${escapeHtml(task.due)}</span>
                              </div>
                            </div>
                          </article>
                        `
              )
              .join("")
            : `<div class="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs font-semibold text-slate-500">No tasks</div>`
          }
            </div>
          </section>
        `;
      })
      .join("");

    refreshIcons();
  }

  function renderList(items = state.filteredTasks) {
    selectors.listRows.innerHTML = items.length
      ? items
        .map(
          (task) => `
              <article
                class="mb-1.5 grid w-full grid-cols-1 items-center gap-2 rounded-xl border border-white/[0.065] bg-white/[0.032] px-3 py-2 text-left transition duration-200 hover:-translate-y-px hover:border-cyan-300/20 hover:bg-white/[0.06] hover:shadow-[0_8px_20px_rgba(2,6,23,0.12)] motion-reduce:transform-none lg:grid-cols-[minmax(340px,2.2fr)_minmax(150px,0.8fr)_minmax(120px,0.65fr)_minmax(150px,0.75fr)_minmax(90px,0.45fr)] lg:gap-4"
                role="button"
                tabindex="0"
                draggable="true"
                data-task-id="${task.id}"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <button class="grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition ${isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${escapeHtml(task.title)}">
                      <i data-lucide="star" class="h-3.5 w-3.5 ${isFavorite(task.id) ? "fill-current" : ""}"></i>
                    </button>
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-300/75 to-violet-500/80 text-[0.68rem] font-black text-white">${escapeHtml(task.title.slice(0, 2).toUpperCase())}</span>
                    <span class="min-w-0">
                      <span class="block truncate text-[0.82rem] font-black text-white">${escapeHtml(task.title)}</span>
                      <span class="block truncate text-[0.68rem] font-semibold text-slate-400">${escapeHtml(task.subtitle)}</span>
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3 lg:block lg:min-w-0">
                  <span class="text-xs font-bold text-slate-500 lg:hidden">Owner</span>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center">${renderAvatarStack(task.members.slice(0, 2), "h-4 w-4")}</div>
                    <span class="truncate text-[0.72rem] font-bold text-slate-300">${escapeHtml(task.owner)}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3 lg:block">
                  <span class="text-xs font-bold text-slate-500 lg:hidden">Status</span>
                  <span class="inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-black ${statusTone(task.status)}">${escapeHtml(task.status)}</span>
                </div>
                <div class="flex items-center justify-between gap-3 lg:block">
                  <span class="text-xs font-bold text-slate-500 lg:hidden">Schedule</span>
                  <span class="text-[0.72rem] font-bold text-slate-300">${escapeHtml(task.due)} · ${timeLabel(task.start)}</span>
                </div>
                <div class="flex items-center justify-between gap-3 lg:justify-end">
                  <span class="text-xs font-bold text-slate-500 lg:hidden">Progress</span>
                  <span class="text-right text-[0.82rem] font-black text-white">${task.progress}%</span>
                </div>
              </article>
            `
        )
        .join("")
      : `<div class="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm font-semibold text-slate-500">No list tasks match your filter.</div>`;

    refreshIcons();
  }

  function renderTaskViews(items = state.filteredTasks) {
    renderTasks(items);
    renderKanban(items);
    renderList(items);
  }

  function setView(view) {
    state.view = view;

    const viewConfig = {
      calendar: {
        title: "10:00 AM Timeline",
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
    selectors.viewMeta.textContent = viewConfig[view].meta;
    selectors.skeleton.classList.add("hidden");
    selectors.scroll.classList.toggle("hidden", view !== "calendar");
    selectors.kanbanView.classList.toggle("hidden", view !== "kanban");
    selectors.kanbanView.classList.toggle("flex", view === "kanban");
    selectors.listView.classList.toggle("hidden", view !== "list");
    selectors.listView.classList.toggle("flex", view === "list");

    showToast(`${viewConfig[view].title} enabled`);
  }

  function setProgressLine() {
    const now = 12.7;
    const left = (now - timelineStart) * scale;
    selectors.progressLine.style.left = `${left}px`;
  }

  function openTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const commentList = [
      `${task.owner || "Sarah"} updated the progress to ${task.progress}%.`,
      `${task.members[0] || "MS"} left a note on the task scope.`,
      "Team reviewed the latest attachment.",
    ];
    const activityList = [
      `Moved to ${task.status}`,
      `${task.priority} priority assigned`,
      `${task.comments} comments and ${task.attachments} files tracked`,
    ];

    selectors.detail.innerHTML = `
      <div class="flex items-start justify-between gap-4 pr-10">
        <div class="min-w-0">
          <p class="text-xs font-extrabold uppercase text-cyan-200">${escapeHtml(task.category)}</p>
          <h2 id="timelineTaskTitle" class="mt-2 text-2xl font-black text-white">${escapeHtml(task.title)}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">${escapeHtml(task.subtitle)} scheduled from ${timeLabel(task.start)} for ${task.duration} hours in ${escapeHtml(activeWorkspace().name)}.</p>
        </div>
        <span class="shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-black ${priorityTone(task.priority)}">${escapeHtml(task.priority)}</span>
      </div>
      <div class="mt-4 grid gap-2 sm:grid-cols-4">
        <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p class="text-xs font-bold text-slate-400">Status</p>
          <strong class="text-sm font-black text-white">${escapeHtml(task.status)}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p class="text-xs font-bold text-slate-400">Owner</p>
          <strong class="text-sm font-black text-white">${escapeHtml(task.owner || "Unassigned")}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p class="text-xs font-bold text-slate-400">Deadline</p>
          <strong class="text-sm font-black text-white">${escapeHtml(task.due)}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p class="text-xs font-bold text-slate-400">Progress</p>
          <strong class="text-sm font-black text-white">${task.progress}%</strong>
        </div>
      </div>
      <div class="mt-4 grid gap-3 lg:grid-cols-3">
        <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="message-square" class="h-4 w-4 text-cyan-200"></i> Comments</h3>
          <div class="space-y-2">
            ${commentList.map((comment) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${escapeHtml(comment)}</p>`).join("")}
          </div>
        </section>
        <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="activity" class="h-4 w-4 text-violet-200"></i> Activity</h3>
          <div class="space-y-2">
            ${activityList.map((activity) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${escapeHtml(activity)}</p>`).join("")}
          </div>
        </section>
        <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="paperclip" class="h-4 w-4 text-emerald-200"></i> Files</h3>
          <div class="space-y-2">
            <p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${task.attachments} attachment${task.attachments === 1 ? "" : "s"} linked</p>
            <button class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-white" type="button">
              <i data-lucide="upload" class="h-3.5 w-3.5"></i>
              Mock upload
            </button>
          </div>
        </section>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="h-9 rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-bold text-slate-300 transition hover:bg-white/14" type="button" data-edit-task="${task.id}">
          Edit
        </button>
        <button class="h-9 rounded-xl border border-rose-300/20 bg-rose-500/12 px-3 text-xs font-bold text-rose-100 transition hover:bg-rose-500/20" type="button" data-delete-task="${task.id}">
          Delete
        </button>
      </div>
    `;
    selectors.modal.classList.remove("hidden");
    selectors.modal.classList.add("grid");
    document.body.style.overflow = "hidden";
    refreshIcons();
  }

  function closeTaskModal() {
    selectors.modal.classList.add("hidden");
    selectors.modal.classList.remove("grid");
    document.body.style.overflow = "";
  }

  function openTaskEditor(status = "To Do", taskId = null) {
    const task = taskId ? tasks.find((item) => item.id === taskId) : null;
    state.editorStatus = task?.status || status || "To Do";
    selectors.editorTitle.textContent = task ? "Edit Task" : "Add Task";
    selectors.editorForm.elements.id.value = task?.id || "";
    selectors.editorForm.elements.title.value = task?.title || "";
    selectors.editorForm.elements.subtitle.value = task?.subtitle || "";
    selectors.editorForm.elements.status.value = task?.status || state.editorStatus;
    selectors.editorForm.elements.priority.value = task?.priority || "Medium";
    selectors.editorForm.elements.owner.value = task?.owner || "Sarah Nguyen";
    selectors.editorForm.elements.due.value = task?.due || "Nov 18";
    selectors.editorForm.elements.progress.value = task?.progress || 20;
    selectors.editorModal.classList.remove("hidden");
    selectors.editorModal.classList.add("grid");
    document.body.style.overflow = "hidden";
    refreshIcons();
  }

  function closeTaskEditor() {
    selectors.editorModal.classList.add("hidden");
    selectors.editorModal.classList.remove("grid");
    document.body.style.overflow = "";
  }

  function openWorkspaceEditor() {
    selectors.workspaceEditorForm.reset();
    selectors.workspaceEditorModal.classList.remove("hidden");
    selectors.workspaceEditorModal.classList.add("grid");
    document.body.style.overflow = "hidden";
    selectors.workspaceEditorForm.elements.name.focus();
  }

  function closeWorkspaceEditor() {
    selectors.workspaceEditorModal.classList.add("hidden");
    selectors.workspaceEditorModal.classList.remove("grid");
    document.body.style.overflow = "";
  }

  function openProjectInviteModal() {
    selectors.projectInviteForm.reset();
    selectors.projectInviteModal.classList.remove("hidden");
    selectors.projectInviteModal.classList.add("grid");
    document.body.style.overflow = "hidden";
    selectors.projectInviteForm.elements.email.focus();
  }

  function closeProjectInviteModal() {
    selectors.projectInviteModal.classList.add("hidden");
    selectors.projectInviteModal.classList.remove("grid");
    document.body.style.overflow = "";
  }

  function openHelpModal() {
    selectors.helpModal.classList.remove("hidden");
    selectors.helpModal.classList.add("grid");
    document.body.style.overflow = "hidden";
  }

  function closeHelpModal() {
    selectors.helpModal.classList.add("hidden");
    selectors.helpModal.classList.remove("grid");
    document.body.style.overflow = "";
  }

  async function sendProjectInvite(event) {
    event.preventDefault();
    const formData = new FormData(selectors.projectInviteForm);
    const workspace = activeWorkspace();
    const payload = {
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "member").trim(),
      projects: [workspace.name],
      message: String(formData.get("message") || `You have been invited to ${workspace.name}.`).trim(),
    };

    selectors.projectInviteSubmit.disabled = true;
    selectors.projectInviteSubmit.innerHTML = '<i data-lucide="loader-2" class="h-3.5 w-3.5 animate-spin"></i> Sending...';
    refreshIcons();

    try {
      await timelineApi.sendInvite(app, selectors.projectInviteForm, payload);
      closeProjectInviteModal();
      showToast("Invitation sent");
    } catch (error) {
      showToast(error.message || "Could not send invitation");
    } finally {
      selectors.projectInviteSubmit.disabled = false;
      selectors.projectInviteSubmit.innerHTML = '<i data-lucide="mail" class="h-3.5 w-3.5"></i> Send Invitation';
      refreshIcons();
    }
  }

  function saveWorkspaceFromEditor(event) {
    event.preventDefault();
    const formData = new FormData(selectors.workspaceEditorForm);
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    const workspace = {
      id: `${createSlug(name)}-${Date.now().toString(36)}`,
      name,
      breadcrumb: `/${name}`,
      category: String(formData.get("category") || "Project").trim() || "Project",
      company: String(formData.get("company") || "TaskFlow Workspace").trim() || "TaskFlow Workspace",
      date: String(formData.get("date") || "No deadline").trim() || "No deadline",
      members: ["SN", "MS"],
      projects: ["Planning", "Delivery"],
    };

    workspaces.push(workspace);
    saveCustomWorkspaces();
    closeWorkspaceEditor();
    switchWorkspace(workspace.id);
    showToast("Workspace created");
  }

  function saveTaskFromEditor(event) {
    event.preventDefault();
    const formData = new FormData(selectors.editorForm);
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

    const existing = tasks.find((task) => task.id === id);
    if (existing) {
      Object.assign(existing, payload);
      showToast("Task updated");
    } else {
      tasks.push({
        id: createTaskId(payload.title),
        ...payload,
        workspaceId: state.activeWorkspaceId,
        projectName: activeProjectName(),
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
      showToast("Task added");
    }

    closeTaskEditor();
    applyTaskFilters();
  }

  function deleteTask(taskId) {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return;
    tasks.splice(index, 1);
    closeTaskModal();
    applyTaskFilters();
    showToast("Task deleted");
  }

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
  }

  function setTheme(theme) {
    app.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme !== "light");
    const isLight = theme === "light";
    selectors.themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    selectors.themeToggle.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
    selectors.themeToggle.innerHTML = `
      <span class="grid h-6 w-6 place-items-center rounded-lg ${isLight ? "bg-violet-500/15 text-violet-700" : "bg-cyan-300/15 text-cyan-100"}">
        <i data-lucide="${isLight ? "moon" : "sun"}" class="h-3.5 w-3.5"></i>
      </span>
      <span class="hidden sm:inline">${isLight ? "Dark" : "Light"}</span>
    `;
    refreshIcons();
  }

  function showToast(message) {
    if (toast) {
      toast.show(selectors.toast, message, { duration: 2400 });
      return;
    }
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => selectors.toast.classList.add("hidden"), 2400);
  }

  function renderNotifications() {
    if (!selectors.notificationList) return;
    selectors.notificationList.innerHTML = notifications
      .map(
        (message) => `
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <i data-lucide="activity" class="h-4 w-4"></i>
            </span>
            <p class="text-sm leading-5 text-slate-300">${escapeHtml(message)}</p>
          </div>
        `
      )
      .join("");
  }

  function filterTimelineTasks() {
    state.kanbanQuery = selectors.searchInput ? selectors.searchInput.value.trim().toLowerCase() : state.kanbanQuery;
    applyTaskFilters();
  }

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
      const workspaceButton = event.target.closest("[data-workspace-id]");
      const workspaceOverview = event.target.closest("[data-workspace-overview]");
      if (workspaceOverview) {
        state.activeWorkspaceId = workspaceOverview.dataset.workspaceOverview;
        state.activeProjectName = workspaces.find((workspace) => workspace.id === state.activeWorkspaceId)?.projects[0] || "";
        window.localStorage.setItem("taskflow-active-workspace", state.activeWorkspaceId);
        window.localStorage.setItem("taskflow-active-project", state.activeProjectName);
        setProjectMode("overview");
        renderWorkspaceList();
        renderProjectOverview();
        toggleSidebar(false);
        return;
      }
      if (!workspaceButton) return;
      switchWorkspace(workspaceButton.dataset.workspaceId, workspaceButton.dataset.projectName || "");
      toggleSidebar(false);
    });

    selectors.addWorkspaceButton.addEventListener("click", openWorkspaceEditor);
    selectors.overviewAddWorkspace.addEventListener("click", openWorkspaceEditor);
    selectors.workspaceEditorForm.addEventListener("submit", saveWorkspaceFromEditor);

    selectors.projectOverviewPanel.addEventListener("click", (event) => {
      const projectButton = event.target.closest("[data-workspace-id][data-project-name]");
      if (!projectButton) return;
      switchWorkspace(projectButton.dataset.workspaceId, projectButton.dataset.projectName || "");
    });

    selectors.workspaceInviteButton.addEventListener("click", openProjectInviteModal);
    selectors.projectInviteForm.addEventListener("submit", sendProjectInvite);

    selectors.helpToggle.addEventListener("click", openHelpModal);

    selectors.profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.profileDropdown.classList.toggle("hidden");
    });

    if (selectors.searchInput) {
      selectors.searchInput.addEventListener("input", filterTimelineTasks);
    }

    if (selectors.kanbanSearch) {
      selectors.kanbanSearch.addEventListener("input", () => {
        state.kanbanQuery = selectors.kanbanSearch.value.trim().toLowerCase();
        applyTaskFilters();
      });
    }

    if (selectors.kanbanPriorityFilter) {
      selectors.kanbanPriorityFilter.addEventListener("change", () => {
        state.kanbanPriority = selectors.kanbanPriorityFilter.value;
        applyTaskFilters();
      });
    }

    if (selectors.kanbanSort) {
      selectors.kanbanSort.addEventListener("change", () => {
        state.kanbanSort = selectors.kanbanSort.value;
        applyTaskFilters();
      });
    }

    selectors.addTaskButton.addEventListener("click", () => openTaskEditor("To Do"));
    selectors.kanbanAddTask.addEventListener("click", () => openTaskEditor("To Do"));
    selectors.editorForm.addEventListener("submit", saveTaskFromEditor);
    selectors.favoriteSortButton.addEventListener("click", () => {
      state.favoriteFirst = !state.favoriteFirst;
      saveFavorites();
      updateFavoriteSortButton();
      applyTaskFilters();
      showToast(state.favoriteFirst ? "Favorite tasks stay first" : "Favorite sorting disabled");
    });

    selectors.viewTabs.forEach((tab) => {
      tab.addEventListener("click", () => setView(tab.dataset.view));
    });

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#timelineNotificationToggle") && !event.target.closest("#timelineNotificationDropdown")) {
        selectors.notificationDropdown.classList.add("hidden");
      }
      if (!event.target.closest("#timelineProfileToggle") && !event.target.closest("#timelineProfileDropdown")) {
        selectors.profileDropdown.classList.add("hidden");
      }
    });

    selectors.themeToggle.addEventListener("click", () => {
      const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
      window.localStorage.setItem("taskflow-timeline-theme", nextTheme);
      showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    document.addEventListener("click", (event) => {
      const addStatus = event.target.closest("[data-add-status]");
      if (addStatus) {
        openTaskEditor(addStatus.dataset.addStatus);
        return;
      }

      const columnMenu = event.target.closest("[data-column-menu]");
      if (columnMenu) {
        showToast(`${columnMenu.dataset.columnMenu} actions ready`);
        return;
      }

      const editTask = event.target.closest("[data-edit-task]");
      if (editTask) {
        closeTaskModal();
        openTaskEditor("To Do", editTask.dataset.editTask);
        return;
      }

      const deleteTaskButton = event.target.closest("[data-delete-task]");
      if (deleteTaskButton) {
        deleteTask(deleteTaskButton.dataset.deleteTask);
        return;
      }

      if (event.target.closest("[data-close-task-editor]")) {
        closeTaskEditor();
        return;
      }

      if (event.target.closest("[data-close-workspace-editor]")) {
        closeWorkspaceEditor();
        return;
      }

      if (event.target.closest("[data-close-project-invite]")) {
        closeProjectInviteModal();
        return;
      }

      if (event.target.closest("[data-close-help]")) {
        closeHelpModal();
        return;
      }

      const favoriteButton = event.target.closest("[data-favorite-task]");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        toggleTaskFavorite(favoriteButton.dataset.favoriteTask);
        return;
      }

      const taskCard = event.target.closest("[data-task-id]");
      if (taskCard) openTask(taskCard.dataset.taskId);
      if (event.target.closest("[data-close-task-modal]")) closeTaskModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTaskModal();
        closeTaskEditor();
        closeWorkspaceEditor();
        closeProjectInviteModal();
        closeHelpModal();
        toggleSidebar(false);
        selectors.profileDropdown.classList.add("hidden");
      }
    });

    selectors.workspace.addEventListener("dragstart", (event) => {
      const task = event.target.closest("[data-task-id]");
      if (!task) return;
      state.draggedTaskId = task.dataset.taskId;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", task.dataset.taskId);
      task.classList.add("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
      showToast("Drag preview enabled");
    });

    selectors.kanbanColumns.addEventListener("dragover", (event) => {
      const dropzone = event.target.closest("[data-drop-status]");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.closest(".kanban-column").classList.add("border-cyan-300/35", "bg-cyan-300/[0.045]");
    });

    selectors.kanbanColumns.addEventListener("dragleave", (event) => {
      const column = event.target.closest(".kanban-column");
      if (!column || column.contains(event.relatedTarget)) return;
      column.classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
    });

    selectors.kanbanColumns.addEventListener("drop", (event) => {
      const dropzone = event.target.closest("[data-drop-status]");
      if (!dropzone) return;
      event.preventDefault();
      const taskId = event.dataTransfer.getData("text/plain") || state.draggedTaskId;
      const task = tasks.find((item) => item.id === taskId);
      if (!task) return;
      task.status = dropzone.dataset.dropStatus;
      task.kanbanOnly = task.kanbanOnly || state.view === "kanban";
      dropzone.closest(".kanban-column").classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
      applyTaskFilters();
      showToast(`Moved to ${task.status}`);
    });

    selectors.workspace.addEventListener("dragend", (event) => {
      const task = event.target.closest("[data-task-id]");
      if (!task) return;
      state.draggedTaskId = null;
      task.classList.remove("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
      document.querySelectorAll(".kanban-column").forEach((column) => {
        column.classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
      });
      showToast("Mock task position updated");
    });
  }

  function startRealtimeStatus() {
    window.setInterval(() => {
      selectors.status.textContent = "Updated now";
      showToast(`${activeWorkspace().name} synced`);
      window.setTimeout(() => {
        selectors.status.textContent = "Live sync";
      }, 2200);
    }, 11000);
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  async function loadProjectData() {
    try {
      const result = await timelineApi.loadProjectData(app);

      tasks = result.data.tasks || tasks;
      normalizeWorkspaceTasks();
      notifications = result.data.notifications || notifications;
      state.filteredTasks = tasks.slice();
    } catch (error) {
      showToast(error.message || "Project data could not be loaded");
      if (!allowDemoFallback) {
        throw error;
      }
      console.warn("Using project demo fallback data:", error);
      normalizeWorkspaceTasks();
    }
  }

  async function init() {
    setTheme(window.localStorage.getItem("taskflow-timeline-theme") || "dark");
    loadStoredWorkspaces();
    ensureActiveWorkspace();
    loadFavorites();
    await loadProjectData();
    setProjectMode(state.mode);
    renderWorkspaceList();
    renderProjectOverview();
    renderProjectHeader();
    renderHeader();
    renderNotifications();
    applyTaskFilters();
    setProgressLine();
    bindEvents();
    startRealtimeStatus();
    refreshIcons();

    window.setTimeout(() => {
      selectors.skeleton.classList.add("hidden");
      if (state.mode === "detail" && state.view === "calendar") {
        selectors.scroll.classList.remove("hidden");
      }
    }, 450);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
