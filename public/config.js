// Runtime Configuration for Production / IIS Server
// You can edit this file directly on the server without rebuilding!
window.__APP_CONFIG__ = {
  // Automatically points to localhost API when developing locally, and to production API on the server
  VITE_ROOT_URL:
    typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5146/"
      : "https://www.isd-sis.mil/"
};

// Mirror to __RUNTIME_ENV__ for backwards compatibility
window.__RUNTIME_ENV__ = window.__APP_CONFIG__;
