import { defineStore } from "pinia";
import { apiPost, apiGet } from "@/utilities/fetchApi";

export const useOhdaAuthStore = defineStore("ohdaAuth", {
  state: () => ({
    token: localStorage.getItem("accessToken") || null,
    user: JSON.parse(localStorage.getItem("ohdaUser") || "null"),
    allowedPages: JSON.parse(localStorage.getItem("ohdaAllowedPages") || "[]"),
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token || !!state.user,
    currentRole: (state) => state.user?.role ?? 2,
    isSuperAdmin: (state) => state.user?.role === 0 || state.user?.role === "SuperAdmin" || state.user?.role === "0",
    isAdmin: (state) => state.user?.role === 1 || state.user?.role === "Admin" || state.user?.role === "1",
    isEmployee: (state) => state.user?.role === 2 || state.user?.role === "Employee" || state.user?.role === "2",
    isSupervisor: (state) => state.user?.role === 3 || state.user?.role === "Supervisor" || state.user?.role === "3",
    isManager: (state) => state.user?.role === 4 || state.user?.role === "Manager" || state.user?.role === "4",
    userName: (state) => state.user?.personName || state.user?.username || "مستخدم",
    branchId: (state) => state.user?.branchId || 1,
    branchName: (state) => state.user?.branchName || "",
    allowedPaths: (state) => {
      const isSuper = state.user?.role === 0 || state.user?.role === "SuperAdmin" || state.user?.role === "0";
      const pages = state.allowedPages || [];

      if (!pages.length) {
        if (isSuper) {
          return [
            "/ohda/dashboard",
            "/ohda/branches-dashboard",
            "/ohda/branches",
            "/ohda/products",
            "/ohda/warehouse-bins",
            "/ohda/inventory",
            "/ohda/exit-requests",
            "/ohda/entry-requests",
            "/ohda/scan",
            "/ohda/categories",
            "/ohda/suppliers",
            "/ohda/users",
            "/ohda/departments",
            "/ohda/product-states",
            "/ohda/approval-config",
            "/ohda/compass"
          ];
        }
        return ["/ohda/dashboard"];
      }

      // Map whatever pages are assigned to this user to standardized routes
      const paths = pages.map(page => {
        if (!page) return null;
        const raw = typeof page === "string" ? page : (page.path || page.route || page.Path || page.Route);
        if (!raw) return null;
        let norm = raw.toLowerCase().trim();
        if (!norm.startsWith("/ohda")) {
          norm = `/ohda${norm}`;
        }
        if (norm.length > 5 && norm.endsWith("/")) {
          norm = norm.slice(0, -1);
        }
        if (norm === "/ohda/orders" || norm === "/ohda/order") {
          norm = "/ohda/entry-requests";
        }
        return norm;
      }).filter(Boolean);

      // SuperAdmin platform routes
      if (isSuper) {
        if (!paths.includes("/ohda/branches-dashboard")) paths.push("/ohda/branches-dashboard");
        if (!paths.includes("/ohda/branches")) paths.push("/ohda/branches");
      }

      // Ensure dashboard is always present as base landing
      if (!paths.includes("/ohda/dashboard")) {
        paths.unshift("/ohda/dashboard");
      }

      return [...new Set(paths)];
    },

    isRouteAllowed: (state) => (routePath) => {
      if (!routePath) return false;
      let path = routePath.toLowerCase().trim();
      if (!path.startsWith("/ohda")) {
        path = `/ohda${path}`;
      }
      if (path.length > 5 && path.endsWith("/")) {
        path = path.slice(0, -1);
      }

      // SuperAdmin has full access
      const isSuper = state.user?.role === 0 || state.user?.role === "SuperAdmin" || state.user?.role === "0";
      if (isSuper) return true;

      // Platform branches management is strictly SuperAdmin only
      if (path === "/ohda/branches" || path === "/ohda/branches-dashboard") {
        return false;
      }

      // Filter purely based on the pages assigned to this user!
      const allowed = state.allowedPaths || [];
      return allowed.includes(path);
    }
  },
  actions: {
    async login(username, password) {
      this.loading = true;
      try {
        const response = await apiPost("/api/Auth/login", { username, password }, false);
        if (response?.data?.isDone && response?.data?.singleObject) {
          const payload = response.data.singleObject;
          this.setSession(payload.token, payload.user, payload.allowedPages || []);
          this.loading = false;
          return { success: true };
        } else {
          this.loading = false;
          return { success: false, message: response?.data?.returnMessage || "اسم المستخدم أو كلمة المرور غير صحيحة" };
        }
      } catch (err) {
        this.loading = false;
        console.warn("API Login failed", err);
        const errorMsg = err?.response?.data?.returnMessage || "اسم المستخدم أو كلمة المرور غير صحيحة";
        return { success: false, message: errorMsg };
      }
    },

    setSession(token, user, allowedPages) {
      this.token = token;
      this.user = user;
      this.allowedPages = allowedPages;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("ohdaUser", JSON.stringify(user));
      localStorage.setItem("ohdaAllowedPages", JSON.stringify(allowedPages));
    },

    logout() {
      this.token = null;
      this.user = null;
      this.allowedPages = [];
      localStorage.removeItem("accessToken");
      localStorage.removeItem("ohdaUser");
      localStorage.removeItem("ohdaAllowedPages");
    },

    async fetchMyPages() {
      try {
        const response = await apiGet("/api/UserPagePermission/my-pages");
        const data = response?.data?.objects || response?.data?.singleObject;
        if (response?.data?.isDone && data) {
          this.allowedPages = data;
          localStorage.setItem("ohdaAllowedPages", JSON.stringify(this.allowedPages));
        }
      } catch (err) {
        console.warn("Fetch my-pages failed", err);
      }
    }
  }
});
