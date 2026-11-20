import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";

export const useOhdaFinanceStore = defineStore("ohdaFinance", {
  state: () => ({
    accounts: [],
    transactions: [],
    closingHistory: [],
    dailyCalculation: null,
    loading: false
  }),

  getters: {
    totalLiquidity: (state) => {
      return state.accounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
    },

    cashBoxBalance: (state) => {
      return state.accounts
        .filter(a => a.accountType === 1)
        .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
    },

    bankBalance: (state) => {
      return state.accounts
        .filter(a => a.accountType === 2)
        .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
    },

    instaPayBalance: (state) => {
      return state.accounts
        .filter(a => a.accountType === 3)
        .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
    }
  },

  actions: {
    async fetchAccounts() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Finance/accounts");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.accounts = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.accounts = [];
        }
      } catch (err) {
        console.warn("Fetch accounts failed", err);
      } finally {
        this.loading = false;
      }
    },

    async createAccount(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Finance/accounts", payload);
        if (res?.data?.isDone) {
          await this.fetchAccounts();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم إنشاء الحساب بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل إنشاء الحساب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إنشاء الحساب"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchTransactions(filters = {}) {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (filters.accountId != null && filters.accountId !== "") params.append("accountId", filters.accountId);
        if (filters.type != null && filters.type !== "") params.append("type", filters.type);
        if (filters.fromDate) params.append("fromDate", filters.fromDate);
        if (filters.toDate) params.append("toDate", filters.toDate);

        const q = params.toString() ? `?${params.toString()}` : "";
        const res = await apiGet(`/api/Finance/transactions${q}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.transactions = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.transactions = [];
        }
      } catch (err) {
        console.warn("Fetch transactions failed", err);
      } finally {
        this.loading = false;
      }
    },

    async transferFunds(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Finance/transfer", payload);
        if (res?.data?.isDone) {
          await this.fetchAccounts();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم التحويل المالي بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل التحويل المالي"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء التحويل"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchDailyClosingCalc(accountId = null, date = null) {
      try {
        const params = new URLSearchParams();
        if (accountId) params.append("accountId", accountId);
        if (date) params.append("date", date);
        const q = params.toString() ? `?${params.toString()}` : "";

        const res = await apiGet(`/api/Finance/daily-closing/calculate${q}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.dailyCalculation = res.data.singleObject;
          return this.dailyCalculation;
        }
        return null;
      } catch (err) {
        console.warn("Fetch daily closing calc failed", err);
        return null;
      }
    },

    async submitDailyClosing(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Finance/daily-closing", payload);
        if (res?.data?.isDone) {
          await this.fetchAccounts();
          await this.fetchClosingHistory();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تسجيل تقفيل الخزينة بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تسجيل تقفيل الخزينة"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء تقفيل الخزينة"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchClosingHistory() {
      try {
        const res = await apiGet("/api/Finance/daily-closing/history");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.closingHistory = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.closingHistory = [];
        }
      } catch (err) {
        console.warn("Fetch closing history failed", err);
      }
    }
  }
});
