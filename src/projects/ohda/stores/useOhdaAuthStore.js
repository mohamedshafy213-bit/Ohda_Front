import { defineStore } from "pinia";
import { apiPost, apiGet } from "@/utilities/fetchApi";

export const useOhdaAuthStore = defineStore("ohdaAuth", {
  state: () => ({
    token: localStorage.getItem("accessToken") || null,
    user: (() => {
      try {
        const u = JSON.parse(localStorage.getItem("ohdaUser") || "null");
        if (u && !u.id && u.militaryNumber) u.id = u.militaryNumber;
        return u;
      } catch (e) {
        return null;
      }
    })(),
    allowedPages: JSON.parse(localStorage.getItem("ohdaAllowedPages") || "[]"),
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token || !!state.user,
    userId: (state) => state.user?.id || state.user?.militaryNumber || 0,
    currentRole: (state) => state.user?.role ?? 2,
    isSuperAdmin: (state) => state.user?.role === 0 || state.user?.role === "SuperAdmin" || state.user?.role === "0",
    isAdmin: (state) => state.user?.role === 1 || state.user?.role === "Admin" || state.user?.role === "1" || state.user?.role === 0 || state.user?.role === "SuperAdmin" || state.user?.role === "0",
    isEmployee: (state) => state.user?.role === 2 || state.user?.role === "Employee" || state.user?.role === "2",
    isSupervisor: (state) => state.user?.role === 3 || state.user?.role === "Supervisor" || state.user?.role === "3",
    isManager: (state) => state.user?.role === 4 || state.user?.role === "Manager" || state.user?.role === "4",
    userName: (state) => state.user?.personName || state.user?.username || "مستخدم",
    branchId: (state) => state.user?.branchId || state.user?.BranchId || null,
    branchName: (state) => state.user?.branchName || state.user?.BranchName || "",
    allowedPaths(state) {
      const isSuper = this.isSuperAdmin;
      const isAdmin = this.isAdmin;
      const pages = state.allowedPages || [];

      if (!pages.length) {
        if (isSuper) {
          return [
            "/ohda/dashboard",
            "/ohda/jobs",
            "/ohda/clients",
            "/ohda/estimates",
            "/ohda/reminders",
            "/ohda/bookings-calendar",
            "/ohda/bays-settings",
            "/ohda/reports",
            "/ohda/products",
            "/ohda/services",
            "/ohda/purchases",
            "/ohda/returns",
            "/ohda/suppliers",
            "/ohda/categories",
            "/ohda/finance",
            "/ohda/expenses",
            "/ohda/month-closing",
            "/ohda/employees",
            "/ohda/users",
            "/ohda/barcode-print",
            "/ohda/scan",
            "/ohda/branches-dashboard",
            "/ohda/branches",
            "/ohda/lookups",
            "/ohda/settings"
          ];
        }
        if (isAdmin && (!state.user?.userGroupId || state.user?.userGroupId === 0)) {
          return [
            "/ohda/dashboard",
            "/ohda/jobs",
            "/ohda/clients",
            "/ohda/estimates",
            "/ohda/reminders",
            "/ohda/bookings-calendar",
            "/ohda/bays-settings",
            "/ohda/reports",
            "/ohda/products",
            "/ohda/services",
            "/ohda/purchases",
            "/ohda/returns",
            "/ohda/suppliers",
            "/ohda/categories",
            "/ohda/finance",
            "/ohda/expenses",
            "/ohda/month-closing",
            "/ohda/employees",
            "/ohda/users",
            "/ohda/lookups",
            "/ohda/settings"
          ];
        }
        return [];
      }

      // Map whatever pages are assigned to this user to standardized routes
      const paths = pages.map(page => {
        if (!page) return null;
        const raw = typeof page === "string" ? page : (page.path || page.route || page.Path || page.Route);
        if (!raw) return null;
        let norm = raw.toLowerCase().trim();
        if (!norm.startsWith("/ohda")) {
          norm = `/ohda${norm.startsWith("/") ? "" : "/"}${norm}`;
        }
        if (norm.length > 5 && norm.endsWith("/")) {
          norm = norm.slice(0, -1);
        }
        if (norm === "/ohda/orders" || norm === "/ohda/order" || norm === "/ohda/entry-requests") {
          norm = "/ohda/purchases";
        }
        if (norm === "/ohda/exit-requests") {
          norm = "/ohda/jobs";
        }
        return norm;
      }).filter(Boolean);

      // SuperAdmin platform routes
      if (isSuper) {
        if (!paths.includes("/ohda/branches-dashboard")) paths.push("/ohda/branches-dashboard");
        if (!paths.includes("/ohda/branches")) paths.push("/ohda/branches");
      }

      return [...new Set(paths)];
    },

    isRouteAllowed(state) {
      return (routePath) => {
        if (!routePath) return false;
        let path = routePath.toLowerCase().trim();
        if (!path.startsWith("/ohda")) {
          path = `/ohda${path.startsWith("/") ? "" : "/"}${path}`;
        }
        if (path.length > 5 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }

        const isSuper = this.isSuperAdmin;
        if (isSuper) return true;

        // Platform branches management is strictly SuperAdmin only
        if (path === "/ohda/branches" || path === "/ohda/branches-dashboard") {
          return false;
        }

        if (path.startsWith("/ohda/branches/")) {
          const parts = path.split("/");
          const bId = parseInt(parts[3]);
          return (this.user?.branchId === bId);
        }

        // Filter strictly based on the pages assigned to this user!
        const allowed = this.allowedPaths || [];
        return allowed.includes(path);
      };
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
          const msg = response?.data?.returnMessage || response?.data?.ReturnMessage || "اسم المستخدم أو كلمة المرور غير صحيحة";
          return { success: false, message: msg };
        }
      } catch (err) {
        this.loading = false;
        console.warn("API Login failed", err);
        const data = err?.response?.data;
        let errorMsg = "اسم المستخدم أو كلمة المرور غير صحيحة";
        if (typeof data === "string" && data.trim()) {
          errorMsg = data;
        } else if (data && typeof data === "object") {
          errorMsg = data.returnMessage || data.ReturnMessage || data.message || data.title || errorMsg;
        } else if (err?.message && !err.response) {
          errorMsg = "تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الـ API";
        }
        return { success: false, message: errorMsg };
      }
    },

    setSession(token, user, allowedPages) {
      if (user && !user.id && user.militaryNumber) {
        user.id = user.militaryNumber;
      }
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
