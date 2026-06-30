(function () {
  "use strict";

  const loginApp = document.getElementById("loginApp");
  const logoutApp = document.getElementById("logoutApp");
  if (!loginApp && !logoutApp) return;

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  refreshIcons();

  const THEME_KEY = "taskflow-theme";
  document.documentElement.classList.toggle(
    "dark",
    (localStorage.getItem(THEME_KEY) || "dark") !== "light",
  );

  document.querySelectorAll(".js-toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      const icon = btn.querySelector("[data-lucide]");
      if (icon) {
        icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
        refreshIcons();
      }
    });
  });

  function showToast(targetId, message) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add("hidden"), 2400);
  }

  if (loginApp) {
    const form = document.getElementById("loginForm");
    const submitBtn = document.getElementById("loginSubmit");
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const fullNameInput = form?.querySelector('input[name="full_name"]');

    const tabs = document.querySelectorAll(".js-auth-tab");
    function setMode(mode) {
      const nextMode = mode === "signup" ? "signup" : "signin";
      tabs.forEach((tab) => {
        const isActive = tab.dataset.mode === nextMode;
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.classList.toggle("bg-gradient-to-r", isActive);
        tab.classList.toggle("from-violet-600", isActive);
        tab.classList.toggle("via-blue-600", isActive);
        tab.classList.toggle("to-cyan-500", isActive);
        tab.classList.toggle("text-white", isActive);
        tab.classList.toggle("shadow-[0_8px_24px_rgba(79,70,229,0.28)]", isActive);
        tab.classList.toggle("text-slate-400", !isActive);
      });
      document
        .querySelectorAll(".js-signin-only")
        .forEach((el) => el.classList.toggle("hidden", nextMode !== "signin"));
      document
        .querySelectorAll(".js-signup-only")
        .forEach((el) => el.classList.toggle("hidden", nextMode !== "signup"));
      passwordInput?.setAttribute(
        "autocomplete",
        nextMode === "signup" ? "new-password" : "current-password",
      );
      form && form.setAttribute("data-mode", nextMode);
    }

    tabs.forEach((tab) =>
      tab.addEventListener("click", () => setMode(tab.dataset.mode)),
    );
    setMode(new URLSearchParams(window.location.search).get("mode"));

    function showError(name, message) {
      const el = form.querySelector(`[data-error-for="${name}"]`);
      if (el) {
        el.textContent = message;
        el.classList.remove("hidden");
      }
    }

    function clearErrors() {
      form
        .querySelectorAll(".js-error")
        .forEach((el) => el.classList.add("hidden"));
    }

    form &&
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearErrors();
        const mode = form.getAttribute("data-mode") || "signin";

        const email = (emailInput.value || "").trim();
        const password = passwordInput.value || "";
        const fullName =
          mode === "signup" ? (fullNameInput?.value || "").trim() : "";
        let valid = true;

        if (!/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)) {
          showError("email", "Enter a valid email address");
          valid = false;
        }
        if (password.length < 8) {
          showError("password", "Password must be at least 8 characters");
          valid = false;
        }
        if (mode === "signup" && !fullName) {
          showError("full_name", "Full name is required");
          valid = false;
        }
        if (!valid) return;

        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> ' +
          (mode === "signin" ? "Signing in..." : "Creating account...");
        refreshIcons();

        const url =
          mode === "signin" ? "/api/auth/login/" : "/api/auth/signup/";
        const payload = { email, password };
        if (mode === "signup") {
          payload.full_name = fullName;
        }

        window.TaskFlow.api
          .post(url, payload, { root: form })
          .then(() => {
            showToast(
              "authToast",
              mode === "signin"
                ? "Signed in successfully. Redirecting..."
                : "Account created successfully",
            );
            const queryNext = new URLSearchParams(window.location.search).get(
              "next",
            );
            const redirectUrl =
              submitBtn.dataset.next ||
              (typeof window.TF_NEXT_URL === "string"
                ? window.TF_NEXT_URL
                : null) ||
              queryNext ||
              "/dashboard/";
            setTimeout(() => (window.location.href = redirectUrl), 700);
          })
          .catch((err) => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = original;
            refreshIcons();
            const message = err.message || "Something went wrong";
            showToast("authToast", message);
            if (message.toLowerCase().includes("email") || message.toLowerCase().includes("account")) {
              showError("email", message);
            } else if (message.toLowerCase().includes("password")) {
              showError("password", message);
            }
          });
      });
  }

  if (logoutApp) {
    const form = document.getElementById("logoutForm");
    const submitBtn = document.getElementById("logoutSubmit");
    const confirmCard = document.getElementById("logoutConfirmCard");
    const successCard = document.getElementById("logoutSuccessCard");
    const countdownEl = document.getElementById("logoutCountdown");

    form &&
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> Signing out...';
        refreshIcons();

        const allDevices = document.getElementById("logoutAllDevices")?.checked;
        window.TaskFlow.api
          .post("/api/auth/logout/", {}, { root: form })
          .then(() => {
            confirmCard.classList.add("hidden");
            successCard.classList.remove("hidden");
            refreshIcons();
            showToast(
              "logoutToast",
              allDevices
                ? "Signed out from all devices"
                : "Signed out from this device",
            );

            let seconds = 5;
            const tick = setInterval(() => {
              seconds -= 1;
              if (countdownEl) countdownEl.textContent = String(seconds);
              if (seconds <= 0) {
                clearInterval(tick);
                const next =
                  window.TF_LOGIN_URL ||
                  document.querySelector('a[href*="login"]')?.href ||
                  "/login/";
                window.location.href = next;
              }
            }, 1000);
          })
          .catch((err) => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = original;
            refreshIcons();
            showToast("logoutToast", err.message || "Sign out failed");
          });
      });
  }
})();
