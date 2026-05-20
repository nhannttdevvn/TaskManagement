(function () {
  "use strict";

  const app = document.getElementById("teamApp");
  if (!app) return;

  const members = [
    {
      id: "mostafa",
      name: "Mostafa Ahmed",
      role: "Design Lead",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "Can you review the landing page timeline before standup?", time: "09:32 AM" },
        { body: "I pushed the visual notes into the shared workspace.", time: "09:44 AM" },
        { body: "Looks clean. I will align the hero copy with the final mockup.", time: "10:05 AM" },
        { body: "Keep the member cards compact so the chat stays usable on laptop screens.", time: "10:12 AM" },
        { body: "The Team page should match the Dashboard shell exactly.", time: "10:18 AM" },
        { body: "I will send the invite list after the design review.", time: "10:24 AM" },
        { body: "Great. The internal scroll behavior is the main thing to verify.", time: "10:29 AM" },
      ],
    },
    {
      id: "sarah",
      name: "Sarah Nguyen",
      role: "Product Manager",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "The roadmap sync is ready for the team review.", time: "08:20 AM" },
        { body: "Please keep the sprint board focused on launch blockers.", time: "08:36 AM" },
      ],
    },
    {
      id: "daniel",
      name: "Daniel Reyes",
      role: "Frontend Engineer",
      status: "away",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "I am wrapping up the responsive pass now.", time: "11:12 AM" },
        { body: "The dashboard shell is stable on laptop viewports.", time: "11:18 AM" },
      ],
    },
    {
      id: "aisha",
      name: "Aisha Khan",
      role: "UX Writer",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "I updated the empty states and notification text.", time: "01:06 PM" },
        { body: "The new labels should feel lighter and more product-led.", time: "01:14 PM" },
      ],
    },
    {
      id: "leo",
      name: "Leo Martins",
      role: "QA Specialist",
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "QA notes are in the release checklist.", time: "Yesterday" },
        { body: "No blockers on the timeline view after the last pass.", time: "Yesterday" },
      ],
    },
    {
      id: "nina",
      name: "Nina Patel",
      role: "Product Designer",
      status: "away",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "I added the updated avatar stack references.", time: "02:22 PM" },
        { body: "Spacing tokens look consistent across the two pages.", time: "02:31 PM" },
      ],
    },
    {
      id: "omar",
      name: "Omar Hassan",
      role: "Backend Engineer",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "API mocks are ready whenever the frontend needs them.", time: "03:10 PM" },
        { body: "I will keep the data contract lightweight for now.", time: "03:18 PM" },
      ],
    },
    {
      id: "mei",
      name: "Mei Lin",
      role: "Research Lead",
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "Research notes are grouped by persona in the workspace.", time: "Yesterday" },
      ],
    },
    {
      id: "jules",
      name: "Jules Carter",
      role: "Motion Designer",
      status: "away",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "I kept the hover transitions subtle for the SaaS dashboard tone.", time: "12:08 PM" },
      ],
    },
    {
      id: "elena",
      name: "Elena Rossi",
      role: "Customer Success",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=160&q=80",
      messages: [
        { body: "Customer feedback is grouped by priority for the next sync.", time: "04:02 PM" },
      ],
    },
  ];

  const notifications = [
    "Aisha mentioned you in UX copy updates.",
    "Daniel completed responsive review.",
  ];

  const state = {
    selectedId: members[0].id,
    filteredMembers: members.slice(),
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

    selectors.selectedAvatar.src = member.avatar;
    selectors.selectedAvatar.alt = `${member.name} avatar`;
    selectors.selectedName.textContent = member.name;
    selectors.selectedStatus.className = `text-xs font-semibold ${tone.label}`;
    selectors.selectedStatus.textContent = `${tone.text} - ${member.role}`;

    selectors.chatMessages.innerHTML = member.messages
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
      .join("");

    selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
    refreshIcons();
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
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => selectors.toast.classList.add("hidden"), 2200);
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
      renderMembers();
      renderChat();
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

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#teamNotificationToggle") && !event.target.closest("#teamNotificationDropdown")) {
        selectors.notificationDropdown.classList.add("hidden");
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

    selectors.inviteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      closeInviteModal();
      showToast("Invitation sent");
      selectors.inviteForm.reset();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggleSidebar(false);
        selectors.notificationDropdown.classList.add("hidden");
        if (!selectors.inviteModal.classList.contains("hidden")) closeInviteModal();
      }
    });
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    setTheme(window.localStorage.getItem("taskflow-team-theme") || "dark");
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
