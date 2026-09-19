<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <LayoutGrid class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.nav.dashboard') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.systemTitle') }} — {{ $t('ohda.auth.welcome') }} <span class="font-semibold text-brand-accent">{{ authStore.userName }}</span> ({{ authStore.user?.roleName || 'User' }})
        </p>
      </div>

      <!-- Quick Actions Buttons using Volt Button Component -->
      <div class="flex items-center gap-3">
        <router-link to="/ohda/exit-requests">
          <Button class="!bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2">
            <Plus class="w-4 h-4" />
            {{ $t('ohda.exitRequests.createRequest') }}
          </Button>
        </router-link>
        <router-link to="/ohda/scan">
          <Button class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2">
            <Barcode class="w-4 h-4" />
            {{ $t('ohda.nav.scan') }}
          </Button>
        </router-link>
      </div>
    </div>

    <!-- 4 KPI Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-brand-white border border-brand-gray/10 p-5 rounded-2xl relative overflow-hidden shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.dashboard.totalStock') }}</span>
          <div class="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/15">
            <Box class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-brand-dark mb-1">
          {{ inventoryStore.totalStockQuantity }}
        </div>
        <span class="text-[11px] text-brand-gray">
          {{ inventoryStore.totalProductsCount }} {{ $t('ohda.dashboard.productName') }}
        </span>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 p-5 rounded-2xl relative overflow-hidden shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.dashboard.assetValue') }}</span>
          <div class="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center text-brand-dark border border-brand-gray/10">
            <TrendingUp class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-brand-dark mb-1">
          {{ inventoryStore.totalFinancialAssetValue.toLocaleString() }} <span class="text-xs font-normal text-brand-gray">{{ $t('ohda.dashboard.currency') }}</span>
        </div>
        <span class="text-[11px] text-brand-gray">القيمة التقديرية بناءً على الأصول</span>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 p-5 rounded-2xl relative overflow-hidden shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.dashboard.lowStockCount') }}</span>
          <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-600 mb-1">
          {{ inventoryStore.lowStockCount }}
        </div>
        <span class="text-[11px] text-brand-gray">منتجات تحت الحد الأدنى</span>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 p-5 rounded-2xl relative overflow-hidden shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.dashboard.pendingRequests') }}</span>
          <div class="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <div class="text-2xl font-bold text-brand-accent mb-1">
          {{ requestsStore.totalPendingRequestsCount }}
        </div>
        <span class="text-[11px] text-brand-gray">بانتظار موافقة المدير/المشرف</span>
      </div>
    </div>

    <!-- Category Distribution & Low Stock Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <h2 class="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2">
          <Package class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.dashboard.categoryDistribution') }}
        </h2>
        <div class="space-y-4">
          <div
            v-for="(count, catName) in inventoryStore.categoryDistribution"
            :key="catName"
            class="space-y-1.5"
          >
            <div class="flex justify-between text-xs font-medium">
              <span class="text-brand-dark">{{ catName }}</span>
              <span class="text-brand-gray">{{ count }} قطعة</span>
            </div>
            <div class="w-full bg-brand-light rounded-full h-2 overflow-hidden">
              <div
                class="bg-brand-accent h-2 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, (count / inventoryStore.totalStockQuantity) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Volt DataTable for Low Stock Alerts (NO raw tr/td) -->
      <div class="lg:col-span-2 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-brand-dark flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500" />
            {{ $t('ohda.dashboard.lowStockAlerts') }}
          </h2>
          <router-link to="/ohda/inventory" class="text-xs text-brand-accent hover:underline">
            عرض رصيد المخزون الكامل
          </router-link>
        </div>

        <DataTable :value="inventoryStore.lowStockProducts" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]" class="w-full text-xs">
          <Column field="name" :header="$t('ohda.dashboard.productName')">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.name }}</span>
            </template>
          </Column>
          <Column field="sku" :header="$t('ohda.products.sku')">
            <template #body="{ data }">
              <span class="font-mono text-brand-gray">{{ data.sku }}</span>
            </template>
          </Column>
          <Column field="quantity" :header="$t('ohda.dashboard.currentQty')">
            <template #body="{ data }">
              <span class="font-bold text-amber-600">{{ data.quantity }}</span>
            </template>
          </Column>
          <Column field="minThreshold" :header="$t('ohda.dashboard.minQty')">
            <template #body="{ data }">
              <span class="text-brand-gray">{{ data.minThreshold }}</span>
            </template>
          </Column>
          <Column :header="$t('ohda.common.status')">
            <template #body>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30">
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
