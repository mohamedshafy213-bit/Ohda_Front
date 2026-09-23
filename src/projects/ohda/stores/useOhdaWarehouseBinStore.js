import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaWarehouseBinStore = defineStore("ohdaWarehouseBin", {
  state: () => ({
    bins: [],
    departments: [],
    selectedBinItems: [],
    currentBin: null,
    loading: false,
    loadingItems: false
  }),

  getters: {
    totalBinsCount: (state) => state.bins.length,
    occupiedBinsCount: (state) => state.bins.filter((b) => (b.itemsCount || 0) > 0).length,
    emptyBinsCount: (state) => state.bins.filter((b) => (b.itemsCount || 0) === 0).length,
    totalItemsInBins: (state) => state.bins.reduce((acc, b) => acc + (b.itemsCount || 0), 0),
    totalCapacity: (state) => state.bins.reduce((acc, b) => acc + (b.capacity || 0), 0),
    totalRemainingSpace: (state) => state.bins.reduce((acc, b) => {
      const cap = b.capacity || 0;
      const rem = b.remainingCapacity != null ? b.remainingCapacity : Math.max(0, cap - (b.itemsCount || 0));
      return acc + rem;
    }, 0)
  },

  actions: {
    async fetchBins(departmentId = null) {
      this.loading = true;
      try {
        let url = "/api/WarehouseBin/list";
        if (departmentId && departmentId > 0) {
          url += `?departmentId=${departmentId}`;
        }
        const res = await apiGet(url);
        if (res?.data?.isDone && res.data.singleObject) {
          this.bins = res.data.singleObject;
        } else if (res?.data?.objects) {
          this.bins = res.data.objects;
        }
      } catch (error) {
        console.error("Error fetching warehouse bins:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDepartments() {
      try {
        const res = await apiGet("/api/Department");
        const list = res?.data?.objects || res?.data?.singleObject || [];
        this.departments = list;
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    },

    async fetchBinItems(binId) {
      this.loadingItems = true;
      this.selectedBinItems = [];
      try {
        const res = await apiGet(`/api/WarehouseBin/${binId}/items`);
        if (res?.data?.isDone && res.data.singleObject) {
          this.selectedBinItems = res.data.singleObject;
        }
      } catch (error) {
        console.error(`Error fetching items for bin ${binId}:`, error);
      } finally {
        this.loadingItems = false;
      }
    },

    async createBin(binData) {
      try {
        const res = await apiPost("/api/WarehouseBin", binData);
        if (res?.data?.isDone) {
          await this.fetchBins();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating warehouse bin:", error);
        return false;
      }
    },

    async updateBin(id, binData) {
      try {
        const res = await apiPut(`/api/WarehouseBin/${id}`, binData);
        if (res?.data?.isDone) {
          await this.fetchBins();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating warehouse bin:", error);
        return false;
      }
    },

    async deleteBin(id) {
      try {
        const res = await apiDelete(`/api/WarehouseBin/${id}`);
        if (res?.data?.isDone) {
          await this.fetchBins();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting warehouse bin:", error);
        return false;
      }
    },

    async assignProductToBin(binId, productId, quantity = 1) {
      try {
        const res = await apiPost(`/api/WarehouseBin/${binId}/assign-product`, {
          productId,
          quantity
        });
        if (res?.data?.isDone) {
          await this.fetchBins();
          await this.fetchBinItems(binId);
          return { success: true, message: res?.data?.message || "تم تسكين الأصناف بنجاح" };
        }
        return { success: false, message: res?.data?.message || "فشل تسكين الأصناف" };
      } catch (error) {
        console.error("Error assigning product to bin:", error);
        return { success: false, message: error?.response?.data?.message || "حدث خطأ أثناء التسكين" };
      }
    },

    async unassignItem(binId, itemId) {
      try {
        const res = await apiPost(`/api/WarehouseBin/${binId}/unassign-item/${itemId}`);
        if (res?.data?.isDone) {
          await this.fetchBins();
          await this.fetchBinItems(binId);
          return { success: true, message: res?.data?.message || "تم إلغاء تسكين الجهاز بنجاح" };
        }
        return { success: false, message: res?.data?.message || "فشل إلغاء التسكين" };
      } catch (error) {
        console.error("Error unassigning item from bin:", error);
        return { success: false, message: "حدث خطأ أثناء إلغاء التسكين" };
      }
    }
  }
});
