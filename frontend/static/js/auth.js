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

  /* ============================================================
   *  Theme — auth pages giữ dark theme là chính, nhưng vẫn tôn
   *  trọng preference đã lưu để đồng bộ với các trang khác.
   * ============================================================ */
  const THEME_KEY = "taskflow-theme";
  document.documentElement.classList.toggle(
    "dark",
    (localStorage.getItem(THEME_KEY) || "dark") !== "light",
  );

  /* ============================================================
   *  Password eye toggle (chung cho cả login + logout)
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
   *  Toast helper
   * ============================================================ */
  function showToast(targetId, message) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add("hidden"), 2400);
  }

  /* ============================================================
   *  LOGIN PAGE
   * ============================================================ */
  if (loginApp) {
    const form = document.getElementById("loginForm");
    const submitBtn = document.getElementById("loginSubmit");
    const identifierInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const fullNameInput = form?.querySelector('input[name="full_name"]');

    // Tab Sign in / Sign up
    const tabs = document.querySelectorAll(".js-auth-tab");
    function setMode(mode) {
      const nextMode = mode === "signup" ? "signup" : "signin";
      tabs.forEach((t) => {
        const isActive = t.dataset.mode === nextMode;
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.classList.toggle("bg-gradient-to-r", isActive);
        t.classList.toggle("from-violet-600", isActive);
        t.classList.toggle("via-blue-600", isActive);
        t.classList.toggle("to-cyan-500", isActive);
        t.classList.toggle("text-white", isActive);
        t.classList.toggle(
          "shadow-[0_8px_24px_rgba(79,70,229,0.28)]",
          isActive,
        );
        t.classList.toggle("text-slate-400", !isActive);
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
    tabs.forEach((t) =>
      t.addEventListener("click", () => setMode(t.dataset.mode)),
    );
    setMode(new URLSearchParams(window.location.search).get("mode"));

    // Validation helpers
    function showError(name, msg) {
      const el = form.querySelector(`[data-error-for="${name}"]`);
      if (el) {
        el.textContent = msg;
        el.classList.remove("hidden");
      }
    }
    function clearErrors() {
      form
        .querySelectorAll(".js-error")
        .forEach((e) => e.classList.add("hidden"));
    }
    form &&
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearErrors();
        const mode = form.getAttribute("data-mode") || "signin";

        const identifier = (identifierInput.value || "").trim();
        const password = passwordInput.value || "";
        const fullName =
          mode === "signup" ? (fullNameInput?.value || "").trim() : "";
        let valid = true;

        if (!identifier) {
          showError("identifier", "Email or username is required");
          valid = false;
        }
        if (mode === "signup" && !/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(identifier)) {
          showError("identifier", "A valid email is required for signup");
          valid = false;
        }
        if (password.length < 8) {
          showError("password", "Mật khẩu tối thiểu 8 ký tự");
          valid = false;
        }
        if (mode === "signup" && !fullName) {
          showError("full_name", "Họ và tên là bắt buộc");
          valid = false;
        }
        if (!valid) return;

        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> ' +
          (mode === "signin" ? "Đang đăng nhập..." : "Đang tạo tài khoản...");
        refreshIcons();

        const url =
          mode === "signin" ? "/api/auth/login/" : "/api/auth/signup/";
        const payload = { identifier, username: identifier, password };
        if (identifier.includes("@")) {
          payload.email = identifier;
        }
        if (mode === "signup") {
          payload.email = identifier;
          payload.full_name = fullName;
        }

        window.TaskFlow.api
          .post(url, payload, { root: form })
          .then(() => {
            showToast(
              "authToast",
              mode === "signin"
                ? "Đăng nhập thành công, đang chuyển..."
                : "Tạo tài khoản thành công",
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
            showToast("authToast", err.message || "Có lỗi xảy ra");
            if (
              err.message.includes("Email") ||
              err.message.includes("tài khoản")
            ) {
              showError("identifier", err.message);
            } else if (
              err.message.includes("mật khẩu") ||
              err.message.includes("Mật khẩu")
            ) {
              showError("password", err.message);
            }
          });
      });
  }

  /* ============================================================
   *  LOGOUT PAGE
   * ============================================================ */
  if (logoutApp) {
    const form = document.getElementById("logoutForm");
    const submitBtn = document.getElementById("logoutSubmit");
    const confirmCard = document.getElementById("logoutConfirmCard");
    const successCard = document.getElementById("logoutSuccessCard");
    const countdownEl = document.getElementById("logoutCountdown");

    form &&
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> Đang đăng xuất...';
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
                ? "Đã đăng xuất khỏi tất cả thiết bị"
                : "Đã đăng xuất khỏi thiết bị này",
            );

            // Countdown auto redirect
            let s = 5;
            const tick = setInterval(() => {
              s -= 1;
              if (countdownEl) countdownEl.textContent = String(s);
              if (s <= 0) {
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
            showToast("logoutToast", err.message || "Lỗi đăng xuất");
          });
      });
  }
})();
