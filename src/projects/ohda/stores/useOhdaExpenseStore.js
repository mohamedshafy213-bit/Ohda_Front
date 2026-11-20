import { defineStore } from "pinia";
import { apiGet, apiPost, apiDelete } from "@/utilities/fetchApi";

export const useOhdaExpenseStore = defineStore("ohdaExpense", {
  state: () => ({
    expenses: [],
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

    async generateRecurringExpenses() {
      this.loading = true;
      try {
        const res = await apiPost("/api/Expense/generate-recurring", {});
        if (res?.data?.isDone) {
          await this.fetchExpenses();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم توليد فواتير الشهر الدورية بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل توليد الفواتير الدورية"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء توليد الفواتير الدورية"
        };
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
