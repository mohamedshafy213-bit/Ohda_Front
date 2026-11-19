import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaServiceStore = defineStore("ohdaServices", {
  state: () => ({
    services: [],
    loading: false
  }),

  getters: {
    totalServicesCount: (state) => state.services.length,
    activeServices: (state) => state.services.filter(s => s.isActive !== false),
    categories: (state) => {
      const cats = new Set(state.services.map(s => s.category).filter(Boolean));
      return Array.from(cats);
    },
    servicesWithConsumptionCount: (state) => {
      return state.services.filter(s => s.consumedProducts && s.consumedProducts.length > 0).length;
    },
    averageServicePrice: (state) => {
      if (!state.services.length) return 0;
      const sum = state.services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      return Math.round(sum / state.services.length);
    }
  },

  actions: {
    async fetchServices() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Service");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.services = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch services failed, keeping active state", err);
      } finally {
        this.loading = false;
      }
    },

    async addService(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Service", payload);
        if (res?.data?.isDone) {
          await this.fetchServices();
          return { success: true, message: res?.data?.returnMessage || "تمت إضافة الخدمة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة الخدمة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة الخدمة" };
      } finally {
        this.loading = false;
      }
    },

    async updateService(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Service/${id}`, payload);
        if (res?.data?.isDone) {
          await this.fetchServices();
          return { success: true, message: res?.data?.returnMessage || "تم تحديث الخدمة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث الخدمة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث الخدمة" };
      } finally {
        this.loading = false;
      }
    },

    async deleteService(id) {
      try {
        const res = await apiDelete(`/api/Service/${id}`);
        if (res?.data?.isDone) {
          this.services = this.services.filter(s => s.id !== id);
          return { success: true, message: res?.data?.returnMessage || "تم حذف الخدمة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف الخدمة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف الخدمة" };
      }
    }
  }
});
