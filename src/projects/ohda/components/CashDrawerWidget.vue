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
            <h4 class="font-bold text-sm text-brand-dark dark:text-white">درج النقدية مغلق — لم يبدأ يوم العمل بعد</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">مغلق</span>
          </div>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            سجل عهدة الدرج الافتتاحية (الفكة والنقدية الأولية) لبدء تحصيل الفواتير وتسجيل المصروفات النقدية.
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
      class="p-4 sm:p-5 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs"
    >
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

      <!-- Quick Metrics Strip -->
      <div class="flex items-center gap-2 sm:gap-4 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
        <div class="px-3 py-1.5 rounded-xl bg-brand-white dark:bg-white/5 border border-brand-gray/10 text-right">
          <div class="text-[10px] text-brand-gray">عهدة البداية</div>
          <div class="font-bold font-mono text-xs text-brand-dark dark:text-white">
            {{ formatCurrency(activeSession?.openingBalance || 0) }}
          </div>
        </div>

        <div class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-right">
          <div class="text-[10px] text-emerald-600 dark:text-emerald-400">مقبوضات نقدية (+)</div>
          <div class="font-bold font-mono text-xs text-emerald-700 dark:text-emerald-300">
            +{{ formatCurrency(activeSession?.totalCashIn || 0) }}
          </div>
        </div>

        <div class="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-right">
          <div class="text-[10px] text-rose-600 dark:text-rose-400">مصروفات نقدية (-)</div>
          <div class="font-bold font-mono text-xs text-rose-700 dark:text-rose-300">
            -{{ formatCurrency(activeSession?.totalCashOut || 0) }}
          </div>
        </div>

        <div class="px-3.5 py-1.5 rounded-xl bg-brand-dark text-white border border-brand-dark/20 text-right shadow-xs">
          <div class="text-[10px] text-brand-accent font-medium">المتوقع بالدرج (=)</div>
          <div class="font-bold font-mono text-xs text-brand-accent">
            {{ formatCurrency(activeSession?.expectedCash || 0) }}
          </div>
        </div>

        <button
          type="button"
          @click="openCloseDayModal"
          class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>تقفيل الكاش</span>
        </button>
      </div>
    </div>

    <!-- 2. Modal: Open Cash Drawer / Start Working Day -->
    <OhdaModal
      :visible="showOpenModal"
      @close="showOpenModal = false"
      title="فتح درج النقدية وبدء يوم العمل"
      description="أدخل عهدة النقدية الافتتاحية الموجودة فعلياً بالدرج لبدء الوردية وتحصيل الفواتير"
      :icon="KeyRound"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitOpenDrawer" id="openDrawerForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            الخزينة النقدية (الدرج) <span class="text-red-500">*</span>
          </label>
          <!-- If no cash accounts found yet -->
          <div
            v-if="availableAccounts.length === 0"
            class="px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs"
          >
            <span>جاري فحص الخزينة النقدية للفرع...</span>
            <button
              type="button"
              @click="financeStore.fetchAccounts()"
              class="underline font-bold hover:text-amber-800 cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
          <!-- Single Cash Box (Standard Workshop) -->
          <div
            v-else-if="availableAccounts.length === 1"
            class="px-3.5 py-2.5 rounded-xl border border-brand-gray/20 bg-brand-light/50 dark:bg-white/5 flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <Wallet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span class="font-bold text-brand-dark dark:text-white">
                {{ availableAccounts[0]?.name || 'درج الكاش والخزينة الرئيسية' }}
              </span>
            </div>
            <span class="text-[11px] text-brand-gray font-mono">
              الرصيد: {{ formatCurrency(availableAccounts[0]?.currentBalance || 0) }}
            </span>
          </div>
          <!-- Multiple Cash Boxes Selection -->
          <select
            v-else
            v-model="openForm.accountId"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all text-xs"
          >
            <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} (الرصيد الدفتري الحالي: {{ formatCurrency(acc.currentBalance) }})
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            مبلغ العهدة الافتتاحي بالدرج (فكة بداية اليوم) <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model.number="openForm.openingBalance"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-base font-bold focus:border-brand-accent transition-all"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <button
              v-for="preset in [0, 200, 500, 1000, 2000]"
              :key="preset"
              type="button"
              @click="openForm.openingBalance = preset"
              class="px-2.5 py-1 rounded-lg border border-brand-gray/20 hover:border-brand-accent text-[11px] font-mono text-brand-dark dark:text-white hover:bg-brand-soft cursor-pointer transition-colors"
            >
              {{ preset }} ج.م
            </button>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات البداية (اختياري)
          </label>
          <textarea
            v-model="openForm.notes"
            rows="2"
            placeholder="مثال: فكة صباحية 500 جنيه، استلام الوردية الصباحية..."
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

    <!-- 3. Modal: Close Cash Drawer / Reconcile Day -->
    <OhdaModal
      :visible="showCloseModal"
      @close="showCloseModal = false"
      title="تقفيل درج النقدية ومطابقة النقدية"
      description="عدّ النقدية الفعلية الموجودة في الدرج الآن لمطابقتها مع الحركات الدفترية وتسوية اليوم"
      :icon="CheckCircle2"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitCloseDrawer" id="closeDrawerForm" class="space-y-4 text-xs">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15">
          <div>
            <div class="text-[10px] text-brand-gray">الرصيد الافتتاحي</div>
            <div class="font-bold font-mono text-xs text-brand-dark dark:text-white">
              {{ formatCurrency(activeSession?.openingBalance || 0) }}
            </div>
          </div>
          <div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400">مقبوضات (+)</div>
            <div class="font-bold font-mono text-xs text-emerald-700 dark:text-emerald-300">
              +{{ formatCurrency(activeSession?.totalCashIn || 0) }}
            </div>
          </div>
          <div>
            <div class="text-[10px] text-rose-600 dark:text-rose-400">مصروفات (-)</div>
            <div class="font-bold font-mono text-xs text-rose-700 dark:text-rose-300">
              -{{ formatCurrency(activeSession?.totalCashOut || 0) }}
            </div>
          </div>
          <div class="border-r sm:border-r border-brand-gray/20 pr-2">
            <div class="text-[10px] font-bold text-brand-dark dark:text-white">المتوقع بالدرج</div>
            <div class="font-bold font-mono text-sm text-brand-dark dark:text-white">
              {{ formatCurrency(activeSession?.expectedCash || 0) }}
            </div>
          </div>
        </div>

        <!-- Actual Cash Counted -->
        <div>
          <label class="block font-bold text-brand-dark dark:text-white mb-1.5 text-xs">
            النقدية الفعلية المعدودة في الدرج الآن <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model.number="closeForm.actualCash"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              class="w-full px-3.5 py-3 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-lg font-extrabold focus:border-brand-accent transition-all"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gray">ج.م</span>
          </div>
        </div>

        <!-- Real-time Difference Banner -->
        <div
          class="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
          :class="diffClasses"
        >
          <div class="flex items-center gap-2">
            <component :is="diffIcon" class="w-5 h-5 shrink-0" />
            <div>
              <span class="font-bold">{{ diffTitle }}</span>
              <p class="text-[11px] opacity-85">{{ diffDescription }}</p>
            </div>
          </div>
          <div class="font-mono font-bold text-sm text-left">
            {{ formatCurrency(cashDifference) }}
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات التقفيل
          </label>
          <textarea
            v-model="closeForm.notes"
            rows="2"
            placeholder="مثال: تم الجرد والمطابقة، تسليم الوردية للمدير..."
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
          <span>{{ submitting ? 'جاري التقفيل...' : 'تأكيد التقفيل وإنهاء يوم العمل' }}</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
  MinusCircle
} from "lucide-vue-next";

