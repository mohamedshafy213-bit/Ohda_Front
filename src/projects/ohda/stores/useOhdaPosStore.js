import { defineStore } from "pinia";
import apiClient from "@/utilities/apiClient";

export const useOhdaPosStore = defineStore("ohdaPos", {
  state: () => ({
    invoices: [],
    loading: false,
    activeInvoice: null
  }),

  actions: {
    async fetchInvoices(search = "", date = null) {
      this.loading = true;
      try {
        let url = "/api/Pos/invoices";
        const params = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (date) params.push(`date=${encodeURIComponent(date)}`);
        if (params.length) url += `?${params.join("&")}`;

        const res = await apiClient.get(url);
        if (res?.data?.isDone && res?.data?.objects) {
          this.invoices = res.data.objects;
        }
      } catch (err) {
        console.warn("Fetch POS invoices failed:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchInvoiceById(id) {
      this.loading = true;
      try {
        const res = await apiClient.get(`/api/Pos/invoices/${id}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.activeInvoice = res.data.singleObject;
          return { success: true, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "لم يتم العثور على الفاتورة" };
      } catch (err) {
        console.warn(`Fetch POS invoice ${id} failed:`, err);
        return { success: false, message: err?.response?.data?.returnMessage || "حدث خطأ أثناء تحميل الفاتورة" };
      } finally {
        this.loading = false;
      }
    },

    async createSale(payload) {
      this.loading = true;
      try {
        const res = await apiClient.post("/api/Pos/sale", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.invoices.unshift(res.data.singleObject);
          return { success: true, invoice: res.data.singleObject, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إتمام عملية البيع" };
      } catch (err) {
        console.error("POS Sale Error:", err);
        return {
          success: false,
          message: err?.response?.data?.returnMessage || "حدث خطأ غير متوقع أثناء إتمام البيع."
        };
      } finally {
        this.loading = false;
      }
    },

    async refundSale(payload) {
      this.loading = true;
      try {
        const res = await apiClient.post("/api/Pos/refund", payload);
        if (res?.data?.isDone) {
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إتمام استرجاع البضاعة" };
      } catch (err) {
        console.error("POS Refund Error:", err);
        return {
          success: false,
          message: err?.response?.data?.returnMessage || "حدث خطأ أثناء استرجاع البضاعة."
        };
      } finally {
        this.loading = false;
      }
    }
  }
});
