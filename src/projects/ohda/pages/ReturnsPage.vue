<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <RotateCcw class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">إدارة المرتجعات (موردين وعملاء)</h1>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            تسجيل مرتجعات البضاعة للموردين ومرتجعات العملاء مع تسوية المخزون والحسابات المالية فورياً
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openCreateReturnModal(1)"
          class="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>مرتجع لمورد</span>
        </button>

        <button
          type="button"
          @click="openCreateReturnModal(2)"
          class="px-3.5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>مرتجع من عميل</span>
        </button>
      </div>
    </div>

    <!-- Tabs Bar (Tab 1: Supplier Returns, Tab 2: Client Returns) -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
      <button
        type="button"
        @click="activeTab = 1; onTabChange()"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 1 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'text-brand-gray hover:text-brand-dark'"
      >
        <ArrowUpRight class="w-4 h-4" />
        <span>مرتجعات الموردين (إرجاع للمورد)</span>
      </button>

      <button
        type="button"
        @click="activeTab = 2; onTabChange()"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 2 ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'text-brand-gray hover:text-brand-dark'"
      >
        <ArrowDownLeft class="w-4 h-4" />
        <span>مرتجعات العملاء (استرجاع من عميل)</span>
      </button>
    </div>

    <!-- Returns Table -->
    <OhdaDataTable
      :columns="tableColumns"
      :items="returnStore.returns"
      :loading="returnStore.loading"
      :rowsPerPage="10"
      :emptyTitle="activeTab === 1 ? 'لا توجد مرتجعات موردين' : 'لا توجد مرتجعات عملاء'"
      :emptyMessage="activeTab === 1 ? 'لم يتم تسجيل أي بضاعة مرتجعة للموردين حتى الآن.' : 'لم يتم تسجيل أي بضاعة مرتجعة من العملاء حتى الآن.'"
      :emptyIcon="RotateCcw"
    >
      <template #returnNumber="{ data }">
        <span class="font-mono font-bold text-brand-accent">{{ data.returnNumber }}</span>
      </template>

      <template #partyName="{ data }">
        <span class="font-semibold">{{ data.returnType === 1 ? data.supplierName : data.clientName }}</span>
      </template>

      <template #returnDate="{ data }">
        <span class="font-mono text-xs">{{ formatDate(data.returnDate) }}</span>
      </template>

      <template #totalAmount="{ data }">
        <span class="font-mono font-bold text-red-600 dark:text-red-400">{{ formatCurrency(data.totalAmount) }} ج.م</span>
      </template>

      <template #refundMethod="{ data }">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-light dark:bg-white/10 text-brand-dark dark:text-white border border-brand-gray/20">
          {{ data.refundMethodArabic }}
        </span>
      </template>

      <template #actions="{ data }">
        <button
          type="button"
          @click="viewDetails(data)"
          class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="عرض التفاصيل"
        >
          <Eye class="w-4 h-4" />
        </button>
      </template>
    </OhdaDataTable>

    <!-- Create Return Modal (Tab A or Tab B) -->
    <OhdaModal
      v-model:visible="showCreateModal"
      :title="returnForm.returnType === 1 ? 'تسجيل مرتجع بضاعة لمورد' : 'تسجيل مرتجع بضاعة من عميل'"
      :description="returnForm.returnType === 1 ? 'إرجاع قطع غيار للمورد: يؤدي إلى خفض المخزون وخفض مديونية المورد (أو استرداد نقدي).' : 'استرجاع قطع غيار من عميل: يؤدي إلى زيادة رصيد المخزون وخفض مديونية العميل (أو استرداد نقدي).'"
      :icon="RotateCcw"
      maxWidth="max-w-4xl"
    >
      <form id="createReturnForm" @submit.prevent="submitCreateReturn" class="space-y-4">
        <!-- 2-Column Form Grid: Party & Link -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Supplier or Client Select -->
          <div v-if="returnForm.returnType === 1">
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              المورد <span class="text-red-500">*</span>
            </label>
            <select
              v-model="returnForm.supplierId"
              required
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="" disabled>اختر المورد...</option>
              <option v-for="s in inventoryStore.suppliers" :key="s.id" :value="s.id">
                {{ s.companyName }} (الرصيد: {{ formatCurrency(s.currentBalance) }} ج.م)
              </option>
            </select>
          </div>

          <div v-else>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              العميل <span class="text-red-500">*</span>
            </label>
            <select
              v-model="returnForm.clientId"
              required
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="" disabled>اختر العميل...</option>
              <option v-for="c in clientStore.clients" :key="c.id" :value="c.id">
                {{ c.name }} (المديونية: {{ formatCurrency(c.currentBalance) }} ج.م)
              </option>
            </select>
          </div>

          <!-- Refund Method -->
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">طريقة التسوية / الرد</label>
            <select
              v-model="returnForm.refundMethod"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-semibold"
            >
              <option :value="1">تسوية على رصيد الحساب (دائن / خفض مديونية)</option>
              <option :value="2">استرداد نقدي (صرف / إيداع كاش بالخزينة)</option>
            </select>
          </div>
        </div>

        <!-- Optional Cash Account Select if Cash Refund -->
        <div v-if="returnForm.refundMethod === 2" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الخزينة النقدية</label>
            <select
              v-model="returnForm.financialAccountId"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="">الخزينة النقدية الرئيسية</option>
              <option v-for="acc in financeStore.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">سبب الإرجاع</label>
            <input
              v-model="returnForm.reason"
              type="text"
              placeholder="تالف، غير مطابق، زيادة بالطلب..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>
        </div>

        <div v-else>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">سبب الإرجاع</label>
          <input
            v-model="returnForm.reason"
            type="text"
            placeholder="تالف، غير مطابق، زيادة بالطلب..."
            class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
          />
        </div>

        <!-- Items Table Section -->
        <div class="border border-brand-gray/15 rounded-2xl p-4 bg-brand-light/30 dark:bg-white/5 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Package class="w-4 h-4 text-amber-500" />
              <span>الأصناف المرتجعة</span>
            </h4>
            <button
              type="button"
              @click="addItemRow"
              class="px-2.5 py-1 bg-brand-accent/20 hover:bg-brand-accent text-brand-dark dark:text-white hover:text-brand-dark text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, idx) in returnForm.items"
              :key="idx"
              class="grid grid-cols-12 gap-2 items-center bg-brand-white dark:bg-brand-dark p-2.5 rounded-xl border border-brand-gray/10"
            >
              <div class="col-span-12 sm:col-span-5">
                <label class="block text-[10px] text-brand-gray mb-1">الصنف</label>
                <select
                  v-model="item.productId"
                  required
                  @change="onProductSelect(item)"
                  class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-lg px-2 py-1.5 text-xs text-brand-dark dark:text-white"
                >
                  <option value="" disabled>اختر الصنف...</option>
                  <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
                    {{ p.name }} (الرصيد الحالي بالمخزن: {{ p.currentQuantity }})
                  </option>
                </select>
              </div>

              <div class="col-span-4 sm:col-span-2">
                <label class="block text-[10px] text-brand-gray mb-1">الكمية المرتجعة</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-lg px-2 py-1.5 text-xs text-brand-dark dark:text-white font-mono text-center font-bold"
                />
              </div>

              <div class="col-span-4 sm:col-span-2">
                <label class="block text-[10px] text-brand-gray mb-1">سعر الوحدة (ج.م)</label>
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-lg px-2 py-1.5 text-xs text-brand-dark dark:text-white font-mono text-center"
                />
              </div>

              <div class="col-span-3 sm:col-span-2 text-center">
                <span class="block text-[10px] text-brand-gray mb-1">قيمة المرتجع</span>
                <span class="font-mono font-bold text-xs text-red-600">
                  {{ formatCurrency(item.quantity * item.unitPrice) }} ج.م
                </span>
              </div>

              <div class="col-span-1 flex justify-center">
                <button
                  type="button"
                  @click="removeItemRow(idx)"
                  :disabled="returnForm.items.length <= 1"
                  class="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-20 cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Return Value Bar -->
        <div class="flex items-center justify-between p-4 bg-brand-light/50 dark:bg-white/5 rounded-2xl border border-brand-gray/15">
          <span class="text-xs font-bold text-brand-dark dark:text-white">إجمالي قيمة المرتجع المستحقة:</span>
          <span class="font-mono font-bold text-base text-red-600">
            {{ formatCurrency(totalReturnAmount) }} ج.م
          </span>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 border border-brand-gray/20 rounded-xl text-xs font-semibold hover:bg-brand-light transition-colors cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="createReturnForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>تأكيد المرتجع وتحديث الحسابات</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Return Details Modal -->
    <OhdaModal
      v-model:visible="showDetailsModal"
      :title="`تفاصيل المرتجع #${selectedReturn?.returnNumber || ''}`"
      :description="`الطرف: ${selectedReturn?.partyName} - التاريخ: ${formatDate(selectedReturn?.returnDate)}`"
      :icon="RotateCcw"
      maxWidth="max-w-3xl"
    >
      <div v-if="selectedReturn" class="space-y-4 text-xs">
        <div class="grid grid-cols-3 gap-3 bg-brand-light/40 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block text-[10px]">نوع المرتجع</span>
            <span class="font-bold text-brand-dark dark:text-white">{{ selectedReturn.returnTypeArabic }}</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">إجمالي القيمة</span>
            <span class="font-mono font-bold text-sm text-red-600">{{ formatCurrency(selectedReturn.totalAmount) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">طريقة الرد</span>
            <span class="font-bold text-brand-dark dark:text-white">{{ selectedReturn.refundMethodArabic }}</span>
          </div>
        </div>

        <div class="border border-brand-gray/15 rounded-xl overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
              <tr>
                <th class="py-2.5 px-3">الصنف</th>
                <th class="py-2.5 px-3 text-center">الكمية المرتجعة</th>
                <th class="py-2.5 px-3 text-center">سعر الوحدة</th>
                <th class="py-2.5 px-3 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-for="item in selectedReturn.items" :key="item.id">
                <td class="py-2 px-3 font-semibold">{{ item.productName }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ item.quantity }} {{ item.unit }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ formatCurrency(item.unitPrice) }} ج.م</td>
                <td class="py-2 px-3 text-center font-mono font-bold text-red-600">{{ formatCurrency(item.totalPrice) }} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-5 py-2 bg-brand-light dark:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaReturnStore } from "../stores/useOhdaReturnStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import {
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Package,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-vue-next";

