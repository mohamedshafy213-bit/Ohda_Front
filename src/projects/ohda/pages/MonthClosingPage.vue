<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <CalendarCheck2 class="w-7 h-7 text-brand-accent" />
          <span>الإقفال المالي الشهري والتقارير</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          مراجعة المبيعات والتحصيلات، تحليل المصروفات، صافي الأرباح، ديون العملاء، وإقفال الشهر وتصدير التقرير
        </p>
      </div>

      <!-- Action Buttons & Month Selector -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Month Picker -->
        <select
          v-model.number="selectedMonth"
          @change="loadMonthData"
          class="text-xs p-2 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-bold"
        >
          <option v-for="m in 12" :key="m" :value="m" class="bg-white dark:bg-slate-800">شهر {{ m }}</option>
        </select>

        <!-- Year Picker -->
        <select
          v-model.number="selectedYear"
          @change="loadMonthData"
          class="text-xs p-2 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold"
        >
          <option :value="2025" class="bg-white dark:bg-slate-800">2025</option>
          <option :value="2026" class="bg-white dark:bg-slate-800">2026</option>
          <option :value="2027" class="bg-white dark:bg-slate-800">2027</option>
        </select>

        <!-- Print Report -->
        <Button
          @click="triggerPrint"
          class="!bg-black/5 dark:!bg-white/5 hover:!bg-black/10 !text-brand-dark dark:!text-white !border !border-brand-gray/20 dark:!border-white/10 !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة تقرير الشهر</span>
        </Button>

        <!-- Export CSV -->
        <Button
          @click="exportCsv"
          class="!bg-emerald-600/10 hover:!bg-emerald-600/20 !text-emerald-600 dark:!text-emerald-400 !border !border-emerald-500/30 !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Download class="w-4 h-4" />
          <span>تصدير Excel</span>
        </Button>

        <!-- Lock / Reopen Action -->
        <Button
          v-if="!closingStore.isMonthLocked"
          @click="openCloseModal"
          class="!bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <Lock class="w-4 h-4" />
          <span>إقفال الشهر واعتماده</span>
        </Button>

        <Button
          v-else
          @click="openReopenModal"
          class="!bg-amber-600 hover:!bg-amber-700 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Unlock class="w-4 h-4" />
          <span>إعادة فتح الشهر</span>
        </Button>
      </div>
    </div>

    <!-- Month Status Banner -->
    <div
      v-if="closingStore.preview"
      class="p-4 rounded-2xl border flex items-center justify-between gap-4 print:hidden"
      :class="closingStore.isMonthLocked
        ? 'bg-purple-500/10 border-purple-500/25 text-purple-800 dark:text-purple-300'
        : 'bg-amber-500/10 border-amber-500/25 text-amber-800 dark:text-amber-300'"
    >
      <div class="flex items-center gap-3">
        <component :is="closingStore.isMonthLocked ? Lock : AlertCircle" class="w-5 h-5 shrink-0" />
        <div>
          <span class="text-xs font-bold block">
            {{ closingStore.isMonthLocked ? 'هذا الشهر مقفل ومعتمد رسمياً' : 'الشهر مفتوح حالياً وقيد التسجيل اليومي' }}
          </span>
          <span class="text-[11px] opacity-80 block mt-0.5">
            {{ closingStore.isMonthLocked
              ? `تم الاعتماد بتاريخ ${formatDate(closingStore.preview.closedAt)} بواسطة ${closingStore.preview.closedByUserName || 'الإدارة'}`
              : 'يمكنك مراجعة الأرقام وفي نهاية الشهر اضغط على "إقفال الشهر واعتماده" لحفظ السجل وتجميد التعديلات.' }}
          </span>
        </div>
      </div>

      <span
        class="px-3 py-1 rounded-full text-[11px] font-bold border shrink-0"
        :class="closingStore.isMonthLocked ? 'bg-purple-600 text-white border-purple-500' : 'bg-amber-500 text-white border-amber-400'"
      >
        {{ closingStore.isMonthLocked ? 'شهر مغلق ومحمي' : 'شهر مفتوح' }}
      </span>
    </div>

    <!-- Print Header (Visible only in print) -->
    <div class="hidden print:block text-center border-b pb-4 mb-4">
      <h1 class="text-xl font-bold text-black">تقرير الإقفال المالي والحسابات الشهرية</h1>
      <p class="text-sm text-gray-600">ورشة الصيانة ومركز العناية بالسيارات - تقرير شهر {{ selectedMonth }} / {{ selectedYear }}</p>
      <div class="flex justify-between text-xs text-gray-500 mt-2">
        <span>تاريخ الطباعة: {{ formatDate(new Date()) }}</span>
        <span>حالة الإقفال: {{ closingStore.isMonthLocked ? 'معتمد ومغلق' : 'مسودة قيد العمل' }}</span>
      </div>
    </div>

    <!-- 6 KPI Metric Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Total Invoiced -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي الفواتير الصادرة</span>
        <span class="text-base font-bold text-brand-dark dark:text-white font-mono mt-1 block">
          {{ formatCurrency(closingStore.preview?.totalInvoiced) }}
        </span>
      </div>

      <!-- Total Collected -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">المحصل الفعلي</span>
        <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
          {{ formatCurrency(closingStore.preview?.totalCollected) }}
        </span>
      </div>

      <!-- Unpaid Receivables -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <span class="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">ديون عملاء غير محصلة</span>
        <span class="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
          {{ formatCurrency(closingStore.preview?.totalUnpaid) }}
        </span>
      </div>

      <!-- Total Expenses -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <span class="text-[11px] text-red-600 dark:text-red-400 block font-medium">إجمالي المصروفات</span>
        <span class="text-base font-bold text-red-600 dark:text-red-400 font-mono mt-1 block">
          {{ formatCurrency(closingStore.preview?.totalExpenses) }}
        </span>
      </div>

      <!-- Net Profit (Collected - Expenses) -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm" :class="netProfitBgClass">
        <span class="text-[11px] font-bold block" :class="netProfitTextClass">صافي الربح الفعلي</span>
        <span class="text-base font-bold font-mono mt-1 block" :class="netProfitTextClass">
          {{ formatCurrency(closingStore.preview?.netProfit) }}
        </span>
      </div>

      <!-- Estimated Margin -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <span class="text-[11px] text-purple-600 dark:text-purple-400 block font-medium">الربح التقديري (بعد القطع)</span>
        <span class="text-base font-bold text-purple-600 dark:text-purple-400 font-mono mt-1 block">
          {{ formatCurrency(closingStore.preview?.estimatedGrossProfit) }}
        </span>
      </div>
    </div>

    <!-- 2 Column Layout: Unpaid Invoices & Expenses Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Section A: Unpaid Customer Debts -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Users class="w-4 h-4 text-amber-500" />
            <span>كشف ديون العملاء والفواتير المعلقة</span>
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {{ closingStore.unpaidJobsCount }} فاتورة غير مكتملة
          </span>
        </div>

        <div v-if="closingStore.unpaidJobsCount === 0" class="p-6 text-center text-xs text-slate-400">
          لا يوجد أي ديون أو مبالغ متبقية على العملاء لهذا الشهر!
        </div>

        <div v-else class="overflow-x-auto max-h-80 overflow-y-auto">
          <table class="w-full text-start border-collapse text-xs">
            <thead>
              <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-slate-400 font-semibold">
                <th class="p-2.5 text-start">رقم الأمر</th>
                <th class="p-2.5 text-start">العميل والسيارة</th>
                <th class="p-2.5 text-start">الحالة</th>
                <th class="p-2.5 text-start">المتبقي (ج.م)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
              <tr
                v-for="job in closingStore.preview.unpaidJobs"
                :key="job.jobId"
                class="hover:bg-black/5 dark:hover:bg-white/5"
              >
                <td class="p-2.5 font-mono font-bold">{{ job.JobNumber || job.jobNumber }}</td>
                <td class="p-2.5">
                  <div class="font-bold text-brand-dark dark:text-white">{{ job.CustomerName || job.customerName }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ job.CarPlate || job.carPlate }} - {{ job.CarModel || job.carModel }}</div>
                </td>
                <td class="p-2.5 whitespace-nowrap">
                  <span
                    v-if="job.isDoneButUnpaid"
                    class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1 w-fit"
                  >
                    <AlertTriangle class="w-3 h-3" />
                    جاهزة ولم تسدد
                  </span>
                  <span v-else class="text-[10px] text-slate-400">
                    {{ job.statusName }}
                  </span>
                </td>
                <td class="p-2.5 font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ formatCurrency(job.remainingBalance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section B: Expenses Breakdown by Category -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <PieChart class="w-4 h-4 text-purple-500" />
            <span>تحليل المصروفات حسب البند</span>
          </h2>
          <span class="text-xs font-mono font-bold text-red-600 dark:text-red-400">
            {{ formatCurrency(closingStore.preview?.totalExpenses) }}
          </span>
        </div>

        <div v-if="!closingStore.preview?.expensesBreakdown?.length" class="p-6 text-center text-xs text-slate-400">
          لا توجد مصروفات مسجلة لهذا الشهر
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in closingStore.preview.expensesBreakdown"
            :key="item.expenseType"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700 dark:text-slate-300">{{ item.typeName }}</span>
              <div class="flex items-center gap-2 font-mono">
                <span class="font-bold">{{ formatCurrency(item.totalAmount) }}</span>
                <span class="text-[10px] text-slate-400">({{ item.percentage }}%)</span>
              </div>
            </div>

            <!-- Visual Bar -->
            <div class="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getExpenseBarColor(item.expenseType)"
                :style="{ width: `${item.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section C & D: Accounts Reconciliation & Stock/Payroll Asset Values -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Section C: Cash & Bank Accounts Reconciliation -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Landmark class="w-4 h-4 text-blue-500" />
            <span>مطابقة أرصدة الخزائن والبنوك عند الإقفال</span>
          </h2>
          <span class="text-xs text-slate-400">الأرصدة الحالية</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="acc in closingStore.preview?.accountsReconciliation"
            :key="acc.accountId"
            class="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10 flex items-center justify-between"
          >
            <div>
              <span class="text-xs font-bold text-brand-dark dark:text-white block">{{ acc.accountName }}</span>
              <span class="text-[10px] text-slate-400 block">{{ acc.accountTypeName }}</span>
            </div>
            <span class="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(acc.currentBalance) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Section D: Stock Value & Payroll Summary -->
      <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Boxes class="w-4 h-4 text-emerald-500" />
            <span>ملخص قيمة المخزون ومسير الرواتب</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Stock Asset Value -->
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
            <span class="text-xs text-emerald-800 dark:text-emerald-300 font-bold">إجمالي قيمة بضاعة المخزن بسعر التكلفة:</span>
            <span class="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-2">
              {{ formatCurrency(closingStore.preview?.stockValue) }}
            </span>
          </div>

          <!-- Monthly Payroll -->
          <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
            <span class="text-xs text-purple-800 dark:text-purple-300 font-bold">إجمالي مسير رواتب موظفي الشهر:</span>
            <span class="text-lg font-bold font-mono text-purple-700 dark:text-purple-300 mt-2">
              {{ formatCurrency(closingStore.preview?.payrollTotal) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section E: Returns & Invoices Reconciliation -->
    <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-gray/10 pb-3">
        <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <RotateCcw class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>تسوية المرتجعات وربطها بالفواتير وأوامر الشغل الصادرة</span>
        </h2>
        <div class="flex items-center gap-3 text-xs flex-wrap">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
            صافي مبيعات الشهر: {{ formatCurrency(closingStore.preview?.netSales || ((closingStore.preview?.totalInvoiced || 0) - (closingStore.preview?.totalClientReturns || 0))) }}
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
            صافي مشتريات الشهر: {{ formatCurrency(closingStore.preview?.netPurchases || ((closingStore.preview?.totalPurchases || 0) - (closingStore.preview?.totalSupplierReturns || 0))) }}
          </span>
        </div>
      </div>

      <!-- Quick Net Breakdown Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10">
          <div class="text-[10px] text-brand-gray">فواتير مبيعات صادرة (+)</div>
          <div class="font-bold font-mono text-sm text-brand-dark dark:text-white mt-1">
            {{ formatCurrency(closingStore.preview?.totalInvoiced) }}
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div class="text-[10px] text-purple-700 dark:text-purple-300">مرتجعات مبيعات العملاء (-)</div>
          <div class="font-bold font-mono text-sm text-purple-700 dark:text-purple-300 mt-1">
            -{{ formatCurrency(closingStore.preview?.totalClientReturns) }}
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10">
          <div class="text-[10px] text-brand-gray">فواتير مشتريات موردين (+)</div>
          <div class="font-bold font-mono text-sm text-brand-dark dark:text-white mt-1">
            {{ formatCurrency(closingStore.preview?.totalPurchases) }}
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div class="text-[10px] text-blue-700 dark:text-blue-300">مرتجعات مشتريات للموردين (-)</div>
          <div class="font-bold font-mono text-sm text-blue-700 dark:text-blue-300 mt-1">
            -{{ formatCurrency(closingStore.preview?.totalSupplierReturns) }}
          </div>
        </div>
      </div>

      <!-- Detailed Returns List -->
      <div v-if="!closingStore.preview?.returnsBreakdown?.length" class="p-6 text-center text-xs text-slate-400">
        لا توجد أي مرتجعات مسجلة في هذا الشهر (جميع الفواتير والمشتريات تمت تسويتها بالكامل).
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="border-b border-brand-gray/10 text-brand-gray dark:text-slate-400">
              <th class="py-2.5 px-3 font-semibold">رقم المرتجع</th>
              <th class="py-2.5 px-3 font-semibold">نوع المرتجع</th>
              <th class="py-2.5 px-3 font-semibold">الفاتورة / أمر الشغل المرتبط</th>
              <th class="py-2.5 px-3 font-semibold">العميل / المورد</th>
              <th class="py-2.5 px-3 font-semibold">طريقة التسوية</th>
              <th class="py-2.5 px-3 font-semibold text-left">قيمة المرتجع</th>
              <th class="py-2.5 px-3 font-semibold">التاريخ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10">
            <tr
              v-for="ret in closingStore.preview.returnsBreakdown"
              :key="ret.returnId"
              class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <td class="py-2.5 px-3 font-mono font-bold text-brand-dark dark:text-white">
                {{ ret.returnNumber }}
              </td>
              <td class="py-2.5 px-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="ret.returnType === 2 ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'"
                >
                  {{ ret.returnTypeName }}
                </span>
              </td>
              <td class="py-2.5 px-3 font-medium text-brand-accent font-mono">
                {{ ret.relatedInvoiceNumber || '—' }}
              </td>
              <td class="py-2.5 px-3 font-medium text-brand-dark dark:text-white">
                {{ ret.partyName }}
              </td>
              <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                {{ ret.refundMethodName }}
              </td>
              <td class="py-2.5 px-3 font-mono font-bold text-left" :class="ret.returnType === 2 ? 'text-purple-600' : 'text-blue-600'">
                {{ formatCurrency(ret.totalAmount) }}
              </td>
              <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                {{ formatDate(ret.returnDate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Signatures Block (Print Only) -->
    <div class="hidden print:grid grid-cols-3 gap-8 pt-12 text-center text-xs">
      <div>
        <p class="font-bold">المحاسب المسؤول</p>
        <div class="border-b border-gray-400 mt-8"></div>
      </div>
      <div>
        <p class="font-bold">مدير الورشة</p>
        <div class="border-b border-gray-400 mt-8"></div>
      </div>
      <div>
        <p class="font-bold">اعتماد مالك الورشة</p>
        <div class="border-b border-gray-400 mt-8"></div>
      </div>
    </div>

    <!-- 1. Modal: Confirm Month Close / Lock using OhdaModal -->
    <OhdaModal
      :visible="showCloseModal"
      @close="showCloseModal = false"
      title="إقفال واعتماد الشهر المالي"
      :description="`تأكيد اعتماد وإقفال شهر ${selectedMonth} / ${selectedYear}`"
      :icon="Lock"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitCloseMonth" id="closeMonthForm" class="space-y-4 text-xs">
        <div class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-800 dark:text-purple-300 space-y-1">
          <p class="text-[11px] leading-relaxed">
            سيتم تجميد وحفظ لقطة تاريخية رسمية لكافة مبيعات ومصروفات وصافي أرباح الشهر لحمايتها من أي تعديل مستقبلي.
          </p>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات الإقفال (اختياري)</label>
          <input
            type="text"
            v-model="closingNotes"
            placeholder="مثال: تم الجرد والمطابقة مع المحاسب المالي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="closeMonthForm"
          :disabled="closingStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          تأكيد الإقفال والاعتماد
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Modal: Confirm Month Reopen (Admin) using OhdaModal -->
    <OhdaModal
      :visible="showReopenModal"
      @close="showReopenModal = false"
      title="إعادة فتح الشهر المقفل"
      :description="`إعادة فتح شهر ${selectedMonth} / ${selectedYear}`"
      :icon="Unlock"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitReopenMonth" id="reopenMonthForm" class="space-y-4 text-xs">
        <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300">
          هل تريد بالتأكيد إعادة فتح هذا الشهر للسماح بإجراء تعديلات؟
        </div>

        <div>
          <label class="block font-semibold mb-1">سبب إعادة الفتح *</label>
          <input
            type="text"
            v-model="reopenReason"
            required
            placeholder="اكتب سبب إعادة الفتح للإدارة..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="reopenMonthForm"
          :disabled="closingStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          تأكيد إعادة الفتح
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaClosingStore } from "../stores/useOhdaClosingStore";
import OhdaModal from "../components/OhdaModal.vue";
import {
  CalendarCheck2,
  Lock,
  Unlock,
  Printer,
  Download,
  AlertCircle,
  AlertTriangle,
  Users,
  PieChart,
  Landmark,
  Boxes,
  RotateCcw
} from "lucide-vue-next";

const closingStore = useOhdaClosingStore();

const now = new Date();
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear = ref(now.getFullYear());

const showCloseModal = ref(false);
const showReopenModal = ref(false);
const closingNotes = ref("");
const reopenReason = ref("");

onMounted(async () => {
  await loadMonthData();
});

async function loadMonthData() {
  await closingStore.fetchPreview(selectedMonth.value, selectedYear.value);
}

function formatCurrency(amount) {
  if (amount == null) return "0 ج.م";
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

const netProfitBgClass = computed(() => {
  const p = closingStore.preview?.netProfit || 0;
  return p >= 0 ? "border-emerald-500/30" : "border-red-500/30";
});

const netProfitTextClass = computed(() => {
  const p = closingStore.preview?.netProfit || 0;
  return p >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
});

function getExpenseBarColor(type) {
  switch (type) {
    case 1: return "bg-blue-500";
    case 2: return "bg-amber-500";
    case 3: return "bg-purple-500";
    case 4: return "bg-sky-500";
    case 5: return "bg-emerald-500";
    case 6: return "bg-orange-500";
    default: return "bg-slate-400";
  }
}

function triggerPrint() {
  window.print();
}

function exportCsv() {
  const p = closingStore.preview;
  if (!p) return;

  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += `تقرير الإقفال الشهري - شهر ${selectedMonth.value} / ${selectedYear.value}\n\n`;
  csvContent += `إجمالي الفواتير,${p.totalInvoiced}\n`;
  csvContent += `المحصل الفعلي,${p.totalCollected}\n`;
  csvContent += `ديون العملاء المعلقة,${p.totalUnpaid}\n`;
  csvContent += `إجمالي المصروفات,${p.totalExpenses}\n`;
  csvContent += `صافي الربح الفعلي,${p.netProfit}\n`;
  csvContent += `تكلفة قطع الغيار المستهلكة,${p.estimatedPartsCost}\n`;
  csvContent += `الربح التقديري,${p.estimatedGrossProfit}\n`;
  csvContent += `قيمة المخزون عند الإقفال,${p.stockValue}\n`;
  csvContent += `إجمالي مسير الرواتب,${p.payrollTotal}\n\n`;

  csvContent += `فواتير العملاء غير المسددة:\n`;
  csvContent += `رقم الأمر,اسم العميل,الهاتف,لوحة السيارة,إجمالي الفاتورة,المدفوع,المتبقي\n`;
  p.unpaidJobs.forEach(j => {
    csvContent += `"${j.jobNumber}","${j.customerName}","${j.customerPhone || ''}","${j.carPlate || ''}",${j.totalAmount},${j.paidAmount},${j.remainingBalance}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Warsha_Closing_${selectedYear.value}_${selectedMonth.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function openCloseModal() {
  closingNotes.value = "";
  showCloseModal.value = true;
}

async function submitCloseMonth() {
  const res = await closingStore.closeMonth({
    month: selectedMonth.value,
    year: selectedYear.value,
    notes: closingNotes.value
  });

  if (res.success) {
    showCloseModal.value = false;
  } else {
    alert(res.message);
  }
}

function openReopenModal() {
  reopenReason.value = "";
  showReopenModal.value = true;
}

async function submitReopenMonth() {
  const res = await closingStore.reopenMonth({
    month: selectedMonth.value,
    year: selectedYear.value,
    reason: reopenReason.value
  });

  if (res.success) {
    showReopenModal.value = false;
  } else {
    alert(res.message);
  }
}
</script>
