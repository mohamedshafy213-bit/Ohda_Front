<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <List class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.inventory.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.inventory.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          @click="inventoryStore.exportToExcel('products')"
          class="!bg-slate-700/80 hover:!bg-slate-700 !text-slate-200 !border !border-slate-600 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2"
        >
          <Download class="w-4 h-4 text-emerald-400" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>
      </div>
    </div>

    <!-- Inventory Stock Volt DataTable (No raw tr/td) -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="inventoryStore.products" class="w-full text-xs">
        <Column field="name" :header="$t('ohda.products.name')">
          <template #body="{ data }">
            <span class="font-semibold text-white">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="sku" :header="$t('ohda.products.sku')">
          <template #body="{ data }">
            <span class="font-mono text-emerald-400 font-semibold">{{ data.sku }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')">
          <template #body="{ data }">
            <span class="text-slate-300">{{ data.categoryName }}</span>
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
            <span class="text-slate-400 font-mono">{{ data.minThreshold }}</span>
          </template>
        </Column>

        <!-- Stock Level Progress Meter -->
        <Column :header="$t('ohda.inventory.stockLevel')">
          <template #body="{ data }">
            <div class="space-y-1 w-44">
              <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getBarColor(data)"
                  :style="{ width: `${Math.min(100, (data.quantity / (data.minThreshold * 3)) * 100)}%` }"
                ></div>
              </div>
              <span class="text-[10px] text-slate-400 font-mono block">
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
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";

const inventoryStore = useOhdaInventoryStore();

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchInventory();
});

function getStockColorClass(product) {
  if (product.quantity === 0) return "text-red-400";
  if (product.quantity <= product.minThreshold) return "text-amber-400";
  return "text-emerald-400";
}

function getBarColor(product) {
  if (product.quantity === 0) return "bg-red-500";
  if (product.quantity <= product.minThreshold) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStatusBadgeClass(product) {
  if (product.quantity === 0) return "bg-red-500/20 text-red-300 border-red-500/30";
  if (product.quantity <= product.minThreshold) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
}

function getStatusText(product) {
  if (product.quantity === 0) return "نفذت الكمية بالكامل";
  if (product.quantity <= product.minThreshold) return "منخفض - ينصح بالتوريد";
  return "متوفر بكمية كافية";
}
</script>
