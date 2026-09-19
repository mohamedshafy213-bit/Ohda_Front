import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaBranchStore = defineStore("ohdaBranch", {
  state: () => ({
    branches: [],
    stats: [],
    myQuota: null,
    loading: false
  }),

  getters: {
    totalBranches: (state) => state.branches.length,
    activeBranches: (state) => state.branches.filter(b => b.isActive),
    suspendedBranches: (state) => state.branches.filter(b => !b.isActive),
    totalUsersAcrossBranches: (state) => state.branches.reduce((acc, b) => acc + (b.currentUserCount || 0), 0),
    totalProductsAcrossBranches: (state) => state.branches.reduce((acc, b) => acc + (b.currentProductCount || 0), 0)
  },

  actions: {
    async fetchBranches() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Branches");
        if (res?.data?.isDone && res?.data?.objects) {
          this.branches = res.data.objects;
        } else if (Array.isArray(res?.data)) {
          this.branches = res.data;
        }
      } catch (err) {
        console.warn("Failed to fetch branches", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        const res = await apiGet("/api/Branches/stats");
        if (res?.data?.isDone && res?.data?.objects) {
          this.stats = res.data.objects;
        }
      } catch (err) {
        console.warn("Failed to fetch branch stats", err);
      }
    },

    async fetchMyQuota() {
      try {
        const res = await apiGet("/api/Branches/my-quota");
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.myQuota = res.data.singleObject;
        }
      } catch (err) {
        console.warn("Failed to fetch my quota", err);
      }
    },

    async createBranch(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Branches/create-branch", dto);
        if (res?.data?.isDone) {
          await this.fetchBranches();
          return {
            success: true,
            data: res.data.singleObject,
            message: res.data.returnMessage
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل إنشاء الفرع"
        };
      } catch (err) {
        const msg = err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إنشاء الفرع";
        return { success: false, message: msg };
      } finally {
        this.loading = false;
      }
    },

    async updateBranch(id, dto) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Branches/${id}`, dto);
        if (res?.data?.isDone) {
          await this.fetchBranches();
          return { success: true, message: res.data.returnMessage };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تحديث بيانات الفرع"
        };
      } catch (err) {
        const msg = err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء التحديث";
        return { success: false, message: msg };
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(id) {
      try {
        const res = await apiPost(`/api/Branches/${id}/toggle-status`, {});
        if (res?.data?.isDone) {
          await this.fetchBranches();
          return { success: true, message: res.data.returnMessage };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تغيير حالة الفرع"
        };
      } catch (err) {
        const msg = err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء تغيير الحالة";
        return { success: false, message: msg };
      }
    },

    async deleteBranch(id) {
      try {
        const res = await apiDelete(`/api/Branches/${id}`);
        if (res?.data?.isDone) {
          await this.fetchBranches();
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      }
    }
  }
});
