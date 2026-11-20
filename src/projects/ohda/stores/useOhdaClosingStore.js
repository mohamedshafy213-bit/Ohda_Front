import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi";

export const useOhdaClosingStore = defineStore("ohdaClosing", {
  state: () => ({
    preview: null,
    history: [],
    loading: false
  }),

  getters: {
    isMonthLocked: (state) => state.preview?.isLocked ?? false,
    unpaidJobsCount: (state) => state.preview?.unpaidJobs?.length ?? 0,
    doneButUnpaidCount: (state) => state.preview?.unpaidJobs?.filter(j => j.isDoneButUnpaid).length ?? 0
  },

  actions: {
    async fetchPreview(month = null, year = null) {
      this.loading = true;
      try {
        const now = new Date();
        const m = month || (now.getMonth() + 1);
        const y = year || now.getFullYear();

        const res = await apiGet(`/api/MonthClosing/preview?month=${m}&year=${y}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.preview = res.data.singleObject;
          return this.preview;
        }
        return null;
      } catch (err) {
        console.warn("Fetch month closing preview failed", err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async closeMonth(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/MonthClosing/close", payload);
        if (res?.data?.isDone) {
          await this.fetchPreview(payload.month, payload.year);
          await this.fetchHistory();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم إقفال الشهر واعتماده بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل إقفال الشهر"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إقفال الشهر"
        };
      } finally {
        this.loading = false;
      }
    },

    async reopenMonth(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/MonthClosing/reopen", payload);
        if (res?.data?.isDone) {
          await this.fetchPreview(payload.month, payload.year);
          await this.fetchHistory();
          return {
            success: true,
            message: res?.data?.returnMessage || "تمت إعادة فتح الشهر بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل إعادة فتح الشهر"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إعادة الفتح"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchHistory() {
      try {
        const res = await apiGet("/api/MonthClosing/history");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.history = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.history = [];
        }
      } catch (err) {
        console.warn("Fetch month closing history failed", err);
      }
    }
  }
});
