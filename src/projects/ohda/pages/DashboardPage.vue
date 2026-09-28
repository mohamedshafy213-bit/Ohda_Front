<template>
  <div class="dashboard-root space-y-6">
    <!-- Header -->
    <div class="dash-header flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <LayoutGrid class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.nav.dashboard') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.systemTitle') }} — {{ $t('ohda.auth.welcome') }}
          <span class="font-semibold text-brand-accent">{{ authStore.userName }}</span>
          ({{ authStore.user?.roleName || 'User' }})
          <span v-if="authStore.branchName" class="mx-1">•</span>
          <span v-if="authStore.branchName" class="font-semibold text-brand-dark">{{ authStore.branchName }}</span>
        </p>
      </div>
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

    <!-- KPI Stat Cards - 6 cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div v-for="(card, idx) in kpiCards" :key="idx"
           class="kpi-card group relative bg-brand-white border rounded-2xl p-5 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
           :style="{ borderColor: card.borderColor + '30' }">
        <!-- Gradient glow on hover -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             :style="{ background: `radial-gradient(ellipse at 50% 0%, ${card.color}15 0%, transparent 70%)` }"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
                 :style="{ backgroundColor: card.color + '12', borderColor: card.color + '25', color: card.color }">
              <component :is="card.icon" class="w-5 h-5" />
            </div>
            <span v-if="card.trend !== null" class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="card.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'">
              {{ card.trend >= 0 ? '▲' : '▼' }} {{ Math.abs(card.trend) }}%
            </span>
          </div>
          <div class="text-2xl font-bold mb-0.5 transition-colors duration-300" :style="{ color: card.valueColor || '#101828' }">
            <span class="counter-value">{{ card.value }}</span>
            <span v-if="card.suffix" class="text-xs font-normal text-brand-gray ms-1">{{ card.suffix }}</span>
          </div>
          <span class="text-[11px] text-brand-gray leading-tight block">{{ card.label }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Row: Donut | Bar Chart | Warehouse Gauge -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Category Distribution - Donut Chart -->
      <div class="lg:col-span-3 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <h2 class="text-sm font-bold text-brand-dark mb-5 flex items-center gap-2">
          <Package class="w-4 h-4 text-brand-accent" />
          توزيع المنتجات حسب الفئات
        </h2>
        
        <div v-if="categoryEntries.length" class="flex flex-col items-center">
          <!-- SVG Donut Chart -->
          <div class="relative w-44 h-44 mb-5">
            <svg viewBox="0 0 42 42" class="w-full h-full donut-chart">
              <circle cx="21" cy="21" r="15.5" fill="transparent" stroke="#F1F5F9" stroke-width="5" />
              <circle v-for="(seg, i) in donutSegments" :key="i"
                      cx="21" cy="21" r="15.5" fill="transparent"
                      :stroke="seg.color"
                      stroke-width="5"
                      :stroke-dasharray="seg.dashArray"
                      :stroke-dashoffset="seg.dashOffset"
                      stroke-linecap="round"
                      class="donut-segment transition-all duration-700"
                      :style="{ animationDelay: `${i * 150}ms` }" />
            </svg>
            <!-- Center Label -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-brand-dark">{{ inventoryStore.totalProductsCount }}</span>
              <span class="text-[10px] text-brand-gray">إجمالي الأصناف</span>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="w-full space-y-2">
            <div v-for="(seg, i) in donutSegments" :key="'legend-' + i"
                 class="flex items-center justify-between text-xs group/legend cursor-default hover:bg-brand-light rounded-lg px-2 py-1.5 transition-colors">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" :style="{ backgroundColor: seg.color }"></span>
                <span class="text-brand-dark font-medium">{{ seg.name }}</span>
              </div>
              <span class="font-bold" :style="{ color: seg.color }">{{ seg.count }}</span>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-brand-gray">
          <Package class="w-10 h-10 mb-3 opacity-30" />
          <span class="text-xs">لا توجد بيانات تصنيفات</span>
        </div>
      </div>

      <!-- Request Activity Bar Chart -->
      <div class="lg:col-span-5 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-sm font-bold text-brand-dark flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-brand-accent" />
            حركة الطلبات
          </h2>
          <div class="flex items-center gap-4 text-[10px]">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
              طلبات إدخال
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block"></span>
              طلبات صرف
            </span>
          </div>
        </div>

        <div class="flex items-end gap-1.5 h-40">
          <div v-for="(bar, i) in barChartData" :key="i" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full flex gap-0.5 items-end" style="height: 128px;">
              <!-- Entry bar -->
              <div class="flex-1 rounded-t-md bg-emerald-500/80 hover:bg-emerald-500 transition-all duration-500 cursor-default relative group/bar"
                   :style="{ height: bar.entryHeight + '%', animationDelay: i * 80 + 'ms' }"
                   :class="{ 'bar-animate': mounted }">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                  {{ bar.entry }}
                </div>
              </div>
              <!-- Exit bar -->
              <div class="flex-1 rounded-t-md bg-rose-400/80 hover:bg-rose-400 transition-all duration-500 cursor-default relative group/bar"
                   :style="{ height: bar.exitHeight + '%', animationDelay: i * 80 + 50 + 'ms' }"
                   :class="{ 'bar-animate': mounted }">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                  {{ bar.exit }}
                </div>
              </div>
            </div>
            <span class="text-[9px] text-brand-gray">{{ bar.label }}</span>
          </div>
        </div>

        <!-- Summary mini stats -->
        <div class="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-brand-gray/10">
          <div class="text-center">
            <span class="block text-lg font-bold text-emerald-600">{{ totalApprovedEntry }}</span>
            <span class="text-[10px] text-brand-gray">إدخال معتمد</span>
          </div>
          <div class="text-center">
            <span class="block text-lg font-bold text-rose-500">{{ totalApprovedExit }}</span>
            <span class="text-[10px] text-brand-gray">صرف معتمد</span>
          </div>
          <div class="text-center">
            <span class="block text-lg font-bold text-amber-500">{{ totalPending }}</span>
            <span class="text-[10px] text-brand-gray">قيد الانتظار</span>
          </div>
        </div>
      </div>

      <!-- Warehouse Capacity Gauge -->
      <div class="lg:col-span-4 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <h2 class="text-sm font-bold text-brand-dark mb-5 flex items-center gap-2">
          <Warehouse class="w-4 h-4 text-brand-accent" />
          سعة المستودع
        </h2>
        
        <div class="flex flex-col items-center">
          <!-- Radial Gauge SVG -->
          <div class="relative w-48 h-48 mb-4">
            <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90">
              <!-- Track -->
              <circle cx="21" cy="21" r="17" fill="transparent" stroke="#F1F5F9" stroke-width="3.5" />
              <!-- Used capacity -->
              <circle cx="21" cy="21" r="17" fill="transparent"
                      :stroke="capacityColor"
                      stroke-width="3.5"
                      :stroke-dasharray="capacityDash"
                      stroke-dashoffset="0"
                      stroke-linecap="round"
                      class="gauge-fill transition-all duration-1000" />
              <!-- Inner track -->
              <circle cx="21" cy="21" r="13" fill="transparent" stroke="#F1F5F9" stroke-width="2.5" />
              <!-- Occupied bins -->
              <circle cx="21" cy="21" r="13" fill="transparent"
                      :stroke="'#6366F1'"
                      stroke-width="2.5"
                      :stroke-dasharray="occupiedBinsDash"
                      stroke-dashoffset="0"
                      stroke-linecap="round"
                      class="gauge-fill transition-all duration-1000" style="animation-delay: 300ms" />
            </svg>
            <!-- Center -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold" :style="{ color: capacityColor }">{{ capacityPercent }}%</span>
              <span class="text-[10px] text-brand-gray">نسبة الاستخدام</span>
            </div>
          </div>
          
          <!-- Warehouse Stats Grid -->
          <div class="w-full grid grid-cols-2 gap-3">
            <div class="bg-brand-light rounded-xl p-3 text-center border border-brand-gray/5">
              <span class="block text-lg font-bold text-brand-dark">{{ binStore.totalBinsCount }}</span>
              <span class="text-[10px] text-brand-gray">إجمالي الأرفف</span>
            </div>
            <div class="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
              <span class="block text-lg font-bold text-indigo-600">{{ binStore.occupiedBinsCount }}</span>
              <span class="text-[10px] text-brand-gray">أرفف مشغولة</span>
            </div>
            <div class="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <span class="block text-lg font-bold text-emerald-600">{{ binStore.emptyBinsCount }}</span>
              <span class="text-[10px] text-brand-gray">أرفف فارغة</span>
            </div>
            <div class="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
              <span class="block text-lg font-bold text-amber-600">{{ binStore.totalRemainingSpace }}</span>
              <span class="text-[10px] text-brand-gray">سعة متبقية</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Activity Timeline + Low Stock Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Recent Activity Timeline -->
      <div class="lg:col-span-5 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Activity class="w-4 h-4 text-brand-accent" />
            آخر النشاطات
          </h2>
          <span class="text-[10px] text-brand-gray bg-brand-light px-2.5 py-1 rounded-full">آخر 10 أحداث</span>
        </div>

        <div v-if="recentActivities.length" class="space-y-0">
          <div v-for="(act, i) in recentActivities" :key="i"
               class="flex items-start gap-3 py-3 group/act hover:bg-brand-light/50 rounded-lg px-2 transition-colors -mx-2 cursor-default"
               :class="{ 'border-b border-brand-gray/5': i < recentActivities.length - 1 }">
            <!-- Timeline dot -->
            <div class="relative flex flex-col items-center pt-0.5">
              <div class="w-3 h-3 rounded-full border-2 shrink-0 transition-transform group-hover/act:scale-125"
                   :style="{ borderColor: act.color, backgroundColor: act.color + '25' }"></div>
              <div v-if="i < recentActivities.length - 1" class="w-px flex-1 bg-brand-gray/10 mt-1" style="min-height: 16px"></div>
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-semibold text-brand-dark">{{ act.title }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      :style="{ backgroundColor: act.color + '15', color: act.color }">
                  {{ act.badge }}
                </span>
              </div>
              <p class="text-[11px] text-brand-gray truncate">{{ act.description }}</p>
              <span class="text-[9px] text-brand-gray/60 mt-0.5 block">{{ act.time }}</span>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-16 text-brand-gray">
          <Activity class="w-10 h-10 mb-3 opacity-20" />
          <span class="text-xs">لا توجد نشاطات حديثة</span>
        </div>
      </div>

      <!-- Low Stock Alerts Table -->
      <div class="lg:col-span-7 bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-brand-dark flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500" />
            تنبيهات انخفاض المخزون
            <span v-if="inventoryStore.lowStockCount" 
                  class="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
              {{ inventoryStore.lowStockCount }} صنف
            </span>
          </h2>
          <router-link to="/ohda/inventory" class="text-xs text-brand-accent hover:underline flex items-center gap-1">
            عرض المخزون الكامل
            <ChevronLeft class="w-3 h-3" />
          </router-link>
        </div>

        <DataTable v-if="inventoryStore.lowStockProducts.length"
                   :value="inventoryStore.lowStockProducts" 
                   paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]" 
                   class="w-full text-xs"
                   stripedRows>
          <Column field="name" header="اسم الصنف">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.name }}</span>
            </template>
          </Column>
          <Column field="sku" header="SKU">
            <template #body="{ data }">
              <span class="font-mono text-brand-gray text-[11px]">{{ data.sku || '—' }}</span>
            </template>
          </Column>
          <Column field="categoryName" header="التصنيف">
            <template #body="{ data }">
              <span class="text-brand-gray">{{ data.categoryName || 'عام' }}</span>
            </template>
          </Column>
          <Column field="quantity" header="الرصيد" sortable>
            <template #body="{ data }">
              <span class="font-bold" :class="data.quantity === 0 ? 'text-red-500' : 'text-amber-600'">
                {{ data.quantity }}
              </span>
            </template>
          </Column>
          <Column field="minThreshold" header="الحد الأدنى">
            <template #body="{ data }">
              <span class="text-brand-gray">{{ data.minThreshold }}</span>
            </template>
          </Column>
          <Column header="الحالة">
            <template #body="{ data }">
              <span v-if="data.quantity === 0"
                    class="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                نفد المخزون
              </span>
              <span v-else-if="data.quantity <= Math.floor((data.minThreshold || 5) * 0.5)"
                    class="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-400/20">
                حرج جداً
              </span>
              <span v-else
                    class="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                منخفض
              </span>
            </template>
          </Column>
        </DataTable>
        
        <div v-else class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle class="w-8 h-8 text-emerald-500" />
          </div>
          <span class="text-sm font-semibold text-brand-dark mb-1">المخزون بحالة ممتازة</span>
          <span class="text-xs text-brand-gray">لا توجد أصناف تحت الحد الأدنى المطلوب</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats Footer -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(stat, i) in quickStats" :key="i"
           class="bg-brand-white border border-brand-gray/10 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-brand-accent/20 transition-colors cursor-default">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
             :style="{ backgroundColor: stat.color + '12', color: stat.color }">
          <component :is="stat.icon" class="w-4.5 h-4.5" />
        </div>
        <div>
          <span class="block text-sm font-bold text-brand-dark">{{ stat.value }}</span>
          <span class="text-[10px] text-brand-gray">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";

