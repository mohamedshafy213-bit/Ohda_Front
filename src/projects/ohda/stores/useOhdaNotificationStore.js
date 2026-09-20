import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut } from "@/utilities/fetchApi";

export const useOhdaNotificationStore = defineStore("ohdaNotifications", {
  state: () => ({
    notifications: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.isRead).length
  },

  actions: {
    async fetchMyNotifications(unreadOnly = false) {
      this.loading = true;
      try {
        const url = `/api/Notification/my-notifications?unreadOnly=${unreadOnly}`;
        const res = await apiGet(url);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.notifications = data;
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل جلب الإشعارات" };
      } catch (err) {
        console.warn("Notifications API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل جلب الإشعارات" };
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        const res = await apiPut(`/api/Notification/${id}/read`, {}, false);
        if (res?.data?.isDone) {
          const notif = this.notifications.find(n => n.id === id);
          if (notif) {
            notif.isRead = true;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل وضع الإشعار كمقروء" };
      } catch (err) {
        console.warn("Mark notification read API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل وضع الإشعار كمقروء" };
      }
    },

    async markAllAsRead() {
      try {
        const res = await apiPut("/api/Notification/read-all", {}, false);
        if (res?.data?.isDone) {
          this.notifications.forEach(n => {
            n.isRead = true;
          });
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل وضع جميع الإشعارات كمقروءة" };
      } catch (err) {
        console.warn("Mark all read API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل وضع جميع الإشعارات كمقروءة" };
      }
    },

    async addNotification({ title, message, userId }) {
      if (!userId || Number(userId) <= 0) {
        console.warn("addNotification skipped: invalid recipient userId", userId);
        return { success: false, message: "Invalid userId" };
      }
      try {
        const res = await apiPost("/api/Notification", { title, message, userId: Number(userId) }, false);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.notifications.unshift(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة الإشعار" };
      } catch (err) {
        console.warn("Add notification API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة الإشعار" };
      }
    }
  }
});
