import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";

export const useOhdaReturnStore = defineStore("ohdaReturn", {
  state: () => ({
    returns: [],
    loading: false
  }),

  actions: {
    async fetchReturns(returnType = null) {
      this.loading = true;
      try {
        const url = returnType ? `/api/Returns?returnType=${returnType}` : "/api/Returns";
        const res = await apiGet(url);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          this.returns = res.data.objects;
          return this.returns;
        }
      } catch (err) {
        console.error("Failed to fetch returns", err);
      } finally {
        this.loading = false;
      }
      return [];
    },

    async createReturn(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Returns", dto);
        if (res?.data?.isDone) {
          await this.fetchReturns(dto.returnType);
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل المرتجع" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    }
  }
});
