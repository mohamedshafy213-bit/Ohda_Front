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
    currentRole: (state) => state.user?.role || 2,
    isAdmin: (state) => state.user?.role === 1,
    isEmployee: (state) => state.user?.role === 2,
    isSupervisor: (state) => state.user?.role === 3,
    isManager: (state) => state.user?.role === 4,
    userName: (state) => state.user?.personName || state.user?.username || "مستخدم",
    allowedPaths: (state) => {
      if (!state.allowedPages) return [];
      const pageMap = {
        1: "/ohda/dashboard",
        2: "/ohda/products",
        3: "/ohda/inventory",
        4: "/ohda/exit-requests",
        5: "/ohda/entry-requests",
        6: "/ohda/scan",
        7: "/ohda/categories",
        8: "/ohda/suppliers",
        9: "/ohda/users",
        10: "/ohda/notifications",
        11: "/ohda/compass",
        15: "/ohda/warehouse-bins"
      };
      
      // If user is Admin, ensure warehouse-bins is always available
      if (state.user?.role === 1 && !state.allowedPages.some(p => (p.path || p) === "/ohda/warehouse-bins" || p.id === 15)) {
        state.allowedPages.push({ id: 15, name: "أماكن وأرفف التخزين", path: "/ohda/warehouse-bins" });
      }

      return state.allowedPages.map(page => {
        if (typeof page === "string") {
          return page;
        }

        if (typeof page === "object" && page !== null) {
          if (page.path || page.route) {
            return page.path || page.route;
          }
          const id = page.id || page.pageId;
          if (id && pageMap[id]) {
            return pageMap[id];
          }
          return null;
        }

        return pageMap[page] || null;
      }).map(path => {
        if (!path) return null;
        let normalized = path.toLowerCase().startsWith("/ohda") ? path : `/ohda${path}`;
        const lower = normalized.toLowerCase();
        if (lower === "/ohda/orders" || lower === "/ohda/order" || lower === "/ohda/entry-request" || lower === "/ohda/entry-requests") {
          return "/ohda/entry-requests";
        }
        if (lower === "/ohda/exit-request" || lower === "/ohda/exit-requests") {
          return "/ohda/exit-requests";
        }
        return lower;
      }).filter(Boolean);
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