const financeStore = useOhdaFinanceStore();
const toast = useToast();

const showOpenModal = ref(false);
const showCloseModal = ref(false);
const submitting = ref(false);

const openForm = ref({
  accountId: null,
  openingBalance: 0,
  notes: ""
});

const closeForm = ref({
  actualCash: 0,
  notes: ""
});

const activeSession = computed(() => financeStore.activeDrawerSession);

const cashAccounts = computed(() => {
  return (financeStore.accounts || []).filter(a => a.accountType === 1 || a.accountType === 'CashBox' || String(a.accountType) === '1');
});

const availableAccounts = computed(() => {
  if (cashAccounts.value.length > 0) return cashAccounts.value;
  if ((financeStore.accounts || []).length > 0) return financeStore.accounts;
  return [];
});

const cashDifference = computed(() => {
  const expected = Number(activeSession.value?.expectedCash) || 0;
  const actual = Number(closeForm.value.actualCash) || 0;
  return actual - expected;
});

const diffClasses = computed(() => {
  const diff = cashDifference.value;
  if (Math.abs(diff) < 0.01) {
    return "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300";
  }
  if (diff < 0) {
    return "bg-rose-500/10 border-rose-500/25 text-rose-800 dark:text-rose-300";
  }
  return "bg-blue-500/10 border-blue-500/25 text-blue-800 dark:text-blue-300";
});

