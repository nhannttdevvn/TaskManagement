(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginSubmit = document.getElementById("loginSubmit");
    const authToast = document.getElementById("authToast");
    const authTabs = document.querySelectorAll(".js-auth-tab");
    const signupOnlyElements = document.querySelectorAll(".js-signup-only");
    const signinOnlyElements = document.querySelectorAll(".js-signin-only");
    const togglePasswordBtn = document.querySelector(".js-toggle-password");
    const passwordInput = document.querySelector(".js-password");

    let currentMode = "signin"; // 'signin' or 'signup'

    // Init Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        const icon = togglePasswordBtn.querySelector("i");
        if (icon && window.lucide) {
          icon.setAttribute("data-lucide", type === "password" ? "eye" : "eye-off");
          window.lucide.createIcons();
        }
      });
    }

    // Switch between Sign in and Sign up modes
    authTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const targetMode = tab.getAttribute("data-mode");
        if (targetMode && targetMode !== currentMode) {
          switchMode(targetMode);
        }
      });
    });

    function switchMode(mode) {
      currentMode = mode;
      clearErrors();
      loginForm.reset();

      // Update tabs UI
      authTabs.forEach(function (tab) {
        const tabMode = tab.getAttribute("data-mode");
        if (tabMode === currentMode) {
          tab.className = "js-auth-tab flex-1 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-3 py-2 text-white shadow-[0_8px_24px_rgba(79,70,229,0.28)]";
          tab.setAttribute("aria-selected", "true");
        } else {
          tab.className = "js-auth-tab flex-1 rounded-xl px-3 py-2 text-slate-400 transition hover:text-white";
          tab.setAttribute("aria-selected", "false");
        }
      });

      // Update form fields visibility
      if (currentMode === "signup") {
        signupOnlyElements.forEach(el => el.classList.remove("hidden"));
        signinOnlyElements.forEach(el => el.classList.add("hidden"));
      } else {
        signupOnlyElements.forEach(el => el.classList.add("hidden"));
        signinOnlyElements.forEach(el => el.classList.remove("hidden"));
      }
    }

    // Client-side validations
    function validateForm(data) {
      let isValid = true;
      clearErrors();

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email) {
        showFieldError("email", "Email không được để trống");
        isValid = false;
      } else if (!emailRegex.test(data.email)) {
        showFieldError("email", "Email không hợp lệ");
        isValid = false;
      }

      // Validate Password
      if (!data.password) {
        showFieldError("password", "Mật khẩu không được để trống");
        isValid = false;
      } else if (data.password.length < 8) {
        showFieldError("password", "Mật khẩu phải chứa ít nhất 8 ký tự");
        isValid = false;
      }

      // Validate Name (Sign up only)
      if (currentMode === "signup" && !data.full_name.trim()) {
        showFieldError("full_name", "Vui lòng nhập họ và tên");
        isValid = false;
      }

      return isValid;
    }

    function showFieldError(fieldName, message) {
      const errorEl = document.querySelector(`.js-error[data-error-for="${fieldName}"]`);
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
      }
      const inputEl = loginForm.querySelector(`[name="${fieldName}"]`);
      if (inputEl) {
        inputEl.classList.add("border-rose-500/50");
      }
    }

    function clearErrors() {
      const errors = loginForm.querySelectorAll(".js-error");
      errors.forEach(el => el.classList.add("hidden"));
      
      const inputs = loginForm.querySelectorAll("input");
      inputs.forEach(el => el.classList.remove("border-rose-500/50"));
    }

    // Submit form handler
    if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        if (!validateForm(data)) {
          return;
        }

        // Disable button & show loading state
        loginSubmit.disabled = true;
        const originalBtnHtml = loginSubmit.innerHTML;
        loginSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;

        try {
          let response;
          if (currentMode === "signin") {
            // Map 'email' to 'username' for Django authenticate backend
            response = await window.TaskFlow.api.post("/api/auth/login/", {
              username: data.email,
              password: data.password,
            });
          } else {
            response = await window.TaskFlow.api.post("/api/auth/signup/", {
              email: data.email,
              password: data.password,
              full_name: data.full_name,
            });
          }

          if (response && response.ok !== false) {
            window.TaskFlow.toast.show(authToast, currentMode === "signin" ? "Đăng nhập thành công!" : "Tạo tài khoản thành công!", { duration: 1500 });
            setTimeout(() => {
              window.location.href = "/dashboard/";
            }, 1200);
          } else {
            throw new Error(response.error || "Có lỗi xảy ra, vui lòng thử lại.");
          }
        } catch (error) {
          window.TaskFlow.toast.show(authToast, error.message || "Không thể kết nối tới server.");
          loginSubmit.disabled = false;
          loginSubmit.innerHTML = originalBtnHtml;
        }
      });
    }
  });
})();
