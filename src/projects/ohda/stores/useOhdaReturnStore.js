import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "./useOhdaInventoryStore";
import { useOhdaPosStore } from "./useOhdaPosStore";

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

    async findInvoicesForReturn(q = "", clientId = null) {
      try {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        if (clientId) params.append("clientId", clientId);
        const res = await apiGet(`/api/Returns/find-invoices${params.toString() ? "?" + params.toString() : ""}`);
        return res?.data?.objects || [];
      } catch {
        return [];
      }
    },

    async findPurchasesForReturn(q = "", supplierId = null) {
      try {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        if (supplierId) params.append("supplierId", supplierId);
        const res = await apiGet(`/api/Returns/find-purchases${params.toString() ? "?" + params.toString() : ""}`);
        return res?.data?.objects || [];
      } catch {
        return [];
      }
    },

    async createReturn(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Returns", dto);
        if (res?.data?.isDone) {
          await this.fetchReturns(dto.returnType);
          try { await useOhdaInventoryStore().fetchProducts(); } catch {}
          try { await useOhdaPosStore().fetchCatalog(); } catch {}
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
