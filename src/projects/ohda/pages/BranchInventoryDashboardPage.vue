<template>
  <div class="space-y-6">
    <!-- Breadcrumb Navigation Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-2 text-xs">
        <router-link
          to="/ohda/branches"
          class="text-brand-gray hover:text-brand-accent flex items-center gap-1 font-semibold transition-colors"
        >
          <Building2 class="w-4 h-4" />
          <span>{{ $t('ohda.nav.branches') }}</span>
        </router-link>
        <span class="text-brand-gray/40">&larr;</span>
        <span class="font-bold text-brand-dark flex items-center gap-1">
          <span class="font-mono text-brand-accent px-1.5 py-0.5 bg-brand-accent/10 rounded text-[10px]">
            {{ dashboardData?.branchCode || '...' }}
          </span>
          <span>{{ dashboardData?.branchName || '...' }}</span>
        </span>
        <span class="text-brand-gray/40">&larr;</span>
        <span class="text-brand-accent font-bold">لوحة مؤشرات المخزون والعهدة</span>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          to="/ohda/branches"
          class="px-3.5 py-2 bg-brand-light hover:bg-brand-soft text-brand-dark rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-brand-gray/15"
        >
          <ArrowRight class="w-3.5 h-3.5 rtl:rotate-0" />
          <span>العودة لإدارة الفروع</span>
        </router-link>

        <Button
          @click="fetchData"
          :disabled="loading"
          class="!bg-brand-white hover:!bg-brand-light !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-3 !py-2 !text-xs flex items-center gap-2"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>تحديث</span>
        </Button>
      </div>
    </div>

    <!-- Loading Skeleton / Error State -->
    <div v-if="loading && !dashboardData" class="p-12 text-center text-brand-gray">
      <RefreshCw class="w-8 h-8 animate-spin mx-auto text-brand-accent mb-3" />
      <p class="text-xs">جاري تحميل مؤشرات أداء ومخزون الفرع...</p>
    </div>

    <div v-else-if="!dashboardData" class="p-12 text-center bg-brand-white rounded-2xl border border-brand-gray/10">
      <AlertTriangle class="w-10 h-10 text-amber-500 mx-auto mb-2" />
      <h3 class="text-sm font-bold text-brand-dark">تعذر تحميل بيانات الفرع</h3>
      <p class="text-xs text-brand-gray mt-1">تأكد من صحة معرف الفرع وصلاحيات الحساب الحالية.</p>
    </div>

    <template v-else>
      <!-- Branch Overview KPI Row (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Products vs Quota -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
            <Package class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي الأصناف بالفرع</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ dashboardData.totalProducts }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة قصوى {{ dashboardData.maxProducts }}</span>
          </div>
        </div>

        <!-- Card 2: Total Asset Value -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Coins class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">القيمة المالية للأصول والعهدة</div>
            <div class="text-xl font-bold text-emerald-600 mt-0.5 font-mono">
              {{ formatCurrency(dashboardData.totalAssetValue) }}
            </div>
            <span class="text-[10px] text-brand-gray">ريال سعودي (SAR)</span>
          </div>
        </div>

        <!-- Card 3: Users vs Seat Limit -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">مستخدمي الفرع المعتمدين</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ dashboardData.totalUsers }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة مستخدمين {{ dashboardData.maxUsers }}</span>
          </div>
        </div>

        <!-- Card 4: Low Stock Alert Items -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center border"
            :class="dashboardData.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'"
          >
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">تنبيهات نقص المخزون</div>
            <div class="text-2xl font-bold mt-0.5" :class="dashboardData.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'">
              {{ dashboardData.lowStockCount }}
            </div>
            <span class="text-[10px] text-brand-gray">أصناف قاربت أو تجاوزت الحد الأدنى</span>
          </div>
        </div>
      </div>

      <!-- Charts Row (Categories Donut, Condition Donut, Requests Bar) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart 1: Categories Breakdown -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3 border-b border-brand-gray/10 pb-2">
              <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                <Tags class="w-4 h-4 text-brand-accent" />
                توزيع الأصناف حسب التصنيف
              </span>
              <span class="text-[10px] font-mono text-brand-gray">
                {{ dashboardData.categoryBreakdown?.length || 0 }} تصنيفات
              </span>
            </div>
            <div class="h-56 relative flex items-center justify-center">
              <Doughnut v-if="categoryChartData.labels.length > 0" :data="categoryChartData" :options="doughnutOptions" />
              <div v-else class="text-xs text-brand-gray text-center">لا توجد تصنيفات مرتبطة بأصناف هذا الفرع</div>
            </div>
          </div>
        </div>

        <!-- Chart 2: Items Condition / Status Breakdown -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3 border-b border-brand-gray/10 pb-2">
              <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                <Activity class="w-4 h-4 text-emerald-500" />
                حالة الوحدات والعهد الفيزيائية
              </span>
              <span class="text-[10px] font-mono text-brand-gray">Product Items</span>
            </div>
            <div class="h-56 relative flex items-center justify-center">
              <Doughnut v-if="conditionChartData.labels.length > 0" :data="conditionChartData" :options="doughnutOptions" />
              <div v-else class="text-xs text-brand-gray text-center">لا توجد بيانات وحدات مسجلة للفرع</div>
            </div>
          </div>
        </div>

        <!-- Chart 3: Requests Summary (Exit & Entry) -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3 border-b border-brand-gray/10 pb-2">
              <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                <ScrollText class="w-4 h-4 text-purple-500" />
                حالة طلبات الإدخال والصرف
              </span>
              <span class="text-[10px] font-mono text-brand-gray">
                {{ (dashboardData.requestStats?.totalExitRequests || 0) + (dashboardData.requestStats?.totalEntryRequests || 0) }} طلب
              </span>
            </div>
            <div class="h-56 relative">
              <Bar :data="requestsBarData" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Items Warning Table -->
      <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-brand-dark">الأصناف التي اقتربت من النفاد في مستودع الفرع</h3>
              <p class="text-[11px] text-brand-gray">قائمة بالأصناف التي انخفضت كميتها الحالية عن الحد الأدنى المحدد للمستودع (Min Stock)</p>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-600 font-mono">
            {{ dashboardData.lowStockItems?.length || 0 }} أصناف متأثرة
          </span>
        </div>

        <DataTable
          :value="dashboardData.lowStockItems || []"
          responsiveLayout="scroll"
          class="text-xs"
        >
          <Column field="productName" header="اسم الصنف">
            <template #body="{ data }">
              <span class="font-bold text-brand-dark">{{ data.productName }}</span>
            </template>
          </Column>

          <Column field="sku" header="رمز SKU">
            <template #body="{ data }">
              <span class="font-mono text-brand-accent font-bold px-1.5 py-0.5 bg-brand-accent/10 rounded text-[11px]">
                {{ data.sku || '—' }}
              </span>
            </template>
          </Column>

          <Column field="currentQuantity" header="الكمية المتوفرة">
            <template #body="{ data }">
              <span class="font-mono font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                {{ data.currentQuantity }}
              </span>
            </template>
          </Column>

          <Column field="minStock" header="الحد الأدنى">
            <template #body="{ data }">
              <span class="font-mono text-brand-gray font-semibold">{{ data.minStock }}</span>
            </template>
          </Column>

          <Column field="maxStock" header="الحد الأقصى">
            <template #body="{ data }">
              <span class="font-mono text-brand-gray font-semibold">{{ data.maxStock }}</span>
            </template>
          </Column>

          <Column header="حالة التنبيه">
            <template #body="{ data }">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                :class="data.currentQuantity <= 0 ? 'bg-red-500/15 text-red-700 border border-red-500/30' : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'"
              >
                {{ data.currentQuantity <= 0 ? 'نفد تماماً (Out of Stock)' : 'منخفض (Low Stock)' }}
              </span>
            </template>
          </Column>

          <template #empty>
            <div class="p-6 text-center text-xs text-brand-gray">
              <CheckCircle class="w-8 h-8 text-emerald-500/60 mx-auto mb-1.5" />
              مستوى المخزون في هذا الفرع ممتاز، لا توجد أصناف تحت الحد الأدنى حالياً.
            </div>
          </template>
        </DataTable>
      </div>
    </template>
  </div>