const toast = useToast();
const returnStore = useOhdaReturnStore();
const inventoryStore = useOhdaInventoryStore();
const clientStore = useOhdaClientStore();
const financeStore = useOhdaFinanceStore();

const activeTab = ref(1); // 1 = Supplier Returns, 2 = Client Returns
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const selectedReturn = ref(null);
const submitting = ref(false);

const tableColumns = [
  { field: "returnNumber", header: "رقم المرتجع", width: "160px", sortable: true },
  { field: "returnDate", header: "تاريخ المرتجع", width: "130px", sortable: true },
  { field: "partyName", header: activeTab.value === 1 ? "المورد" : "العميل", sortable: true },
  { field: "totalAmount", header: "إجمالي القيمة", width: "130px", align: "center", sortable: true },
  { field: "refundMethod", header: "طريقة الرد", width: "150px", align: "center" },
  { field: "actions", header: "الإجراءات", width: "90px", align: "center" }
];

const returnForm = ref({
  returnType: 1,
  returnDate: new Date().toISOString(),
  supplierId: "",
  clientId: "",
  refundMethod: 1,
  financialAccountId: "",
  reason: "",
  notes: "",
  items: [
    { productId: "", quantity: 1, unitPrice: 0 }
  ]
});

onMounted(async () => {
  await Promise.all([
    returnStore.fetchReturns(activeTab.value),
    inventoryStore.fetchSuppliers(),
    inventoryStore.fetchProducts(),
    clientStore.fetchClients(),
    financeStore.fetchAccounts()
  ]);
});