import {
  LayoutGrid, Plus, Barcode, Box, TrendingUp, AlertTriangle, Clock, Package,
  Warehouse, Activity, ChevronLeft, CheckCircle,
  ShoppingCart, ArrowUpRight, ArrowDownLeft, Users, Layers, Tag
} from "lucide-vue-next";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();
const binStore = useOhdaWarehouseBinStore();

const mounted = ref(false);

// ─── KPI Cards ───
const kpiCards = computed(() => [
  {
    label: "إجمالي الأصناف",
    value: inventoryStore.totalProductsCount,
    icon: Box,
    color: "#21C87A",
    borderColor: "#21C87A",
    valueColor: "#101828",
    trend: null,
    suffix: "صنف"
  },
  {
    label: "إجمالي كمية المخزون",
    value: inventoryStore.totalStockQuantity.toLocaleString(),
    icon: Layers,
    color: "#6366F1",
    borderColor: "#6366F1",
    valueColor: "#101828",
    trend: null,
    suffix: "وحدة"
  },
  {
    label: "القيمة المالية للعهدة",
    value: inventoryStore.totalFinancialAssetValue.toLocaleString(),
    icon: TrendingUp,
    color: "#0EA5E9",
    borderColor: "#0EA5E9",
    valueColor: "#101828",
    trend: null,
    suffix: "ريال"
  },
  {
    label: "تنبيهات نقص المخزون",
    value: inventoryStore.lowStockCount,
    icon: AlertTriangle,
    color: "#F59E0B",
    borderColor: "#F59E0B",
    valueColor: inventoryStore.lowStockCount > 0 ? "#D97706" : "#101828",
    trend: null,
    suffix: null
  },
  {
    label: "طلبات صرف معلقة",
    value: requestsStore.exitRequests.filter(r => r.status === 1 || r.status === 3).length,
    icon: ArrowUpRight,
    color: "#F43F5E",
    borderColor: "#F43F5E",
    valueColor: "#101828",
    trend: null,
    suffix: null
  },
  {
    label: "طلبات إدخال معلقة",
    value: requestsStore.entryRequests.filter(r => r.status === 1 || r.status === 3).length,
    icon: ArrowDownLeft,
    color: "#10B981",
    borderColor: "#10B981",
    valueColor: "#101828",
    trend: null,
    suffix: null
  }
]);

