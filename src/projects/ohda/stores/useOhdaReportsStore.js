import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/utilities/apiClient";

export const useOhdaReportsStore = defineStore("ohdaReports", () => {
  const kpis = ref(null);
  const customerSpending = ref([]);
  const customerAcquisition = ref([]);
  const bookingsAnalytics = ref(null);
  const remindersConversion = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchKpis() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Reports/kpis");
      kpis.value = res.data?.singleObject || null;
      return kpis.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCustomerSpending(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Reports/customers-spending", { params });
      customerSpending.value = res.data?.objects || [];
      return customerSpending.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCustomerAcquisition(months = 6) {
    try {
      const res = await apiClient.get("/api/Reports/customer-acquisition", { params: { months } });
      customerAcquisition.value = res.data?.objects || [];
      return customerAcquisition.value;
    } catch (err) {
      console.warn("fetchCustomerAcquisition error:", err);
      return [];
    }
  }

  async function fetchBookingsAnalytics(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Reports/bookings-analytics", { params });
      bookingsAnalytics.value = res.data?.singleObject || null;
      return bookingsAnalytics.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRemindersConversion(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Reports/reminders-conversion", { params });
      remindersConversion.value = res.data?.singleObject || null;
      return remindersConversion.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    kpis,
    customerSpending,
    customerAcquisition,
    bookingsAnalytics,
    remindersConversion,
    loading,
    error,
    fetchKpis,
    fetchCustomerSpending,
    fetchCustomerAcquisition,
    fetchBookingsAnalytics,
    fetchRemindersConversion
  };
});
