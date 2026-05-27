(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  function fromCookie(name) {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    const prefix = `${name}=`;
    for (const cookie of cookies) {
      const value = cookie.trim();
      if (value.startsWith(prefix)) {
        return decodeURIComponent(value.slice(prefix.length));
      }
    }
    return "";
  }

  function getToken(root) {
    return (
      root?.querySelector("[name=csrfmiddlewaretoken]")?.value ||
      document.querySelector("[name=csrfmiddlewaretoken]")?.value ||
      fromCookie("csrftoken")
    );
  }

  window.TaskFlow.csrf = { getToken };
})();