// ─── Donut Chart Data ───
const donutColors = ["#21C87A", "#6366F1", "#F59E0B", "#0EA5E9", "#F43F5E", "#8B5CF6", "#14B8A6", "#EC4899", "#EF4444", "#84CC16"];

const categoryEntries = computed(() => {
  const dist = inventoryStore.categoryDistribution;
  return Object.entries(dist).map(([name, count], i) => ({
    name,
    count,
    color: donutColors[i % donutColors.length]
  }));
});

const donutSegments = computed(() => {
  const total = inventoryStore.totalStockQuantity || 1;
  const circumference = 2 * Math.PI * 15.5; // ~97.39
  let accumulated = 0;

  return categoryEntries.value.map(entry => {
    const pct = entry.count / total;
    const segLen = pct * circumference;
    const gap = 1.5; // gap between segments
    const dashArray = `${Math.max(0, segLen - gap)} ${circumference - Math.max(0, segLen - gap)}`;
    const dashOffset = -accumulated + circumference * 0.25; // start from top
    accumulated += segLen;

    return {
      name: entry.name,
      count: entry.count,
      color: entry.color,
      dashArray,
      dashOffset
    };
  });
});

// ─── Bar Chart (Request Activity) ───
const statusLabels = { 0: "جديد", 1: "بانتظار المدير", 2: "معتمد", 3: "بانتظار المشرف", 4: "مرفوض" };

