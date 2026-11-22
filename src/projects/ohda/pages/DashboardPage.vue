<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-brand-accent/10">
          <img v-if="workshopSettings.logoUrl" :src="workshopSettings.logoUrl" alt="شعار المركز" class="w-full h-full object-cover" />
          <Wrench v-else class="w-7 h-7 text-brand-accent" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
            <span>{{ workshopTitle }}</span>
          </h1>
          <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
            {{ workshopSettings.slogan || 'نظام إدارة ورشة الصيانة والعناية بالسيارات' }} — مرحباً بك
            <span class="font-bold text-brand-accent">{{ authStore.userName }}</span>
            ({{ authStore.user?.roleName || 'مدير الورشة' }})
          </p>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <router-link to="/ohda/jobs">
          <Button class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 shadow-md shadow-brand-accent/10 cursor-pointer">
            <Plus class="w-4 h-4" />
            <span>+ أمر شغل جديد</span>
          </Button>
        </router-link>

        <router-link to="/ohda/expenses">
          <Button class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 dark:!text-red-400 !border !border-red-500/25 !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer">
            <Receipt class="w-4 h-4" />
            <span>+ تسجيل مصروف</span>
          </Button>
        </router-link>

        <router-link to="/ohda/settings">
          <Button class="!bg-brand-gray/10 hover:!bg-brand-gray/20 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer" title="تخصيص الاسم والشعار والألوان">
            <Sliders class="w-4 h-4 text-brand-accent" />
            <span>إعدادات الهوية</span>
          </Button>
        </router-link>

        <button
          type="button"
          @click="handleCashDrawerClick"
          class="!font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer border transition-all active:scale-95"
          :class="financeStore.hasActiveDrawer ? '!bg-purple-600/10 hover:!bg-purple-600/20 !text-purple-600 dark:!text-purple-400 !border-purple-500/25' : '!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !border-brand-accent'"
        >
          <Scale v-if="financeStore.hasActiveDrawer" class="w-4 h-4" />
          <KeyRound v-else class="w-4 h-4" />
          <span>{{ financeStore.hasActiveDrawer ? 'تقفيل الكاش' : 'بدء يوم العمل (فتح الدرج)' }}</span>
        </button>
      </div>
    </div>

    <!-- Cash Drawer & Working Day Shift Component -->
    <CashDrawerWidget ref="cashDrawerWidgetRef" />

    <!-- 7 Core Workshop KPIs (User Explicit Requirements) -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      <!-- 1. Today's Sales -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
          <span class="text-[11px] font-bold">مبيعات اليوم</span>
          <Banknote class="w-4 h-4" />
        </div>
        <span class="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(todaySales) }}
        </span>
      </div>

      <!-- 2. This Month's Sales -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
          <span class="text-[11px] font-bold">مبيعات الشهر</span>
          <TrendingUp class="w-4 h-4" />
        </div>
        <span class="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
          {{ formatCurrency(monthSales) }}
        </span>
      </div>

      <!-- 3. This Month's Expenses -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between text-red-600 dark:text-red-400 mb-2">
          <span class="text-[11px] font-bold">مصروفات الشهر</span>
          <Receipt class="w-4 h-4" />
        </div>
        <span class="text-base font-bold font-mono text-red-600 dark:text-red-400">
          {{ formatCurrency(monthExpenses) }}
        </span>
      </div>

      <!-- 4. Net Profit -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between" :class="netProfit >= 0 ? 'bg-emerald-500/5' : 'bg-red-500/5'">
        <div class="flex items-center justify-between mb-2" :class="netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'">
          <span class="text-[11px] font-bold">صافي الربح</span>
          <Wallet class="w-4 h-4" />
        </div>
        <span class="text-base font-bold font-mono" :class="netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
          {{ formatCurrency(netProfit) }}
        </span>
      </div>

      <!-- 5. Unpaid Customer Balances -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
          <span class="text-[11px] font-bold">ديون عملاء معلقة</span>
          <Clock class="w-4 h-4" />
        </div>
        <span class="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
          {{ formatCurrency(unpaidBalances) }}
        </span>
      </div>

      <!-- 6. Low Stock Items -->
      <router-link to="/ohda/products" class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between hover:border-red-500/40 transition-colors">
        <div class="flex items-center justify-between text-rose-500 mb-2">
          <span class="text-[11px] font-bold">نواقص المخزن</span>
          <AlertTriangle class="w-4 h-4" />
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
            {{ lowStockCount }}
          </span>
          <span class="text-[10px] text-slate-400">صنف ناقص</span>
        </div>
      </router-link>

      <!-- 7. Open Jobs in Workshop -->
      <router-link to="/ohda/jobs" class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
        <div class="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-2">
          <span class="text-[11px] font-bold">سيارات بالورشة</span>
          <Car class="w-4 h-4" />
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
            {{ openJobsCount }}
          </span>
          <span class="text-[10px] text-slate-400">أمر مفتوح</span>
        </div>
      </router-link>
    </div>

    <!-- Chart: Daily Income vs Expenses (User Explicit Requirement) -->
    <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
        <div>
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-brand-accent" />
            <span>مقارنة الإيرادات والمصروفات اليومية (Income vs Expenses)</span>
          </h2>
          <p class="text-[11px] text-slate-400 mt-0.5">
            حركة المبيعات المحصلة مقابل المصروفات خلال الأيام الماضية
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
            <span class="text-slate-600 dark:text-slate-300 font-bold">الإيرادات والتحصيل</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md bg-red-400 inline-block"></span>
            <span class="text-slate-600 dark:text-slate-300 font-bold">المصروفات</span>
          </div>
        </div>
      </div>

      <!-- CSS / SVG Bar Chart -->
      <div class="pt-4">
        <div class="flex items-end gap-2 md:gap-4 h-52">
          <div
            v-for="(day, idx) in dailyChartData"
            :key="idx"
            class="flex-1 flex flex-col items-center gap-1.5 group cursor-default"
          >
            <!-- Bars Container -->
            <div class="w-full flex items-end justify-center gap-1 h-44 relative">
              <!-- Income Bar -->
              <div
                class="w-full max-w-[18px] rounded-t-md bg-emerald-500/85 hover:bg-emerald-500 transition-all duration-300 relative"
                :style="{ height: `${day.incomeHeight}%` }"
              >
                <!-- Tooltip -->
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                  +{{ formatCurrency(day.income) }}
                </div>
              </div>

              <!-- Expense Bar -->
              <div
                class="w-full max-w-[18px] rounded-t-md bg-red-400/85 hover:bg-red-500 transition-all duration-300 relative"
                :style="{ height: `${day.expenseHeight}%` }"
              >
                <!-- Tooltip -->
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                  -{{ formatCurrency(day.expense) }}
                </div>
              </div>
            </div>

            <!-- Date Label -->
            <span class="text-[10px] text-slate-400 font-mono whitespace-nowrap">
              {{ day.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 Column Section: Active Workshop Cars & Low-Stock Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Section 1: Active Cars in Workshop (Open Jobs) -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Car class="w-4 h-4 text-sky-500" />
            <span>السيارات وأوامر الشغل الحالية بالورشة</span>
          </h2>
          <router-link to="/ohda/jobs" class="text-xs text-brand-accent hover:underline font-bold">
            عرض الكل ({{ openJobsList.length }})
          </router-link>
        </div>

        <div v-if="openJobsList.length === 0" class="text-center py-8 text-xs text-slate-400">
          لا يوجد سيارات قيد الصيانة بالورشة حالياً
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="job in openJobsList.slice(0, 5)"
            :key="job.id"
            class="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10 flex items-center justify-between hover:border-brand-accent/30 transition-colors"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-brand-dark dark:text-white">{{ job.customerName }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-accent/15 text-brand-dark dark:text-brand-accent font-bold">
                  {{ job.carPlate }}
                </span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ job.carModel || 'سيارة' }} • أمر: <span class="font-mono">{{ job.jobNumber }}</span>
              </div>
            </div>

            <div class="text-end">
              <span
                class="px-2 py-0.5 rounded-full text-[9px] font-bold"
                :class="job.status === 2 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'"
              >
                {{ job.status === 2 ? 'جاهزة للتسليم' : 'قيد الصيانة' }}
              </span>
              <span class="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
                {{ formatCurrency(job.totalAmount) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Low-Stock Inventory Warning -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-rose-500" />
            <span>تنبيهات الأصناف تحت حد الأمان بالمخزن</span>
          </h2>
          <router-link to="/ohda/products" class="text-xs text-brand-accent hover:underline font-bold">
            إدارة المخزن
          </router-link>
        </div>

        <div v-if="inventoryStore.lowStockProducts.length === 0" class="text-center py-8 text-xs text-slate-400">
          جميع الأصناف متوفرة ورصيد المخزن في الحدود الآمنة الممتازة!
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="prod in inventoryStore.lowStockProducts.slice(0, 5)"
            :key="prod.id"
            class="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between"
          >
            <div>
              <span class="text-xs font-bold text-brand-dark dark:text-white block">{{ prod.name }}</span>
              <span class="text-[10px] text-slate-400 block">{{ prod.categoryName || 'عام' }} [{{ prod.sku }}]</span>
            </div>

            <div class="text-end">
              <span class="text-xs font-mono font-bold text-red-600 dark:text-red-400 block">
                {{ prod.currentQuantity }} {{ prod.unit || 'قطعة' }}
              </span>
              <span class="text-[9px] text-slate-400 block">حد الأمان: {{ prod.minQuantity || 5 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaJobCardStore } from "../stores/useOhdaJobCardStore";
import { useOhdaExpenseStore } from "../stores/useOhdaExpenseStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import CashDrawerWidget from "../components/CashDrawerWidget.vue";
import Button from "primevue/button";
import {
  Wrench,
  Plus,
  Receipt,
  Scale,
  KeyRound,
  Banknote,
  TrendingUp,
  Wallet,
  Clock,
  AlertTriangle,
  Car,
  BarChart3,
  Sliders
} from "lucide-vue-next";
import { getBranchSettings, formatBranchCurrency } from "../utilities/themeManager";

const authStore = useOhdaAuthStore();
const jobStore = useOhdaJobCardStore();
const expenseStore = useOhdaExpenseStore();
const inventoryStore = useOhdaInventoryStore();
const financeStore = useOhdaFinanceStore();
const cashDrawerWidgetRef = ref(null);

const workshopSettings = ref(getBranchSettings());

const workshopTitle = computed(() => {
  return workshopSettings.value.branchName || authStore.branchName || "لوحة التحكم ومؤشرات أداء الورشة";
});

function handleCashDrawerClick() {
  if (financeStore.hasActiveDrawer) {
    cashDrawerWidgetRef.value?.openCloseDayModal();
  } else {
    cashDrawerWidgetRef.value?.openStartDayModal();
  }
}

onMounted(async () => {
  workshopSettings.value = getBranchSettings();
  await Promise.all([
    jobStore.fetchJobs(),
    expenseStore.fetchExpenses(),
    inventoryStore.fetchProducts(),
    financeStore.fetchAccounts(),
    financeStore.fetchCurrentDrawerSession()
  ]);
});

function formatCurrency(amount) {
  return formatBranchCurrency(amount);
}

// 1. Today's Sales
const todaySales = computed(() => {
  const todayStr = new Date().toISOString().split("T")[0];
  return jobStore.jobs
    .filter(j => j.status !== 4 && j.insertDate && j.insertDate.startsWith(todayStr))
    .reduce((sum, j) => sum + (Number(j.paidAmount) || 0), 0);
});

// 2. This Month's Sales
const monthSales = computed(() => {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  return jobStore.jobs
    .filter(j => {
      if (j.status === 4 || !j.insertDate) return false;
      const d = new Date(j.insertDate);
      return (d.getMonth() + 1) === m && d.getFullYear() === y;
    })
    .reduce((sum, j) => sum + (Number(j.paidAmount) || 0), 0);
});

// 3. This Month's Expenses
const monthExpenses = computed(() => {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  return expenseStore.expenses
    .filter(e => {
      if (!e.expenseDate) return false;
      const d = new Date(e.expenseDate);
      return (d.getMonth() + 1) === m && d.getFullYear() === y;
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
});

// 4. Net Profit
const netProfit = computed(() => {
  return monthSales.value - monthExpenses.value;
});

// 5. Unpaid Balances
const unpaidBalances = computed(() => {
  return jobStore.totalUnpaidReceivables;
});

// 6. Low Stock Count
const lowStockCount = computed(() => {
  return inventoryStore.lowStockCount;
});

// 7. Open Jobs
const openJobsCount = computed(() => {
  return jobStore.openJobsCount;
});

const openJobsList = computed(() => {
  return jobStore.jobs.filter(j => j.status === 1 || j.status === 2);
});

// Daily Income vs Expense Chart (Past 7 Days)
const dailyChartData = computed(() => {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" });

    // Income on that date
    const dayIncome = jobStore.jobs
      .filter(j => j.status !== 4 && j.insertDate && j.insertDate.startsWith(dateStr))
      .reduce((sum, j) => sum + (Number(j.paidAmount) || 0), 0);

    // Expense on that date
    const dayExpense = expenseStore.expenses
      .filter(e => e.expenseDate && e.expenseDate.startsWith(dateStr))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    days.push({
      date: dateStr,
      label: dayLabel,
      income: dayIncome,
      expense: dayExpense
    });
  }

  // Calculate bar heights proportionally
  const maxVal = Math.max(
    ...days.map(d => Math.max(d.income, d.expense)),
    1000 // min ceiling
  );

  return days.map(d => ({
    ...d,
    incomeHeight: Math.min(Math.round((d.income / maxVal) * 100), 100),
    expenseHeight: Math.min(Math.round((d.expense / maxVal) * 100), 100)
  }));
});
</script>
