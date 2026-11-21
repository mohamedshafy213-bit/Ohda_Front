import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaEstimateStore = defineStore("ohdaEstimates", {
  state: () => ({
    estimates: [],
    loading: false,
    currentEstimate: null
  }),

  getters: {
    totalCount: (state) => state.estimates.length,
    draftCount: (state) => state.estimates.filter(e => e.status === 1).length,
    sentCount: (state) => state.estimates.filter(e => e.status === 2).length,
    approvedCount: (state) => state.estimates.filter(e => e.status === 3).length,
    rejectedCount: (state) => state.estimates.filter(e => e.status === 4).length,
    expiredCount: (state) => state.estimates.filter(e => e.status === 5 || e.isExpired).length,
    totalValue: (state) => state.estimates.reduce((acc, e) => acc + (Number(e.totalAmount) || 0), 0),
    approvedValue: (state) => state.estimates.filter(e => e.status === 3).reduce((acc, e) => acc + (Number(e.totalAmount) || 0), 0),
    pendingValue: (state) => state.estimates.filter(e => e.status === 1 || e.status === 2).reduce((acc, e) => acc + (Number(e.totalAmount) || 0), 0)
  },

  actions: {
    async fetchEstimates(filters = {}) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.clientId) queryParams.append("clientId", filters.clientId);
        if (filters.search) queryParams.append("search", filters.search);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const res = await apiGet(`/api/Estimates${qs}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.estimates = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("fetchEstimates failed", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchEstimateById(id) {
      this.loading = true;
      try {
        const res = await apiGet(`/api/Estimates/${id}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.currentEstimate = res.data.singleObject;
          return res.data.singleObject;
        }
        return null;
      } catch (err) {
        console.warn(`fetchEstimateById(${id}) failed`, err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createEstimate(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Estimates", payload);
        if (res?.data?.isDone) {
          await this.fetchEstimates();
          return { success: true, data: res.data.singleObject, message: res.data.returnMessage || "تم إنشاء عرض السعر بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء عرض السعر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء عرض السعر" };
      } finally {
        this.loading = false;
      }
    },

    async updateEstimate(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Estimates/${id}`, payload);
        if (res?.data?.isDone) {
          await this.fetchEstimates();
          return { success: true, data: res.data.singleObject, message: res.data.returnMessage || "تم تحديث عرض السعر بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث عرض السعر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث عرض السعر" };
      } finally {
        this.loading = false;
      }
    },

    async updateStatus(id, status, reason = "") {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Estimates/${id}/status`, { status, reason });
        if (res?.data?.isDone) {
          await this.fetchEstimates();
          return { success: true, data: res.data.singleObject, message: res.data.returnMessage || "تم تحديث حالة عرض السعر بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث حالة عرض السعر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث حالة عرض السعر" };
      } finally {
        this.loading = false;
      }
    },

    async convertToJob(id) {
      this.loading = true;
      try {
        const res = await apiPost(`/api/Estimates/${id}/convert-to-job`, {});
        if (res?.data?.isDone) {
          await this.fetchEstimates();
          return { success: true, data: res.data.singleObject, message: res.data.returnMessage || "تم تحويل عرض السعر إلى أمر شغل بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحويل عرض السعر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحويل عرض السعر" };
      } finally {
        this.loading = false;
      }
    },

    async deleteEstimate(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Estimates/${id}`);
        if (res?.data?.isDone) {
          await this.fetchEstimates();
          return { success: true, message: res.data.returnMessage || "تم حذف عرض السعر بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف عرض السعر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف عرض السعر" };
      } finally {
        this.loading = false;
      }
    }
  }
});
