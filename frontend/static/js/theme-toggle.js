/* ============================================================
 * TaskFlow — Cross-page theme toggle + sync
 * ----------------------------------------------------------
 * Vấn đề: dashboard.js/team.js/timeline.js của Nhàn dùng key
 * localStorage RIÊNG biệt → click toggle ở dashboard không lan
 * sang team/settings.
 *
 * Giải pháp:
 *   1. Sync TẤT CẢ 4 keys (mỗi lần class `dark` đổi)
 *   2. MutationObserver theo dõi class change → sync key
 *   3. Capture-phase click listener + stopImmediatePropagation
 *      → chặn Nhàn handler để tránh double-toggle khi cả 2 cùng wire
 *   4. Apply theme NGAY ở top-of-script (tránh flash)
 * ============================================================ */
(function () {
  "use strict";

  var KEYS = [
    "taskflow-theme",            // master key (mới)
    "tmds-dashboard-theme",      // dashboard.js key của Nhàn
    "taskflow-team-theme",       // team.js key của Nhàn
    "taskflow-timeline-theme",   // timeline.js key của Nhàn
  ];

  function readTheme() {
    try {
      for (var i = 0; i < KEYS.length; i++) {
        var v = window.localStorage.getItem(KEYS[i]);
        if (v === "light" || v === "dark") return v;
      }
    } catch (e) { /* ignore */ }
    return "dark";
  }

  function syncAllKeys(theme) {
    try {
      for (var i = 0; i < KEYS.length; i++) {
        window.localStorage.setItem(KEYS[i], theme);
      }
    } catch (e) { /* ignore */ }
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function getToggleButtons() {
    var sel = "[id$='ThemeToggle'], #themeToggle, [data-theme-toggle]";
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function swapIcons(theme) {
    var iconName = theme === "light" ? "sun" : "moon";
    getToggleButtons().forEach(function (btn) {
      var icon = btn.querySelector("[data-lucide]");
      if (!icon) {
        // Button chưa có icon → set
        btn.innerHTML = '<i data-lucide="' + iconName + '" class="h-4 w-4"></i>';
        return;
      }
      var cur = icon.getAttribute("data-lucide");
      if (cur === "moon" || cur === "sun") {
        icon.setAttribute("data-lucide", iconName);
      }
    });
    refreshIcons();
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    var wantDark = theme !== "light";
    var isDark = root.classList.contains("dark");
    if (wantDark !== isDark) {
      root.classList.toggle("dark", wantDark);
    }
    // Sync data-theme attr trên app element (Nhàn JS check attr này)
    var app = document.querySelector(
      "#loginApp, #logoutApp, #settingsApp, #filesApp, #dashboardApp, #teamApp, #timelineApp"
    );
    if (app) app.dataset.theme = theme;

    swapIcons(theme);
    syncAllKeys(theme);
  }

  function toggleTheme() {
    var curIsDark = document.documentElement.classList.contains("dark");
    applyTheme(curIsDark ? "light" : "dark");
  }

  // ── BOOT: apply theme NGAY (top of script, không chờ DOM) ────
  applyTheme(readTheme());

  // ── MutationObserver: theo dõi <html class> change ───────────
  // Khi Nhàn JS (hoặc bất kỳ code nào) toggle class `dark`, ta
  // sync sang tất cả keys + swap icon.
  var lastDark = document.documentElement.classList.contains("dark");
  var observer = new MutationObserver(function () {
    var nowDark = document.documentElement.classList.contains("dark");
    if (nowDark !== lastDark) {
      lastDark = nowDark;
      var theme = nowDark ? "dark" : "light";
      syncAllKeys(theme);
      swapIcons(theme);
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // ── Wire click handlers ─────────────────────────────────────
  // Dùng CAPTURE phase + stopImmediatePropagation để chặn
  // các handler khác (dashboard.js, team.js, timeline.js) chạy.
  // → Chỉ 1 handler duy nhất xử lý click → không double-toggle.
  function wireToggles() {
    getToggleButtons().forEach(function (btn) {
      if (btn.dataset.tfThemeWired === "1") return;
      btn.dataset.tfThemeWired = "1";

      btn.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          toggleTheme();
        },
        true /* capture phase: fire trước bubble listener của Nhàn */
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggles);
  } else {
    wireToggles();
  }

  // Re-wire khi DOM mutate (vd: notification dropdown re-render
  // có thể tạo lại button)
  var rewireObserver = new MutationObserver(function () {
    wireToggles();
  });
  document.addEventListener("DOMContentLoaded", function () {
    rewireObserver.observe(document.body, { childList: true, subtree: true });
  });

  // Public API
  window.TFTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    current: function () {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    },
  };
})();
