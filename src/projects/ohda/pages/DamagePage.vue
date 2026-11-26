<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20 shrink-0">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">التالف وتواريخ الصلاحية</h1>
          <p class="text-xs text-brand-gray mt-0.5">
            تسجيل الأصناف التالفة والفاقدة، متابعة الدفعات قريبة الانتهاء، وحساب خسائر التالف في الأرباح
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="downloadServerPdf('/api/ReportsPdf/report/damage', 'DamageReport.pdf')"
          class="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-600/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>تقرير التالف PDF</span>
        </button>

        <button
          type="button"
          @click="triggerExpiryCheck"
          :disabled="runningExpiry"
          class="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Clock class="w-4 h-4" />
          <span>{{ runningExpiry ? 'جاري الفحص...' : 'فحص وتكهين الصلاحية المنتهية' }}</span>
        </button>

        <button
          type="button"
          @click="openCreateDamageModal()"
          class="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>تسجيل سند تالف جديد</span>
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
        <span class="text-xs text-brand-gray block">إجمالي قيمة التالف المعتمد</span>
        <span class="text-xl font-mono font-bold text-red-600">{{ formatCurrency(totalPostedDamageLoss) }}</span>
      </div>
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
        <span class="text-xs text-brand-gray block">خسائر انتهاء الصلاحية</span>
        <span class="text-xl font-mono font-bold text-amber-600">{{ formatCurrency(totalExpiryLoss) }}</span>
      </div>
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
        <span class="text-xs text-brand-gray block">مسودات بانتظار اعتماد المدير</span>
        <span class="text-xl font-mono font-bold text-purple-600">{{ pendingApprovalCount }}</span>
      </div>
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
        <span class="text-xs text-brand-gray block">دفعات قريبة الانتهاء (≤ 30 يوم)</span>
        <span class="text-xl font-mono font-bold text-orange-600">{{ expiringAlerts.length }}</span>
      </div>
    </div>

    <!-- Mode Tabs -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
      <button
        type="button"
        @click="activeTab = 'damages'"
        class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
        :class="activeTab === 'damages' ? 'bg-brand-accent text-brand-dark' : 'text-brand-gray hover:text-brand-dark'"
      >
        سجل مستندات التالف ({{ damages.length }})
      </button>
      <button
        type="button"
        @click="activeTab = 'expiring'"
        class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
        :class="activeTab === 'expiring' ? 'bg-amber-500 text-white' : 'text-brand-gray hover:text-brand-dark'"
      >
        <span>تقرير قريبة الانتهاء والمنتهية</span>
        <span v-if="expiringAlerts.length > 0" class="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-mono">
          {{ expiringAlerts.length }}
        </span>
      </button>
    </div>

    <!-- TAB 1: Damage Documents List -->
    <div v-if="activeTab === 'damages'" class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 overflow-hidden">
      <div class="p-4 border-b border-brand-gray/10 flex flex-wrap items-center gap-3">
        <select v-model="filterReason" @change="fetchDamages" class="text-xs px-3 py-2 rounded-xl border border-brand-gray/20 bg-transparent text-brand-dark dark:text-white">
          <option value="">كل الأسباب</option>
          <option :value="1">منتهي الصلاحية</option>
          <option :value="2">تلف أثناء التخزين</option>
          <option :value="3">كسر أثناء النقل</option>
          <option :value="4">عيب توريد من المورد</option>
          <option :value="5">تالف بعد البيع</option>
          <option :value="6">فاقد / عجز جرد</option>
          <option :value="7">أخرى</option>
        </select>
        <select v-model="filterStatus" @change="fetchDamages" class="text-xs px-3 py-2 rounded-xl border border-brand-gray/20 bg-transparent text-brand-dark dark:text-white">
          <option value="">كل الحالات</option>
          <option :value="2">معتمد ومرحل</option>
          <option :value="1">مسودة بانتظار اعتماد</option>
          <option :value="3">ملغي</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
            <tr>
              <th class="p-3">رقم المستند</th>
              <th class="p-3">التاريخ</th>
              <th class="p-3">الصنف والدفعة</th>
              <th class="p-3 text-center">الكمية</th>
              <th class="p-3 text-center">التكلفة (الخسارة)</th>
              <th class="p-3">السبب والملاحظات</th>
              <th class="p-3">الحالة</th>
              <th class="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10">
            <tr v-if="damages.length === 0">
              <td colspan="8" class="p-8 text-center text-brand-gray">لا توجد مستندات تالف مسجلة.</td>
            </tr>
            <tr v-for="d in damages" :key="d.id" class="hover:bg-black/5 dark:hover:bg-white/5">
              <td class="p-3 font-mono font-bold text-brand-dark dark:text-white">
                {{ d.documentNumber }}
                <span v-if="d.isAutoWriteOff" class="block text-[9px] text-amber-600">تكهين آلي</span>
              </td>
              <td class="p-3 font-mono text-slate-500">{{ formatDate(d.damageDate) }}</td>
              <td class="p-3">
                <div class="font-bold text-brand-dark dark:text-white">{{ d.productName }}</div>
                <div class="font-mono text-[10px] text-brand-gray">دفعة: {{ d.batchCode }}</div>
              </td>
              <td class="p-3 text-center font-mono font-bold">{{ d.quantity }} {{ d.unit }}</td>
              <td class="p-3 text-center font-mono font-bold text-red-600">{{ formatCurrency(d.totalCostValue) }}</td>
              <td class="p-3">
                <span class="font-semibold">{{ d.reasonText }}</span>
                <p class="text-[11px] text-brand-gray truncate max-w-xs">{{ d.notes || '—' }}</p>
              </td>
              <td class="p-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="d.status === 2 ? 'bg-emerald-500/15 text-emerald-700' : d.status === 1 ? 'bg-amber-500/15 text-amber-700' : 'bg-slate-500/15 text-slate-500 line-through'"
                >
                  {{ d.statusText }}
                </span>
              </td>
              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="downloadServerPdf(`/api/ReportsPdf/damage/${d.id}`, `Damage_${d.documentNumber}.pdf`)"
                    class="p-1 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                    title="تنزيل سند التالف PDF"
                  >
                    <Download class="w-4 h-4" />
                  </button>
                  <button
                    v-if="d.status === 1 && isManagerOrAdmin"
                    type="button"
                    @click="approveDamage(d)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    اعتماد
                  </button>
                  <button
                    v-if="d.status === 2 && isAdmin"
                    type="button"
                    @click="cancelDamage(d)"
                    class="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-600 hover:bg-red-600 hover:text-white text-[11px] font-bold cursor-pointer"
                  >
                    إلغاء وعكس
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Expiring Soon Report -->
    <div v-else class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
            <tr>
              <th class="p-3">الصنف</th>
              <th class="p-3">الدفعة والرف</th>
              <th class="p-3 text-center">الكمية المتبقية</th>
              <th class="p-3 text-center">القيمة (تكلفة)</th>
              <th class="p-3 text-center">تاريخ الانتهاء</th>
              <th class="p-3 text-center">المتبقي</th>
              <th class="p-3 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10">
            <tr v-if="expiringAlerts.length === 0">
              <td colspan="7" class="p-8 text-center text-emerald-600 font-bold">لا توجد دفعات قريبة الانتهاء حالياً.</td>
            </tr>
            <tr v-for="al in expiringAlerts" :key="al.batchId" class="hover:bg-black/5 dark:hover:bg-white/5">
              <td class="p-3">
                <div class="font-bold text-brand-dark dark:text-white">{{ al.productName }}</div>
                <div class="text-[10px] text-brand-gray">{{ al.categoryName }} • {{ al.productSku }}</div>
              </td>
              <td class="p-3">
                <span class="font-mono font-bold block">{{ al.batchCode }}</span>
                <span class="text-[10px] text-brand-gray">رف: {{ al.shelfLocation || 'افتراضي' }}</span>
              </td>
              <td class="p-3 text-center font-mono font-bold">{{ al.quantityRemaining }} {{ al.unit }}</td>
              <td class="p-3 text-center font-mono font-bold text-red-600">{{ formatCurrency(al.costValue) }}</td>
              <td class="p-3 text-center font-mono">{{ formatDate(al.expiryDate) }}</td>
              <td class="p-3 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  :class="al.daysLeft <= 0 ? 'bg-red-600 text-white' : al.daysLeft <= 7 ? 'bg-red-500/20 text-red-700 border border-red-500/30' : 'bg-orange-500/20 text-orange-700 border border-orange-500/30'"
                >
                  {{ al.daysLeft <= 0 ? 'منتهية الصلاحية!' : `باقي ${al.daysLeft} يوم` }}
                </span>
              </td>
              <td class="p-3 text-center">
                <button
                  type="button"
                  @click="openCreateDamageModal(al)"
                  class="px-3 py-1 rounded-lg bg-red-600/15 text-red-600 hover:bg-red-600 hover:text-white font-bold text-[11px] cursor-pointer"
                >
                  تكهين كتالف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Damage Modal -->
    <OhdaModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      title="تسجيل سند تالف جديد"
      description="خصم كمية تالفة من دفعة محددة وإثبات قيمتها كخسارة تالف"
      :icon="AlertTriangle"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitCreateDamage" id="createDamageForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">اختر الصنف *</label>
          <select
            v-model="form.productId"
            required
            @change="onProductSelected"
            class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
          >
            <option value="" disabled>اختر الصنف...</option>
            <option v-for="p in productsWithStock" :key="p.id" :value="p.id" class="bg-white dark:bg-slate-800">
              {{ p.name }} (رصيد: {{ p.currentQuantity }} {{ p.unit }})
            </option>
          </select>
        </div>

        <div v-if="productBatches.length > 0">
          <label class="block font-semibold mb-1">الدفعة (Batch) *</label>
          <select
            v-model="form.batchId"
            required
            class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
          >
            <option v-for="b in productBatches" :key="b.id" :value="b.id" class="bg-white dark:bg-slate-800">
              {{ b.batchCode }} | متبقي: {{ b.quantityRemaining }} | تكلفة: {{ b.costPerBaseUnit }} ج.م {{ b.expiryDate ? `| انتهاء: ${formatDate(b.expiryDate)}` : '' }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1">الكمية التالفة *</label>
            <input
              v-model.number="form.quantity"
              type="number"
              min="0.01"
              :max="selectedBatch?.quantityRemaining || 99999"
              step="any"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent font-mono font-bold text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">السبب *</label>
            <select
              v-model.number="form.reason"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">منتهي الصلاحية</option>
              <option :value="2" class="bg-white dark:bg-slate-800">تلف أثناء التخزين</option>
              <option :value="3" class="bg-white dark:bg-slate-800">كسر أثناء النقل والتداول</option>
              <option :value="4" class="bg-white dark:bg-slate-800">عيب توريد من المورد</option>
              <option :value="5" class="bg-white dark:bg-slate-800">تالف بعد البيع</option>
              <option :value="6" class="bg-white dark:bg-slate-800">فاقد أو مفقود (يتطلب اعتماد مدير)</option>
              <option :value="7" class="bg-white dark:bg-slate-800">أسباب أخرى</option>
            </select>
          </div>
        </div>

        <!-- Supplier Defect Shortcut -->
        <div v-if="form.reason === 4" class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <span class="text-amber-700 dark:text-amber-300 font-semibold">هل العيب من المورد ويمكن رده واسترداد قيمته؟</span>
          <router-link to="/ohda/returns" class="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold shrink-0">
            إنشاء مرتجع للمورد بدلاً من التالف
          </router-link>
        </div>

        <!-- Serial picker if product is serialized -->
        <div v-if="selectedProduct?.trackSerialNumbers" class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <label class="block font-bold text-blue-700 dark:text-blue-300">
            هذا الصنف يتطلب أرقام تسلسلية (اختر {{ Math.round(form.quantity || 0) }} سيريال):
          </label>
          <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            <label
              v-for="sn in availableSerials"
              :key="sn.id"
              class="px-2 py-1 rounded-lg border text-[11px] font-mono cursor-pointer flex items-center gap-1"
              :class="form.serialNumbers.includes(sn.serialNumber) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-brand-gray/20'"
            >
              <input type="checkbox" :value="sn.serialNumber" v-model="form.serialNumbers" class="hidden" />
              <span>{{ sn.serialNumber }}</span>
            </label>
          </div>
        </div>

        <!-- Live Cost Value Sentence -->
        <div v-if="selectedBatch && form.quantity > 0" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 font-bold">
          قيمة الخسارة التي ستُسجل في الحسابات: {{ formatCurrency(form.quantity * selectedBatch.costPerBaseUnit) }} ({{ form.quantity }} × {{ selectedBatch.costPerBaseUnit }} ج.م للوحدة)
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات وتفاصيل {{ form.reason === 6 ? '(مطلوبة إلزامياً للفاقد) *' : '' }}</label>
          <textarea
            v-model="form.notes"
            :required="form.reason === 6"
            rows="2"
            placeholder="اشرح تفاصيل التلف أو سبب الفقد..."
            class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer">إلغاء</button>
        <button type="submit" form="createDamageForm" :disabled="submitting" class="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer">
          {{ submitting ? 'جاري الحفظ...' : 'اعتماد وخصم التالف' }}
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { apiGet, apiPost } from "@/utilities/fetchApi";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import OhdaModal from "../components/OhdaModal.vue";
import { AlertTriangle, Plus, Clock, Printer, Download } from "lucide-vue-next";
import { downloadServerPdf } from "../utils/pdfHelper";

const toast = useToast();
const inventoryStore = useOhdaInventoryStore();
const authStore = useOhdaAuthStore();

const activeTab = ref("damages");
const damages = ref([]);
const expiringAlerts = ref([]);
const filterReason = ref("");
const filterStatus = ref("");
const runningExpiry = ref(false);
const showCreateModal = ref(false);
const submitting = ref(false);
const productBatches = ref([]);
const availableSerials = ref([]);

const isAdmin = computed(() => ["Admin", "SuperAdmin", 1, 0].includes(authStore.user?.role));
const isManagerOrAdmin = computed(() => ["Admin", "Manager", "SuperAdmin", 1, 4, 0].includes(authStore.user?.role));

const form = ref({
  productId: "",
  batchId: "",
  quantity: 1,
  reason: 2,
  notes: "",
  serialNumbers: []
});

const productsWithStock = computed(() => (inventoryStore.products || []).filter(p => p.currentQuantity > 0));
const selectedProduct = computed(() => (inventoryStore.products || []).find(p => p.id === form.value.productId));
const selectedBatch = computed(() => productBatches.value.find(b => b.id === form.value.batchId));

const totalPostedDamageLoss = computed(() => damages.value.filter(d => d.status === 2).reduce((s, d) => s + (d.totalCostValue || 0), 0));
const totalExpiryLoss = computed(() => damages.value.filter(d => d.status === 2 && d.reason === 1).reduce((s, d) => s + (d.totalCostValue || 0), 0));
const pendingApprovalCount = computed(() => damages.value.filter(d => d.status === 1).length);

onMounted(async () => {
  await Promise.all([
    fetchDamages(),
    fetchExpiring(),
    inventoryStore.fetchProducts()
  ]);
});

async function fetchDamages() {
  const params = new URLSearchParams();
  if (filterReason.value) params.append("reason", filterReason.value);
  if (filterStatus.value) params.append("status", filterStatus.value);
  const res = await apiGet(`/api/Damage${params.toString() ? "?" + params.toString() : ""}`);
  if (res?.data?.isDone) damages.value = res.data.objects || [];
}

async function fetchExpiring() {
  const res = await apiGet("/api/Damage/expiring-soon");
  if (res?.data?.isDone) expiringAlerts.value = res.data.objects || [];
}

async function triggerExpiryCheck() {
  runningExpiry.value = true;
  try {
    const res = await apiPost("/api/Damage/run-expiry-check", {});
    toast.add({ severity: "info", summary: "فحص الصلاحية", detail: res?.data?.returnMessage, life: 4000 });
    await Promise.all([fetchDamages(), fetchExpiring(), inventoryStore.fetchProducts()]);
  } finally {
    runningExpiry.value = false;
  }
}

async function openCreateDamageModal(prefillAlert = null) {
  form.value = {
    productId: prefillAlert ? prefillAlert.productId : "",
    batchId: prefillAlert ? prefillAlert.batchId : "",
    quantity: prefillAlert ? prefillAlert.quantityRemaining : 1,
    reason: prefillAlert ? (prefillAlert.daysLeft <= 0 ? 1 : 2) : 2,
    notes: "",
    serialNumbers: []
  };
  productBatches.value = [];
  availableSerials.value = [];
  if (form.value.productId) {
    await onProductSelected(prefillAlert?.batchId);
  }
  showCreateModal.value = true;
}

async function onProductSelected(preferredBatchId = null) {
  if (!form.value.productId) return;
  const res = await apiGet(`/api/Damage/product/${form.value.productId}/batches`);
  productBatches.value = res?.data?.objects || [];
  form.value.batchId = preferredBatchId || productBatches.value[0]?.id || "";
  if (selectedProduct.value?.trackSerialNumbers) {
    const sRes = await apiGet(`/api/ProductItem/product/${form.value.productId}/instock`);
    availableSerials.value = sRes?.data?.objects || [];
  } else {
    availableSerials.value = [];
  }
}

async function submitCreateDamage() {
  submitting.value = true;
  try {
    const res = await apiPost("/api/Damage", form.value);
    if (res?.data?.isDone) {
      toast.add({ severity: "success", summary: "تم الحفظ", detail: res.data.returnMessage, life: 4000 });
      showCreateModal.value = false;
      await Promise.all([fetchDamages(), fetchExpiring(), inventoryStore.fetchProducts()]);
    } else {
      toast.add({ severity: "error", summary: "خطأ", detail: res?.data?.returnMessage || "فشل الحفظ", life: 4000 });
    }
  } catch (err) {
    toast.add({ severity: "error", summary: "خطأ", detail: err?.response?.data?.returnMessage || "حدث خطأ", life: 4000 });
  } finally {
    submitting.value = false;
  }
}

async function approveDamage(d) {
  const res = await apiPost(`/api/Damage/${d.id}/approve`, {});
  if (res?.data?.isDone) {
    toast.add({ severity: "success", summary: "تم الاعتماد", detail: res.data.returnMessage, life: 3000 });
    await Promise.all([fetchDamages(), fetchExpiring(), inventoryStore.fetchProducts()]);
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res?.data?.returnMessage, life: 4000 });
  }
}

async function cancelDamage(d) {
  const reason = prompt(`أدخل سبب إلغاء سند التالف #${d.documentNumber}:`);
  if (!reason) return;
  const res = await apiPost(`/api/Damage/${d.id}/cancel`, { reason });
  if (res?.data?.isDone) {
    toast.add({ severity: "success", summary: "تم الإلغاء", detail: res.data.returnMessage, life: 3000 });
    await Promise.all([fetchDamages(), fetchExpiring(), inventoryStore.fetchProducts()]);
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res?.data?.returnMessage, life: 4000 });
  }
}

function formatCurrency(val) {
  return `${Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}
</script>
