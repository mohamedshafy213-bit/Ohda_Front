<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <LayoutGrid class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.nav.dashboard') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.systemTitle') }} — {{ $t('ohda.auth.welcome') }} <span class="font-semibold text-emerald-300">{{ authStore.userName }}</span> ({{ authStore.user?.roleName || 'User' }})
        </p>
      </div>

      <!-- Quick Actions Buttons using Volt Button Component -->
      <div class="flex items-center gap-3">
        <router-link to="/ohda/exit-requests">
          <Button class="!bg-emerald-500/10 hover:!bg-emerald-500/20 !text-emerald-400 !border !border-emerald-500/30 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2">
            <Plus class="w-4 h-4" />
            {{ $t('ohda.exitRequests.createRequest') }}
          </Button>
        </router-link>
        <router-link to="/ohda/scan">
          <Button class="!bg-blue-500/10 hover:!bg-blue-500/20 !text-blue-400 !border !border-blue-500/30 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2">
            <Barcode class="w-4 h-4" />
            {{ $t('ohda.nav.scan') }}
          </Button>
        </router-link>
      </div>
    </div>

    <!-- 4 KPI Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400">{{ $t('ohda.dashboard.totalStock') }}</span>
          <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <Box class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-white mb-1">
          {{ inventoryStore.totalStockQuantity }}
        </div>
        <span class="text-[11px] text-slate-400">
          {{ inventoryStore.totalProductsCount }} {{ $t('ohda.dashboard.productName') }}
        </span>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400">{{ $t('ohda.dashboard.assetValue') }}</span>
          <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
            <TrendingUp class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-white mb-1">
          {{ inventoryStore.totalFinancialAssetValue.toLocaleString() }} <span class="text-xs font-normal text-slate-400">{{ $t('ohda.dashboard.currency') }}</span>
        </div>
        <span class="text-[11px] text-slate-400">القيمة التقديرية بناءً على الأصول</span>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400">{{ $t('ohda.dashboard.lowStockCount') }}</span>
          <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-400 mb-1">
          {{ inventoryStore.lowStockCount }}
        </div>
        <span class="text-[11px] text-slate-400">منتجات تحت الحد الأدنى</span>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400">{{ $t('ohda.dashboard.pendingRequests') }}</span>
          <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-purple-300 mb-1">
          {{ requestsStore.totalPendingRequestsCount }}
        </div>
        <span class="text-[11px] text-slate-400">بانتظار موافقة المدير/المشرف</span>
      </div>
    </div>

    <!-- Category Distribution & Low Stock Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
        <h2 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Package class="w-4 h-4 text-emerald-400" />
          {{ $t('ohda.dashboard.categoryDistribution') }}
        </h2>
        <div class="space-y-4">
          <div
            v-for="(count, catName) in inventoryStore.categoryDistribution"
            :key="catName"
            class="space-y-1.5"
          >
            <div class="flex justify-between text-xs font-medium">
              <span class="text-slate-300">{{ catName }}</span>
              <span class="text-slate-400">{{ count }} قطعة</span>
            </div>
            <div class="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, (count / inventoryStore.totalStockQuantity) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Volt DataTable for Low Stock Alerts (NO raw tr/td) -->
      <div class="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-400" />
            {{ $t('ohda.dashboard.lowStockAlerts') }}
          </h2>
          <router-link to="/ohda/inventory" class="text-xs text-emerald-400 hover:underline">
            عرض رصيد المخزون الكامل
          </router-link>
        </div>

        <DataTable :value="inventoryStore.lowStockProducts" class="w-full text-xs">
          <Column field="name" :header="$t('ohda.dashboard.productName')">
            <template #body="{ data }">
              <span class="font-semibold text-white">{{ data.name }}</span>
            </template>
          </Column>
          <Column field="sku" :header="$t('ohda.products.sku')">
            <template #body="{ data }">
              <span class="font-mono text-slate-400">{{ data.sku }}</span>
            </template>
          </Column>
          <Column field="quantity" :header="$t('ohda.dashboard.currentQty')">
            <template #body="{ data }">
              <span class="font-bold text-amber-400">{{ data.quantity }}</span>
            </template>
          </Column>
          <Column field="minThreshold" :header="$t('ohda.dashboard.minQty')">
            <template #body="{ data }">
              <span class="text-slate-400">{{ data.minThreshold }}</span>
            </template>
          </Column>
          <Column :header="$t('ohda.common.status')">
            <template #body>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                منخفض - يتطلب توريد
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchDashboardMetrics();
  requestsStore.fetchExitRequests();
  requestsStore.fetchEntryRequests();
});
</script>
