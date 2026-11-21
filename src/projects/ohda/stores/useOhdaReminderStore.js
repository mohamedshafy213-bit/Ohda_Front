import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaReminderStore = defineStore("ohdaReminders", {
  state: () => ({
    serviceReminders: [],
    followUpTasks: [],
    agingReport: null,
    loading: false
  }),

  getters: {
    overdueReminders: (state) => state.serviceReminders.filter(r => r.isOverdue && r.status === 1),
    overdueRemindersCount: (state) => state.serviceReminders.filter(r => r.isOverdue && r.status === 1).length,
    dueThisWeekReminders: (state) => state.serviceReminders.filter(r => !r.isOverdue && r.status === 1 && r.daysRemainingOrOverdue <= 7),
    dueThisWeekCount: (state) => state.serviceReminders.filter(r => !r.isOverdue && r.status === 1 && r.daysRemainingOrOverdue <= 7).length,
    contactedCount: (state) => state.serviceReminders.filter(r => r.status === 2).length,
    openTasksCount: (state) => state.followUpTasks.filter(t => t.status === 1).length,
    overdueTasksCount: (state) => state.followUpTasks.filter(t => t.isOverdue && t.status === 1).length,
    totalUnpaidAmount: (state) => state.agingReport?.totalUnpaidReceivables || 0
  },

  actions: {
    async fetchServiceReminders(filters = {}) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.dueFilter) queryParams.append("dueFilter", filters.dueFilter);
        if (filters.search) queryParams.append("search", filters.search);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const res = await apiGet(`/api/Reminders/services${qs}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.serviceReminders = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("fetchServiceReminders failed", err);
      } finally {
        this.loading = false;
      }
    },

    async recordContact(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Reminders/services/${id}/contact`, payload);
        if (res?.data?.isDone) {
          await this.fetchServiceReminders();
          return { success: true, message: res.data.returnMessage || "تم تسجيل نتيجة التواصل بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل التواصل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تسجيل التواصل" };
      } finally {
        this.loading = false;
      }
    },

    async dismissReminder(id) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Reminders/services/${id}/dismiss`, {});
        if (res?.data?.isDone) {
          await this.fetchServiceReminders();
          return { success: true, message: res.data.returnMessage || "تم تجاهل التذكير بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تجاهل التذكير" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تجاهل التذكير" };
      } finally {
        this.loading = false;
      }
    },

    async fetchFollowUpTasks(filters = {}) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.assignedUserId) queryParams.append("assignedUserId", filters.assignedUserId);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const res = await apiGet(`/api/Reminders/tasks${qs}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.followUpTasks = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("fetchFollowUpTasks failed", err);
      } finally {
        this.loading = false;
      }
    },

    async createFollowUpTask(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Reminders/tasks", payload);
        if (res?.data?.isDone) {
          await this.fetchFollowUpTasks();
          return { success: true, message: res.data.returnMessage || "تم إنشاء مهمة المتابعة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء مهمة المتابعة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء مهمة المتابعة" };
      } finally {
        this.loading = false;
      }
    },

    async completeTask(id) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Reminders/tasks/${id}/complete`, {});
        if (res?.data?.isDone) {
          await this.fetchFollowUpTasks();
          return { success: true, message: res.data.returnMessage || "تم إكمال المهمة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إكمال المهمة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إكمال المهمة" };
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Reminders/tasks/${id}`);
        if (res?.data?.isDone) {
          await this.fetchFollowUpTasks();
          return { success: true, message: res.data.returnMessage || "تم حذف مهمة المتابعة بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المهمة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف المهمة" };
      } finally {
        this.loading = false;
      }
    },

    async fetchUnpaidAging() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Reminders/unpaid-aging");
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.agingReport = res.data.singleObject;
          return res.data.singleObject;
        }
        return null;
      } catch (err) {
        console.warn("fetchUnpaidAging failed", err);
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});
