import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "./useOhdaInventoryStore";

export const useOhdaPurchaseStore = defineStore("ohdaPurchase", {
  state: () => ({
    purchases: [],
    loading: false
  }),

  actions: {
    async fetchPurchases(params = {}) {
      this.loading = true;
      try {
        let url = "/api/Purchases";
        const q = [];
        if (params.supplierId) q.push(`supplierId=${params.supplierId}`);
        if (params.search) q.push(`search=${encodeURIComponent(params.search)}`);
        if (q.length > 0) url += `?${q.join("&")}`;

        const res = await apiGet(url);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          this.purchases = res.data.objects;
          return this.purchases;
        }
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      } finally {
        this.loading = false;
      }
      return [];
    },

    async createPurchase(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Purchases", dto);
        if (res?.data?.isDone) {
          await this.fetchPurchases();
          try {
            const invStore = useOhdaInventoryStore();
            await invStore.fetchProducts();
          } catch (e) {}
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل فاتورة الشراء" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async uploadInvoice(file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await apiPost("/api/Purchases/upload-invoice", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res?.data?.isDone && res?.data?.singleObject?.fileUrl) {
          return { success: true, url: res.data.singleObject.fileUrl };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل رفع الصورة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      }
    }
  }
});
