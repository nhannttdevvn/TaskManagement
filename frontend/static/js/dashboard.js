(function () {
  "use strict";

  const app = document.getElementById("dashboardApp");
  if (!app) return;

  const projects = [
    {
      id: "website-redesign",
      initials: "WR",
      title: "Website Redesign",
      description: "Refresh the marketing site with clearer funnels, new design system tokens, and faster landing pages.",
      status: "Active",
      progress: 76,
      members: ["SN", "AK", "LM", "TN"],
      tasks: 42,
      done: 32,
      gradientClass: "bg-gradient-to-br from-cyan-400 to-blue-600",
      due: "May 28",
    },
    {
      id: "mobile-app-development",
      initials: "MA",
      title: "Mobile App Development",
      description: "Build core mobile task workflows, push notifications, sprint views, and analytics cards.",
      status: "Active",
      progress: 58,
      members: ["HD", "VN", "QD"],
      tasks: 64,
      done: 37,
      gradientClass: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
      due: "Jun 12",
    },
    {
      id: "marketing-campaign",
      initials: "MC",
      title: "Marketing Campaign",
      description: "Coordinate launch calendar, paid assets, newsletter copy, and campaign reporting.",
      status: "Completed",
      progress: 100,
      members: ["KP", "MT", "NL", "TA", "HY"],
      tasks: 38,
      done: 38,
      gradientClass: "bg-gradient-to-br from-emerald-500 to-green-500",
      due: "Completed",
    },
    {
      id: "user-research",
      initials: "UR",
      title: "User Research",
      description: "Interview power users, synthesize pain points, and score backlog opportunities.",
      status: "On-hold",
      progress: 34,
      members: ["PL", "SN"],
      tasks: 21,
      done: 7,
      gradientClass: "bg-gradient-to-br from-amber-500 to-rose-500",
      due: "Paused",
    },
    {
      id: "content-strategy",
      initials: "CS",
      title: "Content Strategy",
      description: "Plan help center structure, onboarding emails, release notes, and product education.",
      status: "Active",
      progress: 69,
      members: ["TH", "BA", "LY"],
      tasks: 29,
      done: 20,
      gradientClass: "bg-gradient-to-br from-cyan-500 to-violet-500",
      due: "Jun 05",
    },
  ];

  const upcomingTasks = [
    {
      title: "Finalize dashboard wireframes",
      deadline: "Today, 4:00 PM",
      priority: "High",
      assignee: "SN",
      project: "Website Redesign",
    },
    {
      title: "Prepare sprint review deck",
      deadline: "Tomorrow, 9:30 AM",
      priority: "Medium",
      assignee: "HD",
      project: "Mobile App Development",
    },
    {
      title: "QA onboarding email sequence",
      deadline: "May 22",
      priority: "Low",
      assignee: "LY",
      project: "Content Strategy",
    },
    {
      title: "Publish campaign performance notes",
      deadline: "May 24",
      priority: "Medium",
      assignee: "KP",
      project: "Marketing Campaign",
    },
  ];

  const notifications = [
    "Mobile App Development moved 3 tasks to review.",
    "Website Redesign reached 76% completion.",
    "Content Strategy has a new deadline this week.",
  ];

  const activityItems = [
    "Sarah assigned a high priority task to Website Redesign.",
    "Marketing Campaign was marked completed.",
    "User Research timeline changed to on-hold.",
    "Content Strategy added 4 new documentation tasks.",
  ];

  const analytics = {
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

  const statusData = [
    { label: "To Do", value: 34, color: "#60a5fa", dotClass: "bg-blue-400" },
    { label: "In Progress", value: 46, color: "#a78bfa", dotClass: "bg-violet-400" },
    { label: "Done", value: 128, color: "#34d399", dotClass: "bg-emerald-400" },
  ];

  const state = {
    taskDoneChart: null,
    statusChart: null,
    currentRange: "daily",
    filteredProjects: projects.slice(),
  };

  const selectors = {
    sidebar: document.getElementById("sidebar"),
    sidebarOverlay: document.getElementById("sidebarOverlay"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    projectGrid: document.getElementById("projectGrid"),
    projectSkeleton: document.getElementById("projectSkeleton"),
    projectSummary: document.getElementById("projectSummary"),
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
    const visibleItems = items.slice(0, 3);
    selectors.projectGrid.innerHTML = visibleItems
      .map((project) => {
        const avatars = project.members
          .slice(0, 4)
          .map((member, index) => `<span class="grid h-6 w-6 place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.6rem] font-black text-white ${index ? "-ml-2" : ""}">${escapeHtml(member)}</span>`)
          .join("");

        return `
          <button class="js-reveal flex min-h-0 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left opacity-0 shadow-glass backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.07] motion-reduce:transform-none" type="button" data-project-id="${project.id}">
            <div class="mb-3 flex items-start justify-between gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-xl ${project.gradientClass} text-sm font-black text-white">${project.initials}</span>
              <span class="inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold ${statusClass(project.status)}">${project.status}</span>
            </div>
            <h3 class="truncate text-sm font-black text-white">${escapeHtml(project.title)}</h3>
            <p class="mt-1 max-h-10 overflow-hidden text-xs leading-5 text-slate-400">${escapeHtml(project.description)}</p>
            <div class="mt-auto pt-3">
              <div class="mb-1.5 flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-300">Progress</span>
                <span class="font-black text-white">${project.progress}%</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-500/20">
                <div class="js-progress h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-500 to-fuchsia-500 transition-[width] duration-1000 ease-out" data-progress="${project.progress}" style="width: 0"></div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between gap-3">
              <div class="flex items-center" aria-label="${project.members.length} members">${avatars}</div>
              <span class="text-xs font-semibold text-slate-400">${project.members.length} members</span>
            </div>
          </button>
        `;
      })
      .join("");

    selectors.projectSummary.textContent = items.length
      ? `Showing ${visibleItems.length} of ${items.length}`
      : "No projects match your search";
    selectors.searchResultCount.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;

    requestAnimationFrame(() => {
      document.querySelectorAll(".js-progress").forEach((bar) => {
        bar.style.width = `${bar.dataset.progress}%`;
      });
      revealCards();
      refreshIcons();
    });
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
    const total = statusData.reduce((sum, item) => sum + item.value, 0);
    selectors.statusTotals.innerHTML = statusData
      .map((item) => {
        const percent = Math.round((item.value / total) * 100);
        return `
          <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full ${item.dotClass}"></span>
              <span class="text-xs font-bold text-white">${item.label}</span>
            </div>
            <span class="text-xs font-semibold text-slate-400">${item.value} - ${percent}%</span>
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
            borderColor: "rgba(15, 23, 42, 0.42)",
            borderWidth: 3,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        animation: {
          animateRotate: true,
          duration: 950,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: getTextColor(),
              boxWidth: 10,
              usePointStyle: true,
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
      },
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
      const taskMatch = upcomingTasks.some((task) => {
        return `${task.title} ${task.project} ${task.priority}`.toLowerCase().includes(normalized);
      });
      return `${project.title} ${project.description} ${project.status}`.toLowerCase().includes(normalized) || taskMatch;
    });

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
    selectors.themeToggle.innerHTML = `<i data-lucide="${theme === "light" ? "sun" : "moon"}" class="h-4 w-4"></i>`;
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

    selectors.createProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(selectors.createProjectForm);
      const name = String(formData.get("name") || "Untitled Project").trim();
      const status = String(formData.get("status") || "Active");
      const description = String(formData.get("description") || "New mock project created from the dashboard modal.").trim();
      const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

      projects.unshift({
        id: `mock-${Date.now()}`,
        initials: initials || "NP",
        title: name,
        description,
        status,
        progress: status === "Completed" ? 100 : 12,
        members: ["SN", "HY"],
        tasks: 8,
        done: status === "Completed" ? 8 : 1,
        gradientClass: "bg-gradient-to-br from-violet-600 to-cyan-400",
        due: "Draft",
      });

      selectors.createProjectForm.reset();
      closeModals();
      filterDashboard(selectors.searchInput.value);
      showToast("Mock project created");
    });
  }

  function init() {
    const savedTheme = window.localStorage.getItem("tmds-dashboard-theme") || "dark";
    setTheme(savedTheme);
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
