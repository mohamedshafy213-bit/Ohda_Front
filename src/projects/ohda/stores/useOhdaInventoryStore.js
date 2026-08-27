import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaInventoryStore = defineStore("ohdaInventory", {
  state: () => ({
    products: [],
    categories: [],
    suppliers: [],
    inventoryReport: [],
    dashboardMetrics: null,
    loading: false
  }),

  getters: {
    totalProductsCount: (state) => state.products.length,
    totalStockQuantity: (state) => state.products.reduce((acc, p) => acc + (p.quantity || 0), 0),
    totalFinancialAssetValue: (state) => state.products.reduce((acc, p) => acc + ((p.quantity || 0) * (p.unitPrice || 0)), 0),
    lowStockProducts: (state) => state.products.filter((p) => (p.quantity || 0) <= (p.minThreshold || 5)),
    lowStockCount: (state) => state.products.filter((p) => (p.quantity || 0) <= (p.minThreshold || 5)).length,

    categoryDistribution: (state) => {
      const counts = {};
      state.products.forEach((p) => {
        const cat = p.categoryName || "عام";
        counts[cat] = (counts[cat] || 0) + (p.quantity || 0);
      });
      return counts;
    }
  },

  actions: {
    // ------------------------------------
    // Products Endpoints (/api/Product)
    // ------------------------------------
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await apiGet("/api/Product");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.products = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch products API offline, keeping active state", err);
      } finally {
        this.loading = false;
      }
    },

    async addProduct(productPayload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Product", productPayload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.products.unshift(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة المنتج" };
      } catch (err) {
        console.warn("Add product API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة المنتج" };
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productPayload) {
      try {
        const res = await apiPut(`/api/Product/${id}`, productPayload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.products.findIndex(p => p.id === id);
          if (idx !== -1) {
            this.products[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث المنتج" };
      } catch (err) {
        console.warn("Update product API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث المنتج" };
      }
    },

    async deleteProduct(id) {
      try {
        const res = await apiDelete(`/api/Product/${id}`);
        if (res?.data?.isDone) {
          this.products = this.products.filter(p => p.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المنتج" };
      } catch (err) {
        console.warn("Delete product API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف المنتج" };
      }
    },

    async adjustStockQuantity(productId, deltaQty) {
      const product = this.products.find(p => p.id === productId);
      if (!product) {
        return { success: false, message: "المنتج غير موجود" };
      }
      const updatedPayload = {
        ...product,
        quantity: Math.max(0, (product.quantity || 0) + deltaQty)
      };
      return this.updateProduct(productId, updatedPayload);
    },

    // ------------------------------------
    // Categories Endpoints (/api/Category)
    // ------------------------------------
    async fetchCategories() {
      try {
        const res = await apiGet("/api/Category");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.categories = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch categories API fallback", err);
      }
    },

    async addCategory(payload) {
      try {
        const res = await apiPost("/api/Category", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.categories.push(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة التصنيف" };
      } catch (err) {
        console.warn("Add category API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة التصنيف" };
      }
    },

    async updateCategory(id, payload) {
      try {
        const res = await apiPut(`/api/Category/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.categories.findIndex(c => c.id === id);
          if (idx !== -1) {
            this.categories[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث التصنيف" };
      } catch (err) {
        console.warn("Update category API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث التصنيف" };
      }
    },

    async deleteCategory(id) {
      try {
        const res = await apiDelete(`/api/Category/${id}`);
        if (res?.data?.isDone) {
          this.categories = this.categories.filter(c => c.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف التصنيف" };
      } catch (err) {
        console.warn("Delete category API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف التصنيف" };
      }
    },

    // ------------------------------------
    // Suppliers Endpoints (/api/Supplier)
    // ------------------------------------
    async fetchSuppliers() {
      try {
        const res = await apiGet("/api/Supplier");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.suppliers = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch suppliers API fallback", err);
      }
    },

    async addSupplier(payload) {
      try {
        const res = await apiPost("/api/Supplier", payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          this.suppliers.push(res.data.singleObject);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة المورد" };
      } catch (err) {
        console.warn("Add supplier API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة المورد" };
      }
    },

    async updateSupplier(id, payload) {
      try {
        const res = await apiPut(`/api/Supplier/${id}`, payload);
        if (res?.data?.isDone && res?.data?.singleObject) {
          const idx = this.suppliers.findIndex(s => s.id === id);
          if (idx !== -1) {
            this.suppliers[idx] = res.data.singleObject;
          }
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تحديث المورد" };
      } catch (err) {
        console.warn("Update supplier API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تحديث المورد" };
      }
    },

    async deleteSupplier(id) {
      try {
        const res = await apiDelete(`/api/Supplier/${id}`);
        if (res?.data?.isDone) {
          this.suppliers = this.suppliers.filter(s => s.id !== id);
          return { success: true };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المورد" };
      } catch (err) {
        console.warn("Delete supplier API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف المورد" };
      }
    },

    // ------------------------------------
    // Inventory & Dashboard (/api/Inventory & /api/Dashboard)
    // ------------------------------------
    async fetchInventory() {
      try {
        const res = await apiGet("/api/Inventory");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.inventoryReport = Array.isArray(data) ? data : [data];
        }
      } catch (err) {
        console.warn("Fetch inventory API fallback", err);
      }
    },

    async fetchDashboardMetrics() {
      try {
        const res = await apiGet("/api/Dashboard");
        const data = res?.data?.objects || res?.data?.singleObject;
        if (res?.data?.isDone && data) {
          this.dashboardMetrics = data;
        }
      } catch (err) {
        console.warn("Fetch dashboard API fallback", err);
      }
    },

    // ------------------------------------
    // Excel Import & Export (/api/Excel/*)
    // ------------------------------------
    async exportToExcel(entityName) {
      try {
        const res = await apiGet(`/api/Excel/export/${entityName}`, { responseType: 'blob' });
        if (res?.data) {
          const url = URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.download = `Ohda_${entityName}_Export.xlsx`;
          link.click();
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn("API Excel Export fallback, saving JSON file locally", err);
      }

      const dataStr = JSON.stringify(this[entityName] || this.products, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Ohda_${entityName}_Export_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    async importExcelProducts(file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await apiPost("/api/Excel/import/products", formData);
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل استيراد المنتجات" };
      } catch (err) {
        console.warn("Excel Import API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل استيراد المنتجات" };
      }
    },

    async downloadExcelTemplate() {
      try {
        const res = await apiGet("/api/Excel/export/template/products", { responseType: 'blob' });
        if (res?.data) {
          const url = URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.download = "Products_Import_Template.xlsx";
          link.click();
          URL.revokeObjectURL(url);
          return { success: true };
        }
        return { success: false, message: "فشل تحميل قالب Excel" };
      } catch (err) {
        console.warn("Failed to download template", err);
        return { success: false, message: "فشل تحميل قالب Excel" };
      }
    },

    // Barcode scanner simulator
    findProductByBarcode(code) {
      const trimmed = String(code).trim();
      return this.products.find(p => p.barcode === trimmed || p.sku === trimmed);
    }
  }
});
