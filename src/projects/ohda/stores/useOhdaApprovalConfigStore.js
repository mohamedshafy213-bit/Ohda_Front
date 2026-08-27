import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaApprovalConfigStore = defineStore("ohdaApprovalConfig", {
  state: () => ({
    configs: [],
    loading: false
  }),

  actions: {
    async fetchApprovalConfigs() {
      this.loading = true;
      try {
        const res = await apiGet("/api/ApprovalConfig");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.configs = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch approval configs failed", err);
      } finally {
        this.loading = false;
      }
    },

    async createApprovalConfig(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/ApprovalConfig", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.configs.push(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء إعداد الاعتماد" };
      } catch (err) {
        console.warn("Create approval config failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء إعداد الاعتماد" };
      } finally {
        this.loading = false;
      }
    },

    async updateApprovalConfig(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/ApprovalConfig/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.configs.findIndex(c => c.id === id);
          if (idx !== -1) {
            this.configs[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث إعداد الاعتماد" };
      } catch (err) {
        console.warn("Update approval config failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث إعداد الاعتماد" };
      } finally {
        this.loading = false;
      }
    },

    async deleteApprovalConfig(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/ApprovalConfig/${id}`);
        if (res?.data?.isDone) {
          this.configs = this.configs.filter(c => c.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف إعداد الاعتماد" };
      } catch (err) {
        console.warn("Delete approval config failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف إعداد الاعتماد" };
      } finally {
        this.loading = false;
      }
    }
  }
});
