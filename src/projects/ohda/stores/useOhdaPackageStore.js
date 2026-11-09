import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaPackageStore = defineStore("ohdaPackage", {
  state: () => ({
    packages: [],
    loading: false
  }),

  getters: {
    totalCount: (state) => state.packages.length,
    activePackages: (state) => state.packages.filter((p) => p.isActive && !p.isDeleted)
  },

  actions: {
    async fetchPackages() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Package");
        const list = res?.data?.jsonResult || res?.data?.objects || res?.data?.singleObject || [];
        this.packages = Array.isArray(list) ? list : [];
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPackageById(id) {
      try {
        const res = await apiGet(`/api/Package/${id}`);
        return res?.data?.singleObject || null;
      } catch (error) {
        console.error(`Error fetching package ${id}:`, error);
        return null;
      }
    },

    async createPackage(payload) {
      try {
        const res = await apiPost("/api/Package", payload);
        await this.fetchPackages();
        return res?.data;
      } catch (error) {
        console.error("Error creating package:", error);
        throw error;
      }
    },

    async updatePackage(id, payload) {
      try {
        const res = await apiPut(`/api/Package/${id}`, payload);
        await this.fetchPackages();
        return res?.data;
      } catch (error) {
        console.error("Error updating package:", error);
        throw error;
      }
    },

    async deletePackage(id) {
      try {
        const res = await apiDelete(`/api/Package/${id}`);
        await this.fetchPackages();
        return res?.data;
      } catch (error) {
        console.error("Error deleting package:", error);
        throw error;
      }
    }
  }
});

