(function () {
  "use strict";

  const app = document.getElementById("timelineApp");
  if (!app) return;

  const scale = 142;
  const timelineStart = 9;
  const timelineEnd = 17;

  const tasks = [
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
      comments: 15,
      attachments: 7,
      featured: true,
    },
  ];

  const notifications = [
    "Web Visual Design moved to high priority.",
    "Development is scheduled for 9:30 AM.",
    "UX Copywrite has 4 new comments.",
  ];

  const state = {
    filteredTasks: tasks.slice(),
  };

  const selectors = {
    sidebar: document.getElementById("timelineSidebar"),
    sidebarOverlay: document.getElementById("timelineSidebarOverlay"),
    sidebarToggle: document.getElementById("timelineSidebarToggle"),
    workspaceToggle: document.getElementById("workspaceToggle"),
    workspaceItems: document.getElementById("workspaceItems"),
    themeToggle: document.getElementById("timelineThemeToggle"),
    searchInput: document.getElementById("timelineSearch"),
    searchCount: document.getElementById("timelineSearchCount"),
    notificationToggle: document.getElementById("timelineNotificationToggle"),
    notificationDropdown: document.getElementById("timelineNotificationDropdown"),
    notificationList: document.getElementById("timelineNotificationList"),
    skeleton: document.getElementById("timelineSkeleton"),
    scroll: document.getElementById("timelineScroll"),
    canvas: document.getElementById("timelineCanvas"),
    header: document.getElementById("timelineHeader"),
    grid: document.getElementById("timelineGrid"),
    taskLayer: document.getElementById("taskLayer"),
    progressLine: document.getElementById("progressLine"),
    status: document.getElementById("timelineStatus"),
    modal: document.getElementById("timelineTaskModal"),
    detail: document.getElementById("timelineTaskDetail"),
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
    selectors.taskLayer.innerHTML = items.length
      ? items
      .map((task) => {
        const left = (task.start - timelineStart) * scale;
        const width = task.duration * scale;
        const top = task.row * 70 + 8;
        const avatars = task.members
          .slice(0, 4)
          .map((member, index) => `<span class="grid h-6 w-6 place-items-center rounded-full border-2 border-white/80 bg-slate-950 text-[0.6rem] font-black text-white ${index ? "-ml-2" : ""}">${escapeHtml(member)}</span>`)
          .join("");
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

  function setProgressLine() {
    const now = 12.7;
    const left = (now - timelineStart) * scale;
    selectors.progressLine.style.left = `${left}px`;
  }

  function openTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    selectors.detail.innerHTML = `
      <p class="text-xs font-extrabold uppercase text-cyan-200">${escapeHtml(task.category)}</p>
      <h2 id="timelineTaskTitle" class="mt-2 text-3xl font-black text-white">${escapeHtml(task.title)}</h2>
      <p class="mt-3 text-sm leading-6 text-slate-400">${escapeHtml(task.subtitle)} scheduled from ${timeLabel(task.start)} for ${task.duration} hours.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
          <p class="text-xs font-bold text-slate-400">Priority</p>
          <strong class="text-xl font-black text-white">${escapeHtml(task.priority)}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
          <p class="text-xs font-bold text-slate-400">Comments</p>
          <strong class="text-xl font-black text-white">${task.comments}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
          <p class="text-xs font-bold text-slate-400">Attachments</p>
          <strong class="text-xl font-black text-white">${task.attachments}</strong>
        </div>
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

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
  }

  function setTheme(theme) {
    app.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme !== "light");
    selectors.themeToggle.innerHTML = `<i data-lucide="${theme === "light" ? "sun" : "moon"}" class="h-4 w-4"></i>`;
    refreshIcons();
  }

  function showToast(message) {
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
    const query = selectors.searchInput.value.trim().toLowerCase();
    state.filteredTasks = tasks.filter((task) => {
      return [task.title, task.subtitle, task.category, task.priority]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    renderTasks(state.filteredTasks);
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

    selectors.searchInput.addEventListener("input", filterTimelineTasks);

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#timelineNotificationToggle") && !event.target.closest("#timelineNotificationDropdown")) {
        selectors.notificationDropdown.classList.add("hidden");
      }
    });

    selectors.themeToggle.addEventListener("click", () => {
      const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
      window.localStorage.setItem("taskflow-timeline-theme", nextTheme);
      showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    document.addEventListener("click", (event) => {
      const taskCard = event.target.closest("[data-task-id]");
      if (taskCard) openTask(taskCard.dataset.taskId);
      if (event.target.closest("[data-close-task-modal]")) closeTaskModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTaskModal();
        toggleSidebar(false);
      }
    });

    selectors.taskLayer.addEventListener("dragstart", (event) => {
      const task = event.target.closest("[data-task-id]");
      if (!task) return;
      task.classList.add("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
      showToast("Drag preview enabled");
    });

    selectors.taskLayer.addEventListener("dragend", (event) => {
      const task = event.target.closest("[data-task-id]");
      if (!task) return;
      task.classList.remove("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
      showToast("Mock timeline position updated");
    });
  }

  function startRealtimeStatus() {
    window.setInterval(() => {
      selectors.status.textContent = "Updated now";
      showToast("Timeline synced with mock workspace");
      window.setTimeout(() => {
        selectors.status.textContent = "Live sync";
      }, 2200);
    }, 11000);
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function init() {
    setTheme(window.localStorage.getItem("taskflow-timeline-theme") || "dark");
    renderHeader();
    renderNotifications();
    renderTasks();
    setProgressLine();
    bindEvents();
    startRealtimeStatus();
    refreshIcons();

    window.setTimeout(() => {
      selectors.skeleton.classList.add("hidden");
      selectors.scroll.classList.remove("hidden");
    }, 450);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
