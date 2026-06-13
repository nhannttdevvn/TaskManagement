(function () {
  "use strict";

  const app = document.getElementById("dashboardApp");
  if (!app) return;

  const dashboardApi = window.TaskFlow?.dashboardApi;
  const toast = window.TaskFlow?.toast;
  const allowDemoFallback = app.dataset.allowDemoFallback === "true";

  let projects = [];
  let upcomingTasks = [];

  let notifications = [
    "Mobile App Development moved 3 tasks to review.",
    "Website Redesign reached 76% completion.",
    "Content Strategy has a new deadline this week.",
  ];

  let activityItems = [
    "Sarah assigned a high priority task to Website Redesign.",
    "Marketing Campaign was marked completed.",
    "User Research timeline changed to on-hold.",
    "Content Strategy added 4 new documentation tasks.",
  ];

  let analytics = {
    daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      planned: [7, 9, 8, 11, 10, 5, 6],
      completed: [5, 8, 7, 9, 12, 4, 5],
    },
    weekly: {
      labels: ["W1", "W2", "W3", "W4", "W5"],
      planned: [38, 42, 47, 44, 50],
      completed: [31, 39, 41, 46, 48],
    },
    monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      planned: [120, 132, 128, 144, 156, 162],
      completed: [102, 118, 121, 138, 148, 154],
    },
  };

  let statusData = [
    { label: "To Do", value: 18, color: "#5b8fdc", dotClass: "bg-blue-400" },
    { label: "In Progress", value: 18, color: "#9b86e8", dotClass: "bg-violet-400" },
    { label: "Done", value: 18, color: "#34d399", dotClass: "bg-emerald-400" },
  ];

  const statusLabelPlugin = {
    id: "statusLabelPlugin",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const total = statusData.reduce((sum, item) => sum + item.value, 0);

      if (!meta?.data?.length || !total) return;

      const labelRows = meta.data.map((arc, index) => {
        const item = statusData[index];
        const percent = Math.round((item.value / total) * 100);
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const unitX = Math.cos(angle);
        const unitY = Math.sin(angle);
        const labelToRight = Math.cos(angle) >= 0;
        const lineStartRadius = arc.outerRadius + 4;
        const lineEndRadius = arc.outerRadius + 20;
        const labelRadius = arc.outerRadius + 42;
        return {
          arc,
          item,
          angle,
          labelToRight,
          label: `${item.label}: ${percent}%`,
          startX: arc.x + unitX * lineStartRadius,
          startY: arc.y + unitY * lineStartRadius,
          endX: arc.x + unitX * lineEndRadius,
          endY: arc.y + unitY * lineEndRadius,
          labelX: arc.x + unitX * labelRadius,
          y: arc.y + unitY * labelRadius,
        };
      });

      ctx.save();
      ctx.font = "800 9.5px Inter, system-ui, sans-serif";
      ctx.textBaseline = "middle";

      labelRows.forEach((row) => {
        const labelWidth = ctx.measureText(row.label).width;
        const textGap = 8;
        const textX = row.labelToRight
          ? Math.min(Math.max(row.labelX + textGap, row.endX + textGap), chart.width - labelWidth - 6)
          : Math.max(Math.min(row.labelX - labelWidth - textGap, row.endX - labelWidth - textGap), 6);

        ctx.strokeStyle = `${row.item.color}bf`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(row.startX, row.startY);
        ctx.lineTo(row.endX, row.endY);
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.fillStyle = row.item.color;
        ctx.fillText(row.label, textX, row.endY);
      });

      ctx.restore();
    },
  };

  const state = {
    taskDoneChart: null,
    statusChart: null,
    currentRange: "daily",
    filteredProjects: projects.slice(),
    projectStart: 0,
    projectPageSize: 3,
  };

  const selectors = {
    sidebar: document.getElementById("sidebar"),
    sidebarOverlay: document.getElementById("sidebarOverlay"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    projectGrid: document.getElementById("projectGrid"),
    projectSkeleton: document.getElementById("projectSkeleton"),
    projectSummary: document.getElementById("projectSummary"),
    projectPrev: document.getElementById("projectPrev"),
    projectNext: document.getElementById("projectNext"),
    searchInput: document.getElementById("dashboardSearch"),
    searchResultCount: document.getElementById("searchResultCount"),
    upcomingTasks: document.getElementById("upcomingTasks"),
    emptyUpcomingTasks: document.getElementById("emptyUpcomingTasks"),
    statusTotals: document.getElementById("statusTotals"),
    notificationToggle: document.getElementById("notificationToggle"),
    notificationDropdown: document.getElementById("notificationDropdown"),
    notificationList: document.getElementById("notificationList"),
    themeToggle: document.getElementById("themeToggle"),
    newProjectButton: document.getElementById("newProjectButton"),
    newProjectButtonSearch: document.getElementById("newProjectButtonSearch"),
    createProjectModal: document.getElementById("createProjectModal"),
    createProjectForm: document.getElementById("createProjectForm"),
    projectDetailModal: document.getElementById("projectDetailModal"),
    projectDetailContent: document.getElementById("projectDetailContent"),
    activityFeed: document.getElementById("activityFeed"),
    toast: document.getElementById("toast"),
    realtimeBadge: document.getElementById("realtimeBadge"),
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusClass(status) {
    const classes = {
      Active: "bg-cyan-400/15 text-cyan-200",
      Completed: "bg-emerald-400/15 text-emerald-200",
      "On-hold": "bg-amber-400/15 text-amber-200",
    };
    return classes[status] || "bg-slate-400/15 text-slate-200";
  }

  function priorityClass(priority) {
    const classes = {
      High: "bg-rose-400/15 text-rose-200",
      Medium: "bg-violet-400/15 text-violet-200",
      Low: "bg-cyan-400/15 text-cyan-200",
    };
    return classes[priority] || "bg-slate-400/15 text-slate-200";
  }

  function renderProjects(items) {
    state.projectPageSize = getProjectPageSize();
    const maxStart = getLastProjectGroupStart(items.length);
    state.projectStart = Math.min(Math.max(state.projectStart, 0), maxStart);

    const visibleItems = items.slice(state.projectStart, state.projectStart + state.projectPageSize);
    selectors.projectGrid.innerHTML = visibleItems
      .map((project) => {
        const avatars = project.members
          .slice(0, 4)
          .map((member, index) => `<span class="grid h-5 w-5 place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.52rem] font-black text-white ${index ? "-ml-1.5" : ""}">${escapeHtml(member)}</span>`)
          .join("");

        return `
          <button class="js-reveal flex h-[118px] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/45 p-3 text-left opacity-0 shadow-glass backdrop-blur-2xl transition duration-500 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-slate-900/75 motion-reduce:transform-none" type="button" data-project-id="${project.id}">
            <div class="mb-2 flex items-start justify-between gap-3">
              <span class="grid h-8 w-8 place-items-center rounded-xl ${project.gradientClass} text-xs font-black text-white">${project.initials}</span>
              <span class="inline-flex rounded-full px-2 py-0.5 text-[0.64rem] font-extrabold ${statusClass(project.status)}">${project.status}</span>
            </div>
            <h3 class="truncate text-sm font-black leading-tight text-white" title="${escapeHtml(project.title)}">${escapeHtml(project.title)}</h3>
            <p class="mt-1 line-clamp-1 overflow-hidden text-xs leading-4 text-slate-200/80">${escapeHtml(project.description)}</p>
            <div class="mt-auto pt-2">
              <div class="mb-1 flex items-center justify-between text-[0.68rem]">
                <span class="font-semibold text-slate-200">Progress</span>
                <span class="font-black text-white">${project.progress}%</span>
              </div>
              <div class="h-1 overflow-hidden rounded-full bg-slate-500/20">
                <div class="js-progress h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-500 to-fuchsia-500 transition-[width] duration-1000 ease-out" data-progress="${project.progress}" style="width: 0"></div>
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between gap-3">
              <div class="flex items-center" aria-label="${project.members.length} members">${avatars}</div>
              <span class="text-[0.68rem] font-semibold text-slate-300">${project.members.length} members</span>
            </div>
          </button>
        `;
      })
      .join("");

    selectors.projectSummary.textContent = items.length
      ? `${state.projectStart + 1}-${state.projectStart + visibleItems.length} of ${items.length}`
      : "No projects match your search";
    selectors.searchResultCount.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;
    updateProjectControls(items.length);

    requestAnimationFrame(() => {
      document.querySelectorAll(".js-progress").forEach((bar) => {
        bar.style.width = `${bar.dataset.progress}%`;
      });
      revealCards();
      refreshIcons();
    });
  }

  function updateProjectControls(total) {
    const maxStart = getLastProjectGroupStart(total);
    if (selectors.projectPrev) {
      selectors.projectPrev.disabled = state.projectStart <= 0;
    }
    if (selectors.projectNext) {
      selectors.projectNext.disabled = state.projectStart >= maxStart;
    }
  }

  function shiftProjects(direction) {
    const maxStart = getLastProjectGroupStart(state.filteredProjects.length);
    const nextStart = state.projectStart + direction * state.projectPageSize;
    state.projectStart = Math.min(Math.max(nextStart, 0), maxStart);
    renderProjects(state.filteredProjects);
  }

  function getLastProjectGroupStart(total) {
    if (total <= state.projectPageSize) return 0;
    return Math.floor((total - 1) / state.projectPageSize) * state.projectPageSize;
  }

  function getProjectPageSize() {
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  }

  function syncProjectPageSize() {
    const nextPageSize = getProjectPageSize();
    if (nextPageSize === state.projectPageSize) return;

    state.projectPageSize = nextPageSize;
    state.projectStart = Math.floor(state.projectStart / nextPageSize) * nextPageSize;
    renderProjects(state.filteredProjects);
  }

  function renderUpcomingTasks(tasks) {
    if (!selectors.upcomingTasks || !selectors.emptyUpcomingTasks) return;
    selectors.upcomingTasks.innerHTML = tasks
      .map(
        (task) => `
          <article class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.68rem] font-black text-white">${escapeHtml(task.assignee)}</span>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-bold text-white">${escapeHtml(task.title)}</h3>
              <p class="truncate text-xs text-slate-400">${escapeHtml(task.project)} - ${escapeHtml(task.deadline)}</p>
            </div>
            <span class="inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold ${priorityClass(task.priority)}">${escapeHtml(task.priority)}</span>
          </article>
        `
      )
      .join("");

    selectors.emptyUpcomingTasks.classList.toggle("hidden", tasks.length > 0);
  }

  function renderStatusTotals() {
    selectors.statusTotals.innerHTML = statusData
      .map((item) => {
        return `
          <div class="min-w-0 text-center">
            <div class="flex items-center justify-center gap-1 text-[0.56rem] font-bold leading-tight text-slate-300">
              <span class="h-2 w-2 shrink-0 rounded-sm" style="background:${item.color}"></span>
              <span>${item.label}</span>
            </div>
            <p class="mt-1.5 text-base font-black leading-none text-white">${item.value}</p>
            <p class="mt-0.5 text-[0.56rem] font-medium text-slate-400">tasks</p>
          </div>
        `;
      })
      .join("");
  }

  function renderNotifications() {
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

  function renderActivityFeed() {
    selectors.activityFeed.innerHTML = activityItems
      .map(
        (message, index) => `
          <article class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-cyan-200">
              <i data-lucide="${index % 2 === 0 ? "git-commit-horizontal" : "message-square"}" class="h-4 w-4"></i>
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-white">${escapeHtml(message)}</p>
              <p class="text-xs text-slate-400">${index + 2} min ago</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  function createTaskDoneChart(range) {
    const canvas = document.getElementById("taskDoneChart");
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.26)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0)");

    if (state.taskDoneChart) {
      state.taskDoneChart.destroy();
    }

    const data = analytics[range];
    state.taskDoneChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Planned tasks",
            data: data.planned,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.12)",
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.42,
          },
          {
            label: "Completed tasks",
            data: data.completed,
            borderColor: "#22d3ee",
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.42,
          },
        ],
      },
      options: chartOptions(),
    });
  }

  function createStatusChart() {
    const canvas = document.getElementById("statusChart");
    if (!canvas || !window.Chart) return;

    if (state.statusChart) {
      state.statusChart.destroy();
    }

    state.statusChart = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: statusData.map((item) => item.label),
        datasets: [
          {
            data: statusData.map((item) => item.value),
            backgroundColor: statusData.map((item) => item.color),
            borderColor: "rgba(15, 23, 42, 0.56)",
            borderWidth: 2,
            hoverOffset: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        rotation: -108,
        layout: {
          padding: {
            top: 26,
            right: 96,
            bottom: 26,
            left: 66,
          },
        },
        animation: {
          animateRotate: true,
          duration: 950,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            borderWidth: 1,
          },
        },
      },
      plugins: [statusLabelPlugin],
    });
  }

  function chartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      animation: {
        duration: 900,
        easing: "easeOutQuart",
      },
      scales: {
        x: {
          grid: { color: "rgba(148, 163, 184, 0.12)" },
          ticks: { color: getMutedColor() },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(148, 163, 184, 0.12)" },
          ticks: { color: getMutedColor(), precision: 0 },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: getTextColor(),
            usePointStyle: true,
            boxWidth: 10,
            padding: 10,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: 1,
        },
      },
    };
  }

  function getTextColor() {
    return app.dataset.theme === "light" ? "#0f172a" : "#f8fafc";
  }

  function getMutedColor() {
    return app.dataset.theme === "light" ? "#475569" : "#94a3b8";
  }

  function filterDashboard(query) {
    const normalized = query.trim().toLowerCase();
    state.filteredProjects = projects.filter((project) => {
      return `${project.title} ${project.description} ${project.status}`.toLowerCase().includes(normalized);
    });
    state.projectStart = 0;

    renderProjects(state.filteredProjects);
  }

  function openProjectDetail(projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;

    selectors.projectDetailContent.innerHTML = `
      <div class="mb-5 flex items-start gap-4 pr-10">
        <span class="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl ${project.gradientClass} text-base font-black text-white">${project.initials}</span>
        <div>
          <p class="text-xs font-extrabold uppercase text-cyan-200">${project.status}</p>
          <h2 id="projectDetailTitle" class="text-2xl font-black text-white">${escapeHtml(project.title)}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">${escapeHtml(project.description)}</p>
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs font-bold text-slate-400">Progress</p>
          <strong class="text-2xl font-black text-white">${project.progress}%</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs font-bold text-slate-400">Tasks</p>
          <strong class="text-2xl font-black text-white">${project.done}/${project.tasks}</strong>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs font-bold text-slate-400">Due</p>
          <strong class="text-2xl font-black text-white">${escapeHtml(project.due)}</strong>
        </div>
      </div>
      <div class="mt-5">
        <div class="mb-2 flex items-center justify-between text-sm">
          <span class="font-semibold text-slate-300">Completion</span>
          <span class="font-black text-white">${project.progress}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-slate-500/20"><div class="js-progress h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-500 to-fuchsia-500 transition-[width] duration-1000 ease-out" data-progress="${project.progress}" style="width: 0"></div></div>
      </div>
    `;

    openModal(selectors.projectDetailModal);
    requestAnimationFrame(() => {
      selectors.projectDetailContent.querySelector(".js-progress").style.width = `${project.progress}%`;
    });
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
    modal.classList.add("grid");
    document.body.style.overflow = "hidden";
    refreshIcons();
  }

  function closeModals() {
    document.querySelectorAll("[role='dialog']").forEach((modal) => {
      modal.classList.add("hidden");
      modal.classList.remove("grid");
    });
    document.body.style.overflow = "";
  }

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
  }

  function toggleTheme() {
    const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("tmds-dashboard-theme", nextTheme);
    showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled`);
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
    createTaskDoneChart(state.currentRange);
    createStatusChart();
    refreshIcons();
  }

  function animateCounters() {
    document.querySelectorAll(".counter").forEach((counter) => {
      const target = Number(counter.dataset.count || 0);
      const suffix = counter.dataset.count === "92" ? "%" : "";
      const duration = 900;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    });
  }

  function revealCards() {
    const cards = document.querySelectorAll(".js-reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => {
        card.classList.add("is-visible", "opacity-100", "translate-y-0");
        card.classList.remove("opacity-0", "translate-y-4");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible", "opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  function startRealtimeUpdates() {
    let index = 0;
    window.setInterval(() => {
      if (projects.length === 0) return;
      const project = projects[index % projects.length];
      const message = `${project.title} updated progress to ${project.progress}%`;
      activityItems.unshift(message);
      activityItems.splice(5);
      renderActivityFeed();
      if (selectors.realtimeBadge) selectors.realtimeBadge.textContent = "Updated now";
      showToast(message);
      refreshIcons();

      window.setTimeout(() => {
        if (selectors.realtimeBadge) selectors.realtimeBadge.textContent = "Live";
      }, 2200);
      index += 1;
    }, 12000);
  }

  function showToast(message) {
    if (toast) {
      toast.show(selectors.toast, message, { duration: 2600 });
      return;
    }
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
      selectors.toast.classList.add("hidden");
    }, 2600);
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function bindEvents() {
    selectors.sidebarToggle.addEventListener("click", () => toggleSidebar());
    selectors.sidebarOverlay.addEventListener("click", () => toggleSidebar(false));

    document.querySelectorAll(".js-sidebar-link").forEach((link) => {
      link.addEventListener("click", () => toggleSidebar(false));
    });

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (!selectors.notificationDropdown.contains(event.target) && !selectors.notificationToggle.contains(event.target)) {
        selectors.notificationDropdown.classList.add("hidden");
      }
    });

    selectors.themeToggle.addEventListener("click", toggleTheme);
    selectors.projectPrev.addEventListener("click", () => shiftProjects(-1));
    selectors.projectNext.addEventListener("click", () => shiftProjects(1));
    if (selectors.newProjectButton) {
      selectors.newProjectButton.addEventListener("click", () => openModal(selectors.createProjectModal));
    }
    selectors.newProjectButtonSearch.addEventListener("click", () => openModal(selectors.createProjectModal));

    document.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-close-modal]");
      if (closeTrigger) closeModals();

      const projectCard = event.target.closest("[data-project-id]");
      if (projectCard) openProjectDetail(projectCard.dataset.projectId);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModals();
        toggleSidebar(false);
        selectors.notificationDropdown.classList.add("hidden");
      }
    });

    selectors.searchInput.addEventListener("input", (event) => filterDashboard(event.target.value));
    window.addEventListener("resize", syncProjectPageSize);

    document.querySelectorAll(".js-chart-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".js-chart-tab").forEach((item) => {
          item.classList.remove("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
          item.classList.add("text-slate-400");
        });
        tab.classList.add("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
        tab.classList.remove("text-slate-400");
        state.currentRange = tab.dataset.range;
        createTaskDoneChart(state.currentRange);
      });
    });

    selectors.createProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(selectors.createProjectForm);
      const name = String(formData.get("name") || "Untitled Project").trim();
      const description = String(formData.get("description") || "Created from dashboard.").trim();
      const submitButton = selectors.createProjectForm.querySelector('button[type="submit"]');
      const originalButton = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = '<i data-lucide="loader-2" class="h-5 w-5 animate-spin"></i> Creating...';
      refreshIcons();

      try {
        const result = await dashboardApi.createProject({ name, description }, selectors.createProjectForm);
        const project = result.data;
        projects.unshift(project);
        state.filteredProjects = projects.slice();
        selectors.createProjectForm.reset();
        closeModals();
        filterDashboard(selectors.searchInput.value);
        showToast("Project saved to database");
      } catch (error) {
        showToast(error.message || "Could not create project");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButton;
        refreshIcons();
      }
    });
  }

  async function loadDashboardData() {
    try {
      const result = await dashboardApi.loadData(app);

      projects = result.data.projects || projects;
      upcomingTasks = result.data.upcomingTasks || upcomingTasks;
      notifications = result.data.notifications || notifications;
      activityItems = result.data.activityItems || activityItems;
      analytics = result.data.analytics || analytics;
      statusData = result.data.statusData || statusData;
      state.filteredProjects = projects.slice();
    } catch (error) {
      showToast(error.message || "Dashboard data could not be loaded");
      if (!allowDemoFallback) {
        throw error;
      }
      console.warn("Using dashboard demo fallback data:", error);
    }
  }

  async function init() {
    const savedTheme = window.localStorage.getItem("tmds-dashboard-theme") || "dark";
    setTheme(savedTheme);
    await loadDashboardData();
    renderNotifications();
    renderUpcomingTasks(upcomingTasks);
    renderStatusTotals();
    renderActivityFeed();
    bindEvents();
    animateCounters();
    revealCards();

    window.setTimeout(() => {
      selectors.projectSkeleton.classList.add("hidden");
      selectors.projectGrid.classList.remove("hidden");
      renderProjects(projects);
    }, 450);

    createTaskDoneChart(state.currentRange);
    createStatusChart();
    startRealtimeUpdates();
    refreshIcons();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
