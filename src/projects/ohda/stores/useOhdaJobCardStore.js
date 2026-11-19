import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaJobCardStore = defineStore("ohdaJobCards", {
  state: () => ({
    jobs: [],
    loading: false
  }),

  getters: {
    totalJobsCount: (state) => state.jobs.length,
    openJobs: (state) => state.jobs.filter(j => j.status === 1),
    openJobsCount: (state) => state.jobs.filter(j => j.status === 1).length,
    doneJobs: (state) => state.jobs.filter(j => j.status === 2),
    doneJobsCount: (state) => state.jobs.filter(j => j.status === 2).length,
    paidJobs: (state) => state.jobs.filter(j => j.status === 3),
    paidJobsCount: (state) => state.jobs.filter(j => j.status === 3).length,

    totalRevenue: (state) => {
      return state.jobs.reduce((acc, j) => acc + (Number(j.paidAmount) || 0), 0);
    },

    totalUnpaidReceivables: (state) => {
      return state.jobs
        .filter(j => j.status !== 4) // exclude cancelled
        .reduce((acc, j) => acc + (Number(j.remainingBalance) || 0), 0);
    }
  },

  actions: {
    async fetchJobs(status = null) {
      this.loading = true;
      try {
        const url = status != null ? `/api/JobCard?status=${status}` : "/api/JobCard";
        const res = await apiGet(url);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.jobs = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch job cards failed, keeping active state", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchJobById(id) {
      try {
        const res = await apiGet(`/api/JobCard/${id}`);
        if (res?.data?.isDone && res?.data?.singleObject) {
          return res.data.singleObject;
        }
        return null;
      } catch (err) {
        console.warn("Fetch job by id failed", err);
        return null;
      }
    },

    async createJob(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/JobCard", payload);
        if (res?.data?.isDone) {
          await this.fetchJobs();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم إنشاء أمر الشغل بنجاح",
            data: res.data.singleObject
          };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء أمر الشغل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء أمر الشغل" };
      } finally {
        this.loading = false;
      }
    },

    async updateJob(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/JobCard/${id}`, payload);
        if (res?.data?.isDone) {
          await this.fetchJobs();
          return { success: true, message: res?.data?.returnMessage || "تم تحديث أمر الشغل بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث أمر الشغل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث أمر الشغل" };
      } finally {
        this.loading = false;
      }
    },

    async updateStatus(id, status) {
      try {
        const res = await apiPost("/api/JobCard/status", { id, status });
        if (res?.data?.isDone) {
          await this.fetchJobs();
          return { success: true, message: res?.data?.returnMessage || "تم تحديث الحالة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث الحالة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث الحالة" };
      }
    },

    async addPayment(payload) {
      try {
        const res = await apiPost("/api/JobCard/payment", payload);
        if (res?.data?.isDone) {
          await this.fetchJobs();
          return { success: true, message: res?.data?.returnMessage || "تم تسجيل الدفعة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل الدفعة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تسجيل الدفعة" };
      }
    },

    async deleteJob(id) {
      try {
        const res = await apiDelete(`/api/JobCard/${id}`);
        if (res?.data?.isDone) {
          this.jobs = this.jobs.filter(j => j.id !== id);
          return { success: true, message: res?.data?.returnMessage || "تم حذف / إلغاء أمر الشغل" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف أمر الشغل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف أمر الشغل" };
      }
    }
  }
});
