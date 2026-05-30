(function () {
  "use strict";

  const app = document.getElementById("teamApp");
  if (!app) return;

  const teamApi = window.TaskFlow?.teamApi;
  const toast = window.TaskFlow?.toast;
  const allowDemoFallback = app.dataset.allowDemoFallback === "true";

  let members = [];

  let notifications = [
    "Aisha mentioned you in UX copy updates.",
    "Daniel completed responsive review.",
  ];

  const state = {
    selectedId: members[0].id,
    filteredMembers: members.slice(),
    messageQuery: "",
    callActive: false,
    callConnected: false,
    callStartedAt: null,
    callTimer: null,
    callConnectTimeout: null,
  };

  let initialized = false;

  const selectors = {
    sidebar: document.getElementById("teamSidebar"),
    sidebarOverlay: document.getElementById("teamSidebarOverlay"),
    sidebarToggle: document.getElementById("teamSidebarToggle"),
    memberSearch: document.getElementById("memberSearch"),
    memberList: document.getElementById("memberList"),
    selectedAvatar: document.getElementById("selectedMemberAvatar"),
    selectedName: document.getElementById("selectedMemberName"),
    selectedStatus: document.getElementById("selectedMemberStatus"),
    callButton: document.getElementById("teamCallButton"),
    callStatus: document.getElementById("teamCallStatus"),
    callModal: document.getElementById("teamCallModal"),
    callDialog: document.getElementById("teamCallDialog"),
    callAvatar: document.getElementById("teamCallAvatar"),
    callName: document.getElementById("teamCallName"),
    callRole: document.getElementById("teamCallRole"),
    callState: document.getElementById("teamCallState"),
    callTimer: document.getElementById("teamCallTimer"),
    endCall: document.getElementById("teamEndCall"),
    muteCall: document.getElementById("teamMuteCall"),
    speakerCall: document.getElementById("teamSpeakerCall"),
    chatMenuButton: document.getElementById("teamChatMenuButton"),
    chatMenu: document.getElementById("teamChatMenu"),
    messageSearchBar: document.getElementById("teamMessageSearchBar"),
    messageSearchInput: document.getElementById("messageSearchInput"),
    messageSearchClose: document.getElementById("messageSearchClose"),
    searchMessagesButton: document.getElementById("teamSearchMessagesButton"),
    deleteConversationButton: document.getElementById("teamDeleteConversationButton"),
    chatMessages: document.getElementById("chatMessages"),
    messageForm: document.getElementById("messageForm"),
    messageInput: document.getElementById("messageInput"),
    themeToggle: document.getElementById("teamThemeToggle"),
    notificationToggle: document.getElementById("teamNotificationToggle"),
    notificationDropdown: document.getElementById("teamNotificationDropdown"),
    notificationList: document.getElementById("teamNotificationList"),
    inviteButton: document.getElementById("inviteMemberButton"),
    inviteModal: document.getElementById("inviteMemberModal"),
    inviteDialog: document.getElementById("inviteMemberDialog"),
    inviteClose: document.getElementById("inviteMemberClose"),
    inviteCancel: document.getElementById("inviteMemberCancel"),
    inviteForm: document.getElementById("inviteMemberForm"),
    inviteSubmit: document.getElementById("inviteSubmitButton"),
    toast: document.getElementById("teamToast"),
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusTone(status) {
    const tones = {
      online: {
        dot: "bg-emerald-400",
        label: "text-emerald-200",
        badge: "bg-emerald-400/15 text-emerald-200",
        text: "Online",
      },
      away: {
        dot: "bg-amber-400",
        label: "text-amber-200",
        badge: "bg-amber-400/15 text-amber-200",
        text: "Away",
      },
      offline: {
        dot: "bg-slate-500",
        label: "text-slate-300",
        badge: "bg-slate-400/15 text-slate-300",
        text: "Offline",
      },
    };
    return tones[status] || tones.offline;
  }

  function selectedMember() {
    return members.find((member) => member.id === state.selectedId) || members[0];
  }

  function renderMembers() {
    selectors.memberList.innerHTML = state.filteredMembers
      .map((member) => {
        const tone = statusTone(member.status);
        const active = member.id === state.selectedId;
        return `
          <button
            class="team-member flex items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(34,211,238,0.12)] motion-reduce:transform-none ${
              active
                ? "border-cyan-300/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
            }"
            type="button"
            data-member-id="${member.id}"
          >
            <span class="relative shrink-0">
              <img class="h-10 w-10 rounded-xl border border-white/20 object-cover" src="${member.avatar}" alt="${escapeHtml(member.name)} avatar">
              <span class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${tone.dot}"></span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-bold text-white">${escapeHtml(member.name)}</span>
              <span class="block truncate text-xs text-slate-400">${escapeHtml(member.role)}</span>
            </span>
            <span class="rounded-full px-2 py-1 text-[0.65rem] font-extrabold ${tone.badge}">${tone.text}</span>
          </button>
        `;
      })
      .join("");
    refreshIcons();
  }

  function renderChat() {
    const member = selectedMember();
    const tone = statusTone(member.status);
    const query = state.messageQuery.trim().toLowerCase();
    const visibleMessages = query
      ? member.messages.filter((message) => message.body.toLowerCase().includes(query) || message.time.toLowerCase().includes(query))
      : member.messages;

    selectors.selectedAvatar.src = member.avatar;
    selectors.selectedAvatar.alt = `${member.name} avatar`;
    selectors.selectedName.textContent = member.name;
    selectors.selectedStatus.className = `text-xs font-semibold ${tone.label}`;
    selectors.selectedStatus.textContent = `${tone.text} - ${member.role}`;

    selectors.chatMessages.innerHTML = visibleMessages.length
      ? visibleMessages
        .map(
          (message) => `
          <article class="flex justify-end gap-3">
            <div class="max-w-[min(34rem,78%)] text-right">
              <div class="inline-block rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/95 via-blue-600/95 to-cyan-600/95 px-4 py-3 text-left text-sm leading-6 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]">
                ${escapeHtml(message.body)}
              </div>
              <p class="mt-1 text-xs text-slate-500">${escapeHtml(message.time)}</p>
            </div>
            <img class="mt-1 h-8 w-8 rounded-xl border border-white/20 object-cover" src="${member.avatar}" alt="${escapeHtml(member.name)} avatar">
          </article>
        `
        )
        .join("")
      : `
        <div class="grid h-full min-h-[14rem] place-items-center text-center">
          <div>
            <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
              <i data-lucide="${query ? "search-x" : "message-square-off"}" class="h-5 w-5"></i>
            </div>
            <p class="mt-3 text-sm font-bold text-white">${query ? "No matching messages" : "Conversation is empty"}</p>
            <p class="mt-1 text-xs font-semibold text-slate-500">${query ? "Try a different keyword." : "Send a new message to restart this chat."}</p>
          </div>
        </div>
      `;

    selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
    refreshIcons();
  }

  function toggleChatMenu(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.chatMenu.classList.contains("hidden");
    selectors.chatMenu.classList.toggle("hidden", !shouldOpen);
    selectors.chatMenuButton.setAttribute("aria-expanded", String(shouldOpen));
  }

  function callDurationLabel() {
    if (!state.callStartedAt) return "00:00";
    const seconds = Math.max(0, Math.floor((Date.now() - state.callStartedAt) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }

  function setCallButtonState(active) {
    selectors.callStatus.classList.toggle("hidden", !active);
    selectors.callButton.classList.toggle("bg-emerald-400/15", active);
    selectors.callButton.classList.toggle("border-emerald-300/30", active);
    selectors.callButton.innerHTML = `<i data-lucide="${active ? "phone-off" : "phone"}" class="h-4 w-4"></i>`;
    refreshIcons();
  }

  function openCallModal() {
    const member = selectedMember();
    state.callActive = true;
    state.callConnected = false;
    state.callStartedAt = null;
    selectors.callAvatar.src = member.avatar;
    selectors.callAvatar.alt = `${member.name} avatar`;
    selectors.callName.textContent = member.name;
    selectors.callRole.textContent = member.role;
    selectors.callState.textContent = "Ringing...";
    selectors.callTimer.textContent = "Calling...";
    selectors.callStatus.textContent = `Ringing ${member.name.split(" ")[0]}...`;
    setCallButtonState(true);

    selectors.callModal.classList.remove("hidden");
    selectors.callModal.classList.add("flex");
    selectors.callModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");

    window.requestAnimationFrame(() => {
      selectors.callModal.classList.remove("opacity-0");
      selectors.callDialog.classList.remove("scale-95", "opacity-0");
      selectors.callDialog.classList.add("scale-100", "opacity-100");
    });

    window.clearTimeout(state.callConnectTimeout);
    state.callConnectTimeout = window.setTimeout(() => {
      if (!state.callActive) return;
      state.callConnected = true;
      state.callStartedAt = Date.now();
      selectors.callState.textContent = "Connected";
      selectors.callTimer.textContent = "00:00";
      selectors.callStatus.textContent = `In call with ${member.name.split(" ")[0]}`;
      window.clearInterval(state.callTimer);
      state.callTimer = window.setInterval(() => {
        selectors.callTimer.textContent = callDurationLabel();
      }, 1000);
    }, 2300);

    showToast(`Calling ${member.name}`);
    refreshIcons();
  }

  function endCall() {
    state.callActive = false;
    state.callConnected = false;
    state.callStartedAt = null;
    window.clearTimeout(state.callConnectTimeout);
    window.clearInterval(state.callTimer);
    selectors.callModal.classList.add("opacity-0");
    selectors.callDialog.classList.add("scale-95", "opacity-0");
    selectors.callDialog.classList.remove("scale-100", "opacity-100");
    selectors.callModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    selectors.callStatus.textContent = "";
    setCallButtonState(false);

    window.setTimeout(() => {
      selectors.callModal.classList.add("hidden");
      selectors.callModal.classList.remove("flex");
    }, 180);

    showToast("Call ended");
  }

  function toggleCall() {
    if (state.callActive) {
      endCall();
      return;
    }
    openCallModal();
  }

  function toggleCallControl(button, activeClass, message) {
    button.classList.toggle(activeClass);
    showToast(message);
    refreshIcons();
  }

  function openMessageSearch() {
    selectors.messageSearchBar.classList.remove("hidden");
    selectors.messageSearchInput.focus();
    toggleChatMenu(false);
  }

  function closeMessageSearch() {
    state.messageQuery = "";
    selectors.messageSearchInput.value = "";
    selectors.messageSearchBar.classList.add("hidden");
    renderChat();
  }

  function deleteConversation() {
    const member = selectedMember();
    member.messages = [];
    state.messageQuery = "";
    selectors.messageSearchInput.value = "";
    selectors.messageSearchBar.classList.add("hidden");
    toggleChatMenu(false);
    renderChat();
    showToast("Conversation deleted");
  }

  function renderNotifications() {
    selectors.notificationList.innerHTML = notifications
      .map(
        (message) => `
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <i data-lucide="message-square" class="h-4 w-4"></i>
            </span>
            <p class="text-sm leading-5 text-slate-300">${escapeHtml(message)}</p>
          </div>
        `
      )
      .join("");
  }

  function filterMembers() {
    const query = selectors.memberSearch.value.trim().toLowerCase();
    state.filteredMembers = members.filter((member) => {
      return `${member.name} ${member.role} ${member.status}`.toLowerCase().includes(query);
    });
    renderMembers();
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
    if (toast) {
      toast.show(selectors.toast, message, { duration: 2200 });
      return;
    }
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => selectors.toast.classList.add("hidden"), 2200);
  }

  function invitePayload() {
    const formData = new FormData(selectors.inviteForm);
    return {
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "member").trim().toLowerCase(),
      projects: formData.getAll("projects").map((project) => String(project).trim()).filter(Boolean),
      message: String(formData.get("message") || "").trim(),
    };
  }

  function openInviteModal() {
    selectors.inviteModal.classList.remove("hidden");
    selectors.inviteModal.classList.add("flex");
    selectors.inviteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");

    window.requestAnimationFrame(() => {
      selectors.inviteModal.classList.remove("opacity-0");
      selectors.inviteDialog.classList.remove("scale-95", "opacity-0");
      selectors.inviteDialog.classList.add("scale-100", "opacity-100");
      selectors.inviteForm.querySelector("input")?.focus();
    });
  }

  function closeInviteModal() {
    selectors.inviteModal.classList.add("opacity-0");
    selectors.inviteDialog.classList.add("scale-95", "opacity-0");
    selectors.inviteDialog.classList.remove("scale-100", "opacity-100");
    selectors.inviteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");

    window.setTimeout(() => {
      selectors.inviteModal.classList.add("hidden");
      selectors.inviteModal.classList.remove("flex");
    }, 180);
  }

  function bindEvents() {
    selectors.sidebarToggle.addEventListener("click", () => toggleSidebar());
    selectors.sidebarOverlay.addEventListener("click", () => toggleSidebar(false));

    document.querySelectorAll(".team-nav-link").forEach((link) => {
      link.addEventListener("click", () => toggleSidebar(false));
    });

    selectors.memberSearch.addEventListener("input", filterMembers);

    selectors.memberList.addEventListener("click", (event) => {
      const memberButton = event.target.closest("[data-member-id]");
      if (!memberButton) return;
      state.selectedId = memberButton.dataset.memberId;
      state.messageQuery = "";
      state.callActive = false;
      state.callConnected = false;
      window.clearTimeout(state.callConnectTimeout);
      window.clearInterval(state.callTimer);
      selectors.messageSearchInput.value = "";
      selectors.messageSearchBar.classList.add("hidden");
      selectors.callStatus.classList.add("hidden");
      setCallButtonState(false);
      renderMembers();
      renderChat();
      refreshIcons();
    });

    selectors.messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const body = selectors.messageInput.value.trim();
      if (!body) return;
      selectedMember().messages.push({
        body,
        time: "Just now",
      });
      selectors.messageInput.value = "";
      renderChat();
      showToast("Mock message sent");
    });

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    selectors.callButton.addEventListener("click", toggleCall);
    selectors.endCall.addEventListener("click", endCall);
    selectors.muteCall.addEventListener("click", () => toggleCallControl(selectors.muteCall, "bg-cyan-400/15", "Mute toggled"));
    selectors.speakerCall.addEventListener("click", () => toggleCallControl(selectors.speakerCall, "bg-cyan-400/15", "Speaker toggled"));
    selectors.chatMenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleChatMenu();
    });
    selectors.searchMessagesButton.addEventListener("click", openMessageSearch);
    selectors.deleteConversationButton.addEventListener("click", deleteConversation);
    selectors.messageSearchInput.addEventListener("input", () => {
      state.messageQuery = selectors.messageSearchInput.value.trim();
      renderChat();
    });
    selectors.messageSearchClose.addEventListener("click", closeMessageSearch);

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#teamNotificationToggle") && !event.target.closest("#teamNotificationDropdown")) {
        selectors.notificationDropdown.classList.add("hidden");
      }
      if (!event.target.closest("#teamChatMenuButton") && !event.target.closest("#teamChatMenu")) {
        toggleChatMenu(false);
      }
    });

    selectors.themeToggle.addEventListener("click", () => {
      const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
      window.localStorage.setItem("taskflow-team-theme", nextTheme);
      showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    selectors.inviteButton.addEventListener("click", openInviteModal);
    selectors.inviteClose.addEventListener("click", closeInviteModal);
    selectors.inviteCancel.addEventListener("click", closeInviteModal);

    selectors.inviteModal.addEventListener("click", (event) => {
      if (event.target === selectors.inviteModal) closeInviteModal();
    });

    selectors.inviteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      selectors.inviteSubmit.disabled = true;
      selectors.inviteSubmit.innerHTML = '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> Sending...';
      refreshIcons();

      try {
        const data = await teamApi.sendInvite(app, selectors.inviteForm, invitePayload());

        closeInviteModal();
        showToast(data.message || "Invitation sent");
        selectors.inviteForm.reset();
      } catch (error) {
        showToast(error.message || "Could not send invitation");
      } finally {
        selectors.inviteSubmit.disabled = false;
        selectors.inviteSubmit.innerHTML = '<i data-lucide="mail" class="h-4 w-4"></i> Send Invitation';
        refreshIcons();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggleSidebar(false);
        selectors.notificationDropdown.classList.add("hidden");
        toggleChatMenu(false);
        if (!selectors.messageSearchBar.classList.contains("hidden")) closeMessageSearch();
        if (state.callActive) endCall();
        if (!selectors.inviteModal.classList.contains("hidden")) closeInviteModal();
      }
    });
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  async function loadTeamData() {
    try {
      const result = await teamApi.loadData(app);

      members = result.data.members || members;
      notifications = result.data.notifications || notifications;
      state.selectedId = members[0]?.id || state.selectedId;
      state.filteredMembers = members.slice();
    } catch (error) {
      showToast(error.message || "Team data could not be loaded");
      if (!allowDemoFallback) {
        throw error;
      }
      console.warn("Using team demo fallback data:", error);
    }
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    setTheme(window.localStorage.getItem("taskflow-team-theme") || "dark");
    await loadTeamData();

    // Enforce role restrictions
    const userRole = app.dataset.userRole || "viewer";
    if (userRole === "viewer" || userRole === "member") {
      if (selectors.inviteButton) selectors.inviteButton.classList.add("hidden");
      if (selectors.deleteConversationButton) selectors.deleteConversationButton.classList.add("hidden");
    }

    renderNotifications();
    renderMembers();
    renderChat();
    bindEvents();
    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
