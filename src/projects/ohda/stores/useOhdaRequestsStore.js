import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "./useOhdaInventoryStore";
import { useOhdaWarehouseBinStore } from "./useOhdaWarehouseBinStore";
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
    myReturnedExitRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      const userId = auth.user?.militaryNumber || auth.user?.id;
      const username = auth.user?.username?.toLowerCase();
      return state.exitRequests.filter(r => {
        const isMine = (userId && r.requestedByUserId === userId) ||
                       (username && (r.insertUserCode?.toLowerCase() === username || r.requestedByUsername?.toLowerCase() === username));
        return isMine && r.status === 4;
      }).length;
    },
    myReturnedEntryRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      const userId = auth.user?.militaryNumber || auth.user?.id;
      const username = auth.user?.username?.toLowerCase();
      return state.entryRequests.filter(r => {
        const isMine = (userId && (r.receivedByUserId === userId || r.requestedByUserId === userId)) ||
                       (username && (r.insertUserCode?.toLowerCase() === username || r.receivedByUsername?.toLowerCase() === username));
        return isMine && r.status === 4;
      }).length;
    },
    pendingExitRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      const userId = auth.user?.militaryNumber || auth.user?.id;
      const username = auth.user?.username?.toLowerCase();
      const myReturned = state.exitRequests.filter(r => {
        const isMine = (userId && r.requestedByUserId === userId) ||
                       (username && (r.insertUserCode?.toLowerCase() === username || r.requestedByUsername?.toLowerCase() === username));
        return isMine && r.status === 4;
      }).length;

      let rolePending = 0;
      if (auth.isSupervisor) {
        rolePending = state.exitRequests.filter(r => r.status === 3).length; // Awaiting supervisor
      } else if (auth.isManager) {
        rolePending = state.exitRequests.filter(r => r.status === 1).length; // Awaiting manager
      } else if (auth.isAdmin || auth.isSuperAdmin) {
        rolePending = state.exitRequests.filter(r => r.status === 1 || r.status === 3).length;
      }
      return (rolePending + myReturned) || null;
    },
    pendingEntryRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      const userId = auth.user?.militaryNumber || auth.user?.id;
      const username = auth.user?.username?.toLowerCase();
      const myReturned = state.entryRequests.filter(r => {
        const isMine = (userId && (r.receivedByUserId === userId || r.requestedByUserId === userId)) ||
                       (username && (r.insertUserCode?.toLowerCase() === username || r.receivedByUsername?.toLowerCase() === username));
        return isMine && r.status === 4;
      }).length;

      let rolePending = 0;
      if (auth.isSupervisor) {
        rolePending = state.entryRequests.filter(r => r.status === 3).length;
      } else if (auth.isManager) {
        rolePending = state.entryRequests.filter(r => r.status === 1).length;
      } else if (auth.isAdmin || auth.isSuperAdmin) {
        rolePending = state.entryRequests.filter(r => r.status === 1 || r.status === 3).length;
      }
      return (rolePending + myReturned) || null;
    },
    totalPendingRequestsCount: (state) => {
      const auth = useOhdaAuthStore();
      const exitCount = state.exitRequests.filter(r => r.status === 1 || r.status === 3 || r.status === 4).length;
      const entryCount = state.entryRequests.filter(r => r.status === 1 || r.status === 3 || r.status === 4).length;
      return exitCount + entryCount;
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
        if (res?.data?.isDone) {
          if (res?.data?.singleObject) {
            this.exitRequests.unshift(res.data.singleObject);
          }
          if (payload.autoApprove) {
            const inventoryStore = useOhdaInventoryStore();
            const binStore = useOhdaWarehouseBinStore();
            await Promise.all([
              this.fetchExitRequests({ silent: true }),
              inventoryStore.fetchProducts(),
              inventoryStore.fetchCategories(),
              binStore.fetchBins()
            ]);
          }
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

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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

            // Auto-Refresh inventory stock, warehouse bins, and categories across the whole system!
            const inventoryStore = useOhdaInventoryStore();
            const binStore = useOhdaWarehouseBinStore();
            await Promise.all([
              inventoryStore.fetchProducts(),
              inventoryStore.fetchCategories(),
              binStore.fetchBins()
            ]);

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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
        if (res?.data?.isDone) {
          if (res?.data?.singleObject) {
            this.entryRequests.unshift(res.data.singleObject);
          }
          if (payload.autoApprove) {
            const inventoryStore = useOhdaInventoryStore();
            const binStore = useOhdaWarehouseBinStore();
            await Promise.all([
              this.fetchEntryRequests({ silent: true }),
              inventoryStore.fetchProducts(),
              inventoryStore.fetchCategories(),
              binStore.fetchBins()
            ]);
          }
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

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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

            // Auto-Refresh inventory stock, warehouse bins, and categories across the whole system!
            const inventoryStore = useOhdaInventoryStore();
            const binStore = useOhdaWarehouseBinStore();
            await Promise.all([
              inventoryStore.fetchProducts(),
              inventoryStore.fetchCategories(),
              binStore.fetchBins()
            ]);

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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

            // Refresh user notifications from backend
            useOhdaNotificationStore().fetchMyNotifications();
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
