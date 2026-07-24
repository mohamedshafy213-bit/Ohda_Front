import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaGroupStore = defineStore("ohdaGroup", {
  state: () => ({
    groups: [],
    pages: [],
    groupPermissions: {},
    loading: false
  }),

  actions: {
    // --- User Groups CRUD ---
    async fetchUserGroups() {
      this.loading = true;
      try {
        const res = await apiGet("/api/UserGroup");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.groups = data;
        }
      } catch (err) {
        console.warn("Fetch user groups API fallback", err);
      } finally {
        this.loading = false;
      }
    },

    async createUserGroup(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/UserGroup", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.groups.push(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء مجموعة المستخدم" };
      } catch (err) {
        console.warn("Create user group API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء مجموعة المستخدم" };
      } finally {
        this.loading = false;
      }
    },

    async updateUserGroup(id, payload) {
      try {
        const res = await apiPut(`/api/UserGroup/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.groups.findIndex(g => g.id === id);
          if (idx !== -1) {
            this.groups[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث مجموعة المستخدم" };
      } catch (err) {
        console.warn("Update user group API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث مجموعة المستخدم" };
      }
    },

    async deleteUserGroup(id) {
      try {
        const res = await apiDelete(`/api/UserGroup/${id}`);
        if (res?.data?.isDone) {
          this.groups = this.groups.filter(g => g.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف مجموعة المستخدم" };
      } catch (err) {
        console.warn("Delete user group API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف مجموعة المستخدم" };
      }
    },

    // --- Group Page Permissions ---
    async fetchGroupPermissions(groupId) {
      try {
        const res = await apiGet(`/api/GroupPagePermission/group/${groupId}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.groupPermissions[groupId] = data.map(p => p.id);
        }
      } catch (err) {
        console.warn("Fetch group permissions API fallback", err);
      }
      if (!this.groupPermissions[groupId]) {
        this.groupPermissions[groupId] = [];
      }
      return this.groupPermissions[groupId];
    },

    async grantGroupPermission(userGroupId, pageId) {
      try {
        const res = await apiPost("/api/GroupPagePermission/grant", { userGroupId, pageId }, false);
        if (res?.data?.isDone) {
          if (!this.groupPermissions[userGroupId]) {
            this.groupPermissions[userGroupId] = [];
          }
          if (!this.groupPermissions[userGroupId].includes(pageId)) {
            this.groupPermissions[userGroupId].push(pageId);
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل منح صلاحيات المجموعة" };
      } catch (err) {
        console.warn("Grant group permission API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل منح صلاحيات المجموعة" };
      }
    },

    async revokeGroupPermission(groupId, pageId) {
      try {
        const res = await apiDelete(`/api/GroupPagePermission/revoke/${groupId}/${pageId}`, {}, false);
        if (res?.data?.isDone) {
          if (this.groupPermissions[groupId]) {
            this.groupPermissions[groupId] = this.groupPermissions[groupId].filter(id => id !== pageId);
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إلغاء صلاحية المجموعة" };
      } catch (err) {
        console.warn("Revoke group permission API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إلغاء صلاحية المجموعة" };
      }
    },

    async grantAllGroupPermissions(groupId) {
      try {
        const res = await apiPost(`/api/GroupPagePermission/grant-all/${groupId}`, {}, false);
        if (res?.data?.isDone) {
          this.groupPermissions[groupId] = this.pages.map(p => p.id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل منح جميع صلاحيات المجموعة" };
      } catch (err) {
        console.warn("Grant all group permissions API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل منح جميع صلاحيات المجموعة" };
      }
    },

    // --- Pages CRUD ---
    async fetchPages() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Page");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.pages = data;
        }
      } catch (err) {
        console.warn("Fetch pages API fallback", err);
      } finally {
        this.loading = false;
      }
    },

    async createPage(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Page", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.pages.push(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء صفحة النظام" };
      } catch (err) {
        console.warn("Create page API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء صفحة النظام" };
      } finally {
        this.loading = false;
      }
    },

    async updatePage(id, payload) {
      try {
        debugger
        const res = await apiPut(`/api/Page/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.pages.findIndex(p => p.id === id);
          if (idx !== -1) {
            this.pages[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث صفحة النظام" };
      } catch (err) {
        console.warn("Update page API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث صفحة النظام" };
      }
    },

    async deletePage(id) {
      try {
        const res = await apiDelete(`/api/Page/${id}`);
        if (res?.data?.isDone) {
          this.pages = this.pages.filter(p => p.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف صفحة النظام" };
      } catch (err) {
        console.warn("Delete page API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف صفحة النظام" };
      }
    }
  }
});