const diffIcon = computed(() => {
  const diff = cashDifference.value;
  if (Math.abs(diff) < 0.01) return CheckCircle2;
  if (diff < 0) return AlertTriangle;
  return TrendingUp;
});

const diffTitle = computed(() => {
  const diff = cashDifference.value;
  if (Math.abs(diff) < 0.01) return "النقدية مطابقة تماماً (0.00 ج.م)";
  if (diff < 0) return `يوجد عجز نقدي بمقدار ${Math.abs(diff).toFixed(2)} ج.م`;
  return `يوجد فائض / زيادة نقدية بمقدار ${diff.toFixed(2)} ج.م`;
});

const diffDescription = computed(() => {
  const diff = cashDifference.value;
  if (Math.abs(diff) < 0.01) return "النقدية المعدودة بالدرج مساوية تماماً للرصيد الدفتري المسجل.";
  if (diff < 0) return "المبلغ المعدود أقل من المتوقع، سيتم تسجيل قيد تسوية عجز نقدي تلقائياً.";
  return "المبلغ المعدود أكبر من المتوقع، سيتم تسجيل قيد تسوية زيادة نقدية تلقائياً.";
});

async function openStartDayModal() {
  if (!financeStore.accounts || financeStore.accounts.length === 0) {
    try {
      await financeStore.fetchAccounts();
    } catch (e) {
      console.warn("fetchAccounts error:", e);
    }
  }
  const defaultAcc = availableAccounts.value[0] || financeStore.defaultDrawerAccount;
  if (defaultAcc?.id) {
    openForm.value.accountId = defaultAcc.id;
  }
  openForm.value.openingBalance = 0;
  openForm.value.notes = "";
  showOpenModal.value = true;
}

function openCloseDayModal() {
  const expected = Number(activeSession.value?.expectedCash) || 0;
  closeForm.value.actualCash = expected;
  closeForm.value.notes = "";
  showCloseModal.value = true;
}

async function submitOpenDrawer() {
  submitting.value = true;
  try {
    const res = await financeStore.openCashDrawer({
      accountId: openForm.value.accountId,
      openingBalance: Number(openForm.value.openingBalance) || 0,
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
      notes: closeForm.value.notes
    });

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم تقفيل الكاش",
        detail: res.message,
        life: 4000
      });
      showCloseModal.value = false;
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

function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return "0.00 ج.م";
  return (Number(val) || 0).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ج.م";
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
    financeStore.fetchAccounts()
  ]);
});

defineExpose({
  openStartDayModal,
  openCloseDayModal
});
</script>
