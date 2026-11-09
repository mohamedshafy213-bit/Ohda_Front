import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaUntrackedItemStore = defineStore("ohdaUntrackedItem", {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    totalCount: (state) => state.items.length,
    activeItems: (state) => state.items.filter((i) => i.isActive && !i.isDeleted)
  },

  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const res = await apiGet("/api/UntrackedItem");
        const list = res?.data?.objects || res?.data?.jsonResult || res?.data?.singleObject || [];
        this.items = Array.isArray(list) ? list : [];
      } catch (error) {
        console.error("Error fetching untracked items:", error);
      } finally {
        this.loading = false;
      }
    },

    async createItem(payload) {
      try {
        const res = await apiPost("/api/UntrackedItem", payload);
        await this.fetchItems();
        return res?.data;
      } catch (error) {
        console.error("Error creating untracked item:", error);
        throw error;
      }
    },

    async updateItem(id, payload) {
      try {
        const res = await apiPut(`/api/UntrackedItem/${id}`, payload);
        await this.fetchItems();
        return res?.data;
      } catch (error) {
        console.error("Error updating untracked item:", error);
        throw error;
      }
    },

    async toggleActive(id) {
      try {
        const res = await apiPut(`/api/UntrackedItem/${id}/toggle-active`, {});
        await this.fetchItems();
        return res?.data;
      } catch (error) {
        console.error("Error toggling untracked item active state:", error);
        throw error;
      }
    },

    async deleteItem(id) {
      try {
        const res = await apiDelete(`/api/UntrackedItem/${id}`);
        await this.fetchItems();
        return res?.data;
      } catch (error) {
        console.error("Error deleting untracked item:", error);
        throw error;
      }
    }
  }
});

