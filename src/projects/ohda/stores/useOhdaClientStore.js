import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaClientStore = defineStore("ohdaClient", {
  state: () => ({
    clients: [],
    loading: false,
    statement: []
  }),

  getters: {
    totalClients: (state) => state.clients.length,
    totalReceivables: (state) => state.clients.filter(c => c.currentBalance > 0).reduce((acc, c) => acc + c.currentBalance, 0),
    owingClientsCount: (state) => state.clients.filter(c => c.currentBalance > 0).length
  },

  actions: {
    async fetchClients(search = "") {
      this.loading = true;
      try {
        const url = search ? `/api/Clients?search=${encodeURIComponent(search)}` : "/api/Clients";
        const res = await apiGet(url);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          this.clients = res.data.objects;
          return this.clients;
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        this.loading = false;
      }
      return [];
    },

    async createClient(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Clients", dto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة العميل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async updateClient(id, dto) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Clients/${id}`, dto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث بيانات العميل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async deleteClient(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Clients/${id}`);
        if (res?.data?.isDone) {
          await this.fetchClients();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف العميل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async fetchStatement(clientId) {
      try {
        const res = await apiGet(`/api/Clients/${clientId}/statement`);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          this.statement = res.data.objects;
          return this.statement;
        }
      } catch (err) {
        console.error("Failed to fetch statement", err);
      }
      return [];
    },

    async recordPayment(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Clients/record-payment", dto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل السداد" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    }
  }
});
