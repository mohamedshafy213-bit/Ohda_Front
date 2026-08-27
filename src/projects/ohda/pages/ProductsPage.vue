<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Package class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.products.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.products.subTitle') }}
        </p>
      </div>

      <!-- Action Buttons using Volt Component -->
      <div class="flex flex-wrap items-center gap-3">
        <Button
          @click="exportExcel"
          class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>

        <Button
          @click="showImportModal = true"
          class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          {{ $t('ohda.common.importExcel') }}
        </Button>

        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.products.addProduct') }}
        </Button>
      </div>
    </div>

    <!-- Search Bar using src/components/searchField.vue -->
    <div class="bg-brand-white border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" placeholder="ohda.common.search" />
    </div>

    <!-- Products Volt DataTable (No raw tr/td) -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="filteredProducts" class="w-full text-xs">
        <Column field="sku" :header="$t('ohda.products.sku')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold">{{ data.sku }}</span>
          </template>
        </Column>

        <Column field="barcode" :header="$t('ohda.products.barcode')">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.barcode }}</span>
          </template>
        </Column>

        <Column field="name" :header="$t('ohda.products.name')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.categoryName }}</span>
          </template>
        </Column>

        <Column field="supplierName" :header="$t('ohda.products.supplier')">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.supplierName }}</span>
          </template>
        </Column>

        <Column header="نوع المخزون">
          <template #body="{ data }">
            <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold inline-block" :class="data.inventoryType === 2 ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' : 'bg-blue-500/10 text-blue-700 border border-blue-500/20'">
              {{ data.inventoryType === 2 ? 'أصل ثابت (Asset)' : 'شراء (Purchase)' }}
            </span>
          </template>
        </Column>

        <Column header="التكلفة / القيمة">
          <template #body="{ data }">
            <span class="text-brand-dark font-mono">
              {{ data.inventoryType === 2 ? `${data.assetValue || 0} ر.س (أصل)` : `${data.purchasePrice || 0} ر.س (شراء)` }}
            </span>
          </template>
        </Column>

        <Column field="unitPrice" :header="$t('ohda.products.unitPrice')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark font-mono">{{ data.unitPrice }} ر.س</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.products.qty')">
          <template #body="{ data }">
            <span class="font-bold" :class="data.quantity <= data.minThreshold ? 'text-amber-600' : 'text-brand-accent'">
              {{ data.quantity }}
            </span>
          </template>
        </Column>

        <!-- Action Buttons using src/components/editButton.vue & deleteButton.vue -->
        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button @click="viewProductSerials(data)" class="!bg-brand-light hover:!bg-brand-soft !text-brand-gray hover:!text-brand-accent !border-none !rounded-xl !p-1.5 flex items-center justify-center cursor-pointer" title="عرض الأرقام التسلسلية">
                <Eye class="w-3.5 h-3.5" />
              </Button>
              <editButton @click="editProduct(data)" />
              <deleteButton @click="deleteProduct(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Product Volt Dialog -->
    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل بيانات المنتج' : $t('ohda.products.addProduct')" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.name') }}</label>
          <InputText v-model="form.name" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.sku') }}</label>
            <InputText v-model="form.sku" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.barcode') }}</label>
            <InputText v-model="form.barcode" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.category') }}</label>
            <Select v-model="form.categoryId" :options="inventoryStore.categories" optionLabel="name" optionValue="id" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.supplier') }}</label>
            <Select v-model="form.supplierId" :options="inventoryStore.suppliers" optionLabel="companyName" optionValue="id" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">نوع المخزون</label>
          <Select v-model="form.inventoryType" :options="[
            { value: 1, label: 'شراء (Purchase)' },
            { value: 2, label: 'أصل ثابت (Asset)' }
          ]" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div v-if="form.inventoryType === 1">
            <label class="block font-semibold text-brand-dark mb-1">سعر الشراء</label>
            <InputText v-model.number="form.purchasePrice" type="number" step="0.01" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
          </div>
          <div v-else>
            <label class="block font-semibold text-brand-dark mb-1">قيمة الأصل</label>
            <InputText v-model.number="form.assetValue" type="number" step="0.01" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.unitPrice') }}</label>
            <InputText v-model.number="form.unitPrice" type="number" step="0.01" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.qty') }}</label>
            <InputText v-model.number="form.amount" type="number" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.products.minThreshold') }}</label>
            <InputText v-model.number="form.minThreshold" type="number" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Import Excel Upload Volt Dialog -->
    <Dialog v-model:visible="showImportModal" modal :header="$t('ohda.products.importTitle')" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <div class="space-y-4">
        <div class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light transition-colors">
          <FileSpreadsheet class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="text-xs font-semibold text-brand-dark mb-1">
            {{ $t('ohda.products.dragExcel') }}
          </p>
          <span class="text-[11px] text-brand-gray block mb-4">يدعم ملفات .XLSX و .CSV</span>
          <input type="file" accept=".xlsx, .xls, .csv" class="hidden" id="excelInput" @change="handleFileUpload" />
          <label for="excelInput" class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer inline-block">
            اختر ملف من جهازك
          </label>
        </div>

        <div class="flex items-center justify-between pt-3 text-xs border-t border-brand-gray/10">
          <Button @click="downloadTemplate" class="!bg-transparent !text-brand-accent hover:!underline">
            {{ $t('ohda.products.downloadTemplate') }}
          </Button>
          <SecondaryButton @click="showImportModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- View Serials Dialog -->
    <Dialog v-model:visible="showSerialsModal" modal :header="`الأرقام التسلسلية: ${selectedProductForSerials?.name || ''}`" class="!bg-brand-white !border-brand-gray/15 max-w-2xl w-full !text-brand-dark">
      <div class="space-y-4 text-xs">
        <div v-if="loadingSerials" class="text-center py-8">
          <svg class="animate-spin h-6 w-6 text-brand-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-brand-gray mt-2 block">جاري تحميل الأرقام التسلسلية...</span>
        </div>

        <div v-else-if="productSerials.length === 0" class="p-8 text-center text-brand-gray">
          <Package class="w-12 h-12 text-brand-gray/50 mx-auto mb-2" />
          لا توجد أرقام تسلسلية مسجلة لهذا المنتج حالياً.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
          <div
            v-for="item in productSerials"
            :key="item.id"
            class="flex items-center gap-4 p-3 bg-brand-light border border-brand-gray/15 rounded-xl"
          >
            <!-- QR Code -->
            <div class="flex-shrink-0 bg-white p-1 rounded-lg border border-brand-gray/10">
              <svg class="w-14 h-14" viewBox="0 0 29 29">
                <path d="M0 0h9v9H0zm1 1h7v7H1zm18-1h9v9h-9zm1 1h7v7h-7zM0 19h9v9H0zm1 1h7v7H1zm18 0v2h2v-2zm4 0v2h2v-2zm-2 2v2h2v-2zm4 0v2h2v-2zm-6 2v2h2v-2zm4 0v2h2v-2zm-4-4h2v2h-2zm4 0h2v2h-2zm0 6h2v3h-2zm-6-2h2v2h-2zm12-4h2v2h-2z" fill="#101828" shape-rendering="crispEdges"/>
              </svg>
            </div>

            <!-- Item details -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono font-bold text-brand-dark text-sm select-all truncate">{{ item.serialNumber }}</span>
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                  :class="item.status === 1 ? 'bg-brand-soft text-brand-accent border-brand-accent/20' : 'bg-red-500/10 text-red-750 border-red-500/20'"
                >
                  {{ item.status === 1 ? 'متوفر' : 'منصرف عهدة' }}
                </span>
              </div>

              <!-- Recipient and placement log details if exited -->
              <div v-if="item.status === 2" class="text-[10px] text-brand-gray space-y-0.5">
                <div class="flex items-center gap-1">
                  <span class="font-semibold text-brand-gray">المستلم:</span>
                  <span class="truncate text-brand-dark font-medium">{{ item.holderName || 'غير محدد' }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="font-semibold text-brand-gray">الجهة/المكان:</span>
                  <span class="truncate text-brand-dark font-medium">{{ item.holderPlace || 'غير محدد' }}</span>
                </div>
              </div>
              <div v-else class="text-[10px] text-brand-accent font-semibold">
                جاهز للصرف من المستودع
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showSerialsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { apiGet } from "@/utilities/fetchApi";

const inventoryStore = useOhdaInventoryStore();
const showSerialsModal = ref(false);
const loadingSerials = ref(false);
const productSerials = ref([]);
const selectedProductForSerials = ref(null);

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchCategories();
  inventoryStore.fetchSuppliers();
});

