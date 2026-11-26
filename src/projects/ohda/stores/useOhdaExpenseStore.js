import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";
import apiClient from "@/utilities/apiClient";

export const useOhdaExpenseStore = defineStore("ohdaExpense", {
  state: () => ({
    expenses: [],
    fixedTemplates: [],
    fixedMonthlyStatus: [],
    summary: null,
    loading: false
  }),

  getters: {
    totalExpensesCount: (state) => state.expenses.length,

    totalExpensesAmount: (state) => {
      return state.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    supplierPurchasesTotal: (state) => {
      return state.expenses
        .filter(e => e.expenseType === 5)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    utilitiesTotal: (state) => {
      return state.expenses
        .filter(e => [1, 2, 3, 4].includes(e.expenseType))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    salariesTotal: (state) => {
      return state.expenses
        .filter(e => e.expenseType === 6)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    otherExpensesTotal: (state) => {
      return state.expenses
        .filter(e => [7, 8].includes(e.expenseType))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    }
  },

  actions: {
    async fetchExpenses(filters = {}) {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (filters.type != null && filters.type !== "") params.append("type", filters.type);
        if (filters.month != null) params.append("month", filters.month);
        if (filters.year != null) params.append("year", filters.year);

        const queryString = params.toString() ? `?${params.toString()}` : "";
        const res = await apiGet(`/api/Expense${queryString}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.expenses = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.expenses = [];
        }
      } catch (err) {
        console.warn("Fetch expenses failed, fallback to empty", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchMonthlySummary(month = null, year = null) {
      try {
        const now = new Date();
        const m = month || (now.getMonth() + 1);
        const y = year || now.getFullYear();
        const res = await apiGet(`/api/Expense/summary?month=${m}&year=${y}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.summary = res.data.singleObject;
          return this.summary;
        }
        return null;
      } catch (err) {
        console.warn("Fetch expense summary failed", err);
        return null;
      }
    },

    async addExpense(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Expense", payload);
        if (res?.data?.isDone) {
          await this.fetchExpenses();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تسجيل المصروف بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تسجيل المصروف"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء حفظ المصروف"
        };
      } finally {
        this.loading = false;
      }
    },

    async recordSupplierPurchase(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Expense/purchase", payload);
        if (res?.data?.isDone) {
          await this.fetchExpenses();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تسجيل فاتورة الشراء وتوريد البضاعة بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تسجيل فاتورة الشراء"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء توريد البضاعة"
        };
      } finally {
        this.loading = false;
      }
    },

    async uploadReceipt(file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiClient.post("/api/Expense/upload-receipt", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res?.data?.isDone && res.data.singleObject?.fileUrl) {
          return { success: true, url: res.data.singleObject.fileUrl };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل رفع الصورة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل رفع ملف الفاتورة" };
      }
    },

    async fetchFixedTemplates() {
      try {
        const res = await apiGet("/api/Expense/fixed-templates");
        if (res?.data?.isDone) {
          this.fixedTemplates = res.data.objects || [];
        }
      } catch (err) {
        console.warn("Fetch fixed templates failed", err);
      }
    },

    async createFixedTemplate(payload) {
      try {
        const res = await apiPost("/api/Expense/fixed-templates", payload);
        if (res?.data?.isDone) {
          await this.fetchFixedTemplates();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة البند الثابت" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "حدث خطأ أثناء الإضافة" };
      }
    },

    async updateFixedTemplate(id, payload) {
      try {
        const res = await apiPut(`/api/Expense/fixed-templates/${id}`, payload);
        if (res?.data?.isDone) {
          await this.fetchFixedTemplates();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث البند الثابت" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "حدث خطأ أثناء التحديث" };
      }
    },

    async deleteFixedTemplate(id) {
      try {
        const res = await apiDelete(`/api/Expense/fixed-templates/${id}`);
        if (res?.data?.isDone) {
          this.fixedTemplates = this.fixedTemplates.filter(t => t.id !== id);
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل الحذف" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "حدث خطأ أثناء الحذف" };
      }
    },

    async fetchFixedMonthlyStatus(month, year) {
      try {
        const now = new Date();
        const m = month || (now.getMonth() + 1);
        const y = year || now.getFullYear();
        const res = await apiGet(`/api/Expense/fixed-monthly-status?month=${m}&year=${y}`);
        if (res?.data?.isDone) {
          this.fixedMonthlyStatus = res.data.objects || [];
          return this.fixedMonthlyStatus;
        }
        return [];
      } catch (err) {
        console.warn("Fetch fixed monthly status failed", err);
        return [];
      }
    },

    async recordMonthlyFixedExpense(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Expense/fixed-record-monthly", payload);
        if (res?.data?.isDone) {
          await Promise.all([
            this.fetchExpenses(),
            this.fetchFixedMonthlyStatus(payload.month, payload.year)
          ]);
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل المصروف الثابت" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "حدث خطأ أثناء التسجيل" };
      } finally {
        this.loading = false;
      }
    },

    async deleteExpense(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Expense/${id}`);
        if (res?.data?.isDone) {
          this.expenses = this.expenses.filter(e => e.id !== id);
          return {
            success: true,
            message: res?.data?.returnMessage || "تم حذف المصروف بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل حذف المصروف"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء الحذف"
        };
      } finally {
        this.loading = false;
      }
    }
  }
});
