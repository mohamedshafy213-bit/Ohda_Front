import { defineStore } from "pinia";
import { apiGet, apiPost, apiDelete } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "./useOhdaInventoryStore";
import { useOhdaPosStore } from "./useOhdaPosStore";

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

    async checkDuplicateInvoice(supplierId, supplierInvoiceNumber) {
      if (!supplierId || !supplierInvoiceNumber) return { isDuplicate: false };
      try {
        const res = await apiGet(`/api/Purchases/check-duplicate?supplierId=${supplierId}&supplierInvoiceNumber=${encodeURIComponent(supplierInvoiceNumber)}`);
        return res?.data?.singleObject || { isDuplicate: false };
      } catch {
        return { isDuplicate: false };
      }
    },

    async createPurchase(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Purchases", dto);
        if (res?.data?.isDone) {
          await this.fetchPurchases();
          if (!dto.IsDraft && !dto.isDraft) {
            try { await useOhdaInventoryStore().fetchProducts(); } catch {}
            try { await useOhdaPosStore().fetchCatalog(); } catch {}
          }
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل فاتورة الشراء" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async postDraft(id) {
      this.loading = true;
      try {
        const res = await apiPost(`/api/Purchases/${id}/post`, null);
        if (res?.data?.isDone) {
          await this.fetchPurchases();
          try { await useOhdaInventoryStore().fetchProducts(); } catch {}
          try { await useOhdaPosStore().fetchCatalog(); } catch {}
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل اعتماد المسودة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async deleteDraft(id) {
      try {
        const res = await apiDelete(`/api/Purchases/${id}`);
        if (res?.data?.isDone) {
          this.purchases = this.purchases.filter(p => p.id !== id);
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المسودة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
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
