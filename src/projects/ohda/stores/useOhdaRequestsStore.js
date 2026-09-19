import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "./useOhdaInventoryStore";
import { useOhdaNotificationStore } from "./useOhdaNotificationStore";
import { useOhdaUserPermissionStore } from "./useOhdaUserPermissionStore";
import { useOhdaAuthStore } from "./useOhdaAuthStore";

export const useOhdaRequestsStore = defineStore("ohdaRequests", {
  state: () => ({
    exitRequests: [],
    entryRequests: [],
    loading: false
  }),

  getters: {
    pendingExitRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      if (auth.isSupervisor) {
        return state.exitRequests.filter(r => r.status === 3).length; // Awaiting supervisor
      }
      if (auth.isManager) {
        return state.exitRequests.filter(r => r.status === 1).length; // Awaiting manager
      }
      return state.exitRequests.filter(r => r.status === 1 || r.status === 3).length;
    },
    pendingEntryRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      if (auth.isSupervisor) {
        return state.entryRequests.filter(r => r.status === 3).length;
      }
      if (auth.isManager) {
        return state.entryRequests.filter(r => r.status === 1).length;
      }
      return state.entryRequests.filter(r => r.status === 1 || r.status === 3).length;
    },
    totalPendingRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      if (auth.isSupervisor) {
        return state.exitRequests.filter(r => r.status === 3).length + state.entryRequests.filter(r => r.status === 3).length;
      }
      if (auth.isManager) {
        return state.exitRequests.filter(r => r.status === 1).length + state.entryRequests.filter(r => r.status === 1).length;
      }
      return state.exitRequests.filter(r => r.status === 1 || r.status === 3).length + state.entryRequests.filter(r => r.status === 1 || r.status === 3).length;
    }
  },

  actions: {
    // API Fetch Exit Requests (silent = true prevents UI loading flicker on background polls)
    async fetchExitRequests({ silent = false } = {}) {
      if (!silent) this.loading = true;
      try {
        const res = await apiGet("/api/ProductExitRequest");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.exitRequests = data;
        }
      } catch (err) {
        console.warn("ProductExitRequest API failed", err);
      } finally {
        if (!silent) this.loading = false;
      }
    },

    // Create Exit Request
    async createExitRequest(payload, userObj) {
      this.loading = true;
      try {
        const res = await apiPost("/api/ProductExitRequest/request", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.exitRequests.unshift(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء طلب الصرف" };
      } catch (err) {
        console.warn("Create Exit Request API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء طلب الصرف" };
      } finally {
        this.loading = false;
      }
    },

    // Manager Step 1 Approval for Exit
    async managerApproveExit(id, managerUserObj, approvalDto = null) {
      try {
        const res = await apiPut(`/api/ProductExitRequest/${id}/manager-approve`, approvalDto || {}, false);
        if (res?.data?.isDone) {
          const req = this.exitRequests.find(r => r.id === id);
          if (req) {
            req.status = 3; // ManagerApproved (BE value)
            req.managerId = managerUserObj?.id || req.managerId;
            req.managerUsername = managerUserObj?.username || req.managerUsername;
            req.managerApprove = true;

            // Notify supervisors
            try {
              const userStore = useOhdaUserPermissionStore();
              const notifStore = useOhdaNotificationStore();
              const supervisors = userStore.users.filter(u => u.role === 3);
              supervisors.forEach(sup => {
                notifStore.addNotification({
                  title: `طلب صرف معلق #${req.id}`,
                  message: `تم اعتماد طلب الصرف من المدير. يرجى توثيق الطلب وصرف الكمية.`,
                  userId: sup.id
                });
              });
            } catch (notifErr) {
              console.warn("Failed to notify supervisors", notifErr);
            }
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل اعتماد المدير لطلب الصرف" };
      } catch (err) {
        console.warn("Manager approve API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل اعتماد المدير لطلب الصرف" };
      }
    },

    // Supervisor Step 2 Approval for Exit (Deducts Stock!)
    async supervisorApproveExit(id, supervisorUserObj, approvalDto = null) {
      try {
        const res = await apiPut(`/api/ProductExitRequest/${id}/supervisor-approve`, approvalDto || {}, false);
        if (res?.data?.isDone) {
          const req = this.exitRequests.find(r => r.id === id);
          if (req) {
            req.status = 2; // SupervisorApproved (BE value)
            req.supervisorId = supervisorUserObj?.id || req.supervisorId;
            req.supervisorUsername = supervisorUserObj?.username || req.supervisorUsername;
            req.supervisorApprove = true;

            // Auto-Refresh inventory stock!
            const inventoryStore = useOhdaInventoryStore();
            await inventoryStore.fetchProducts();

            // Notify requesting employee
            const notifStore = useOhdaNotificationStore();
            notifStore.addNotification({
              title: `تم توثيق واكتمال طلب الصرف #${req.id}`,
              message: `تم اعتماد صرف الكمية لطلب الصرف #${req.id} وتسليمها إلى ${req.recipientName}.`,
              userId: req.requestedByUserId
            });
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل اعتماد المشرف لطلب الصرف" };
      } catch (err) {
        console.warn("Supervisor approve API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل اعتماد المشرف لطلب الصرف" };
      }
    },

    // Reject Exit Request
    async rejectExitRequest(id, rejectionReason, userObj) {
      try {
        const res = await apiPut(`/api/ProductExitRequest/${id}/reject`, { rejectionReason }, false);
        if (res?.data?.isDone) {
          const req = this.exitRequests.find(r => r.id === id);
          if (req) {
            req.status = 4; // Rejected
            req.rejectionReason = rejectionReason;

            const notifStore = useOhdaNotificationStore();
            notifStore.addNotification({
              title: `تم رفض طلب الصرف #${req.id}`,
              message: `تم رفض طلب الصرف لـ ${req.productName}. السبب: ${rejectionReason}`,
              userId: req.requestedByUserId
            });
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل رفض طلب الصرف" };
      } catch (err) {
        console.warn("Reject Exit Request API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل رفض طلب الصرف" };
      }
    },

    // API Fetch Entry Requests (silent = true prevents UI loading flicker on background polls)
    async fetchEntryRequests({ silent = false } = {}) {
      if (!silent) this.loading = true;
      try {
        const res = await apiGet("/api/ProductEntryRequest");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.entryRequests = data;
        }
      } catch (err) {
        console.warn("ProductEntryRequest API failed", err);
      } finally {
        if (!silent) this.loading = false;
      }
    },

    // Create Entry Request
    async createEntryRequest(payload, userObj) {
      this.loading = true;
      try {
        const res = await apiPost("/api/ProductEntryRequest/request", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.entryRequests.unshift(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إنشاء طلب التوريد" };
      } catch (err) {
        console.warn("Create Entry Request API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إنشاء طلب التوريد" };
      } finally {
        this.loading = false;
      }
    },

    // Manager Step 1 Approval for Entry
    async managerApproveEntry(id, managerUserObj, approvalDto = null) {
      try {
        const res = await apiPut(`/api/ProductEntryRequest/${id}/manager-approve`, approvalDto || {}, false);
        if (res?.data?.isDone) {
          const req = this.entryRequests.find(r => r.id === id);
          if (req) {
            req.status = 3; // ManagerApproved (BE value)
            req.managerId = managerUserObj?.id || req.managerId;
            req.managerUsername = managerUserObj?.username || req.managerUsername;
            req.managerApprove = true;

            // Notify supervisors
            try {
              const userStore = useOhdaUserPermissionStore();
              const notifStore = useOhdaNotificationStore();
              const supervisors = userStore.users.filter(u => u.role === 3);
              supervisors.forEach(sup => {
                notifStore.addNotification({
                  title: `طلب توريد معلق #${req.id}`,
                  message: `تم اعتماد طلب التوريد من المدير. يرجى توثيق الطلب وإدخال الكمية للمخزن.`,
                  userId: sup.id
                });
              });
            } catch (notifErr) {
              console.warn("Failed to notify supervisors", notifErr);
            }
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل اعتماد المدير لطلب التوريد" };
      } catch (err) {
        console.warn("Manager approve entry API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل اعتماد المدير لطلب التوريد" };
      }
    },

    // Supervisor Step 2 Approval for Entry (Adds Stock!)
    async supervisorApproveEntry(id, supervisorUserObj, approvalDto = null) {
      try {
        const res = await apiPut(`/api/ProductEntryRequest/${id}/supervisor-approve`, approvalDto || {}, false);
        if (res?.data?.isDone) {
          const req = this.entryRequests.find(r => r.id === id);
          if (req) {
            req.status = 2; // SupervisorApproved (BE value)
            req.supervisorId = supervisorUserObj?.id || req.supervisorId;
            req.supervisorUsername = supervisorUserObj?.username || req.supervisorUsername;
            req.supervisorApprove = true;

            // Auto-Refresh inventory stock!
            const inventoryStore = useOhdaInventoryStore();
            await inventoryStore.fetchProducts();

            // Notify receiving employee
            const notifStore = useOhdaNotificationStore();
            notifStore.addNotification({
              title: `تم اعتماد وتوثيق توريد المخزون #${req.id}`,
              message: `تمت إضافة الكمية الموردة لطلب التوريد #${req.id} إلى الرصيد المتاح.`,
              userId: req.receivedByUserId
            });
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل اعتماد المشرف لطلب التوريد" };
      } catch (err) {
        console.warn("Supervisor approve entry API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل اعتماد المشرف لطلب التوريد" };
      }
    },

    // Reject Entry Request
    async rejectEntryRequest(id, rejectionReason, userObj) {
      try {
        const res = await apiPut(`/api/ProductEntryRequest/${id}/reject`, { rejectionReason }, false);
        if (res?.data?.isDone) {
          const req = this.entryRequests.find(r => r.id === id);
          if (req) {
            req.status = 4; // Rejected
            req.rejectionReason = rejectionReason;

            const notifStore = useOhdaNotificationStore();
            notifStore.addNotification({
              title: `تم رفض شحنة التوريد #${req.id}`,
              message: `تم رفض توريد ${req.productName}. السبب: ${rejectionReason}`,
              userId: req.receivedByUserId
            });
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل رفض طلب التوريد" };
      } catch (err) {
        console.warn("Reject Entry Request API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل رفض طلب التوريد" };
      }
    }
  }
});
