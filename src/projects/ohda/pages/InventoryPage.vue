<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Boxes class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.inventory.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.inventory.subTitle') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <Button
          @click="showPdfModal = true"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Upload class="w-4 h-4" />
          {{ $t('ohda.inventory.pdfImportTitle') }}
        </Button>

        <Button
          @click="inventoryStore.exportToExcel('products')"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs !font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="w-full md:w-96">
        <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="stockFilter = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'all' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.common.all') }}
        </button>
        <button
          @click="stockFilter = 'low'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'low' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.inventory.lowStock') }}
        </button>
        <button
          @click="stockFilter = 'out'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'out' ? 'bg-red-500/15 text-red-600 border-red-500/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.inventory.outOfStock') }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading" type="table" :count="6" />

    <!-- Inventory Stock DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredProducts"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.inventory.emptyInventory')"
            icon="Boxes"
          />
        </template>

        <Column field="name" :header="$t('ohda.products.name')" sortable>
          <template #body="{ data }">
            <span class="font-bold text-brand-dark dark:text-white">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="sku" :header="$t('ohda.products.sku')" sortable>
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold select-all">{{ data.sku || '-' }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')" sortable>
          <template #body="{ data }">
            <span class="text-brand-dark dark:text-slate-300">{{ data.categoryName || '-' }}</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.dashboard.currentQty')" sortable>
          <template #body="{ data }">
            <span class="font-bold text-base font-mono" :class="getStockColorClass(data)">
              {{ data.quantity || data.amount || 0 }}
            </span>
          </template>
        </Column>

        <Column field="minThreshold" :header="$t('ohda.products.minThreshold')" sortable>
          <template #body="{ data }">
            <span class="text-brand-gray dark:text-slate-400 font-mono font-medium">{{ getMinThreshold(data) }}</span>
          </template>
        </Column>

        <!-- Stock Level Progress Meter -->
        <Column :header="$t('ohda.inventory.stockLevel')">
          <template #body="{ data }">
            <div class="space-y-1 w-36 sm:w-44">
              <div class="w-full bg-brand-light dark:bg-white/10 rounded-full h-2 overflow-hidden border border-brand-gray/15">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getBarColor(data)"
                  :style="{ width: `${getBarWidth(data)}%` }"
                ></div>
              </div>
              <span class="text-[10px] text-brand-gray dark:text-slate-400 font-mono block">
                {{ $t('ohda.inventory.safetyPercentage', { percent: getSafePercentage(data) }) }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Stock Status Badge -->
        <Column :header="$t('ohda.inventory.stockStatus')">
          <template #body="{ data }">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block"
              :class="getStatusBadgeClass(data)"
            >
              {{ getStatusText(data) }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Import PDF Dialog -->
    <Dialog
      v-model:visible="showPdfModal"
      modal
      :header="$t('ohda.inventory.pdfImportTitle')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs">
        <div
          class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light dark:bg-white/5 transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onPdfDrop"
          @click="triggerPdfSelect"
        >
          <Upload class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="font-bold text-brand-dark dark:text-white mb-1">
            {{ $t('ohda.inventory.pdfImportSub') }}
          </p>
          <span class="text-[10px] text-brand-gray dark:text-slate-400 block mb-4">
            {{ $t('ohda.inventory.pdfOnlyNotice') }}
          </span>
          <input type="file" ref="pdfInput" accept=".pdf" class="hidden" @change="onPdfSelected" />
          <button
            type="button"
            class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            {{ $t('ohda.inventory.browseFiles') }}
          </button>
        </div>

        <div v-if="uploadingPdf" class="space-y-2">
          <div class="flex justify-between text-brand-gray dark:text-slate-400">
            <span>{{ $t('ohda.inventory.analyzingPdf') }}</span>
            <span class="font-bold text-brand-accent">PDF...</span>
          </div>
          <div class="w-full bg-brand-light dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" @click="showPdfModal = false">
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
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import axios from "@/utilities/apiClient";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const { t } = useI18n();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const stockFilter = ref("all");
const showPdfModal = ref(false);
const uploadingPdf = ref(false);
const pdfInput = ref(null);

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchInventory();
});

const filteredProducts = computed(() => {
  let list = inventoryStore.products || [];

  if (stockFilter.value === "low") {
    list = list.filter(p => {
      const min = getMinThreshold(p);
      const qty = Number(p.quantity || p.amount || 0);
      return qty > 0 && qty <= min;
    });
  } else if (stockFilter.value === "out") {
    list = list.filter(p => Number(p.quantity || p.amount || 0) === 0);
  }

  if (searchQuery.value?.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      p => p.name?.toLowerCase().includes(q) ||
           p.sku?.toLowerCase().includes(q) ||
           p.categoryName?.toLowerCase().includes(q) ||
           p.barcode?.toLowerCase().includes(q)
    );
  }

  return list;
});

const triggerPdfSelect = () => {
  pdfInput.value?.click();
};

const onPdfSelected = (e) => {
  const file = e.target.files[0];
  if (file) uploadPdfFile(file);
};

const onPdfDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) uploadPdfFile(file);
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
      toastStore.addSuccessToast(res.data.returnMessage || t("ohda.common.operationSuccess"));
      showPdfModal.value = false;
      inventoryStore.fetchProducts();
      inventoryStore.fetchInventory();
    } else {
      toastStore.addErrorToast(res?.data?.returnMessage || t("ohda.common.operationFailed"));
    }
  } catch (err) {
    console.error("PDF upload failed", err);
  } finally {
    uploadingPdf.value = false;
  }
};

function getMinThreshold(product) {
  if (!product) return 5;
  const val = Number(product.minThreshold);
  return (!isNaN(val) && val > 0) ? val : 5;
}

function getSafePercentage(product) {
  if (!product) return 0;
  const min = getMinThreshold(product);
  const qty = Number(product.quantity || product.amount || 0);
  const target = min * 3;
  if (!target || target <= 0) return 100;
  return Math.max(0, Math.round((qty / target) * 100));
}

function getBarWidth(product) {
  return Math.min(100, Math.max(0, getSafePercentage(product)));
}

function getStockColorClass(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "text-red-600 dark:text-red-400";
  if (qty <= min) return "text-amber-600 dark:text-amber-400";
  return "text-brand-accent";
}

function getBarColor(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "bg-red-500";
  if (qty <= min) return "bg-amber-500";
  return "bg-brand-accent";
}

function getStatusBadgeClass(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  if (qty <= min) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-brand-soft dark:bg-white/10 text-brand-accent border-brand-accent/25";
}

function getStatusText(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return t("ohda.inventory.outOfStock");
  if (qty <= min) return t("ohda.inventory.lowStock");
  return t("ohda.inventory.sufficient");
}
</script>
