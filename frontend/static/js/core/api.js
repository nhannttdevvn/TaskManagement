(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};

  async function request(url, options = {}) {
    if (!url) {
      throw new Error("Missing API URL.");
    }

    const method = (options.method || "GET").toUpperCase();
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      options.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
      headers["X-CSRFToken"] = headers["X-CSRFToken"] || window.TaskFlow.csrf?.getToken(options.root) || "";
      headers["X-Requested-With"] = headers["X-Requested-With"] || "XMLHttpRequest";
    }

    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      method,
      headers,
    });

    let result = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      result = await response.json();
    }

    if (!response.ok || result?.ok === false) {
      const message = result?.error || response.statusText || "API request failed.";
      throw new Error(message);
    }

    return result;
  }

  window.TaskFlow.api = {
    request,
    get: (url, options = {}) => request(url, { ...options, method: "GET" }),
    post: (url, body, options = {}) => request(url, { ...options, method: "POST", body }),
    patch: (url, body, options = {}) => request(url, { ...options, method: "PATCH", body }),
    delete: (url, options = {}) => request(url, { ...options, method: "DELETE" }),
  };
})();
