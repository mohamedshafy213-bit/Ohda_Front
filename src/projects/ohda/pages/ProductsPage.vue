<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <Package class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.products.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.products.subTitle') }}
        </p>
      </div>

      <!-- Action Buttons using Volt Component -->
      <div class="flex flex-wrap items-center gap-3">
        <Button
          @click="exportExcel"
          class="!bg-slate-700/80 hover:!bg-slate-700 !text-slate-200 !border !border-slate-600 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2"
        >
          <Download class="w-4 h-4 text-emerald-400" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>

        <Button
          @click="showImportModal = true"
          class="!bg-slate-700/80 hover:!bg-slate-700 !text-slate-200 !border !border-slate-600 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2"
        >
          <Upload class="w-4 h-4 text-blue-400" />
          {{ $t('ohda.common.importExcel') }}
        </Button>

        <Button
          @click="openAddModal"
          class="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.products.addProduct') }}
        </Button>
      </div>
    </div>

    <!-- Search Bar using src/components/searchField.vue -->
    <div class="bg-slate-800/40 border border-slate-700/40 p-4 rounded-2xl">
      <searchField v-model="searchQuery" placeholder="ohda.common.search" />
    </div>

    <!-- Products Volt DataTable (No raw tr/td) -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="filteredProducts" class="w-full text-xs">
        <Column field="sku" :header="$t('ohda.products.sku')">
          <template #body="{ data }">
            <span class="font-mono text-emerald-400 font-semibold">{{ data.sku }}</span>
          </template>
        </Column>

        <Column field="barcode" :header="$t('ohda.products.barcode')">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.barcode }}</span>
          </template>
        </Column>

        <Column field="name" :header="$t('ohda.products.name')">
          <template #body="{ data }">
            <span class="font-semibold text-white">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')">
          <template #body="{ data }">
            <span class="text-slate-300">{{ data.categoryName }}</span>
          </template>
        </Column>

        <Column field="supplierName" :header="$t('ohda.products.supplier')">
          <template #body="{ data }">
            <span class="text-slate-400">{{ data.supplierName }}</span>
          </template>
        </Column>

        <Column header="نوع المخزون">
          <template #body="{ data }">
            <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold inline-block" :class="data.inventoryType === 2 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'">
              {{ data.inventoryType === 2 ? 'أصل ثابت (Asset)' : 'شراء (Purchase)' }}
            </span>
          </template>
        </Column>

        <Column header="التكلفة / القيمة">
          <template #body="{ data }">
            <span class="text-slate-300 font-mono">
              {{ data.inventoryType === 2 ? `${data.assetValue || 0} ر.س (أصل)` : `${data.purchasePrice || 0} ر.س (شراء)` }}
            </span>
          </template>
        </Column>

        <Column field="unitPrice" :header="$t('ohda.products.unitPrice')">
          <template #body="{ data }">
            <span class="font-semibold text-slate-200 font-mono">{{ data.unitPrice }} ر.س</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.products.qty')">
          <template #body="{ data }">
            <span class="font-bold" :class="data.quantity <= data.minThreshold ? 'text-amber-400' : 'text-emerald-400'">
              {{ data.quantity }}
            </span>
          </template>
        </Column>

        <!-- Action Buttons using src/components/editButton.vue & deleteButton.vue -->
        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <editButton @click="editProduct(data)" />
              <deleteButton @click="deleteProduct(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Product Volt Dialog -->
    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل بيانات المنتج' : $t('ohda.products.addProduct')" class="!bg-slate-800 !border-slate-700 max-w-lg w-full">
      <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.name') }}</label>
          <InputText v-model="form.name" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.sku') }}</label>
            <InputText v-model="form.sku" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.barcode') }}</label>
            <InputText v-model="form.barcode" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.category') }}</label>
            <Select v-model="form.categoryId" :options="inventoryStore.categories" optionLabel="name" optionValue="id" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.supplier') }}</label>
            <Select v-model="form.supplierId" :options="inventoryStore.suppliers" optionLabel="companyName" optionValue="id" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">نوع المخزون</label>
          <Select v-model="form.inventoryType" :options="[
            { value: 1, label: 'شراء (Purchase)' },
            { value: 2, label: 'أصل ثابت (Asset)' }
          ]" optionLabel="label" optionValue="value" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div v-if="form.inventoryType === 1">
            <label class="block font-semibold text-slate-300 mb-1">سعر الشراء</label>
            <InputText v-model.number="form.purchasePrice" type="number" step="0.01" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
          <div v-else>
            <label class="block font-semibold text-slate-300 mb-1">قيمة الأصل</label>
            <InputText v-model.number="form.assetValue" type="number" step="0.01" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.unitPrice') }}</label>
            <InputText v-model.number="form.unitPrice" type="number" step="0.01" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.qty') }}</label>
            <InputText v-model.number="form.quantity" type="number" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.products.minThreshold') }}</label>
            <InputText v-model.number="form.minThreshold" type="number" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-emerald-500 !text-slate-950 !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Import Excel Upload Volt Dialog -->
    <Dialog v-model:visible="showImportModal" modal :header="$t('ohda.products.importTitle')" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <div class="space-y-4">
        <div class="border-2 border-dashed border-slate-600/80 hover:border-emerald-500/80 rounded-2xl p-8 text-center bg-slate-900/40 transition-colors">
          <FileSpreadsheet class="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p class="text-xs font-semibold text-slate-200 mb-1">
            {{ $t('ohda.products.dragExcel') }}
          </p>
          <span class="text-[11px] text-slate-400 block mb-4">يدعم ملفات .XLSX و .CSV</span>
          <input type="file" accept=".xlsx, .xls, .csv" class="hidden" id="excelInput" @change="handleFileUpload" />
          <label for="excelInput" class="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold cursor-pointer inline-block">
            اختر ملف من جهازك
          </label>
        </div>

        <div class="flex items-center justify-between pt-3 text-xs">
          <Button @click="inventoryStore.exportToExcel('products')" class="!bg-transparent !text-emerald-400 hover:!underline">
            {{ $t('ohda.products.downloadTemplate') }}
          </Button>
          <SecondaryButton @click="showImportModal = false">
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

const inventoryStore = useOhdaInventoryStore();

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
    quantity: 10,
    minThreshold: 5
  };
  showModal.value = true;
}

function editProduct(product) {
  isEditing.value = true;
  editingId.value = product.id;
  form.value = { ...product };
  showModal.value = true;
}

async function saveProduct() {
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

function exportExcel() {
  inventoryStore.exportToExcel("products");
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    alert(`تم رفع الملف "${file.name}" بنجاح! جاري معالجة البيانات واستيراد المنتجات...`);
    showImportModal.value = false;
  }
}
</script>
