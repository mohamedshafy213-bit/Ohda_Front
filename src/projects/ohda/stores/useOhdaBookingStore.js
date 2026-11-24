import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/utilities/apiClient";

export const useOhdaBookingStore = defineStore("ohdaBookings", () => {
  const bookings = ref([]);
  const bays = ref([]);
  const workingHours = ref([]);
  const holidays = ref([]);
  const todaysBoard = ref(null);
  const capacityIndicator = ref([]);
  const selectedBooking = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // ==========================================
  // Bays
  // ==========================================
  async function fetchBays(onlyActive = false) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Bays", { params: { onlyActive } });
      bays.value = res.data?.objects || res.data?.Objects || (Array.isArray(res.data) ? res.data : []);
      return bays.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function saveBay(bayData) {
    loading.value = true;
    error.value = null;
    try {
      if (bayData.id) {
        await apiClient.put(`/api/Bays/${bayData.id}`, bayData);
      } else {
        await apiClient.post("/api/Bays", bayData);
      }
      await fetchBays();
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteBay(id) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/api/Bays/${id}`);
      await fetchBays();
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // Calendar Settings (Working Hours & Holidays)
  // ==========================================
  async function fetchWorkingHours() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/CalendarSettings/working-hours");
      workingHours.value = res.data?.objects || res.data?.Objects || (Array.isArray(res.data) ? res.data : []);
      return workingHours.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkingHours(days) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.put("/api/CalendarSettings/working-hours", { days });
      await fetchWorkingHours();
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchHolidays(year = null) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/CalendarSettings/holidays", { params: { year } });
      holidays.value = res.data?.objects || res.data?.Objects || (Array.isArray(res.data) ? res.data : []);
      return holidays.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createHoliday(holidayData) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.post("/api/CalendarSettings/holidays", holidayData);
      await fetchHolidays();
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteHoliday(id) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/api/CalendarSettings/holidays/${id}`);
      await fetchHolidays();
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // Bookings
  // ==========================================
  async function fetchBookings(filters = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Bookings", { params: filters });
      bookings.value = res.data?.objects || [];
      return bookings.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAvailability(checkData) {
    try {
      const res = await apiClient.post("/api/Bookings/check-availability", checkData);
      return res.data?.singleObject;
    } catch (err) {
      return {
        isAvailable: false,
        conflictReason: err.response?.data?.returnMessage || err.message
      };
    }
  }

  async function createBooking(bookingData) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post("/api/Bookings", bookingData);
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateBookingStatus(id, status, notes = "") {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.put(`/api/Bookings/${id}/status`, { status, notes });
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function convertToJob(id) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post(`/api/Bookings/${id}/convert-to-job`);
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createInstantWalkIn(data) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.post("/api/Bookings/instant-walkin", data);
      return { success: true, data: res.data?.singleObject || res.data };
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message || "تعذر تسجيل الحضور الفوري";
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function fetchTodaysBoard() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get("/api/Bookings/todays-board");
      todaysBoard.value = res.data?.singleObject || null;
      return todaysBoard.value;
    } catch (err) {
      error.value = err.response?.data?.returnMessage || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCapacityIndicator() {
    try {
      const res = await apiClient.get("/api/Bookings/capacity-indicator");
      capacityIndicator.value = res.data?.objects || [];
      return capacityIndicator.value;
    } catch (err) {
      console.warn("fetchCapacityIndicator error:", err);
      return [];
    }
  }

  return {
    bookings,
    bays,
    workingHours,
    holidays,
    todaysBoard,
    capacityIndicator,
    selectedBooking,
    loading,
    error,
    fetchBays,
    saveBay,
    deleteBay,
    fetchWorkingHours,
    updateWorkingHours,
    fetchHolidays,
    createHoliday,
    deleteHoliday,
    fetchBookings,
    checkAvailability,
    createBooking,
    updateBookingStatus,
    convertToJob,
    createInstantWalkIn,
    fetchTodaysBoard,
    fetchCapacityIndicator
  };
});