const searchQuery = ref("");
const showModal = ref(false);
const showImportModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const form = ref({
  name: "",
  sku: "",
  barcode: "",
  categoryId: 1,
  supplierId: 1,
  inventoryType: 1,
  purchasePrice: 0,
  assetValue: 0,
  unitPrice: 0,
  amount: 1,
  quantity: 1,
  minThreshold: 5
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return inventoryStore.products;
  const q = searchQuery.value.toLowerCase();
  return inventoryStore.products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q)
  );
});

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    name: "",
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `629${Math.floor(100000000 + Math.random() * 900000000)}`,
    categoryId: inventoryStore.categories[0]?.id || 1,
    supplierId: inventoryStore.suppliers[0]?.id || 1,
    inventoryType: 1,
    purchasePrice: 100,
    assetValue: 0,
    unitPrice: 150,
    amount: 10,
    quantity: 10,
    minThreshold: 5
  };
  showModal.value = true;
}

function editProduct(product) {
  isEditing.value = true;
  editingId.value = product.id;
  form.value = {
    ...product,
    amount: product.amount || product.quantity || 0
  };
  showModal.value = true;
}

async function saveProduct() {
  // Sync both values for API/UI compatibility
  form.value.quantity = form.value.amount;
  if (isEditing.value) {
    await inventoryStore.updateProduct(editingId.value, form.value);
  } else {
    await inventoryStore.addProduct(form.value);
  }
  showModal.value = false;
}

async function deleteProduct(id) {
  if (confirm("هل أنت تأكد من رغبتك في حذف هذا المنتج؟")) {
    await inventoryStore.deleteProduct(id);
  }
}

async function viewProductSerials(product) {
  selectedProductForSerials.value = product;
  productSerials.value = [];
  showSerialsModal.value = true;
  loadingSerials.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/product/${product.id}`);
    if (res?.data?.isDone) {
      productSerials.value = res.data.objects || (res.data.singleObject ? [res.data.singleObject] : []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingSerials.value = false;
  }
}

function exportExcel() {
  inventoryStore.exportToExcel("products");
}

async function downloadTemplate() {
  const res = await inventoryStore.downloadExcelTemplate();
  if (!res.success) {
    alert(res.message);
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const res = await inventoryStore.importExcelProducts(file);
    if (res.success) {
      alert(res.message || "تم استيراد المنتجات بنجاح!");
      showImportModal.value = false;
    } else {
      alert(res.message || "حدث خطأ أثناء استيراد المنتجات");
    }
  }
}
</script>
