<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <List class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.inventory.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.inventory.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          @click="showPdfModal = true"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !border-none !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-brand-accent/10"
        >
          <Upload class="w-4 h-4 text-brand-dark" />
          تفريغ دفتر العهد (PDF)
        </Button>

        <Button
          @click="inventoryStore.exportToExcel('products')"
          class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>
      </div>
    </div>

    <!-- Inventory Stock Volt DataTable (No raw tr/td) -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="inventoryStore.products" class="w-full text-xs">
        <Column field="name" :header="$t('ohda.products.name')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="sku" :header="$t('ohda.products.sku')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold">{{ data.sku }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.categoryName }}</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.dashboard.currentQty')">
          <template #body="{ data }">
            <span class="font-bold text-lg" :class="getStockColorClass(data)">
              {{ data.quantity }}
            </span>
          </template>
        </Column>

        <Column field="minThreshold" :header="$t('ohda.products.minThreshold')">
          <template #body="{ data }">
            <span class="text-brand-gray font-mono">{{ data.minThreshold }}</span>
          </template>
        </Column>

        <!-- Stock Level Progress Meter -->
        <Column :header="$t('ohda.inventory.stockLevel')">
          <template #body="{ data }">
            <div class="space-y-1 w-44">
              <div class="w-full bg-brand-light rounded-full h-2 overflow-hidden border border-brand-gray/15">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getBarColor(data)"
                  :style="{ width: `${Math.min(100, (data.quantity / (data.minThreshold * 3)) * 100)}%` }"
                ></div>
              </div>
              <span class="text-[10px] text-brand-gray font-mono block">
                {{ Math.round((data.quantity / (data.minThreshold * 3)) * 100) }}% من الأمان
              </span>
            </div>
          </template>
        </Column>

        <!-- Stock Status Badge -->
        <Column :header="$t('ohda.inventory.stockStatus')">
          <template #body="{ data }">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-bold border inline-block"
              :class="getStatusBadgeClass(data)"
            >
              {{ getStatusText(data) }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Import PDF Dialog -->
    <Dialog v-model:visible="showPdfModal" modal header="تفريغ دفتر العهد العسكري (حساب صنف PDF)" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full font-sans !text-brand-dark">
      <div class="space-y-4 text-xs">
        <div
          class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onPdfDrop"
          @click="triggerPdfSelect"
        >
          <Upload class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="font-semibold text-brand-dark mb-1">اسحب ملف PDF دفتر العهد هنا أو اضغط للاختيار</p>
          <span class="text-[10px] text-brand-gray block mb-4">يدعم فقط ملفات PDF الخاصة بـ "حساب صنف"</span>
          <input type="file" ref="pdfInput" accept=".pdf" class="hidden" @change="onPdfSelected" />
          <button class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer">
            تصفح الملفات
          </button>
        </div>

        <div v-if="uploadingPdf" class="space-y-2">
          <div class="flex justify-between text-brand-gray">
            <span>جاري استخراج الأصناف وتوليد الأرقام التسلسلية...</span>
            <span class="font-bold text-brand-accent">تحليل ملف PDF...</span>
          </div>
          <div class="w-full bg-brand-light rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showPdfModal = false">إغلاق</SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import axios from "@/utilities/apiClient";

const inventoryStore = useOhdaInventoryStore();
const showPdfModal = ref(false);
const uploadingPdf = ref(false);
const pdfInput = ref(null);

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchInventory();
});

const triggerPdfSelect = () => {
  pdfInput.value.click();
};

const onPdfSelected = (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadPdfFile(file);
  }
};

const onPdfDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    uploadPdfFile(file);
  }
};

const uploadPdfFile = async (file) => {
  uploadingPdf.value = true;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post("/api/Inventory/import/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res?.data?.isDone) {
      alert(res.data.returnMessage || "تم تحليل وتفريغ دفتر العهد وتحديث المخزون بنجاح!");
      showPdfModal.value = false;
      inventoryStore.fetchProducts();
      inventoryStore.fetchInventory();
    } else {
      alert(res?.data?.returnMessage || "فشل تحليل ملف PDF.");
    }
  } catch (err) {
    alert("حدث خطأ أثناء رفع وتحليل ملف PDF.");
  } finally {
    uploadingPdf.value = false;
  }
};

function getStockColorClass(product) {
  if (product.quantity === 0) return "text-red-650";
  if (product.quantity <= product.minThreshold) return "text-amber-600";
  return "text-brand-accent";
}

function getBarColor(product) {
  if (product.quantity === 0) return "bg-red-500";
  if (product.quantity <= product.minThreshold) return "bg-amber-500";
  return "bg-brand-accent";
}

function getStatusBadgeClass(product) {
  if (product.quantity === 0) return "bg-red-500/10 text-red-700 border-red-500/20";
  if (product.quantity <= product.minThreshold) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-brand-soft text-brand-accent border-brand-accent/25";
}

function getStatusText(product) {
  if (product.quantity === 0) return "نفذت الكمية بالكامل";
  if (product.quantity <= product.minThreshold) return "منخفض - ينصح بالتوريد";
  return "متوفر بكمية كافية";
}
</script>
