import { defineStore } from "pinia";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utilities/fetchApi";

export const useOhdaInventoryStore = defineStore("ohdaInventory", {
  state: () => ({
    products: [],
    categories: [],
    suppliers: [],
    inventoryReport: [],
    dashboardMetrics: null,
    movements: [],
    lowStockList: [],
    loading: false
  }),

  getters: {
    totalProductsCount: (state) => state.products.length,
    totalStockQuantity: (state) => state.products.reduce((acc, p) => acc + (Number(p.currentQuantity ?? p.quantity) || 0), 0),
    totalFinancialAssetValue: (state) => state.products.reduce((acc, p) => acc + ((Number(p.currentQuantity ?? p.quantity) || 0) * (Number(p.costPrice ?? p.purchasePrice) || 0)), 0),
    lowStockProducts: (state) => state.products.filter((p) => (Number(p.currentQuantity ?? p.quantity) || 0) <= (Number(p.minQuantity ?? p.minThreshold) || 5)),
    lowStockCount: (state) => state.products.filter((p) => (Number(p.currentQuantity ?? p.quantity) || 0) <= (Number(p.minQuantity ?? p.minThreshold) || 5)).length,

    categoryDistribution: (state) => {
      const counts = {};
      state.products.forEach((p) => {
        const cat = p.categoryName || "عام";
        counts[cat] = (counts[cat] || 0) + (Number(p.currentQuantity ?? p.quantity) || 0);
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
          const raw = Array.isArray(data) ? data : [data];
          this.products = raw.map(p => ({
            ...p,
            costPrice: p.purchasePrice ?? p.costPrice ?? 0,
            sellingPrice: p.unitPrice ?? p.sellingPrice ?? 0,
            unit: p.unit || "قطعة",
            currentQuantity: Number(p.currentQuantity ?? p.quantity ?? 0),
            quantity: Number(p.currentQuantity ?? p.quantity ?? 0),
            minQuantity: Number((p.minQuantity != null && p.minQuantity !== "") ? p.minQuantity : (p.minThreshold || 5)),
            minThreshold: Number((p.minQuantity != null && p.minQuantity !== "") ? p.minQuantity : (p.minThreshold || 5))
          }));
        }
      } catch (err) {
        console.warn("Fetch products API offline, keeping active state", err);
      } finally {
        this.loading = false;
      }
    },

    async recordStockMovement(movementPayload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Product/stock-movement", movementPayload);
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res?.data?.returnMessage || "تم تسجيل حركة المخزون بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل حركة المخزون" };
      } catch (err) {
        console.warn("Record stock movement API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تسجيل حركة المخزون" };
      } finally {
        this.loading = false;
      }
    },

    async fetchProductMovements(productId) {
      try {
        const res = await apiGet(`/api/Product/${productId}/movements`);
        if (res?.data?.isDone) {
          return res.data.objects || [];
        }
        return [];
      } catch (err) {
        console.warn("Fetch product movements API failed", err);
        return [];
      }
    },

    async fetchLowStockProducts() {
      try {
        const res = await apiGet("/api/Product/low-stock");
        if (res?.data?.isDone) {
          this.lowStockList = res.data.objects || [];
          return this.lowStockList;
        }
        return [];
      } catch (err) {
        console.warn("Fetch low stock API failed", err);
        return [];
      }
    },

    async quickUpdateProduct(payload) {
      try {
        const res = await apiPost("/api/Product/quick-update", payload);
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res?.data?.returnMessage || "تم التحديث بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل التحديث" };
      } catch (err) {
        console.warn("Quick update product API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل التحديث" };
      }
    },

    async addProduct(productPayload) {
      this.loading = true;
      try {
        const res = await apiPost("/api/Product", productPayload);
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res?.data?.returnMessage || "تمت إضافة الصنف بنجاح" };
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
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res?.data?.returnMessage || "تم تحديث الصنف بنجاح" };
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
        if (res?.data?.isDone || res?.data?.returnMessage?.includes("غير موجود") || res?.data?.returnMessage?.includes("مسبقاً")) {
          this.products = this.products.filter(p => p.id !== id && p.id !== Number(id));
          return { success: true, message: res?.data?.returnMessage || "تم حذف الصنف بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف المنتج" };
      } catch (err) {
        if (err?.response?.status === 404 || err?.response?.data?.returnMessage?.includes("غير موجود")) {
          this.products = this.products.filter(p => p.id !== id && p.id !== Number(id));
          return { success: true, message: "تمت إزالة الصنف من القائمة" };
        }
        console.warn("Delete product API failed", err);
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف المنتج" };
      }
    },

    async fetchProductBatches(productId) {
      try {
        const res = await apiGet(`/api/Product/${productId}/batches`);
        if (res?.data?.isDone) {
          return res.data.objects || [];
        }
        return [];
      } catch (err) {
        console.warn("Fetch product batches failed", err);
        return [];
      }
    },

    async fetchProductPackages(productId) {
      try {
        const res = await apiGet(`/api/Product/${productId}/packages`);
        if (res?.data?.isDone) {
          return res.data.objects || [];
        }
        return [];
      } catch (err) {
        console.warn("Fetch product packages failed", err);
        return [];
      }
    },

    async addProductPackage(productId, payload) {
      try {
        const res = await apiPost(`/api/Product/${productId}/packages`, payload);
        if (res?.data?.isDone) {
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل إضافة خيار التعبئة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل إضافة خيار التعبئة" };
      }
    },

    async deleteProductPackage(packageId) {
      try {
        const res = await apiDelete(`/api/Product/packages/${packageId}`);
        if (res?.data?.isDone) {
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل حذف خيار التعبئة" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل حذف خيار التعبئة" };
      }
    },

    async runInventoryDiagnosticCheck() {
      try {
        const res = await apiGet("/api/Product/diagnostic-check");
        if (res?.data?.isDone && res?.data?.singleObject) {
          return { success: true, data: res.data.singleObject, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل فحص مطابقة المخزون" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل فحص مطابقة المخزون" };
      }
    },

    async deleteInventoryByProduct(productId) {
      try {
        const res = await apiDelete(`/api/Inventory/product/${productId}`);
        if (res?.data?.isDone) {
          await this.fetchProducts();
          await this.fetchInventory();
          return { success: true, message: res?.data?.returnMessage || "تم تصفية الرصيد بنجاح" };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تصفية الرصيد" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل تصفية الرصيد" };
      }
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

    async bulkMoveCategory(fromCategoryId, toCategoryId) {
      try {
        const res = await apiPost("/api/Category/bulk-move", { fromCategoryId, toCategoryId });
        if (res?.data?.isDone) {
          await this.fetchProducts();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل نقل الأصناف" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || "فشل نقل الأصناف" };
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

    async fetchSupplierStatement(id) {
      try {
        const res = await apiGet(`/api/Supplier/${id}/statement`);
        if (res?.data?.isDone && Array.isArray(res.data.objects)) {
          return res.data.objects;
        }
      } catch (err) {
        console.warn("Fetch supplier statement failed", err);
      }
      return [];
    },

    async recordSupplierPayment(payload) {
      try {
        const res = await apiPost("/api/Supplier/record-payment", payload);
        if (res?.data?.isDone) {
          await this.fetchSuppliers();
          return { success: true, message: res.data.returnMessage };
        }
        return { success: false, message: res?.data?.returnMessage || "فشل تسجيل سداد المورد" };
      } catch (err) {
        return { success: false, message: err?.response?.data?.returnMessage || err.message };
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
