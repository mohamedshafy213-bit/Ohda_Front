import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaClientStore = defineStore("ohdaClient", {
  state: () => ({
    clients: [],
    selectedClient: null,
    loading: false,
    statement: [],
    clientJobs: []
  }),

  getters: {
    totalClients: (state) => (state.clients || []).length,
    totalReceivables: (state) =>
      (state.clients || [])
        .filter((c) => c && c.currentBalance > 0)
        .reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0),
    owingClientsCount: (state) =>
      (state.clients || []).filter((c) => c && c.currentBalance > 0).length,
    totalVehicles: (state) =>
      (state.clients || []).reduce((acc, c) => acc + (Number(c?.vehiclesCount) || (c?.vehicles?.length) || 0), 0),
    totalSpentAll: (state) =>
      (state.clients || []).reduce((acc, c) => acc + (Number(c?.totalSpent) || 0), 0),
    individualClientsCount: (state) =>
      (state.clients || []).filter((c) => c && (c.type === 1 || !c.type)).length,
    companyClientsCount: (state) =>
      (state.clients || []).filter((c) => c && c.type === 2).length
  },

  actions: {
    async fetchClients(filters = {}) {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (typeof filters === "string") {
          if (filters) params.append("search", filters);
        } else {
          if (filters.search) params.append("search", filters.search);
          if (filters.type) params.append("type", filters.type);
          if (filters.tagId) params.append("tagId", filters.tagId);
          if (filters.hasBalance) params.append("hasBalance", "true");
        }

        const q = params.toString() ? `?${params.toString()}` : "";
        const res = await apiGet(`/api/Clients${q}`);
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

    async fetchClientById(id) {
      if (!id) return null;
      try {
        const res = await apiGet(`/api/Clients/${id}`);
        if (res?.data?.isDone && res.data.singleObject) {
          this.selectedClient = res.data.singleObject;
          return this.selectedClient;
        }
      } catch (err) {
        console.error(`Failed to fetch client ${id}`, err);
      }
      return null;
    },

    async fastSearch(query) {
      if (!query || query.trim().length === 0) return [];
      try {
        const res = await apiGet(`/api/Clients/search-fast?q=${encodeURIComponent(query.trim())}`);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          return res.data.objects;
        }
      } catch (err) {
        console.warn("Fast search failed", err);
      }
      return [];
    },

    async createClient(dto) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Clients", dto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
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
          if (this.selectedClient?.id === id) {
            await this.fetchClientById(id);
          }
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
          if (this.selectedClient?.id === id) {
            this.selectedClient = null;
          }
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف العميل" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    // ==========================================
    // Vehicles Management
    // ==========================================

    async fetchClientVehicles(clientId) {
      if (!clientId) return [];
      try {
        const res = await apiGet(`/api/Clients/${clientId}/vehicles`);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          return res.data.objects;
        }
      } catch (err) {
        console.error(`Failed to fetch vehicles for client ${clientId}`, err);
      }
      return [];
    },

    async addVehicle(clientId, vehicleDto) {
      this.loading = true;
      try {
        const res = await apiPost(`/api/Clients/${clientId}/vehicles`, vehicleDto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          if (this.selectedClient?.id === clientId) {
            await this.fetchClientById(clientId);
          }
          return { success: true, message: res.data.returnMessage, data: res.data.singleObject };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة المركبة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async updateVehicle(vehicleId, vehicleDto) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Clients/vehicles/${vehicleId}`, vehicleDto);
        if (res?.data?.isDone) {
          await this.fetchClients();
          if (this.selectedClient?.id) {
            await this.fetchClientById(this.selectedClient.id);
          }
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث المركبة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    async deleteVehicle(vehicleId) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Clients/vehicles/${vehicleId}`);
        if (res?.data?.isDone) {
          await this.fetchClients();
          if (this.selectedClient?.id) {
            await this.fetchClientById(this.selectedClient.id);
          }
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المركبة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
      } finally {
        this.loading = false;
      }
    },

    // ==========================================
    // Statements & Financials
    // ==========================================

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
          if (this.selectedClient?.id === dto.clientId) {
            await this.fetchClientById(dto.clientId);
            await this.fetchStatement(dto.clientId);
          }
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
