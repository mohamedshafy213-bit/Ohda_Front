import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";

export const useOhdaFinanceStore = defineStore("ohdaFinance", {
  state: () => ({
    accounts: [],
    transactions: [],
    closingHistory: [],
    dailyCalculation: null,
    activeDrawerSession: null,
    hasActiveDrawer: false,
    defaultDrawerAccount: null,
    drawerHistory: [],
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
    },

    isDrawerOpen: (state) => !!state.hasActiveDrawer
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

    async updateAccount(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Finance/accounts/${id}`, payload);
        if (res?.data?.isDone) {
          await this.fetchAccounts();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تحديث بيانات الحساب بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تحديث الحساب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء تحديث الحساب"
        };
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Finance/accounts/${id}`);
        if (res?.data?.isDone) {
          await this.fetchAccounts();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم حذف الحساب بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل حذف الحساب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء حذف الحساب"
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
    },

    async fetchDailyClosing() {
      return await this.fetchCurrentDrawerSession();
    },

    async fetchCurrentDrawerSession() {
      try {
        const res = await apiGet("/api/Finance/cash-drawer/current");
        if (res?.data?.isDone && res?.data?.singleObject) {
          const obj = res.data.singleObject;
          this.hasActiveDrawer = !!obj.hasActiveSession;
          this.activeDrawerSession = obj.hasActiveSession ? obj.session : null;
          this.defaultDrawerAccount = {
            id: obj.defaultAccountId,
            name: obj.defaultAccountName,
            balance: obj.currentAccountBalance
          };
          return obj;
        }
      } catch (err) {
        console.warn("Fetch current drawer session failed", err);
      }
      return null;
    },

    async openCashDrawer(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Finance/cash-drawer/open", payload);
        if (res?.data?.isDone) {
          await this.fetchCurrentDrawerSession();
          await this.fetchAccounts();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم فتح درج النقدية وبدء يوم العمل بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل فتح درج النقدية"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء فتح درج النقدية"
        };
      } finally {
        this.loading = false;
      }
    },

    async closeCashDrawer(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Finance/cash-drawer/close", payload);
        if (res?.data?.isDone) {
          await this.fetchCurrentDrawerSession();
          await this.fetchAccounts();
          await this.fetchDrawerHistory();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تقفيل درج النقدية بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تقفيل درج النقدية"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء تقفيل درج النقدية"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchDrawerHistory() {
      try {
        const res = await apiGet("/api/Finance/cash-drawer/history");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.drawerHistory = Array.isArray(data) ? data : [data];
        } else {
          this.drawerHistory = [];
        }
      } catch (err) {
        console.warn("Fetch drawer history failed", err);
      }
    }
  }
});
