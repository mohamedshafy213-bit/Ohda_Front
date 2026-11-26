<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">فحص سلامة وتكامل النظام (System Health)</h1>
          <p class="text-xs text-brand-gray mt-0.5">
            التحقق الآلي من تطابق المخزون مع الدفعات، جاهزية نقطة البيع، الدفعات المنتهية، والورديات المفتوحة
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="runPosSelfTest"
          :disabled="testingPos"
          class="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Play class="w-4 h-4" />
          <span>{{ testingPos ? 'جاري الاختبار...' : 'اختبار ذاتي لنقطة البيع (POS Self-Test)' }}</span>
        </button>

        <button
          type="button"
          @click="runDiagnostics"
          :disabled="loading"
          class="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          <span>{{ loading ? 'جاري الفحص...' : 'تشغيل الفحص الشامل الآن' }}</span>
        </button>
      </div>
    </div>

    <!-- POS Self-Test Result Banner -->
    <div
      v-if="posTestResult"
      class="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      :class="posTestResult.dryRunPassed && posTestResult.drawerOpen ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'"
    >
      <div class="space-y-1 text-xs">
        <div class="font-bold text-sm flex items-center gap-2">
          <CheckCircle2 v-if="posTestResult.dryRunPassed" class="w-5 h-5 text-emerald-600" />
          <AlertTriangle v-else class="w-5 h-5 text-amber-600" />
          <span>نتيجة الاختبار الذاتي لنقطة البيع ({{ posTestResult.durationMs }} ms)</span>
        </div>
        <div class="flex flex-wrap gap-4 pt-1">
          <span>حالة درج النقدية: <strong>{{ posTestResult.drawerOpen ? 'مفتوح ✓' : 'مغلق ✗' }}</strong></span>
          <span>أصناف جاهزة للبيع: <strong>{{ posTestResult.hasSellableProduct ? 'متوفرة ✓' : 'غير متوفرة ✗' }}</strong></span>
          <span>تجربة البيع والتراجع (Rollback): <strong>{{ posTestResult.dryRunMessage }}</strong></span>
        </div>
      </div>
    </div>

    <!-- Summary Bar -->
    <div v-if="report" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
        <span class="text-xs text-brand-gray block">إجمالي الفحوصات</span>
        <span class="text-2xl font-mono font-bold text-brand-dark dark:text-white">{{ report.totalChecks }}</span>
      </div>
      <div class="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
        <span class="text-xs text-emerald-700 dark:text-emerald-300 block">فحوصات سليمة (خضراء)</span>
        <span class="text-2xl font-mono font-bold text-emerald-600">{{ report.passedChecks }}</span>
      </div>
      <div class="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
        <span class="text-xs text-red-700 dark:text-red-300 block">ملاحظات وأخطاء تتطلب تدخلاً</span>
        <span class="text-2xl font-mono font-bold text-red-600">{{ report.totalChecks - report.passedChecks }}</span>
      </div>
    </div>

    <!-- Checks Cards -->
    <div v-if="report" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="chk in report.checks"
        :key="chk.key"
        class="p-5 rounded-2xl border bg-brand-white dark:bg-white/5 flex flex-col justify-between gap-3"
        :class="chk.status === 'ok' ? 'border-emerald-500/25' : chk.status === 'warning' ? 'border-amber-500/30' : 'border-red-500/30'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-2.5">
            <CheckCircle2 v-if="chk.status === 'ok'" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <AlertTriangle v-else-if="chk.status === 'warning'" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <XCircle v-else class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 class="font-bold text-sm text-brand-dark dark:text-white">{{ chk.title }}</h3>
              <span
                class="text-xs font-mono font-bold"
                :class="chk.status === 'ok' ? 'text-emerald-600' : chk.status === 'warning' ? 'text-amber-600' : 'text-red-600'"
              >
                {{ chk.count === 0 ? 'سليم 100%' : `${chk.count} حالة مرصودة` }}
              </span>
            </div>
          </div>

          <button
            v-if="chk.canAutoFix && chk.count > 0"
            type="button"
            @click="runStockSyncFix"
            :disabled="fixingSync"
            class="px-3 py-1.5 rounded-xl bg-brand-accent text-brand-dark text-xs font-bold cursor-pointer shrink-0"
          >
            {{ fixingSync ? 'جاري الإصلاح...' : chk.fixLabel }}
          </button>

          <router-link
            v-else-if="chk.fixRoute && chk.count > 0"
            :to="chk.fixRoute"
            class="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-brand-accent hover:text-brand-dark text-xs font-bold shrink-0 transition-all"
          >
            {{ chk.fixLabel }} &larr;
          </router-link>
        </div>

        <ul v-if="chk.details && chk.details.length" class="bg-black/5 dark:bg-black/20 rounded-xl p-3 space-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-h-36 overflow-y-auto">
          <li v-for="(d, i) in chk.details" :key="i">• {{ d }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { apiGet, apiPost } from "@/utilities/fetchApi";
import { ShieldCheck, RefreshCw, Play, CheckCircle2, AlertTriangle, XCircle } from "lucide-vue-next";

const toast = useToast();
const loading = ref(false);
const testingPos = ref(false);
const fixingSync = ref(false);
const report = ref(null);
const posTestResult = ref(null);

onMounted(() => {
  runDiagnostics();
});

async function runDiagnostics() {
  loading.value = true;
  try {
    const res = await apiGet("/api/SystemHealth/run");
    if (res?.data?.isDone) {
      report.value = res.data.singleObject;
    }
  } catch (err) {
    toast.add({ severity: "error", summary: "خطأ", detail: "فشل تشغيل فحص السلامة", life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function runPosSelfTest() {
  testingPos.value = true;
  try {
    const res = await apiPost("/api/SystemHealth/pos-self-test", {});
    if (res?.data?.isDone) {
      posTestResult.value = res.data.singleObject;
      toast.add({ severity: "info", summary: "اكتمل الاختبار", detail: res.data.returnMessage, life: 4000 });
    }
  } catch (err) {
    toast.add({ severity: "error", summary: "خطأ", detail: "فشل اختبار نقطة البيع", life: 3000 });
  } finally {
    testingPos.value = false;
  }
}

async function runStockSyncFix() {
  fixingSync.value = true;
  try {
    const res = await apiPost("/api/SystemHealth/fix-stock-sync", {});
    if (res?.data?.isDone) {
      toast.add({ severity: "success", summary: "تم الإصلاح", detail: res.data.returnMessage, life: 4000 });
      await runDiagnostics();
    }
  } finally {
    fixingSync.value = false;
  }
}
</script>