const barChartData = computed(() => {
  // Group requests by status for a meaningful breakdown
  const statuses = [0, 1, 3, 2, 4];
  const labels = ["جديد", "مدير", "مشرف", "معتمد", "مرفوض"];
  
  const maxVal = Math.max(
    ...statuses.map(s => requestsStore.exitRequests.filter(r => r.status === s).length),
    ...statuses.map(s => requestsStore.entryRequests.filter(r => r.status === s).length),
    1
  );

  return statuses.map((s, i) => {
    const entry = requestsStore.entryRequests.filter(r => r.status === s).length;
    const exit = requestsStore.exitRequests.filter(r => r.status === s).length;
    return {
      label: labels[i],
      entry,
      exit,
      entryHeight: Math.max(4, (entry / maxVal) * 100),
      exitHeight: Math.max(4, (exit / maxVal) * 100)
    };
  });
});

const totalApprovedEntry = computed(() => requestsStore.entryRequests.filter(r => r.status === 2).length);
const totalApprovedExit = computed(() => requestsStore.exitRequests.filter(r => r.status === 2).length);
const totalPending = computed(() => requestsStore.totalPendingRequestsCount);

// ─── Warehouse Capacity Gauge ───
const capacityPercent = computed(() => {
  const total = binStore.totalCapacity || 0;
  const used = binStore.totalItemsInBins || 0;
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
});