function onTabChange() {
  returnStore.fetchReturns(activeTab.value);
}

function openCreateReturnModal(type) {
  returnForm.value = {
    returnType: type,
    returnDate: new Date().toISOString(),
    supplierId: "",
    clientId: "",
    refundMethod: 1,
    financialAccountId: "",
    reason: "",
    notes: "",
    items: [
      { productId: "", quantity: 1, unitPrice: 0 }
    ]
  };
  showCreateModal.value = true;
}

function addItemRow() {
  returnForm.value.items.push({ productId: "", quantity: 1, unitPrice: 0 });
}

function removeItemRow(idx) {
  if (returnForm.value.items.length > 1) {
    returnForm.value.items.splice(idx, 1);
  }
}

function onProductSelect(item) {
  const prod = inventoryStore.products.find(p => p.id === item.productId);
  if (prod) {
    item.unitPrice = returnForm.value.returnType === 1 ? (prod.costPrice || 0) : (prod.sellingPrice || 0);
  }
}

const totalReturnAmount = computed(() => {
  return returnForm.value.items.reduce((acc, i) => acc + ((i.quantity || 0) * (i.unitPrice || 0)), 0);
});

async function submitCreateReturn() {
  if (returnForm.value.returnType === 1 && !returnForm.value.supplierId) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى تحديد المورد", life: 3000 });
    return;
  }
  if (returnForm.value.returnType === 2 && !returnForm.value.clientId) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى تحديد العميل", life: 3000 });
    return;
  }
  if (!returnForm.value.items.length || returnForm.value.items.some(i => !i.productId || i.quantity <= 0)) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى التحقق من الأصناف والكميات المرتجعة", life: 3000 });
    return;
  }

  submitting.value = true;
  const res = await returnStore.createReturn({
    ...returnForm.value,
    supplierId: returnForm.value.supplierId ? parseInt(returnForm.value.supplierId) : null,
    clientId: returnForm.value.clientId ? parseInt(returnForm.value.clientId) : null,
    financialAccountId: returnForm.value.financialAccountId ? parseInt(returnForm.value.financialAccountId) : null
  });
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم المرتجع", detail: res.message, life: 4000 });
    showCreateModal.value = false;
    await inventoryStore.fetchProducts();
    if (returnForm.value.returnType === 1) await inventoryStore.fetchSuppliers();
    else await clientStore.fetchClients();
  } else {
    toast.add({ severity: "error", summary: "فشل الحفظ", detail: res.message, life: 5000 });
  }
}

function viewDetails(r) {
  selectedReturn.value = {
    ...r,
    partyName: r.returnType === 1 ? r.supplierName : r.clientName
  };
  showDetailsModal.value = true;
}

function formatCurrency(val) {
  if (!val && val !== 0) return "0.00";
  return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}
</script>