</template>

<script setup>
// TODO: Product condition/department fields not found in model — add migration when ready
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from "chart.js";
import { Doughnut, Bar } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const route = useRoute();
const branchStore = useOhdaBranchStore();
const loading = ref(false);

const branchId = computed(() => parseInt(route.params.id) || 1);
const dashboardData = computed(() => branchStore.branchDashboard);

function formatCurrency(val) {
  if (!val && val !== 0) return "0.00";
  return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Chart Configurations ---
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { font: { family: "inherit", size: 10 }, padding: 8 }
    }
  },
  cutout: "65%"
};

const categoryChartData = computed(() => {
  const breakdown = dashboardData.value?.categoryBreakdown || [];
  const labels = breakdown.map(c => c.categoryName);
  const data = breakdown.map(c => c.productCount);
  const colors = [
    "#3b82f6", "#10b981", "#cca752", "#8b5cf6",
    "#ec4899", "#f97316", "#06b6d4", "#64748b"
  ];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, Math.max(data.length, 1)),
        borderWidth: 0
      }
    ]
  };
});

const conditionChartData = computed(() => {
  const breakdown = dashboardData.value?.conditionBreakdown || [];
  const labels = breakdown.map(c => c.statusName);
  const data = breakdown.map(c => c.itemCount);
  const colors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b"];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, Math.max(data.length, 1)),
        borderWidth: 0
      }
    ]
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      ticks: { font: { family: "inherit", size: 10 } },
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { font: { family: "inherit", size: 10 } },
      grid: { color: "#f1f5f9" }
    }
  }
};

const requestsBarData = computed(() => {
  const stats = dashboardData.value?.requestStats || {};
  return {
    labels: ["بانتظار الموافقة", "معتمدة", "مرفوضة", "طلبات صرف", "طلبات إدخال"],
    datasets: [
      {
        label: "العدد",
        backgroundColor: ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"],
        borderRadius: 6,
        data: [
          stats.pendingCount || 0,
          stats.approvedCount || 0,
          stats.rejectedCount || 0,
          stats.totalExitRequests || 0,
          stats.totalEntryRequests || 0
        ]
      }
    ]
  };
});

async function fetchData() {
  loading.value = true;
  await branchStore.fetchBranchInventoryDashboard(branchId.value);
  loading.value = false;
}

onMounted(async () => {
  await fetchData();
});
</script>
