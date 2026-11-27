<template>
  <div class="space-y-4">
    <!-- 1. Drawer State Banner (Always Visible on Cockpit) -->
    <div
      v-if="!financeStore.hasActiveDrawer"
      class="p-4 sm:p-5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Lock class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-sm text-brand-dark dark:text-white">درج النقدية واليومية مغلق — لم يبدأ يوم العمل بعد</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">مغلق</span>
          </div>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            سجل أرصدة بداية اليوم (كاش الدرج، ماكينة الفيزا، إنستاباي) لفتح الوردية ومطابقة الحسابات آلياً بنهاية اليوم.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="openStartDayModal"
        class="w-full md:w-auto px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
      >
        <KeyRound class="w-4 h-4" />
        <span>فتح درج النقدية وبدء يوم العمل</span>
      </button>
    </div>

    <!-- Active Drawer Banner -->
    <div
      v-else
      class="p-4 sm:p-5 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex flex-col gap-4 shadow-xs"
    >
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 relative">
            <Wallet class="w-6 h-6" />
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white dark:ring-brand-dark animate-pulse"></span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-sm text-brand-dark dark:text-white">درج النقدية مفتوح — يوم العمل جاري</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> وردية نشطة
              </span>
            </div>
            <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
              المسؤول: <span class="font-semibold text-brand-dark dark:text-white">{{ activeSession?.openedByUserName || 'الكاشير' }}</span>
              &bull; بدأ الساعة: <span class="font-semibold font-mono">{{ formatTime(activeSession?.openedAt) }}</span>
              &bull; الخزينة: <span class="font-semibold">{{ activeSession?.accountName }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            type="button"
            @click="openCloseDayModal"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>تقفيل اليومية والوردية</span>
          </button>
        </div>
      </div>

      <!-- Channel Switcher Tabs -->
      <div class="flex items-center gap-1.5 border-b border-brand-gray/15 pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          @click="selectedChannelView = 'cash'"
          class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="selectedChannelView === 'cash' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Wallet class="w-3.5 h-3.5 text-emerald-600" />
          <span>كاش الدرج</span>
        </button>

        <button
          type="button"
          @click="selectedChannelView = 'visa'"
          class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="selectedChannelView === 'visa' ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <CreditCard class="w-3.5 h-3.5 text-blue-600" />
          <span>الفيزا والبنك</span>
        </button>

        <button
          type="button"
          @click="selectedChannelView = 'instapay'"
          class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="selectedChannelView === 'instapay' ? 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Smartphone class="w-3.5 h-3.5 text-purple-600" />
          <span>إنستاباي والمحافظ</span>
        </button>

        <button
          type="button"
          @click="selectedChannelView = 'all'"
          class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="selectedChannelView === 'all' ? 'bg-brand-accent text-brand-dark font-extrabold shadow-xs' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Scale class="w-3.5 h-3.5" />
          <span>الإجمالي الشامل (كل الحسابات)</span>
        </button>
      </div>

      <!-- Quick Metrics Strip (Dynamic by Channel View) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="px-3 py-2 rounded-xl bg-brand-white dark:bg-white/5 border border-brand-gray/10 text-right">
          <div class="text-[10px] text-brand-gray">
            {{ selectedChannelView === 'all' ? 'إجمالي عهدة البداية' : 'رصيد الافتتاح' }}
          </div>
          <div class="font-bold font-mono text-sm text-brand-dark dark:text-white">
            {{ formatCurrency(activeMetrics.opening) }}
          </div>
        </div>

        <div class="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-right">
          <div class="text-[10px] text-emerald-600 dark:text-emerald-400">المقبوضات اليوم (+)</div>
          <div class="font-bold font-mono text-sm text-emerald-700 dark:text-emerald-300">
            +{{ formatCurrency(activeMetrics.inflow) }}
          </div>
        </div>

        <div class="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-right">
          <div class="text-[10px] text-rose-600 dark:text-rose-400">المدفوعات والمصروفات (-)</div>
          <div class="font-bold font-mono text-sm text-rose-700 dark:text-rose-300">
            -{{ formatCurrency(activeMetrics.outflow) }}
          </div>
        </div>

        <div class="px-3.5 py-2 rounded-xl bg-brand-dark text-white border border-brand-dark/20 text-right shadow-xs">
          <div class="text-[10px] text-brand-accent font-medium">
            {{ selectedChannelView === 'all' ? 'صافي اليومية / المتوقع الكلي' : 'الرصيد المتوقع بالدرج (=)' }}
          </div>
          <div class="font-bold font-mono text-sm text-brand-accent">
            {{ formatCurrency(activeMetrics.expected) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Modal: Open Cash Drawer / Start Working Day -->
    <OhdaModal
      :visible="showOpenModal"
      @close="showOpenModal = false"
      title="فتح درج النقدية وبدء يوم العمل (Multi-Channel Shift)"
      description="أدخل أرصدة بداية اليوم لكافة الحسابات النقدية والبنكية لمطابقتها في نهاية اليوم بدقة"
      :icon="KeyRound"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitOpenDrawer" id="openDrawerForm" class="space-y-4 text-xs">
        <!-- 3 Account Opening Balance Inputs -->
        <div class="space-y-3 p-3.5 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15">
          <!-- 1. Cash Opening -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <Wallet class="w-3.5 h-3.5 text-emerald-600" />
                <span>عهدة كاش الدرج (فكة البداية والنقدية) <span class="text-red-500">*</span></span>
              </label>
              <span class="text-[10px] text-brand-gray font-mono">
                الرصيد الحالي: {{ formatCurrency(financeStore.cashBoxBalance) }}
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="openForm.openingCash"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-sm font-bold focus:border-brand-accent transition-all"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
          </div>

          <!-- 2. Visa / Bank Opening -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <CreditCard class="w-3.5 h-3.5 text-blue-600" />
                <span>رصيد بداية ماكينة الفيزا / الحساب البنكي</span>
              </label>
              <span class="text-[10px] text-brand-gray font-mono">
                الرصيد الحالي: {{ formatCurrency(financeStore.bankBalance) }}
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="openForm.openingVisa"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-sm font-bold focus:border-brand-accent transition-all"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
          </div>

          <!-- 3. InstaPay Opening -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <Smartphone class="w-3.5 h-3.5 text-purple-600" />
                <span>رصيد بداية محفظة إنستاباي والمحافظ الرقمية</span>
              </label>
              <span class="text-[10px] text-brand-gray font-mono">
                الرصيد الحالي: {{ formatCurrency(financeStore.instaPayBalance) }}
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="openForm.openingInstaPay"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-sm font-bold focus:border-brand-accent transition-all"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
          </div>
        </div>

        <!-- Total Opening Highlight Box -->
        <div class="p-3.5 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-between">
          <div>
            <span class="text-[11px] text-brand-dark dark:text-white font-bold block">إجمالي رصيد بداية يوم العمل:</span>
            <span class="text-[10px] text-brand-gray">مجموع (كاش الدرج + رصيد الفيزا + إنستاباي)</span>
          </div>
          <span class="text-base font-extrabold font-mono text-brand-dark dark:text-white">
            {{ formatCurrency(calculatedTotalOpening) }}
          </span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات البداية (اختياري)
          </label>
          <textarea
            v-model="openForm.notes"
            rows="2"
            placeholder="مثال: استلام الوردية الصباحية، فكة كاش 500 ج.م..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showOpenModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light dark:hover:bg-white/10 font-semibold text-xs cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="openDrawerForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <KeyRound class="w-4 h-4" />
          <span>{{ submitting ? 'جاري الفتح...' : 'تأكيد فتح الدرج وبدء العمل' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Modal: Close Cash Drawer / End Working Day -->
    <OhdaModal
      :visible="showCloseModal"
      @close="showCloseModal = false"
      title="تقفيل اليومية ومطابقة الحسابات المالية"
      description="أدخل النقدية الفعلية بالدرج وإيصالات الفيزا ورصيد إنستاباي لمطابقتها مع الحركات الدفترية وإصدار التقرير"
      :icon="CheckCircle2"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitCloseDrawer" id="closeDrawerForm" class="space-y-4 text-xs">
        <!-- 3 Channel Actual Count Inputs with Real-time Variance -->
        <div class="space-y-3.5">
          <!-- 1. Cash In Drawer -->
          <div class="p-3.5 rounded-2xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <Wallet class="w-4 h-4 text-emerald-600" />
                <span>1. كاش الدرج الفعلي (المعدود باليد) <span class="text-red-500">*</span></span>
              </span>
              <span class="text-[11px] font-mono text-brand-gray">
                المتوقع بالدرج: <strong class="text-brand-dark dark:text-white">{{ formatCurrency(activeSession?.expectedCash || 0) }}</strong>
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="closeForm.actualCash"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-base font-bold focus:border-brand-accent"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
            <div class="flex items-center justify-between text-[11px]" :class="getVarianceTextColor(cashDiff)">
              <span>الفرق (الكاش): {{ getVarianceLabel(cashDiff) }}</span>
              <span class="font-mono font-bold">{{ formatCurrency(Math.abs(cashDiff)) }}</span>
            </div>
          </div>

          <!-- 2. Visa Actual -->
          <div class="p-3.5 rounded-2xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <CreditCard class="w-4 h-4 text-blue-600" />
                <span>2. إجمالي إيصالات ماكينة الفيزا / البنك الفعلية <span class="text-red-500">*</span></span>
              </span>
              <span class="text-[11px] font-mono text-brand-gray">
                المتوقع: <strong class="text-brand-dark dark:text-white">{{ formatCurrency(activeSession?.expectedVisa || 0) }}</strong>
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="closeForm.actualVisa"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-base font-bold focus:border-brand-accent"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
            <div class="flex items-center justify-between text-[11px]" :class="getVarianceTextColor(visaDiff)">
              <span>الفرق (الفيزا): {{ getVarianceLabel(visaDiff) }}</span>
              <span class="font-mono font-bold">{{ formatCurrency(Math.abs(visaDiff)) }}</span>
            </div>
          </div>

          <!-- 3. InstaPay Actual -->
          <div class="p-3.5 rounded-2xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <Smartphone class="w-4 h-4 text-purple-600" />
                <span>3. رصيد محفظة إنستاباي الفعلي الحالي <span class="text-red-500">*</span></span>
              </span>
              <span class="text-[11px] font-mono text-brand-gray">
                المتوقع: <strong class="text-brand-dark dark:text-white">{{ formatCurrency(activeSession?.expectedInstaPay || 0) }}</strong>
              </span>
            </div>
            <div class="relative">
              <input
                v-model.number="closeForm.actualInstaPay"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono text-base font-bold focus:border-brand-accent"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
            </div>
            <div class="flex items-center justify-between text-[11px]" :class="getVarianceTextColor(instaPayDiff)">
              <span>الفرق (إنستاباي): {{ getVarianceLabel(instaPayDiff) }}</span>
              <span class="font-mono font-bold">{{ formatCurrency(Math.abs(instaPayDiff)) }}</span>
            </div>
          </div>
        </div>

        <!-- Overall Day Summary Highlight -->
        <div class="p-4 rounded-xl border flex items-center justify-between text-xs" :class="totalDiffClass">
          <div class="flex items-center gap-2">
            <component :is="totalDiffIcon" class="w-5 h-5 shrink-0" />
            <div>
              <span class="font-bold block">{{ totalDiffTitle }}</span>
              <span class="text-[10px] opacity-80">إجمالي الفعلي: {{ formatCurrency(totalActualCounted) }} &bull; إجمالي المتوقع: {{ formatCurrency(totalExpectedAll) }}</span>
            </div>
          </div>
          <span class="font-mono font-extrabold text-base">{{ formatCurrency(Math.abs(totalVariance)) }}</span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات التقفيل
          </label>
          <textarea
            v-model="closeForm.notes"
            rows="2"
            placeholder="مثال: تم الجرد والمطابقة، تسليم النقدية للإدارة..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showCloseModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light dark:hover:bg-white/10 font-semibold text-xs cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="closeDrawerForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>{{ submitting ? 'جاري التقفيل...' : 'تأكيد التقفيل وإصدار تقرير اليومية' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 4. Modal: Daily Closing Report (Interactive View & Print) -->
    <OhdaModal
      :visible="showReportModal"
      @close="showReportModal = false"
      title="تقرير تقفيل اليومية والوردية المالية"
      description="ملخص شامل لحركة النقدية والفيزا وإنستاباي مع خيارات الطباعة الحرارية والمستندية"
      :icon="Receipt"
      max-width="max-w-2xl"
    >
      <div v-if="activeReport" class="space-y-4 text-xs">
        <!-- Action Toolbar -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10 print:hidden">
          <div class="flex items-center gap-2 text-slate-500">
            <Receipt class="w-4 h-4 text-brand-accent" />
            <span>خيارات الطباعة:</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="printThermalReceipt"
              class="px-3 py-1.5 rounded-lg bg-brand-dark text-brand-accent hover:bg-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>إيصال حراري (80mm)</span>
            </button>
            <button
              type="button"
              @click="printFullA4Report"
              class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>تقرير كامل (A4)</span>
            </button>
            <button
              type="button"
              @click="downloadServerPdf(`/api/ReportsPdf/cash-closing/${activeReport?.id || activeReport?.sessionId}?paperSize=Thermal80mm`, `CashClosing_${activeReport?.id || 'shift'}.pdf`)"
              class="px-3 py-1.5 rounded-lg bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download class="w-3.5 h-3.5" />
              <span>تنزيل PDF</span>
            </button>
          </div>
        </div>

        <!-- Visible Screen Report View -->
        <div id="report-view-content" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-brand-gray/20 space-y-4 shadow-xs">
          <!-- Report Header -->
          <div class="border-b border-brand-gray/15 pb-3 flex items-start justify-between">
            <div>
              <h3 class="text-base font-extrabold text-brand-dark dark:text-white">
                {{ activeReport.BranchName || 'مركز الصيانة' }}
              </h3>
              <p class="text-[11px] text-brand-gray">
                تقرير تقفيل الوردية اليومية #{{ activeReport.ShiftId }} &bull; التاريخ: {{ formatDate(activeReport.ClosedAt) }}
              </p>
            </div>
            <div class="text-left text-[11px] text-brand-gray font-mono">
              <div>بداية: {{ formatTime(activeReport.OpenedAt) }}</div>
              <div>تقفيل: {{ formatTime(activeReport.ClosedAt) }}</div>
            </div>
          </div>

          <!-- Channel Summary Table -->
          <div>
            <h4 class="font-bold text-brand-dark dark:text-white mb-2 flex items-center gap-1.5">
              <Scale class="w-4 h-4 text-brand-accent" />
              <span>مطابقة القنوات المالية (كاش / فيزا / إنستاباي)</span>
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-start border-collapse text-xs">
                <thead>
                  <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-slate-500 font-bold">
                    <th class="p-2.5 text-start">القناة</th>
                    <th class="p-2.5 text-start">الافتتاحي</th>
                    <th class="p-2.5 text-start">مقبوضات (+)</th>
                    <th class="p-2.5 text-start">مدفوعات (-)</th>
                    <th class="p-2.5 text-start">المتوقع</th>
                    <th class="p-2.5 text-start">الفعلي</th>
                    <th class="p-2.5 text-start">الفرق</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-brand-gray/10 font-mono">
                  <!-- Cash -->
                  <tr>
                    <td class="p-2.5 font-bold font-sans flex items-center gap-1.5">
                      <Wallet class="w-3.5 h-3.5 text-emerald-600" />
                      <span>كاش الدرج</span>
                    </td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Channels?.Cash?.Opening || 0) }}</td>
                    <td class="p-2.5 text-emerald-600">+{{ formatCurrency(activeReport.Channels?.Cash?.Inflow || 0) }}</td>
                    <td class="p-2.5 text-rose-600">-{{ formatCurrency(activeReport.Channels?.Cash?.Outflow || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.Cash?.Expected || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.Cash?.Actual || 0) }}</td>
                    <td class="p-2.5 font-bold" :class="getVarianceTextColor(activeReport.Channels?.Cash?.Difference || 0)">
                      {{ getVarianceLabel(activeReport.Channels?.Cash?.Difference || 0) }}
                    </td>
                  </tr>
                  <!-- Visa -->
                  <tr>
                    <td class="p-2.5 font-bold font-sans flex items-center gap-1.5">
                      <CreditCard class="w-3.5 h-3.5 text-blue-600" />
                      <span>الفيزا / البنك</span>
                    </td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Channels?.Visa?.Opening || 0) }}</td>
                    <td class="p-2.5 text-emerald-600">+{{ formatCurrency(activeReport.Channels?.Visa?.Inflow || 0) }}</td>
                    <td class="p-2.5 text-rose-600">-{{ formatCurrency(activeReport.Channels?.Visa?.Outflow || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.Visa?.Expected || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.Visa?.Actual || 0) }}</td>
                    <td class="p-2.5 font-bold" :class="getVarianceTextColor(activeReport.Channels?.Visa?.Difference || 0)">
                      {{ getVarianceLabel(activeReport.Channels?.Visa?.Difference || 0) }}
                    </td>
                  </tr>
                  <!-- InstaPay -->
                  <tr>
                    <td class="p-2.5 font-bold font-sans flex items-center gap-1.5">
                      <Smartphone class="w-3.5 h-3.5 text-purple-600" />
                      <span>إنستاباي ومحافظ</span>
                    </td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Channels?.InstaPay?.Opening || 0) }}</td>
                    <td class="p-2.5 text-emerald-600">+{{ formatCurrency(activeReport.Channels?.InstaPay?.Inflow || 0) }}</td>
                    <td class="p-2.5 text-rose-600">-{{ formatCurrency(activeReport.Channels?.InstaPay?.Outflow || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.InstaPay?.Expected || 0) }}</td>
                    <td class="p-2.5 font-bold">{{ formatCurrency(activeReport.Channels?.InstaPay?.Actual || 0) }}</td>
                    <td class="p-2.5 font-bold" :class="getVarianceTextColor(activeReport.Channels?.InstaPay?.Difference || 0)">
                      {{ getVarianceLabel(activeReport.Channels?.InstaPay?.Difference || 0) }}
                    </td>
                  </tr>
                  <!-- Total Row -->
                  <tr class="bg-black/5 dark:bg-white/5 font-bold text-brand-dark dark:text-white">
                    <td class="p-2.5 font-sans">الإجمالي الشامل</td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Totals?.TotalOpening || 0) }}</td>
                    <td class="p-2.5 text-emerald-600">+{{ formatCurrency(activeReport.Totals?.TotalIncome || 0) }}</td>
                    <td class="p-2.5 text-rose-600">-{{ formatCurrency(activeReport.Totals?.TotalOutflow || 0) }}</td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Totals?.TotalExpected || 0) }}</td>
                    <td class="p-2.5">{{ formatCurrency(activeReport.Totals?.TotalActual || 0) }}</td>
                    <td class="p-2.5" :class="getVarianceTextColor(activeReport.Totals?.TotalDifference || 0)">
                      {{ getVarianceLabel(activeReport.Totals?.TotalDifference || 0) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals Highlights Banner -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15">
            <div>
              <span class="text-[10px] text-brand-gray block">إجمالي المقبوضات:</span>
              <span class="text-sm font-bold font-mono text-emerald-600">+{{ formatCurrency(activeReport.Totals?.TotalIncome || 0) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-brand-gray block">إجمالي المدفوعات:</span>
              <span class="text-sm font-bold font-mono text-rose-600">-{{ formatCurrency(activeReport.Totals?.TotalOutflow || 0) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-brand-gray block">صافي الحركة اليومية:</span>
              <span class="text-sm font-extrabold font-mono text-brand-dark dark:text-white">{{ formatCurrency(activeReport.Totals?.TotalNet || 0) }}</span>
            </div>
          </div>

          <!-- Signatures & Notes -->
          <div class="flex items-center justify-between pt-3 border-t border-brand-gray/15 text-[11px] text-brand-gray">
            <div>
              مسؤول التقفيل: <strong class="text-brand-dark dark:text-white">{{ activeReport.ClosedByUserName || 'الكاشير' }}</strong>
            </div>
            <div v-if="activeReport.ClosingNotes">
              ملاحظات: <span class="italic text-brand-dark dark:text-white">{{ activeReport.ClosingNotes }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showReportModal = false"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-xs"
        >
          إغلاق التقرير
        </button>
      </template>
    </OhdaModal>

    <!-- Hidden Thermal Printable Template Area -->
    <div id="thermal-print-area" class="hidden">
      <div v-if="activeReport" style="text-align: center; font-family: monospace; font-size: 11px;">
        <div style="font-size: 14px; font-weight: bold;">{{ activeReport.BranchName || 'مركز الصيانة' }}</div>
        <div style="font-size: 11px; margin: 3px 0;">*** إيصال تقفيل الوردية اليومية ***</div>
        <div style="border-bottom: 1px dashed #000; margin: 4px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>وردية رقم: #{{ activeReport.ShiftId }}</span>
          <span>التاريخ: {{ formatDate(activeReport.ClosedAt) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>فتح: {{ formatTime(activeReport.OpenedAt) }}</span>
          <span>غلق: {{ formatTime(activeReport.ClosedAt) }}</span>
        </div>
        <div style="text-align: right; margin: 2px 0;">الكاشير: {{ activeReport.ClosedByUserName || 'الكاشير' }}</div>
        <div style="border-bottom: 1px dashed #000; margin: 4px 0;"></div>

        <!-- Cash Details -->
        <div style="font-weight: bold; text-align: right; background: #eee; padding: 2px;">-- كاش الدرج --</div>
        <div style="display: flex; justify-content: space-between;"><span>افتتاحي الكاش:</span><span>{{ formatCurrency(activeReport.Channels?.Cash?.Opening || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مقبوضات كاش (+):</span><span>+{{ formatCurrency(activeReport.Channels?.Cash?.Inflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مصروفات كاش (-):</span><span>-{{ formatCurrency(activeReport.Channels?.Cash?.Outflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>المتوقع بالدرج:</span><span>{{ formatCurrency(activeReport.Channels?.Cash?.Expected || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>الفعلي المعدود:</span><span>{{ formatCurrency(activeReport.Channels?.Cash?.Actual || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>فرق الكاش:</span><span>{{ getVarianceLabel(activeReport.Channels?.Cash?.Difference || 0) }}</span></div>

        <!-- Visa Details -->
        <div style="font-weight: bold; text-align: right; background: #eee; padding: 2px; margin-top: 4px;">-- فيزا وبنك --</div>
        <div style="display: flex; justify-content: space-between;"><span>افتتاحي الفيزا:</span><span>{{ formatCurrency(activeReport.Channels?.Visa?.Opening || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مقبوضات فيزا (+):</span><span>+{{ formatCurrency(activeReport.Channels?.Visa?.Inflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مدفوعات فيزا (-):</span><span>-{{ formatCurrency(activeReport.Channels?.Visa?.Outflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>المتوقع بالفيزا:</span><span>{{ formatCurrency(activeReport.Channels?.Visa?.Expected || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>الفعلي بالماكينة:</span><span>{{ formatCurrency(activeReport.Channels?.Visa?.Actual || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>فرق الفيزا:</span><span>{{ getVarianceLabel(activeReport.Channels?.Visa?.Difference || 0) }}</span></div>

        <!-- InstaPay Details -->
        <div style="font-weight: bold; text-align: right; background: #eee; padding: 2px; margin-top: 4px;">-- إنستاباي ومحافظ --</div>
        <div style="display: flex; justify-content: space-between;"><span>افتتاحي إنستاباي:</span><span>{{ formatCurrency(activeReport.Channels?.InstaPay?.Opening || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مقبوضات إنستاباي (+):</span><span>+{{ formatCurrency(activeReport.Channels?.InstaPay?.Inflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>مدفوعات إنستاباي (-):</span><span>-{{ formatCurrency(activeReport.Channels?.InstaPay?.Outflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>المتوقع بإنستاباي:</span><span>{{ formatCurrency(activeReport.Channels?.InstaPay?.Expected || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>الفعلي بالمحفظة:</span><span>{{ formatCurrency(activeReport.Channels?.InstaPay?.Actual || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>فرق إنستاباي:</span><span>{{ getVarianceLabel(activeReport.Channels?.InstaPay?.Difference || 0) }}</span></div>

        <div style="border-bottom: 2px double #000; margin: 6px 0;"></div>

        <!-- Overall Totals -->
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>إجمالي مقبوضات اليوم:</span><span>+{{ formatCurrency(activeReport.Totals?.TotalIncome || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>إجمالي مدفوعات اليوم:</span><span>-{{ formatCurrency(activeReport.Totals?.TotalOutflow || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>صافي حركة اليوم:</span><span>{{ formatCurrency(activeReport.Totals?.TotalNet || 0) }}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-top: 3px;">
          <span>الفرق الكلي:</span>
          <span>{{ getVarianceLabel(activeReport.Totals?.TotalDifference || 0) }}</span>
        </div>

        <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
        <div style="margin-top: 15px; display: flex; justify-content: space-between;">
          <div style="text-align: center;">توقيع الكاشير<br><br>...................</div>
          <div style="text-align: center;">توقيع المدير<br><br>...................</div>
        </div>
        <div style="margin-top: 10px; font-size: 9px; color: #555;">طبع بواسطة نظام العهدة وإدارة الورش</div>
      </div>
    </div>

    <!-- Hidden A4 Printable Template Area -->
    <div id="a4-print-area" class="hidden">
      <div v-if="activeReport" style="font-family: sans-serif; direction: rtl; text-align: right;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px;">
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #1e3a8a;">{{ activeReport.BranchName || 'مركز الصيانة' }}</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">تقرير تقفيل اليومية والوردية المالية الشامل</p>
          </div>
          <div style="text-align: left; font-family: monospace; font-size: 12px;">
            <div>رقم الوردية: <strong>#{{ activeReport.ShiftId }}</strong></div>
            <div>التاريخ: <strong>{{ formatDate(activeReport.ClosedAt) }}</strong></div>
            <div>وقت التقفيل: <strong>{{ formatTime(activeReport.ClosedAt) }}</strong></div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 8px;">القناة المالية</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">رصيد البداية</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">مقبوضات (+)</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">مدفوعات (-)</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">المتوقع دفترياً</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">الفعلي بعد الجرد</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">الفرق والنتيجة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">كاش الدرج والخزينة</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Channels?.Cash?.Opening || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a;">+{{ formatCurrency(activeReport.Channels?.Cash?.Inflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #dc2626;">-{{ formatCurrency(activeReport.Channels?.Cash?.Outflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.Cash?.Expected || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.Cash?.Actual || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ getVarianceLabel(activeReport.Channels?.Cash?.Difference || 0) }}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">الفيزا وماكينات الدفع والبنك</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Channels?.Visa?.Opening || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a;">+{{ formatCurrency(activeReport.Channels?.Visa?.Inflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #dc2626;">-{{ formatCurrency(activeReport.Channels?.Visa?.Outflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.Visa?.Expected || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.Visa?.Actual || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ getVarianceLabel(activeReport.Channels?.Visa?.Difference || 0) }}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">إنستاباي والمحافظ الرقمية</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Channels?.InstaPay?.Opening || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a;">+{{ formatCurrency(activeReport.Channels?.InstaPay?.Inflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #dc2626;">-{{ formatCurrency(activeReport.Channels?.InstaPay?.Outflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.InstaPay?.Expected || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ formatCurrency(activeReport.Channels?.InstaPay?.Actual || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">{{ getVarianceLabel(activeReport.Channels?.InstaPay?.Difference || 0) }}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td style="border: 1px solid #cbd5e1; padding: 8px;">الإجمالي العام</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Totals?.TotalOpening || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a;">+{{ formatCurrency(activeReport.Totals?.TotalIncome || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #dc2626;">-{{ formatCurrency(activeReport.Totals?.TotalOutflow || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Totals?.TotalExpected || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ formatCurrency(activeReport.Totals?.TotalActual || 0) }}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">{{ getVarianceLabel(activeReport.Totals?.TotalDifference || 0) }}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 50px; display: flex; justify-content: space-around;">
          <div style="text-align: center; width: 200px; border-top: 1px dashed #64748b; padding-top: 8px;">
            توقيع الكاشير / أمين الصندوق
          </div>
          <div style="text-align: center; width: 200px; border-top: 1px dashed #64748b; padding-top: 8px;">
            توقيع المشرف / مدير الفرع
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import OhdaModal from "./OhdaModal.vue";
import {
  Wallet,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Smartphone,
  Scale,
  Printer,
  FileText,
  Receipt,
  Download
} from "lucide-vue-next";
import { downloadServerPdf, printServerPdf } from "../utils/pdfHelper";

const financeStore = useOhdaFinanceStore();
const toast = useToast();

const showOpenModal = ref(false);
const showCloseModal = ref(false);
const showReportModal = ref(false);
const submitting = ref(false);
const selectedChannelView = ref("all");
const activeReport = ref(null);

const openForm = ref({
  accountId: null,
  openingCash: 0,
  openingVisa: 0,
  openingInstaPay: 0,
  notes: ""
});

const closeForm = ref({
  actualCash: 0,
  actualVisa: 0,
  actualInstaPay: 0,
  notes: ""
});

const activeSession = computed(() => financeStore.activeDrawerSession);

const calculatedTotalOpening = computed(() => {
  return (Number(openForm.value.openingCash) || 0) +
         (Number(openForm.value.openingVisa) || 0) +
         (Number(openForm.value.openingInstaPay) || 0);
});

// Real-time Variance for Closing Form
const cashDiff = computed(() => {
  const expected = Number(activeSession.value?.expectedCash) || 0;
  const actual = Number(closeForm.value.actualCash) || 0;
  return actual - expected;
});

const visaDiff = computed(() => {
  const expected = Number(activeSession.value?.expectedVisa) || 0;
  const actual = Number(closeForm.value.actualVisa) || 0;
  return actual - expected;
});

const instaPayDiff = computed(() => {
  const expected = Number(activeSession.value?.expectedInstaPay) || 0;
  const actual = Number(closeForm.value.actualInstaPay) || 0;
  return actual - expected;
});

const totalActualCounted = computed(() => {
  return (Number(closeForm.value.actualCash) || 0) +
         (Number(closeForm.value.actualVisa) || 0) +
         (Number(closeForm.value.actualInstaPay) || 0);
});

const totalExpectedAll = computed(() => {
  return (Number(activeSession.value?.expectedCash) || 0) +
         (Number(activeSession.value?.expectedVisa) || 0) +
         (Number(activeSession.value?.expectedInstaPay) || 0);
});

const totalVariance = computed(() => {
  return totalActualCounted.value - totalExpectedAll.value;
});

const totalDiffClass = computed(() => {
  const diff = totalVariance.value;
  if (Math.abs(diff) < 0.01) return "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300";
  if (diff < 0) return "bg-rose-500/10 border-rose-500/25 text-rose-800 dark:text-rose-300";
  return "bg-blue-500/10 border-blue-500/25 text-blue-800 dark:text-blue-300";
});

const totalDiffIcon = computed(() => {
  const diff = totalVariance.value;
  if (Math.abs(diff) < 0.01) return CheckCircle2;
  if (diff < 0) return AlertTriangle;
  return TrendingUp;
});

const totalDiffTitle = computed(() => {
  const diff = totalVariance.value;
  if (Math.abs(diff) < 0.01) return "كافة الحسابات مطابقة تماماً (0.00 ج.م)";
  if (diff < 0) return `يوجد عجز إجمالي بمقدار ${Math.abs(diff).toFixed(2)} ج.م`;
  return `يوجد فائض / زيادة إجمالية بمقدار ${diff.toFixed(2)} ج.م`;
});

// Dynamic Banner Metrics
const activeMetrics = computed(() => {
  const s = activeSession.value;
  if (!s) return { opening: 0, inflow: 0, outflow: 0, expected: 0 };

  if (selectedChannelView.value === "cash") {
    return {
      opening: Number(s.openingCash) || Number(s.openingBalance) || 0,
      inflow: Number(s.totalCashIn) || 0,
      outflow: Number(s.totalCashOut) || 0,
      expected: Number(s.expectedCash) || 0
    };
  }
  if (selectedChannelView.value === "visa") {
    return {
      opening: Number(s.openingVisa) || 0,
      inflow: Number(s.totalVisaIn) || 0,
      outflow: Number(s.totalVisaOut) || 0,
      expected: Number(s.expectedVisa) || 0
    };
  }
  if (selectedChannelView.value === "instapay") {
    return {
      opening: Number(s.openingInstaPay) || 0,
      inflow: Number(s.totalInstaPayIn) || 0,
      outflow: Number(s.totalInstaPayOut) || 0,
      expected: Number(s.expectedInstaPay) || 0
    };
  }
  // All channels combined
  const totalOpen = (Number(s.openingCash) || 0) + (Number(s.openingVisa) || 0) + (Number(s.openingInstaPay) || 0) || Number(s.openingBalance) || 0;
  const totalIn = (Number(s.totalCashIn) || 0) + (Number(s.totalVisaIn) || 0) + (Number(s.totalInstaPayIn) || 0);
  const totalOut = (Number(s.totalCashOut) || 0) + (Number(s.totalVisaOut) || 0) + (Number(s.totalInstaPayOut) || 0);
  const totalExp = (Number(s.expectedCash) || 0) + (Number(s.expectedVisa) || 0) + (Number(s.expectedInstaPay) || 0);
  return {
    opening: totalOpen,
    inflow: totalIn,
    outflow: totalOut,
    expected: totalExp
  };
});

function getVarianceLabel(diff) {
  const num = Number(diff) || 0;
  if (Math.abs(num) < 0.01) return "مطابق (0.00 ج.م)";
  if (num < 0) return `عجز: ${Math.abs(num).toFixed(2)} ج.م`;
  return `زيادة: +${num.toFixed(2)} ج.م`;
}

function getVarianceTextColor(diff) {
  const num = Number(diff) || 0;
  if (Math.abs(num) < 0.01) return "text-emerald-600 dark:text-emerald-400";
  if (num < 0) return "text-rose-600 dark:text-rose-400 font-bold";
  return "text-blue-600 dark:text-blue-400 font-bold";
}

async function openStartDayModal() {
  if (!financeStore.accounts || financeStore.accounts.length === 0) {
    try {
      await financeStore.fetchAccounts();
    } catch (e) {
      console.warn("fetchAccounts error:", e);
    }
  }

  // Pre-fill opening values from current account balances or sensible defaults
  openForm.value.openingCash = Number(financeStore.cashBoxBalance) || 0;
  openForm.value.openingVisa = Number(financeStore.bankBalance) || 0;
  openForm.value.openingInstaPay = Number(financeStore.instaPayBalance) || 0;
  openForm.value.notes = "";
  showOpenModal.value = true;
}

function openCloseDayModal() {
  const s = activeSession.value;
  closeForm.value.actualCash = Number(s?.expectedCash) || 0;
  closeForm.value.actualVisa = Number(s?.expectedVisa) || 0;
  closeForm.value.actualInstaPay = Number(s?.expectedInstaPay) || 0;
  closeForm.value.notes = "";
  showCloseModal.value = true;
}

async function submitOpenDrawer() {
  submitting.value = true;
  try {
    const res = await financeStore.openCashDrawer({
      openingCash: Number(openForm.value.openingCash) || 0,
      openingVisa: Number(openForm.value.openingVisa) || 0,
      openingInstaPay: Number(openForm.value.openingInstaPay) || 0,
      openingBalance: calculatedTotalOpening.value,
      notes: openForm.value.notes
    });

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم بدء يوم العمل",
        detail: res.message,
        life: 4000
      });
      showOpenModal.value = false;
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ في فتح الدرج",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function submitCloseDrawer() {
  submitting.value = true;
  try {
    const res = await financeStore.closeCashDrawer({
      sessionId: activeSession.value?.id,
      actualCash: Number(closeForm.value.actualCash) || 0,
      actualVisa: Number(closeForm.value.actualVisa) || 0,
      actualInstaPay: Number(closeForm.value.actualInstaPay) || 0,
      notes: closeForm.value.notes
    });

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم تقفيل اليومية والوردية",
        detail: res.message,
        life: 4000
      });
      showCloseModal.value = false;

      // Show Report Modal immediately
      const report = res.report || res.data?.report || res.data?.Report;
      if (report) {
        activeReport.value = report;
        showReportModal.value = true;
      }
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ في التقفيل",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function openReportById(sessionId) {
  const report = await financeStore.fetchCashDrawerReport(sessionId);
  if (report) {
    activeReport.value = report;
    showReportModal.value = true;
  } else {
    toast.add({
      severity: "warn",
      summary: "تعذر فتح التقرير",
      detail: "لم يتم العثور على بيانات التقرير لهذه الجلسة",
      life: 3000
    });
  }
}

function printThermalReceipt() {
  const reportId = activeReport.value?.id || activeReport.value?.sessionId || activeReport.value?.ShiftId;
  if (reportId) {
    printServerPdf(
      `/api/ReportsPdf/cash-closing/${reportId}?paperSize=Thermal80mm`,
      `CashClosing_Thermal_${reportId}.pdf`
    );
    return;
  }
  const printContent = document.getElementById("thermal-print-area");
  if (!printContent) return;
  const win = window.open("", "_blank", "width=380,height=600");
  if (!win) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>إيصال تقفيل الوردية اليومية</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body {
          font-family: 'Courier New', Courier, monospace, 'Segoe UI', Tahoma, sans-serif;
          font-size: 11px;
          line-height: 1.35;
          width: 74mm;
          margin: 0 auto;
          color: #000;
          direction: rtl;
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 400);
}

function printFullA4Report() {
  const reportId = activeReport.value?.id || activeReport.value?.sessionId || activeReport.value?.ShiftId;
  if (reportId) {
    printServerPdf(
      `/api/ReportsPdf/cash-closing/${reportId}?paperSize=A4`,
      `CashClosing_A4_${reportId}.pdf`
    );
    return;
  }
  const printContent = document.getElementById("a4-print-area");
  if (!printContent) return;
  const win = window.open("", "_blank", "width=900,height=800");
  if (!win) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>تقرير تقفيل اليومية والوردية المالية</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          color: #1e293b;
          direction: rtl;
          margin: 0;
          padding: 10px;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; }
        th { background: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 400);
}

function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return "0.00 ج.م";
  return (Number(val) || 0).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ج.م";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function formatTime(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

onMounted(async () => {
  await Promise.allSettled([
    financeStore.fetchCurrentDrawerSession(),
    financeStore.fetchAccounts(),
    financeStore.fetchDrawerHistory()
  ]);
});

defineExpose({
  openStartDayModal,
  openCloseDayModal,
  openReportById
});
</script>
