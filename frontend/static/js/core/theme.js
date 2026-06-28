(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  const THEME_KEY = "taskflow-theme";
  const LEGACY_KEYS = ["tmds-dashboard-theme", "taskflow-dashboard-theme", "taskflow-timeline-theme", "taskflow-team-theme"];
  const ROOT_SELECTOR = "#dashboardApp, #timelineApp, #teamApp, #filesApp, #settingsApp";

  function normalize(theme) {
    return theme === "light" ? "light" : "dark";
  }

  function current() {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored) return normalize(stored);

    const legacy = LEGACY_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
    return normalize(legacy || "dark");
  }

  function rootFor(root) {
    if (root instanceof Element) return root;
    if (typeof root === "string") return document.querySelector(root);
    return document.querySelector(ROOT_SELECTOR);
  }

  function updateToggle(toggle, theme, options = {}) {
    if (!toggle) return;

    const nextTheme = theme === "light" ? "dark" : "light";
    const nextLabel = nextTheme === "light" ? "Light" : "Dark";
    const icon = theme === "light" ? "moon" : "sun";
    const iconTone = theme === "light" ? "bg-violet-500/15 text-violet-700" : "bg-cyan-300/15 text-cyan-100";

    toggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    toggle.setAttribute("title", `Switch to ${nextTheme} mode`);

    if (options.variant === "pill") {
      toggle.innerHTML = `
        <span class="grid h-6 w-6 place-items-center rounded-lg ${iconTone}">
          <i data-lucide="${icon}" class="h-3.5 w-3.5"></i>
        </span>
        <span class="hidden sm:inline">${nextLabel}</span>
      `;
    } else {
      toggle.innerHTML = `<i data-lucide="${icon}" class="h-4 w-4"></i>`;
    }

    if (window.TaskFlow && typeof window.TaskFlow.refreshIcons === "function") {
      window.TaskFlow.refreshIcons();
    }
  }

  function apply(theme, options = {}) {
    const next = normalize(theme);
    const root = rootFor(options.root);

    document.documentElement.classList.toggle("dark", next !== "light");
    document.documentElement.dataset.theme = next;
    if (root) root.dataset.theme = next;

    if (options.store !== false) {
      window.localStorage.setItem(THEME_KEY, next);
      LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }

    updateToggle(options.toggle, next, options);
    document.dispatchEvent(new CustomEvent("taskflow:themechange", { detail: { theme: next, root } }));
    return next;
  }

  function toggle(options = {}) {
    const root = rootFor(options.root);
    const active = normalize(root?.dataset.theme || document.documentElement.dataset.theme || current());
    return apply(active === "light" ? "dark" : "light", options);
  }

  function init(options = {}) {
    return apply(current(), { store: false, ...options });
  }

  window.TaskFlow.theme = {
    key: THEME_KEY,
    current,
    apply,
    toggle,
    init,
    updateToggle,
  };
})();
