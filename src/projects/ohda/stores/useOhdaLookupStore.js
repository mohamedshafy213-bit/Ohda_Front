import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaLookupStore = defineStore("ohdaLookup", {
  state: () => ({
    types: [],
    selectedType: null,
    activeLookups: {}, // Cached lookup values grouped by typeCode e.g. { vehicle_brand: [...], fuel_type: [...] }
    loading: false
  }),

  getters: {
    totalTypes: (state) => state.types.length,
    totalValues: (state) => state.selectedType?.values?.length || 0,
    getValuesByCode: (state) => (code) => {
      const normalized = (code || "").toLowerCase().trim();
      return state.activeLookups[normalized] || [];
    }
  },

  actions: {
    async fetchTypes() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Lookups/types");
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          this.types = res.data.objects;
          if (this.types.length > 0 && !this.selectedType) {
            await this.fetchTypeByCode(this.types[0].code);
          }
          return this.types;
        }
      } catch (err) {
        console.error("Failed to fetch lookup types", err);
      } finally {
        this.loading = false;
      }
      return [];
    },

    async fetchTypeByCode(code) {
      if (!code) return null;
      this.loading = true;
      try {
        const res = await apiGet(`/api/Lookups/types/${encodeURIComponent(code)}`);
        if (res?.data?.isDone && res.data.singleObject) {
          this.selectedType = res.data.singleObject;
          return this.selectedType;
        }
      } catch (err) {
        console.error(`Failed to fetch lookup type ${code}`, err);
      } finally {
        this.loading = false;
      }
      return null;
    },

    async fetchAllActive() {
      try {
        const res = await apiGet("/api/Lookups/all-active");
        if (res?.data?.isDone && res.data.singleObject) {
          this.activeLookups = res.data.singleObject;
          return this.activeLookups;
        }
      } catch (err) {
        console.warn("Failed to fetch all active lookups", err);
      }
      return {};
    },

    async createValue(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Lookups/values", dto);
        if (res?.data?.isDone) {
          if (this.selectedType?.code) {
            await this.fetchTypeByCode(this.selectedType.code);
          }
          await this.fetchAllActive();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة العنصر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إضافة العنصر" };
      } finally {
        this.loading = false;
      }
    },

    async updateValue(id, dto) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Lookups/values/${id}`, dto);
        if (res?.data?.isDone) {
          if (this.selectedType?.code) {
            await this.fetchTypeByCode(this.selectedType.code);
          }
          await this.fetchAllActive();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث العنصر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء تحديث العنصر" };
      } finally {
        this.loading = false;
      }
    },

    async deleteValue(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Lookups/values/${id}`);
        if (res?.data?.isDone) {
          if (this.selectedType?.code) {
            await this.fetchTypeByCode(this.selectedType.code);
          }
          await this.fetchAllActive();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف العنصر" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء حذف العنصر" };
      } finally {
        this.loading = false;
      }
    },

    async seedDefaults() {
      this.loading = true;
      try {
        const res = await apiPost("/api/Lookups/seed-defaults", {});
        if (res?.data?.isDone) {
          await this.fetchTypes();
          await this.fetchAllActive();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل استعادة البيانات الافتراضية" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    }
  }
});
