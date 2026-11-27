import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaHRStore = defineStore("ohdaHR", {
  state: () => ({
    employees: [],
    attendanceRecords: [],
    payrolls: [],
    loading: false
  }),

  getters: {
    totalEmployeesCount: (state) => state.employees.length,
    activeEmployeesCount: (state) => state.employees.filter(e => e.isActive).length,

    totalMonthlyPayrollAmount: (state) => {
      return state.payrolls.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);
    },

    paidPayrollAmount: (state) => {
      return state.payrolls
        .filter(p => p.isPaid)
        .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);
    },

    unpaidPayrollAmount: (state) => {
      return state.payrolls
        .filter(p => !p.isPaid)
        .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);
    }
  },

  actions: {
    // ----------------------------------------
    // 1. Employees Actions
    // ----------------------------------------
    async fetchEmployees(onlyActive = false) {
      this.loading = true;
      try {
        const url = onlyActive ? "/api/Employee?onlyActive=true" : "/api/Employee";
        const res = await apiGet(url);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.employees = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.employees = [];
        }
      } catch (err) {
        console.warn("Fetch employees failed", err);
      } finally {
        this.loading = false;
      }
    },

    async createEmployee(payload) {
      this.loading = true;
      try {
        const cleanPayload = { ...payload };
        if (!cleanPayload.userId || cleanPayload.userId === "") {
          cleanPayload.userId = null;
        } else {
          cleanPayload.userId = Number(cleanPayload.userId);
        }
        const res = await apiPost("/api/Employee", cleanPayload);
        if (res?.data?.isDone) {
          await this.fetchEmployees();
          return {
            success: true,
            message: res?.data?.returnMessage || "تمت إضافة الموظف بنجاح",
            data: res.data.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل إضافة الموظف"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء إضافة الموظف"
        };
      } finally {
        this.loading = false;
      }
    },

    async updateEmployee(id, payload) {
      this.loading = true;
      try {
        const cleanPayload = { ...payload };
        if (!cleanPayload.userId || cleanPayload.userId === "") {
          cleanPayload.userId = null;
        } else {
          cleanPayload.userId = Number(cleanPayload.userId);
        }
        const res = await apiPut(`/api/Employee/${id}`, cleanPayload);
        if (res?.data?.isDone) {
          await this.fetchEmployees();
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تحديث بيانات الموظف بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تحديث بيانات الموظف"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء التحديث"
        };
      } finally {
        this.loading = false;
      }
    },

    async deleteEmployee(id) {
      this.loading = true;
      try {
        const res = await apiDelete(`/api/Employee/${id}`);
        if (res?.data?.isDone) {
          this.employees = this.employees.filter(e => e.id !== id);
          return {
            success: true,
            message: res?.data?.returnMessage || "تم حذف الموظف بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل حذف الموظف"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء الحذف"
        };
      } finally {
        this.loading = false;
      }
    },

    // ----------------------------------------
    // 2. Attendance Actions
    // ----------------------------------------
    async fetchAttendance(date = null) {
      this.loading = true;
      try {
        const d = date || new Date().toISOString().split("T")[0];
        const res = await apiGet(`/api/Employee/attendance?date=${d}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.attendanceRecords = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.attendanceRecords = [];
        }
      } catch (err) {
        console.warn("Fetch attendance failed", err);
      } finally {
        this.loading = false;
      }
    },

    async saveAttendanceBatch(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Employee/attendance", payload);
        if (res?.data?.isDone) {
          return {
            success: true,
            message: res?.data?.returnMessage || "تم حفظ كشف الحضور بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل حفظ الحضور"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء حفظ الحضور"
        };
      } finally {
        this.loading = false;
      }
    },

    // ----------------------------------------
    // 3. Payroll Actions
    // ----------------------------------------
    async fetchPayroll(month = null, year = null) {
      this.loading = true;
      try {
        const now = new Date();
        const m = month || (now.getMonth() + 1);
        const y = year || now.getFullYear();
        const res = await apiGet(`/api/Employee/payroll?month=${m}&year=${y}`);
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.payrolls = Array.isArray(data) ? data : [data];
        } else if (res?.data?.isDone && !data) {
          this.payrolls = [];
        }
      } catch (err) {
        console.warn("Fetch payroll failed", err);
      } finally {
        this.loading = false;
      }
    },

    async generatePayroll(month, year) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Employee/payroll/generate", { month, year });
        if (res?.data?.isDone) {
          await this.fetchPayroll(month, year);
          return {
            success: true,
            message: res?.data?.returnMessage || "تم توليد مسير الرواتب بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل توليد مسير الرواتب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء توليد الرواتب"
        };
      } finally {
        this.loading = false;
      }
    },

    async updatePayrollItem(id, payload) {
      this.loading = true;
      try {
        const res = await apiPut(`/api/Employee/payroll/${id}`, payload);
        if (res?.data?.isDone) {
          return {
            success: true,
            message: res?.data?.returnMessage || "تم تحديث بنود الراتب بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل تحديث الراتب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء التحديث"
        };
      } finally {
        this.loading = false;
      }
    },

    async paySalary(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Employee/payroll/pay", payload);
        if (res?.data?.isDone) {
          return {
            success: true,
            message: res?.data?.returnMessage || "تم صرف الراتب وتسجيله في المصروفات بنجاح"
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل صرف الراتب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء صرف الراتب"
        };
      } finally {
        this.loading = false;
      }
    },

    async quickPayEmployee(payload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Employee/quick-pay", payload);
        if (res?.data?.isDone) {
          return {
            success: true,
            message: res?.data?.returnMessage || "تم صرف الراتب وتسجيل المصروف بنجاح",
            data: res.data?.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "فشل صرف الراتب"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء صرف الراتب"
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchEmployeeJobCards(employeeId, month = null, year = null) {
      this.loading = true;
      try {
        let url = `/api/Employee/${employeeId}/jobcards-history`;
        const params = [];
        if (month) params.push(`month=${month}`);
        if (year) params.push(`year=${year}`);
        if (params.length) url += `?${params.join("&")}`;
        const res = await apiGet(url);
        if (res?.data?.isDone) {
          return {
            success: true,
            data: res.data?.singleObject
          };
        }
        return {
          success: false,
          message: res?.data?.returnMessage || "تعذر جلب ملف أوامر الشغل"
        };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.returnMessage || err.message || "حدث خطأ أثناء جلب ملف أوامر الشغل"
        };
      } finally {
        this.loading = false;
      }
    }
  }
});
