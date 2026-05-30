(function () {
  "use strict";

  const app = document.getElementById("settingsApp");
  if (!app) return;

  // Get initials from a name (e.g., "Aisha Rahman" -> "AR")
  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Get a deterministic gradient based on member ID or name
  function getAvatarGradient(memberId) {
    const gradients = [
      "from-cyan-400 to-blue-500",
      "from-violet-500 to-fuchsia-500",
      "from-emerald-400 to-teal-500",
      "from-amber-400 to-orange-500",
      "from-rose-400 to-pink-500",
      "from-indigo-500 to-purple-600",
      "from-sky-400 to-indigo-500",
      "from-pink-500 to-rose-500"
    ];
    let hash = 0;
    const str = String(memberId || "");
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  /* ============================================================
   *  DATA – mock cho settings (Profile / Preferences / Account /
   *  Team & Permissions). BE sẽ thay bằng API thật, FE chỉ giữ
   *  cấu trúc và behavior tham chiếu.
   * ============================================================ */
  const initialMembers = [
    {
      id: "alex-morgan",
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
      online: true,
    },
    {
      id: "jamie-chen",
      name: "Jamie Chen",
      email: "jamie@example.com",
      role: "Viewer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
      online: true,
    },
    {
      id: "taylor-swift",
      name: "Taylor Swift",
      email: "taylor@example.com",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
      online: false,
    },
  ];

  const ROLES = ["Admin", "Member", "Viewer"];
  const roleAccent = {
    Admin: { ring: "ring-violet-300/30", chip: "bg-violet-400/15 text-violet-200" },
    Member: { ring: "ring-emerald-300/30", chip: "bg-emerald-400/15 text-emerald-200" },
    Viewer: { ring: "ring-cyan-300/30", chip: "bg-cyan-400/15 text-cyan-200" },
  };

  /* ============================================================
   *  Lucide bootstrap (gọi lại mỗi khi inject DOM mới)
   * ============================================================ */
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  refreshIcons();

  /* ============================================================
   *  Sidebar mobile toggle
   * ============================================================ */
  const sidebar = document.getElementById("settingsSidebar");
  const overlay = document.getElementById("settingsSidebarOverlay");
  const sidebarToggle = document.getElementById("settingsSidebarToggle");
  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  }
  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  }
  sidebarToggle && sidebarToggle.addEventListener("click", openSidebar);
  overlay && overlay.addEventListener("click", closeSidebar);

  /* ============================================================
   *  Tabs: Profile / Preferences / Account / Team
   * ============================================================ */
  const tabButtons = Array.from(document.querySelectorAll(".settings-tab"));
  const panels = Array.from(document.querySelectorAll(".settings-panel"));

  function activateTab(tabKey, { focusSearch = false } = {}) {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabKey;
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.classList.toggle("border-white/12", isActive);
      btn.classList.toggle("bg-gradient-to-r", isActive);
      btn.classList.toggle("from-cyan-400/16", isActive);
      btn.classList.toggle("to-violet-500/18", isActive);
      btn.classList.toggle("text-white", isActive);
      btn.classList.toggle("text-slate-200/80", !isActive);
      btn.classList.toggle("shadow-[0_0_24px_rgba(34,211,238,0.1)]", isActive);
    });
    panels.forEach((p) => {
      p.classList.toggle("hidden", p.dataset.panel !== tabKey);
    });
    refreshIcons();
    if (focusSearch) document.getElementById("settingsSearch")?.focus();
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
  activateTab("profile"); // default

  // Đọc hash để deeplink (ví dụ /settings/#team)
  if (location.hash) {
    const key = location.hash.replace("#", "");
    if (tabButtons.find((b) => b.dataset.tab === key)) activateTab(key);
  }

  /* ============================================================
   *  Password eye toggle (chung)
   * ============================================================ */
  document.querySelectorAll(".js-toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      if (!input) return;
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      const icon = btn.querySelector("[data-lucide]");
      if (icon) {
        icon.setAttribute("data-lucide", isPwd ? "eye-off" : "eye");
        refreshIcons();
      }
    });
  });

  /* ============================================================
   *  Theme toggle (lưu localStorage; share key với toàn app)
   * ============================================================ */
  const THEME_KEY = "taskflow-theme";
  function applyTheme(theme) {
    document.documentElement.classList.toggle("dark", theme !== "light");
  }
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
  document.getElementById("settingsThemeToggle")?.addEventListener("click", () => {
    const now = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(now);
    localStorage.setItem(THEME_KEY, now);
    showToast(now === "dark" ? "Dark mode đã bật" : "Light mode đã bật");
  });
  // Nếu Preferences tab có theme switch, đồng bộ ngược về body class
  const prefThemeSwitch = document.getElementById("prefThemeSwitch");
  prefThemeSwitch && prefThemeSwitch.addEventListener("change", (e) => {
    const t = e.target.checked ? "dark" : "light";
    applyTheme(t);
    localStorage.setItem(THEME_KEY, t);
  });

  /* ============================================================
   *  Profile tab – avatar preview + dirty badge
   * ============================================================ */
  const avatarInput = document.getElementById("profileAvatarInput");
  const avatarPreview = document.getElementById("profileAvatarPreview");
  avatarInput && avatarInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast("Ảnh vượt quá 1MB. Vui lòng chọn ảnh khác.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { avatarPreview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });

  const profileForm = document.getElementById("profileForm");
  const dirtyBadge = document.getElementById("profileDirtyBadge");
  if (profileForm) {
    profileForm.addEventListener("input", () => {
      dirtyBadge?.classList.remove("hidden");
    });
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      const payload = {
        full_name: formData.get("full_name"),
        email: formData.get("email"),
      };
      const curPwd = formData.get("current_password");
      const newPwd = formData.get("new_password");
      if (newPwd) {
        payload.current_password = curPwd;
        payload.new_password = newPwd;
      }

      window.TaskFlow.api.patch("/api/users/me/", payload, { root: profileForm })
        .then(() => {
          dirtyBadge?.classList.add("hidden");
          showToast("Profile đã được cập nhật thành công");
          const curPwdInput = profileForm.querySelector('input[name="current_password"]');
          const newPwdInput = profileForm.querySelector('input[name="new_password"]');
          if (curPwdInput) curPwdInput.value = "";
          if (newPwdInput) newPwdInput.value = "";
          setTimeout(() => location.reload(), 1000);
        })
        .catch((err) => {
          showToast(err.message || "Lỗi cập nhật profile");
        });
    });
    profileForm.addEventListener("reset", () => {
      dirtyBadge?.classList.add("hidden");
    });
  }

  /* ============================================================
   *  Preferences tab
   * ============================================================ */
  const preferencesForm = document.getElementById("preferencesForm");
  preferencesForm && preferencesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Preferences đã lưu");
  });

  /* ============================================================
   *  Account tab – revoke devices + delete account
   * ============================================================ */
  document.getElementById("deviceList")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-revoke-device");
    if (!btn) return;
    const li = btn.closest("li");
    if (!li) return;
    li.classList.add("opacity-0");
    setTimeout(() => li.remove(), 180);
    showToast("Đã thu hồi quyền truy cập thiết bị");
  });

  const confirmModal = document.getElementById("confirmDeleteModal");
  function toggleConfirm(open) {
    if (!confirmModal) return;
    if (open) {
      confirmModal.classList.remove("hidden");
      confirmModal.classList.add("flex");
      requestAnimationFrame(() => {
        confirmModal.classList.remove("opacity-0");
        confirmModal.querySelector("section").classList.remove("opacity-0", "scale-95");
        confirmModal.querySelector("section").classList.add("opacity-100", "scale-100");
      });
    } else {
      confirmModal.classList.add("opacity-0");
      confirmModal.querySelector("section").classList.add("opacity-0", "scale-95");
      setTimeout(() => {
        confirmModal.classList.add("hidden");
        confirmModal.classList.remove("flex");
      }, 180);
    }
  }
  document.getElementById("deleteAccountButton")?.addEventListener("click", () => toggleConfirm(true));
  document.querySelectorAll("[data-close-confirm]").forEach((btn) => {
    btn.addEventListener("click", () => toggleConfirm(false));
  });
  document.getElementById("confirmDeleteFinal")?.addEventListener("click", () => {
    toggleConfirm(false);
    showToast("Yêu cầu xoá tài khoản đã gửi tới Admin");
  });

  const accountForm = document.getElementById("accountForm");
  accountForm && accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Cài đặt tài khoản đã được cập nhật");
  });

  /* ============================================================
   *  Team & Permissions tab – render rows + invite modal
   * ============================================================ */
  const memberList = document.getElementById("teamMemberList");
  const state = { members: [], activeTeamId: null };

  const currentRole = app.dataset.workspaceRole || "Member";
  const isAuthorized = currentRole === "Owner" || currentRole === "Admin";

  function fetchTeamData() {
    window.TaskFlow.api.get("/api/teams/")
      .then((teams) => {
        if (teams && teams.length > 0) {
          state.activeTeamId = teams[0].id;
          return window.TaskFlow.api.get(`/api/teams/${state.activeTeamId}/members/`);
        }
        return [];
      })
      .then((members) => {
        state.members = members;
        renderMembers();
      })
      .catch((err) => {
        console.error("Error fetching team members:", err);
      });
  }

  if (memberList) {
    fetchTeamData();
  }

  function renderMembers() {
    if (!memberList) return;
    if (state.members.length === 0) {
      memberList.innerHTML = `<p class="p-4 text-center text-sm text-slate-400">Chưa có thành viên nào.</p>`;
      return;
    }
    memberList.innerHTML = state.members.map((m) => {
      const accent = roleAccent[m.role] || roleAccent.Member;
      const selectDisabled = (!isAuthorized || m.role === "Owner") ? "disabled" : "";
      const removeBtnStyle = (!isAuthorized || m.role === "Owner") ? "style='display:none;'" : "";
      const gradient = getAvatarGradient(m.id);
      const initials = getInitials(m.name);
      return `
        <div class="js-member-row flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-3" data-id="${m.id}">
          <div class="flex min-w-0 items-center gap-3">
            <div class="relative shrink-0">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br ${gradient} text-white font-bold text-sm shadow-glass uppercase font-sans">
                ${initials}
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-slate-900 ${m.online ? 'bg-emerald-400' : 'bg-slate-500'}" aria-hidden="true"></span>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-white">${m.name}</p>
              <p class="truncate text-xs text-slate-400">${m.email}</p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="hidden rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider sm:inline-flex ${accent.chip}">${m.role}</span>
            <label class="relative">
              <select class="js-role-select appearance-none rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 pr-8 text-xs font-bold text-white outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10" aria-label="Role for ${m.name}" ${selectDisabled}>
                ${ROLES.map((r) => `<option ${r === m.role ? "selected" : ""}>${r}</option>`).join("")}
              </select>
              <i data-lucide="chevron-down" class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"></i>
            </label>
            <button class="js-remove-member grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-200" type="button" aria-label="Remove ${m.name}" ${removeBtnStyle}>
              <i data-lucide="user-minus" class="h-4 w-4"></i>
            </button>
          </div>
        </div>`;
    }).join("");
    refreshIcons();
  }

  memberList?.addEventListener("change", (e) => {
    const sel = e.target.closest(".js-role-select");
    if (!sel) return;
    const row = sel.closest(".js-member-row");
    const id = row?.dataset.id;
    const newRole = sel.value;

    window.TaskFlow.api.patch(`/api/teams/${state.activeTeamId}/members/${id}/`, { role: newRole }, { root: memberList })
      .then((updated) => {
        const m = state.members.find((x) => String(x.id) === String(id));
        if (m) {
          m.role = updated.role;
        }
        renderMembers();
        showToast("Đã cập nhật vai trò thành công");
      })
      .catch((err) => {
        showToast(err.message || "Không thể cập nhật vai trò");
        fetchTeamData();
      });
  });

  memberList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-remove-member");
    if (!btn) return;
    const row = btn.closest(".js-member-row");
    const id = row?.dataset.id;

    if (confirm("Bạn có chắc muốn xóa thành viên này khỏi workspace?")) {
      window.TaskFlow.api.delete(`/api/teams/${state.activeTeamId}/members/${id}/`, { root: memberList })
        .then(() => {
          state.members = state.members.filter((x) => String(x.id) !== String(id));
          renderMembers();
          showToast("Đã xoá thành viên thành công");
        })
        .catch((err) => {
          showToast(err.message || "Không thể xóa thành viên");
        });
    }
  });

  // Invite modal
  const inviteModal = document.getElementById("inviteSettingsModal");
  function toggleInvite(open) {
    if (!inviteModal) return;
    if (!isAuthorized && open) {
      showToast("Chỉ Owner hoặc Admin mới có quyền gửi lời mời.");
      return;
    }
    if (open) {
      inviteModal.classList.remove("hidden");
      inviteModal.classList.add("flex");
      requestAnimationFrame(() => {
        inviteModal.classList.remove("opacity-0");
        const dialog = inviteModal.querySelector("section");
        dialog.classList.remove("opacity-0", "scale-95");
        dialog.classList.add("opacity-100", "scale-100");
      });
    } else {
      inviteModal.classList.add("opacity-0");
      const dialog = inviteModal.querySelector("section");
      dialog.classList.add("opacity-0", "scale-95");
      setTimeout(() => {
        inviteModal.classList.add("hidden");
        inviteModal.classList.remove("flex");
      }, 180);
    }
  }
  document.getElementById("inviteTeammateButton")?.addEventListener("click", () => toggleInvite(true));
  document.getElementById("inviteTeammateRowButton")?.addEventListener("click", () => toggleInvite(true));
  document.querySelectorAll("[data-close-invite]").forEach((b) => b.addEventListener("click", () => toggleInvite(false)));

  document.getElementById("inviteSettingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = (data.get("email") || "").toString().trim();
    const role = (data.get("role") || "Member").toString();
    if (!email) return;

    window.TaskFlow.api.post(`/api/teams/${state.activeTeamId}/invitations/`, { email, role }, { root: e.target })
      .then(() => {
        toggleInvite(false);
        e.target.reset();
        showToast(`Đã mời ${email} với vai trò ${role} thành công`);
      })
      .catch((err) => {
        showToast(err.message || "Lỗi gửi lời mời");
      });
  });

  document.getElementById("teamPermissionsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Cài đặt phân quyền team đã được lưu");
  });

  /* ============================================================
   *  Save All
   * ============================================================ */
  document.getElementById("settingsSaveAllButton")?.addEventListener("click", () => {
    showToast("Đã lưu toàn bộ thay đổi của 4 tab");
    dirtyBadge?.classList.add("hidden");
  });

  /* ============================================================
   *  Search filter (lọc theo nhãn tab)
   * ============================================================ */
  const searchInput = document.getElementById("settingsSearch");
  searchInput && searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      tabButtons.forEach((b) => b.classList.remove("opacity-30"));
      return;
    }
    tabButtons.forEach((b) => {
      const matches = b.textContent.toLowerCase().includes(q);
      b.classList.toggle("opacity-30", !matches);
    });
  });

  /* ============================================================
   *  Notification dropdown
   * ============================================================ */
  const notifBtn = document.getElementById("settingsNotificationToggle");
  const notifDrop = document.getElementById("settingsNotificationDropdown");
  const notifList = document.getElementById("settingsNotificationList");
  const notifications = [
    { icon: "shield-check", color: "text-cyan-200 bg-cyan-400/15", title: "Phiên đăng nhập mới", body: "MacBook Pro · 2 phút trước" },
    { icon: "user-plus", color: "text-violet-200 bg-violet-400/15", title: "Lời mời tham gia", body: "Alex Morgan đã chấp nhận lời mời" },
  ];
  if (notifList) {
    notifList.innerHTML = notifications.map((n) => `
      <div class="flex items-start gap-3">
        <span class="grid h-8 w-8 place-items-center rounded-xl ${n.color}"><i data-lucide="${n.icon}" class="h-4 w-4"></i></span>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-white">${n.title}</p>
          <p class="truncate text-xs text-slate-400">${n.body}</p>
        </div>
      </div>`).join("");
    refreshIcons();
  }
  notifBtn && notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifDrop?.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!notifDrop || notifDrop.classList.contains("hidden")) return;
    if (!notifDrop.contains(e.target) && e.target !== notifBtn) notifDrop.classList.add("hidden");
  });

  /* ============================================================
   *  Toast (giữ pattern như team.js)
   * ============================================================ */
  const toastEl = document.getElementById("settingsToast");
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2200);
  }
  window.tfSettingsToast = showToast;
})();
