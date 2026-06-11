(function () {
  "use strict";

  const app = document.getElementById("teamApp");
  if (!app) return;

  const selectors = {
    sidebar: document.getElementById("teamSidebar"),
    sidebarOverlay: document.getElementById("teamSidebarOverlay"),
    sidebarToggle: document.getElementById("teamSidebarToggle"),
    navLinks: document.querySelectorAll(".team-nav-link"),
    workspaceButtons: document.querySelectorAll(".workspace-group"),
    notificationToggle: document.getElementById("teamNotificationToggle"),
    notificationDropdown: document.getElementById("teamNotificationDropdown"),
    notificationList: document.getElementById("teamNotificationList"),
    themeToggle: document.getElementById("teamThemeToggle"),
    search: document.getElementById("teamSearch"),
    pinnedButton: document.getElementById("teamPinnedButton"),
    pinnedMessage: document.getElementById("pinnedMessageSpot"),
    chatMessages: document.getElementById("chatMessages"),
    messageForm: document.getElementById("messageForm"),
    messageInput: document.getElementById("messageInput"),
    activeGroupIcon: document.getElementById("activeGroupIcon"),
    activeGroupTitle: document.getElementById("activeGroupTitle"),
    activeGroupMeta: document.getElementById("activeGroupMeta"),
    groupAboutText: document.getElementById("groupAboutText"),
    callButton: document.getElementById("teamCallButton"),
    videoButton: document.getElementById("teamVideoButton"),
    moreButton: document.getElementById("teamMoreButton"),
    settingsButton: document.getElementById("teamSettingsButton"),
    deleteButton: document.getElementById("teamDeleteButton"),
    leaveButton: document.getElementById("teamLeaveButton"),
    toast: document.getElementById("teamToast"),
  };

  const groupData = {
    general: {
      title: "General",
      meta: "Company-wide updates",
      icon: "megaphone",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-orange-400/15 text-orange-200",
      about: "Company-wide announcements, quick updates, and alignment notes for the full organization.",
    },
    core: {
      title: "Design Team",
      meta: "12 members - 8 online",
      icon: "palette",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-white text-violet-600",
      about: "This is the space for Design Team collaboration and discussions.",
    },
    frontend: {
      title: "Frontend Team",
      meta: "10 members - 6 online",
      icon: "monitor",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/20 text-cyan-200",
      about: "Frontend implementation notes, responsive UI checks, and shared component decisions live here.",
    },
    backend: {
      title: "Backend Team",
      meta: "8 members - 4 online",
      icon: "server",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/20 text-rose-100",
      about: "Backend planning for APIs, data models, integrations, and release readiness.",
    },
    product: {
      title: "Product Squad",
      meta: "9 members - 5 online",
      icon: "kanban",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-blue-400/20 text-blue-100",
      about: "Product roadmap priorities, sprint goals, and stakeholder feedback for the active release.",
    },
    qa: {
      title: "QA Team",
      meta: "6 members - 3 online",
      icon: "badge-check",
      iconClass: "grid h-12 w-12 place-items-center rounded-2xl bg-fuchsia-500/25 text-fuchsia-100",
      about: "QA review, regression notes, test coverage, and launch blockers for the current sprint.",
    },
  };

  const notifications = [
    "Sarah pinned Dashboard redesign review.",
    "Emily replied in Design Team.",
    "Design System.pdf was shared.",
  ];

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function showToast(message) {
    if (!selectors.toast) return;
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => selectors.toast.classList.add("hidden"), 2200);
  }

  function toggleSidebar(forceOpen) {
    if (!selectors.sidebar || !selectors.sidebarOverlay) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
  }

  function setTheme(theme) {
    app.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme !== "light");
    if (selectors.themeToggle) {
      selectors.themeToggle.innerHTML = `<i data-lucide="${theme === "light" ? "sun" : "moon"}" class="h-4 w-4"></i>`;
    }
    refreshIcons();
  }

  function renderNotifications() {
    if (!selectors.notificationList) return;
    selectors.notificationList.innerHTML = notifications
      .map(
        (message) => `
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <i data-lucide="message-square" class="h-4 w-4"></i>
            </span>
            <p class="text-sm leading-5 text-slate-300">${message}</p>
          </div>
        `
      )
      .join("");
  }

  function revealPinnedMessage() {
    if (!selectors.pinnedMessage) return;
    selectors.pinnedMessage.classList.remove("hidden");
    selectors.pinnedMessage.classList.add("ring-2", "ring-violet-300/35");
    selectors.pinnedMessage.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => selectors.pinnedMessage.classList.remove("ring-2", "ring-violet-300/35"), 1500);
    showToast("Pinned message shown in chat");
  }

  function setGroupActive(buttons, groupId, isWorkspace) {
    buttons.forEach((button) => {
      const active = button.dataset.groupId === groupId;
      button.classList.toggle("is-active", active);
      button.classList.toggle("bg-gradient-to-r", active);
      button.classList.toggle(isWorkspace ? "from-violet-600/55" : "from-violet-600/45", active);
      button.classList.toggle(isWorkspace ? "to-blue-600/35" : "to-blue-600/25", active);
      button.classList.toggle("text-white", active);
      button.classList.toggle("text-slate-300", isWorkspace && !active);
      button.classList.toggle("text-slate-400", !isWorkspace && !active);
      button.classList.toggle("font-bold", isWorkspace && active);
      button.classList.toggle("font-semibold", isWorkspace && !active);
    });
  }

  function selectGroup(groupId, announce = true) {
    const group = groupData[groupId] || groupData.core;
    setGroupActive(selectors.workspaceButtons, groupId, true);

    if (selectors.activeGroupTitle) selectors.activeGroupTitle.textContent = group.title;
    if (selectors.activeGroupMeta) selectors.activeGroupMeta.textContent = group.meta;
    if (selectors.groupAboutText) selectors.groupAboutText.textContent = group.about;
    if (selectors.search) {
      selectors.search.value = "";
      selectors.search.placeholder = `Search in ${group.title}...`;
    }
    if (selectors.activeGroupIcon) {
      selectors.activeGroupIcon.className = group.iconClass;
      selectors.activeGroupIcon.innerHTML = `<i data-lucide="${group.icon}" class="h-5 w-5"></i>`;
    }

    filterMessages();
    selectors.pinnedMessage?.classList.add("hidden");
    if (announce) showToast(`${group.title} selected`);
    refreshIcons();
  }

  function filterMessages() {
    const query = (selectors.search?.value || "").trim().toLowerCase();
    document.querySelectorAll(".team-message").forEach((message) => {
      const haystack = message.dataset.messageBody || message.textContent.toLowerCase();
      message.classList.toggle("hidden", Boolean(query) && !haystack.includes(query));
    });
  }

  function appendMessage(body) {
    if (!selectors.chatMessages) return;
    const article = document.createElement("article");
    article.className = "team-message";
    article.dataset.messageBody = body.toLowerCase();
    article.innerHTML = `
      <div class="flex gap-3">
        <span class="relative shrink-0">
          <img class="h-11 w-11 rounded-xl border border-white/20 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Sarah avatar">
          <span class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400"></span>
        </span>
        <div class="min-w-0">
          <p class="text-sm font-black text-white">Sarah Nguyen <span class="ml-2 text-xs font-semibold text-slate-400">Just now</span></p>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-100"></p>
        </div>
      </div>
    `;
    article.querySelector("p.mt-1").textContent = body;
    selectors.chatMessages.appendChild(article);
    selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
  }

  function bindEvents() {
    selectors.sidebarToggle?.addEventListener("click", () => toggleSidebar());
    selectors.sidebarOverlay?.addEventListener("click", () => toggleSidebar(false));
    selectors.navLinks.forEach((link) => link.addEventListener("click", () => toggleSidebar(false)));

    selectors.notificationToggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown?.classList.toggle("hidden");
    });

    selectors.themeToggle?.addEventListener("click", () => {
      const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
      window.localStorage.setItem("taskflow-team-theme", nextTheme);
      showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    selectors.search?.addEventListener("input", filterMessages);

    selectors.messageForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const body = selectors.messageInput?.value.trim();
      if (!body) return;
      appendMessage(body);
      selectors.messageInput.value = "";
      showToast("Message sent");
    });

    selectors.callButton?.addEventListener("click", () => showToast("Voice call mock action"));
    selectors.videoButton?.addEventListener("click", () => showToast("Video call mock action"));
    selectors.moreButton?.addEventListener("click", () => showToast("More options"));
    selectors.pinnedButton?.addEventListener("click", revealPinnedMessage);
    selectors.settingsButton?.addEventListener("click", () => showToast("Group settings"));
    selectors.deleteButton?.addEventListener("click", () => showToast("Delete conversation mock action"));
    selectors.leaveButton?.addEventListener("click", () => showToast("Leave group mock action"));
    selectors.workspaceButtons.forEach((button) => button.addEventListener("click", () => selectGroup(button.dataset.groupId)));

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#teamNotificationToggle") && !event.target.closest("#teamNotificationDropdown")) {
        selectors.notificationDropdown?.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      toggleSidebar(false);
      selectors.notificationDropdown?.classList.add("hidden");
    });
  }

  function init() {
    setTheme(window.localStorage.getItem("taskflow-team-theme") || "dark");
    renderNotifications();
    bindEvents();
    selectGroup("core", false);
    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
