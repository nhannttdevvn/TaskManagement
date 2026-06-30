(function () {
  "use strict";

  const app = document.getElementById("filesApp");
  if (!app) return;

  /* ============================================================
   *  Live data from /api/files/ with safe empty defaults.
   * ============================================================ */
  const FOLDER_PALETTE = [
    { id: "blue",    icon: "folder",          ring: "from-cyan-400 to-blue-600" },
    { id: "violet",  icon: "music",           ring: "from-violet-500 to-fuchsia-500" },
    { id: "emerald", icon: "briefcase",       ring: "from-emerald-500 to-green-500" },
    { id: "amber",   icon: "folder-open",     ring: "from-amber-500 to-rose-500" },
    { id: "cyan",    icon: "cloud",           ring: "from-cyan-500 to-violet-500" },
    { id: "rose",    icon: "folder-heart",    ring: "from-rose-500 to-fuchsia-500" },
  ];

  const state = {
    folders: [],
    recentFiles: [],
    storageBreakdown: [
      { label: "Images", used: 0, total: 1, icon: "image", color: "from-cyan-400 to-blue-500" },
      { label: "Documents", used: 0, total: 1, icon: "file-text", color: "from-amber-400 to-rose-500" },
      { label: "Videos", used: 0, total: 1, icon: "film", color: "from-rose-400 to-fuchsia-500" },
      { label: "Other", used: 0, total: 1, icon: "file", color: "from-emerald-400 to-cyan-500" },
    ],
    folderFilter: "all",
    activeFolderId: null,
    activityRange: "week",
    sort: { key: "modified", dir: "desc" },
  };

  /* ============================================================
   *  Helpers
   * ============================================================ */
  function refreshIcons() {
    if (window.TaskFlow && typeof window.TaskFlow.refreshIcons === "function") {
      window.TaskFlow.refreshIcons();
      return;
    }
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }
  refreshIcons();

  const AVATARS = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
  ];
  function avatarStack(count = 3) {
    const list = AVATARS.slice(0, count);
    return `<div class="flex -space-x-2">${list.map((a) => `<img class="h-6 w-6 rounded-full border-2 border-slate-900 object-cover" src="${a}" alt="">`).join("")}${count > list.length ? `<span class="grid h-6 w-6 place-items-center rounded-full border-2 border-slate-900 bg-white/10 text-[10px] font-bold text-white">+${count - list.length}</span>` : ""}</div>`;
  }

  function formatGb(value) {
    const number = Number(value || 0);
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
  }

  /* ============================================================
   *  Sidebar mobile toggle
   * ============================================================ */
  const sidebar = document.getElementById("filesSidebar");
  const overlay = document.getElementById("filesSidebarOverlay");
  document.getElementById("filesSidebarToggle")?.addEventListener("click", () => {
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    overlay.classList.remove("hidden");
    app.classList.add("taskflow-sidebar-open");
  });
  overlay?.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    overlay.classList.add("hidden");
    app.classList.remove("taskflow-sidebar-open");
  });

  /* ============================================================
   *  Theme toggle
   * ============================================================ */
  const THEME_KEY = "taskflow-theme";
  function applyTheme(theme) {
    if (window.TaskFlow?.theme) {
      return window.TaskFlow.theme.apply(theme, {
        root: app,
        toggle: document.getElementById("filesThemeToggle"),
      });
    }
    document.documentElement.classList.toggle("dark", theme !== "light");
    app.dataset.theme = theme;
    return theme;
  }
  applyTheme(window.TaskFlow?.theme?.current() || localStorage.getItem(THEME_KEY) || "dark");
  document.getElementById("filesThemeToggle")?.addEventListener("click", () => {
    const now = app.dataset.theme === "light" ? "dark" : "light";
    applyTheme(now);
    showToast(now === "dark" ? "Dark mode on" : "Light mode on");
  });

  /* ============================================================
   *  Folder grid
   * ============================================================ */
  function visibleFolders() {
    return state.folders.filter((f) => {
      if (state.folderFilter === "all") return true;
      if (state.folderFilter === "shared") return f.shared;
      if (state.folderFilter === "recent") return f.updatedAt <= 2;
      return true;
    });
  }
  function renderFolders() {
    const grid = document.getElementById("folderGrid");
    if (!grid) return;
    const list = visibleFolders();
    document.getElementById("folderCount").textContent = `${list.length} folders`;

    if (!list.length) {
      grid.innerHTML = `
        <button class="js-create-folder-inline col-span-full flex min-h-[11rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cyan-300/40 bg-cyan-300/5 p-6 text-center transition hover:border-cyan-200/70 hover:bg-cyan-300/10" type="button">
          <span class="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
            <i data-lucide="folder-plus" class="h-6 w-6"></i>
          </span>
          <span class="text-sm font-black text-white">Create your first folder</span>
          <span class="max-w-sm text-xs font-semibold text-slate-400">Folders are saved as real projects, so they stay visible after reload or navigation.</span>
        </button>`;
      refreshIcons();
      return;
    }

    grid.innerHTML = list.map((f) => {
      const palette = FOLDER_PALETTE.find((p) => p.id === f.color) || FOLDER_PALETTE[0];
      return `
        <button class="js-folder-card group relative flex w-full flex-col rounded-2xl border border-white/10 bg-gradient-to-br ${palette.ring} p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow motion-reduce:transform-none" data-id="${f.id}">
          <div class="flex items-start justify-between">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white shadow-glass">
              <i data-lucide="${f.icon}" class="h-5 w-5"></i>
            </span>
            ${avatarStack(Math.min(f.members, 3))}
          </div>
          <div class="mt-6">
            <p class="text-base font-black text-white">${f.name}</p>
            <p class="text-xs font-semibold text-white/80">${f.count.toLocaleString()} files</p>
          </div>
        </button>`;
    }).join("");
    refreshIcons();
  }

  document.querySelectorAll(".js-folder-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".js-folder-filter").forEach((b) => {
        b.classList.remove("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
        b.classList.add("text-slate-400");
      });
      btn.classList.remove("text-slate-400");
      btn.classList.add("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
      state.folderFilter = btn.dataset.filter;
      renderFolders();
    });
  });

  document.getElementById("folderGrid")?.addEventListener("click", (e) => {
    if (e.target.closest(".js-create-folder-inline")) {
      toggleFolderModal(true);
      return;
    }
    const btn = e.target.closest(".js-folder-card");
    if (!btn) return;
    const folder = state.folders.find((f) => f.id === btn.dataset.id);
    if (folder) {
      state.activeFolderId = folder.id;
      showToast(`Selected folder: ${folder.name}`);
    }
  });

  document.getElementById("showAllFolders")?.addEventListener("click", () => {
    state.folderFilter = "all";
    document.querySelectorAll(".js-folder-filter").forEach((b) => {
      b.classList.toggle("bg-gradient-to-r", b.dataset.filter === "all");
      b.classList.toggle("from-cyan-400/20", b.dataset.filter === "all");
      b.classList.toggle("to-violet-500/20", b.dataset.filter === "all");
      b.classList.toggle("text-white", b.dataset.filter === "all");
      b.classList.toggle("text-slate-400", b.dataset.filter !== "all");
    });
    renderFolders();
  });

  /* ============================================================
   *  Recent files table
   * ============================================================ */
  function renderRecent() {
    const tbody = document.getElementById("recentFilesBody");
    if (!tbody) return;

    const sorted = [...state.recentFiles].sort((a, b) => {
      const dir = state.sort.dir === "asc" ? 1 : -1;
      switch (state.sort.key) {
        case "name":     return a.name.localeCompare(b.name) * dir;
        case "size":     return (a.size - b.size) * dir;
        case "members":  return (a.members - b.members) * dir;
        default:         return (a.id - b.id) * dir;
      }
    });

    if (!sorted.length) {
      tbody.innerHTML = `
        <tr class="border-t border-white/5">
          <td class="px-2 py-8 text-center" colspan="5">
            <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
              <span class="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
                <i data-lucide="upload-cloud" class="h-6 w-6"></i>
              </span>
              <span class="text-sm font-black text-white">No uploaded files yet</span>
              <span class="text-xs font-semibold text-slate-400">Choose a folder, then upload a file. The attachment metadata will be saved in the database.</span>
            </div>
          </td>
        </tr>`;
      refreshIcons();
      return;
    }

    tbody.innerHTML = sorted.map((f) => `
      <tr class="border-t border-white/5 hover:bg-white/5" data-id="${f.id}">
        <td class="px-2 py-2.5">
          <div class="flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-xl ${f.accent}"><i data-lucide="${f.icon}" class="h-4 w-4"></i></span>
            <span class="font-semibold text-white">${f.name}</span>
          </div>
        </td>
        <td class="px-2 py-2.5 font-semibold text-slate-300">${f.size} MB</td>
        <td class="px-2 py-2.5 font-semibold text-slate-300">${f.modified}</td>
        <td class="px-2 py-2.5">${avatarStack(f.members)}</td>
        <td class="px-2 py-2.5 text-right">
          <button class="js-row-action grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" aria-label="More actions" data-id="${f.id}">
            <i data-lucide="more-vertical" class="h-4 w-4"></i>
          </button>
        </td>
      </tr>`).join("");
    refreshIcons();
  }

  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      } else {
        state.sort.key = key;
        state.sort.dir = "asc";
      }
      renderRecent();
      showToast(`Sorted by ${key} (${state.sort.dir})`);
    });
  });

  document.getElementById("recentFilesBody")?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".js-row-action");
    if (!btn) return;
    const fileId = btn.dataset.id;
    const file = state.recentFiles.find((f) => String(f.id) === String(fileId));
    if (!file) return;

    if (confirm(`Delete file "${file.name}"?`)) {
      try {
        await window.TaskFlow.api.delete(`/api/attachments/${fileId}/`, { root: btn });
        state.recentFiles = state.recentFiles.filter((f) => String(f.id) !== String(fileId));
        renderRecent();
        await loadFilesData();
        showToast("File deleted");
      } catch (err) {
        showToast(err.message || "Could not delete file");
      }
    }
  });

  /* ============================================================
   *  Storage breakdown
   * ============================================================ */
  function renderStorage() {
    const used = state.storageBreakdown.reduce((s, x) => s + Number(x.used || 0), 0);
    const total = state.storageBreakdown.reduce((s, x) => s + Number(x.total || 0), 0);
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

    document.getElementById("storagePercent").textContent = pct + "%";
    document.getElementById("storageUsed").textContent = formatGb(used) + "GB";
    document.getElementById("storageTotal").textContent = formatGb(total) + "GB";
    const circle = document.getElementById("storageCircle");
    if (circle) circle.setAttribute("stroke-dashoffset", String(100 - pct));

    const list = document.getElementById("storageBreakdown");
    if (!list) return;
    list.innerHTML = state.storageBreakdown.map((b) => {
      const itemUsed = Number(b.used || 0);
      const itemTotal = Number(b.total || 0);
      const p = itemTotal > 0 ? Math.min(100, Math.round((itemUsed / itemTotal) * 100)) : 0;
      return `
        <li class="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
          <div class="flex items-center justify-between text-xs">
            <span class="inline-flex items-center gap-2 font-bold text-white">
              <i data-lucide="${b.icon}" class="h-4 w-4 text-cyan-200"></i>
              ${b.label}
            </span>
            <span class="font-bold text-slate-300">${formatGb(itemUsed)} / ${formatGb(itemTotal)} GB</span>
          </div>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r ${b.color}" style="width:${p}%"></div>
          </div>
        </li>`;
    }).join("");
    refreshIcons();
  }

  /* ============================================================
   *  Activity Chart (Chart.js)
   * ============================================================ */
  const activityData = {
    week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      uploads:   [12, 18, 9, 22, 28, 15, 8],
      downloads: [20, 15, 24, 18, 32, 22, 12],
      shares:    [6, 8, 4, 10, 14, 7, 3],
    },
    month: {
      labels: ["W1", "W2", "W3", "W4"],
      uploads:   [78, 92, 65, 110],
      downloads: [120, 95, 140, 165],
      shares:    [32, 28, 44, 50],
    },
  };
  let chartInstance = null;
  function renderChart(range = "week") {
    const ctx = document.getElementById("activityChart");
    if (!ctx || !window.Chart) return;
    const d = activityData[range];
    const cfg = {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [
          { label: "Uploads",   data: d.uploads,   backgroundColor: "rgba(167,139,250,0.85)", borderRadius: 8, barThickness: 12 },
          { label: "Downloads", data: d.downloads, backgroundColor: "rgba(103,232,249,0.85)", borderRadius: 8, barThickness: 12 },
          { label: "Shares",    data: d.shares,    backgroundColor: "rgba(251,113,133,0.85)", borderRadius: 8, barThickness: 12 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { weight: 600 } } },
          y: { grid: { color: "rgba(255,255,255,0.05)", drawBorder: false }, ticks: { color: "#94a3b8", font: { weight: 600 } } },
        },
      },
    };
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, cfg);
  }
  document.querySelectorAll(".js-activity-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".js-activity-tab").forEach((b) => {
        b.classList.remove("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
        b.classList.add("text-slate-400");
      });
      btn.classList.remove("text-slate-400");
      btn.classList.add("bg-gradient-to-r", "from-cyan-400/20", "to-violet-500/20", "text-white");
      state.activityRange = btn.dataset.range;
      renderChart(btn.dataset.range);
    });
  });

  /* ============================================================
   *  Create folder modal
   * ============================================================ */
  const folderModal = document.getElementById("createFolderModal");
  const folderColorPicker = document.getElementById("folderColorPicker");
  let selectedColor = FOLDER_PALETTE[0].id;
  if (folderColorPicker) {
    folderColorPicker.innerHTML = FOLDER_PALETTE.map((p, i) => `
      <button class="js-color-swatch h-8 w-full rounded-xl border bg-gradient-to-br ${p.ring} ${i === 0 ? "border-white ring-2 ring-cyan-300/50" : "border-white/10"}" type="button" data-color="${p.id}" aria-label="${p.id}"></button>
    `).join("");
    folderColorPicker.querySelectorAll(".js-color-swatch").forEach((s) => {
      s.addEventListener("click", () => {
        selectedColor = s.dataset.color;
        folderColorPicker.querySelectorAll(".js-color-swatch").forEach((x) => {
          x.classList.remove("border-white", "ring-2", "ring-cyan-300/50");
          x.classList.add("border-white/10");
        });
        s.classList.remove("border-white/10");
        s.classList.add("border-white", "ring-2", "ring-cyan-300/50");
      });
    });
  }

  function toggleFolderModal(open) {
    if (!folderModal) return;
    if (open) {
      folderModal.classList.remove("hidden");
      folderModal.classList.add("flex");
      requestAnimationFrame(() => {
        folderModal.classList.remove("opacity-0");
        const dialog = folderModal.querySelector("section");
        dialog.classList.remove("opacity-0", "scale-95");
        dialog.classList.add("opacity-100", "scale-100");
      });
    } else {
      folderModal.classList.add("opacity-0");
      const dialog = folderModal.querySelector("section");
      dialog.classList.add("opacity-0", "scale-95");
      setTimeout(() => {
        folderModal.classList.add("hidden");
        folderModal.classList.remove("flex");
      }, 180);
    }
  }
  document.getElementById("createFolderButton")?.addEventListener("click", () => toggleFolderModal(true));
  document.querySelectorAll("[data-close-folder]").forEach((b) => b.addEventListener("click", () => toggleFolderModal(false)));

  document.getElementById("createFolderForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (new FormData(e.target).get("name") || "").toString().trim();
    if (!name) return;
    const palette = FOLDER_PALETTE.find((p) => p.id === selectedColor) || FOLDER_PALETTE[0];
    
    try {
      const response = await window.TaskFlow.api.post("/api/files/folders/", {
        name,
        color: palette.id,
        icon: palette.icon
      }, { root: e.target });
      
      if (!response.ok) {
        throw new Error(response.message || "Failed to create folder");
      }
      
      state.activeFolderId = response.data.id;
      await loadFilesData();
      toggleFolderModal(false);
      e.target.reset();
      showToast(`Created folder "${name}"`);
    } catch (err) {
      showToast(err.message || "Could not create folder");
    }
  });

  /* ============================================================
   *  Upload (file picker giả lập)
   * ============================================================ */
  document.getElementById("uploadFileButton")?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.addEventListener("change", async (e) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (!file) return;

      showToast(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);
      if (state.activeFolderId) {
        formData.append("folder_id", state.activeFolderId);
      }

      try {
        const response = await window.TaskFlow.api.post("/api/files/upload/", formData, { root: document.getElementById("uploadFileButton") });
        if (!response.ok) {
          throw new Error(response.message || "Failed to upload file");
        }
        
        await loadFilesData();
        showToast("Upload complete");
      } catch (err) {
        showToast(err.message || "Could not upload file");
      }
    });
    input.click();
  });

  /* ============================================================
   *  Search filter (lọc cả folder & recent file)
   * ============================================================ */
  document.getElementById("filesSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    // folder cards
    document.querySelectorAll("#folderGrid .js-folder-card").forEach((card) => {
      const name = card.querySelector("p.text-base")?.textContent.toLowerCase() || "";
      card.classList.toggle("hidden", q && !name.includes(q));
    });
    // recent rows
    document.querySelectorAll("#recentFilesBody tr").forEach((row) => {
      const name = row.querySelector("span.font-semibold")?.textContent.toLowerCase() || "";
      row.classList.toggle("hidden", q && !name.includes(q));
    });
  });

  /* ============================================================
   *  Notification dropdown
   * ============================================================ */
  const notifBtn = document.getElementById("filesNotificationToggle");
  const notifDrop = document.getElementById("filesNotificationDropdown");
  const notifList = document.getElementById("filesNotificationList");
  const notifications = [
    { icon: "upload-cloud", color: "text-cyan-200 bg-cyan-400/15", title: "Upload complete", body: "The file metadata was saved" },
    { icon: "user-plus", color: "text-violet-200 bg-violet-400/15", title: "Shared folder", body: "A teammate shared a project folder" },
    { icon: "trash-2", color: "text-rose-200 bg-rose-400/15", title: "File deleted", body: "Old archive.zip was removed" },
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
   *  Toast
   * ============================================================ */
  const toastEl = document.getElementById("filesToast");
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2200);
  }

  /* ============================================================
   *  Bootstrap render
   * ============================================================ */
  function renderAll() {
    renderFolders();
    renderRecent();
    renderStorage();
    refreshIcons();
  }

  async function loadFilesData() {
    try {
      const response = await window.TaskFlow.api.get("/api/files/");
      if (response && response.ok && response.data) {
        state.folders = Array.isArray(response.data.folders) ? response.data.folders : [];
        state.recentFiles = Array.isArray(response.data.recentFiles) ? response.data.recentFiles : [];
        state.storageBreakdown = Array.isArray(response.data.storageBreakdown)
          ? response.data.storageBreakdown
          : state.storageBreakdown;
        renderAll();
      }
    } catch (err) {
      console.error("Error loading files data:", err);
      renderAll();
      showToast("Could not load files from server.");
    }
  }

  renderAll();
  loadFilesData();
  renderChart("week");
})();