const capacityColor = computed(() => {
  const pct = capacityPercent.value;
  if (pct >= 90) return "#EF4444";
  if (pct >= 70) return "#F59E0B";
  return "#21C87A";
});

const capacityDash = computed(() => {
  const circumference = 2 * Math.PI * 17; // ~106.81
  const fill = (capacityPercent.value / 100) * circumference;
  return `${fill} ${circumference - fill}`;
});

const occupiedBinsDash = computed(() => {
  const circumference = 2 * Math.PI * 13; // ~81.68
  const total = binStore.totalBinsCount || 1;
  const pct = binStore.occupiedBinsCount / total;
  const fill = pct * circumference;
  return `${fill} ${circumference - fill}`;
});

// ─── Recent Activity Timeline ───
const recentActivities = computed(() => {
  const activities = [];
  const colorMap = {
    0: "#6366F1",  // New
    1: "#F59E0B",  // Awaiting Manager
    2: "#21C87A",  // Approved
    3: "#0EA5E9",  // Awaiting Supervisor
    4: "#EF4444"   // Rejected
  };
  const badgeMap = {
    0: "جديد",
    1: "بانتظار المدير",
    2: "معتمد",
    3: "بانتظار المشرف",
    4: "مُرتجع"
  };

  // Combine exit and entry requests
  const allRequests = [
    ...requestsStore.exitRequests.map(r => ({ ...r, type: "exit" })),
    ...requestsStore.entryRequests.map(r => ({ ...r, type: "entry" }))
  ];

  // Sort by insertDate or id descending
  allRequests.sort((a, b) => {
    const dateA = a.insertDate || a.createdAt || "";
    const dateB = b.insertDate || b.createdAt || "";
    if (dateA && dateB) return new Date(dateB) - new Date(dateA);
    return (b.id || 0) - (a.id || 0);
  });

  // Take top 10
  allRequests.slice(0, 10).forEach(req => {
    const isExit = req.type === "exit";
    const productNames = req.items?.map(it => it.productName).filter(Boolean).join("، ") 
                        || req.productName 
                        || `طلب #${req.id}`;
    activities.push({
      title: isExit ? "طلب صرف" : "طلب إدخال",
      badge: badgeMap[req.status] || "غير معروف",
      color: colorMap[req.status] || "#667085",
      description: productNames,
      time: formatDate(req.insertDate || req.createdAt)
    });
  });

  return activities;
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// ─── Quick Stats Footer ───
const quickStats = computed(() => [
  {
    label: "إجمالي طلبات الصرف",
    value: requestsStore.exitRequests.length,
    icon: ArrowUpRight,
    color: "#F43F5E"
  },
  {
    label: "إجمالي طلبات الإدخال",
    value: requestsStore.entryRequests.length,
    icon: ArrowDownLeft,
    color: "#10B981"
  },
  {
    label: "إجمالي الفئات",
    value: inventoryStore.categories.length || Object.keys(inventoryStore.categoryDistribution).length,
    icon: Tag,
    color: "#8B5CF6"
  },
  {
    label: "إجمالي الموردين",
    value: inventoryStore.suppliers.length,
    icon: Users,
    color: "#0EA5E9"
  }
]);

// ─── Lifecycle ───
onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchProducts(),
    inventoryStore.fetchDashboardMetrics(),
    inventoryStore.fetchCategories(),
    inventoryStore.fetchSuppliers(),
    requestsStore.fetchExitRequests(),
    requestsStore.fetchEntryRequests(),
    binStore.fetchBins()
  ]);
  setTimeout(() => { mounted.value = true; }, 100);
});
</script>

<style scoped>
/* Donut chart entrance animation */
.donut-segment {
  animation: donutDraw 1s ease-out forwards;
  opacity: 0;
}

@keyframes donutDraw {
  from { opacity: 0; stroke-dashoffset: 200; }
  to { opacity: 1; }
}

/* Gauge fill animation */
.gauge-fill {
  animation: gaugeDraw 1.2s ease-out forwards;
  opacity: 0;
}

@keyframes gaugeDraw {
  from { opacity: 0; stroke-dasharray: 0 200; }
  to { opacity: 1; }
}

/* Bar chart animation */
.bar-animate {
  animation: barGrow 0.8s ease-out forwards;
}

@keyframes barGrow {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); transform-origin: bottom; }
}

/* KPI card subtle pulse on the icon */
.kpi-card:hover .w-10 {
  animation: iconPulse 0.6s ease-in-out;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Smooth counter animation placeholder */
.counter-value {
  display: inline-block;
}

/* Dashboard scrollbar styling */
.dashboard-root {
  scrollbar-width: thin;
  scrollbar-color: #E2E8F0 transparent;
}
</style>
