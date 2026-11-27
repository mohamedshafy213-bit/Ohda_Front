<template>
  <div class="space-y-6">
    <!-- 1. Header & Filters Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-brand-dark dark:text-white flex items-center gap-2">
          <BarChart3 class="w-6 h-6 text-brand-accent" />
          <span>مركز التقارير والتحليلات (CRM & Operations)</span>
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          تقارير ولاء وإنفاق العملاء، كفاءة وإشغال مناطق الصيانة، ومعدل تحويل التذكيرات إلى حجوزات مدفوعة
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="exportCurrentTabToExcel"
          class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>تصدير إكسل (Excel)</span>
        </button>

        <button
          @click="downloadServerPdf('/api/ReportsPdf/report/customers-spending', 'CustomersReport.pdf')"
          class="px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>تنزيل PDF</span>
        </button>

        <button
          @click="printReport"
          class="px-3.5 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة التقرير</span>
        </button>

        <button
          @click="loadAllReports"
          :disabled="reportsStore.loading"
          class="px-3.5 py-2 rounded-xl bg-brand-light dark:bg-white/10 hover:bg-brand-gray/10 text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', reportsStore.loading ? 'animate-spin' : '']" />
          <span>تحديث</span>
        </button>
      </div>
    </div>

    <!-- 2. High-Level KPI Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-3.5 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs">
        <div class="text-[10px] text-brand-gray">إجمالي العملاء المسجلين</div>
        <div class="text-lg font-black font-mono text-brand-dark dark:text-white mt-0.5">
          {{ reportsStore.kpis?.totalCustomers || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 shadow-xs">
        <div class="text-[10px] text-blue-600 dark:text-blue-400">إجمالي إيرادات المبيعات</div>
        <div class="text-lg font-black font-mono text-blue-700 dark:text-blue-300 mt-0.5">
          {{ formatCurrency(reportsStore.kpis?.totalRevenue || 0) }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 shadow-xs">
        <div class="text-[10px] text-rose-600 dark:text-rose-400">مستحقات وآجل العملاء</div>
        <div class="text-lg font-black font-mono text-rose-700 dark:text-rose-300 mt-0.5">
          {{ formatCurrency(reportsStore.kpis?.totalReceivables || 0) }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-500/20 shadow-xs">
        <div class="text-[10px] text-purple-600 dark:text-purple-400">المركبات النشطة</div>
        <div class="text-lg font-black font-mono text-purple-700 dark:text-purple-300 mt-0.5">
          {{ reportsStore.kpis?.totalVehicles || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs">
        <div class="text-[10px] text-amber-600 dark:text-amber-400">معدل عدم الحضور (No-Show)</div>
        <div class="text-lg font-black font-mono text-amber-700 dark:text-amber-300 mt-0.5">
          {{ reportsStore.bookingsAnalytics?.noShowRate || 0 }}%
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
        <div class="text-[10px] text-emerald-600 dark:text-emerald-400">معدل تحويل التذكيرات</div>
        <div class="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
          {{ reportsStore.remindersConversion?.conversionRate || 0 }}%
        </div>
      </div>
    </div>

    <!-- 3. Tabs Navigation -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2 text-xs font-semibold overflow-x-auto">
      <button
        @click="activeTab = 'customers'"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'customers'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <Users class="w-4 h-4" />
        <span>إنفاق وولاء العملاء ({{ reportsStore.customerSpending.length }})</span>
      </button>

      <button
        @click="activeTab = 'bookings'"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'bookings'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <CalendarDays class="w-4 h-4" />
        <span>تحليل الحجوزات وإشغال مناطق الصيانة</span>
      </button>

      <button
        @click="activeTab = 'reminders'"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'reminders'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <TrendingUp class="w-4 h-4" />
        <span>معدل تحويل التذكيرات الدورية</span>
      </button>
    </div>

    <!-- TAB 1: Customers Spending & Retention -->
    <div v-if="activeTab === 'customers'" class="space-y-4">
      <!-- Sub-filter bar: Top Spenders vs Inactive -->
      <div class="p-3 bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-brand-gray font-semibold">عرض:</span>
          <button
            @click="setCustomerFilter(null)"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              inactiveFilter === null ? 'bg-brand-dark text-white font-bold' : 'hover:bg-brand-light text-brand-dark dark:text-white'
            ]"
          >
            كبار العملاء إنفاقاً (Top Spenders)
          </button>
          <button
            @click="setCustomerFilter(3)"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              inactiveFilter === 3 ? 'bg-amber-600 text-white font-bold' : 'hover:bg-brand-light text-brand-dark dark:text-white'
            ]"
          >
            خاملون (+3 أشهر بدون زيارة)
          </button>
          <button
            @click="setCustomerFilter(6)"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              inactiveFilter === 6 ? 'bg-rose-600 text-white font-bold' : 'hover:bg-brand-light text-brand-dark dark:text-white'
            ]"
          >
            خاملون (+6 أشهر)
          </button>
        </div>

        <div class="relative w-full sm:w-64">
          <Search class="w-3.5 h-3.5 text-brand-gray absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="customerSearch"
            @input="filterCustomers"
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            class="w-full pr-8 pl-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs"
          />
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/50 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray font-semibold">
              <tr>
                <th class="p-3">#</th>
                <th class="p-3">العميل</th>
                <th class="p-3">النوع</th>
                <th class="p-3 font-mono">إجمالي الإنفاق</th>
                <th class="p-3 font-mono">المسدد</th>
                <th class="p-3 font-mono">المديونية</th>
                <th class="p-3">عدد الزيارات</th>
                <th class="p-3">آخر زيارة</th>
                <th class="p-3">فترة الغياب</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10 text-brand-dark dark:text-white">
              <tr
                v-for="(c, idx) in displayedCustomers"
                :key="c.clientId"
                class="hover:bg-brand-light/40 dark:hover:bg-white/5 transition-colors"
              >
                <td class="p-3 font-mono font-bold text-brand-gray text-[11px]">{{ idx + 1 }}</td>
                <td class="p-3">
                  <div class="font-bold">{{ c.clientName }}</div>
                  <a :href="'tel:' + c.Phone" class="text-[11px] font-mono text-brand-gray hover:text-brand-accent">
                    {{ c.phone }}
                  </a>
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] bg-brand-light dark:bg-white/10 font-bold">
                    {{ c.clientType }}
                  </span>
                </td>
                <td class="p-3 font-mono font-bold text-brand-dark dark:text-white">
                  {{ formatCurrency(c.totalSpent) }}
                </td>
                <td class="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {{ formatCurrency(c.totalPaid) }}
                </td>
                <td class="p-3 font-mono font-bold">
                  <span :class="c.remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-brand-gray'">
                    {{ formatCurrency(c.remainingBalance) }}
                  </span>
                </td>
                <td class="p-3 font-mono font-bold">{{ c.visitsCount }}</td>
                <td class="p-3 font-mono text-brand-gray text-[11px]">
                  {{ formatDate(c.lastVisitDate) || 'لا توجد زيارات' }}
                </td>
                <td class="p-3">
                  <span
                    v-if="c.daysSinceLastVisit < 900"
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                      c.daysSinceLastVisit > 180
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : c.daysSinceLastVisit > 90
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    ]"
                  >
                    منذ {{ c.daysSinceLastVisit }} يوم
                  </span>
                  <span v-else class="text-[10px] text-brand-gray">عميل جديد</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Bookings & Bay Utilization -->
    <div v-if="activeTab === 'bookings'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bay Utilization Table -->
        <div class="bg-brand-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-brand-gray/15 space-y-3">
          <h3 class="font-bold text-sm text-brand-dark dark:text-white flex items-center gap-2">
            <Warehouse class="w-4 h-4 text-brand-accent" />
            <span>نسبة إشغال مناطق الصيانة وحارات العمل</span>
          </h3>

          <div class="divide-y divide-brand-gray/10 text-xs">
            <div
              v-for="bay in reportsStore.bookingsAnalytics?.byBay || []"
              :key="bay.bayId"
              class="py-2.5 flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-brand-dark dark:text-white">{{ bay.bayName }}</div>
                <div class="text-[11px] text-brand-gray">
                  {{ bay.bookingsCount }} حجز &bull; {{ bay.totalBookedHours }} ساعة تشغيل
                </div>
              </div>

              <div class="text-left">
                <span class="font-bold font-mono text-sm text-brand-accent">
                  {{ bay.utilizationPercentage }}%
                </span>
                <div class="w-20 bg-brand-light dark:bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    class="bg-brand-accent h-full rounded-full"
                    :style="{ width: Math.min(100, bay.utilizationPercentage) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bookings by Source -->
        <div class="bg-brand-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-brand-gray/15 space-y-3">
          <h3 class="font-bold text-sm text-brand-dark dark:text-white flex items-center gap-2">
            <PhoneCall class="w-4 h-4 text-brand-accent" />
            <span>مصادر الحجوزات (Channels)</span>
          </h3>

          <div class="divide-y divide-brand-gray/10 text-xs">
            <div
              v-for="src in reportsStore.bookingsAnalytics?.bySource || []"
              :key="src.sourceName"
              class="py-2.5 flex items-center justify-between"
            >
              <div class="font-bold text-brand-dark dark:text-white">{{ src.sourceName }}</div>

              <div class="flex items-center gap-3 font-mono">
                <span class="text-brand-gray text-[11px]">{{ src.count }} حجز</span>
                <span class="font-bold text-brand-dark dark:text-white">{{ src.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookings Status Summary Strip -->
      <div class="p-4 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
        <div>
          <div class="text-[10px] text-brand-gray">إجمالي الحجوزات</div>
          <div class="font-bold font-mono text-sm mt-0.5">{{ reportsStore.bookingsAnalytics?.totalBookings || 0 }}</div>
        </div>
        <div>
          <div class="text-[10px] text-blue-600 dark:text-blue-400">مؤكدة</div>
          <div class="font-bold font-mono text-sm mt-0.5">{{ reportsStore.bookingsAnalytics?.confirmedCount || 0 }}</div>
        </div>
        <div>
          <div class="text-[10px] text-emerald-600 dark:text-emerald-400">مكتملة الصيانة</div>
          <div class="font-bold font-mono text-sm mt-0.5">{{ reportsStore.bookingsAnalytics?.completedCount || 0 }}</div>
        </div>
        <div>
          <div class="text-[10px] text-amber-600 dark:text-amber-400">لم يحضر (No-Show)</div>
          <div class="font-bold font-mono text-sm mt-0.5">{{ reportsStore.bookingsAnalytics?.noShowCount || 0 }}</div>
        </div>
        <div>
          <div class="text-[10px] text-rose-600 dark:text-rose-400">ملغية</div>
          <div class="font-bold font-mono text-sm mt-0.5">{{ reportsStore.bookingsAnalytics?.cancelledCount || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Reminders Conversion Report -->
    <div v-if="activeTab === 'reminders'" class="space-y-4">
      <div class="p-4 sm:p-5 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15">
        <h3 class="font-bold text-sm text-brand-dark dark:text-white mb-1">معدل تحويل التذكيرات حسب الخدمات الدورية</h3>
        <p class="text-xs text-brand-gray mb-4">
          يقيس هذا التقرير عدد العملاء الذين تلقوا تذكيرات صيانة دورية (تغيير زيت، فحص، فرامل) وقاموا بالحجز الفعلي.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/50 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray font-semibold">
              <tr>
                <th class="p-3">الخدمة الدورية</th>
                <th class="p-3 font-mono">إجمالي التذكيرات الصادرة</th>
                <th class="p-3 font-mono">تم الحجز بنجاح</th>
                <th class="p-3 font-mono">نسبة التحويل (ROI)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10 text-brand-dark dark:text-white">
              <tr
                v-for="svc in reportsStore.remindersConversion?.byService || []"
                :key="svc.workshopServiceId"
                class="hover:bg-brand-light/40 dark:hover:bg-white/5"
              >
                <td class="p-3 font-bold">{{ svc.serviceName }}</td>
                <td class="p-3 font-mono font-bold">{{ svc.totalReminders }}</td>
                <td class="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {{ svc.bookedCount }}
                </td>
                <td class="p-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {{ svc.conversionRate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { downloadServerPdf, printServerPdf } from "../utils/pdfHelper";
import { useOhdaReportsStore } from "../stores/useOhdaReportsStore";
import {
  BarChart3,
  Users,
  CalendarDays,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Search,
  Warehouse,
  PhoneCall
} from "lucide-vue-next";

const reportsStore = useOhdaReportsStore();

const activeTab = ref("customers");
const inactiveFilter = ref(null);
const customerSearch = ref("");

onMounted(async () => {
  await loadAllReports();
});

async function loadAllReports() {
  try {
    await reportsStore.fetchKpis();
    await reportsStore.fetchCustomerSpending({ inactiveMonths: inactiveFilter.value });
    await reportsStore.fetchBookingsAnalytics();
    await reportsStore.fetchRemindersConversion();
  } catch (err) {
    console.error("loadAllReports error:", err);
  }
}

async function setCustomerFilter(months) {
  inactiveFilter.value = months;
  await reportsStore.fetchCustomerSpending({ inactiveMonths: months, search: customerSearch.value });
}

async function filterCustomers() {
  await reportsStore.fetchCustomerSpending({ inactiveMonths: inactiveFilter.value, search: customerSearch.value });
}

const displayedCustomers = computed(() => {
  return reportsStore.customerSpending || [];
});

function formatCurrency(val) {
  const num = Number(val) || 0;
  return `${num.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

function formatDate(val) {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(val);
  }
}

function exportCurrentTabToExcel() {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  if (activeTab.value === "customers") {
    csvContent += "العميل,الهاتف,النوع,إجمالي الإنفاق,المسدد,المديونية,الزيارات,آخر زيارة\n";
    displayedCustomers.value.forEach(c => {
      csvContent += `"${c.clientName}","${c.phone}","${c.clientType}","${c.totalSpent}","${c.totalPaid}","${c.remainingBalance}","${c.visitsCount}","${c.lastVisitDate || ''}"\n`;
    });
  } else if (activeTab.value === "bookings") {
    csvContent += "منطقة الصيانة,عدد الحجوزات,ساعات التشغيل,نسبة الإشغال %\n";
    (reportsStore.bookingsAnalytics?.byBay || []).forEach(b => {
      csvContent += `"${b.bayName}","${b.bookingsCount}","${b.totalBookedHours}","${b.utilizationPercentage}%"\n`;
    });
  } else {
    csvContent += "الخدمة الدورية,التذكيرات الصادرة,تم الحجز,نسبة التحويل %\n";
    (reportsStore.remindersConversion?.byService || []).forEach(s => {
      csvContent += `"${s.serviceName}","${s.totalReminders}","${s.bookedCount}","${s.conversionRate}%"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ohda-report-${activeTab.value}-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printReport() {
  const type = activeTab.value === "bookings" ? "bookings" : "customers-spending";
  printServerPdf(`/api/ReportsPdf/report/${type}`, `Report_${type}.pdf`);
}
</script>
