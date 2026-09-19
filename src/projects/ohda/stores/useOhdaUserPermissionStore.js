import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

const SYSTEM_PAGES = [
  { id: 1, name: "لوحة التحكم", path: "/ohda/dashboard" },
  { id: 2, name: "المنتجات والأصناف", path: "/ohda/products" },
  { id: 3, name: "رصيد المخزون", path: "/ohda/inventory" },
  { id: 4, name: "طلبات صرف العهدة", path: "/ohda/exit-requests" },
  { id: 5, name: "طلبات إدخال المخزون", path: "/ohda/entry-requests" },
  { id: 6, name: "ماسح الباركود", path: "/ohda/scan" },
  { id: 7, name: "الفئات", path: "/ohda/categories" },
  { id: 8, name: "الموردين", path: "/ohda/suppliers" },
  { id: 9, name: "إدارة المستخدمين والصلاحيات", path: "/ohda/users" },
  { id: 10, name: "الإشعارات", path: "/ohda/notifications" }
];

export const useOhdaUserPermissionStore = defineStore("ohdaUserPermission", {
  state: () => ({
    users: [],
    systemPages: SYSTEM_PAGES,
    loading: false
  }),

  actions: {
    async fetchUsers(branchId = null) {
      this.loading = true;
      try {
        const url = (branchId && branchId > 0) ? `/api/Auth?branchId=${branchId}` : "/api/Auth";
        const res = await apiGet(url);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.users = data;
        }
      } catch (err) {
        console.warn("Auth users list API fallback", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserPermissions(userId) {
      try {
        const res = await apiGet(`/api/UserPagePermission/user/${userId}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          const user = this.users.find(u => u.militaryNumber === userId);
          if (user) {
            user.allowedPages = data.map(p => p.id);
          }
        }
      } catch (err) {
        console.warn("Fetch user permissions API failed", err);
      }
    },

    async registerUser(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Auth/register", payload);
        if (res?.data?.isDone) {
          if (res?.data?.singleObject) {
            this.users.push(res.data.singleObject);
          } else {
            // Fallback: re-fetch all users to ensure list is up to date
            await this.fetchUsers();
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء المستخدم" };
      } catch (err) {
        console.warn("Register user API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء المستخدم" };
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id, payload) {
      try {
        const res = await apiPut(`/api/Auth/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.users.findIndex(u => u.militaryNumber === id);
          if (idx !== -1) {
            this.users[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث المستخدم" };
      } catch (err) {
        console.warn("Update user API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث المستخدم" };
      }
    },

    async deleteUser(id) {
      try {
        const res = await apiDelete(`/api/Auth/${id}`);
        if (res?.data?.isDone) {
          this.users = this.users.filter(u => u.militaryNumber !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المستخدم" };
      } catch (err) {
        console.warn("Delete user API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف المستخدم" };
      }
    },

    async grantPagePermission(userId, pageId) {
      try {
        const res = await apiPost("/api/UserPagePermission/grant", { userId, pageId }, false);
        if (res?.data?.isDone) {
          const user = this.users.find(u => u.militaryNumber === userId);
          if (user) {
            if (!user.allowedPages) user.allowedPages = [];
            if (!user.allowedPages.includes(pageId)) {
              user.allowedPages.push(pageId);
            }
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل منح صلاحية الصفحة" };
      } catch (err) {
        console.warn("Grant page permission API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل منح صلاحية الصفحة" };
      }
    },

    async revokePagePermission(userId, pageId) {
      try {
        const res = await apiDelete(`/api/UserPagePermission/revoke/${userId}/${pageId}`, {}, false);
        if (res?.data?.isDone) {
          const user = this.users.find(u => u.militaryNumber === userId);
          if (user && user.allowedPages) {
            user.allowedPages = user.allowedPages.filter(pId => pId !== pageId);
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إلغاء صلاحية الصفحة" };
      } catch (err) {
        console.warn("Revoke page permission API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إلغاء صلاحية الصفحة" };
      }
    }
  }
});
