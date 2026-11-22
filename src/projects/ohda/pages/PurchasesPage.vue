<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <ShoppingBag class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">المشتريات وتوريد البضاعة</h1>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            تسجيل فواتير الشراء والتوريد المباشر، زيادة أرصدة المخزون فورياً، وإدارة حسابات الموردين
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="exportPurchasesToExcel"
          class="px-3.5 py-2.5 bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="تصدير فواتير الشراء إلى Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <button
          type="button"
          @click="openCreateModal"
          class="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>فاتورة شراء جديدة</span>
        </button>
      </div>
    </div>

    <!-- Purchases Table -->
    <OhdaDataTable
      :columns="tableColumns"
      :items="purchaseStore.purchases"
      :loading="purchaseStore.loading"
      :rowsPerPage="10"
      emptyTitle="لا توجد فواتير شراء مسجلة"
      emptyMessage="ابدأ بتسجيل أول فاتورة شراء لتوريد قطع الغيار وزيادة المخزون."
      :emptyIcon="ShoppingBag"
    >
      <template #toolbar>
        <div class="flex items-center gap-3 w-full sm:w-80">
          <div class="relative w-full">
            <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              @input="onSearch"
              type="text"
              placeholder="بحث برقم الفاتورة أو اسم المورد..."
              class="w-full bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-xl ps-9 pe-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>
        </div>
      </template>

      <template #invoiceNumber="{ data }">
        <span class="font-mono font-bold text-brand-accent">{{ data.invoiceNumber }}</span>
      </template>

      <template #purchaseDate="{ data }">
        <span class="font-mono text-xs">{{ formatDate(data.purchaseDate) }}</span>
      </template>

      <template #supplierName="{ data }">
        <span class="font-semibold">{{ data.supplierName }}</span>
      </template>

      <template #totalAmount="{ data }">
        <span class="font-mono font-bold">{{ formatCurrency(data.totalAmount) }} ج.م</span>
      </template>

      <template #paidAmount="{ data }">
        <span class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatCurrency(data.paidAmount) }} ج.م</span>
      </template>

      <template #remainingBalance="{ data }">
        <span
          class="font-mono font-bold px-2 py-0.5 rounded-lg text-[11px]"
          :class="data.remainingBalance > 0 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'text-brand-gray'"
        >
          {{ formatCurrency(data.remainingBalance) }} ج.م
        </span>
      </template>

      <template #paymentType="{ data }">
        <span
          class="px-2.5 py-1 rounded-full text-[10px] font-bold"
          :class="getPaymentTypeBadge(data.paymentType)"
        >
          {{ getPaymentTypeText(data.paymentType) }}
        </span>
      </template>

      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1.5">
          <button
            type="button"
            @click="viewDetails(data)"
            class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors"
            title="عرض التفاصيل"
          >
            <Eye class="w-4 h-4" />
          </button>
        </div>
      </template>

      <template #empty-action>
        <button
          type="button"
          @click="openCreateModal"
          class="px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl cursor-pointer"
        >
          إضافة فاتورة شراء
        </button>
      </template>
    </OhdaDataTable>

    <!-- Create Purchase Modal -->
    <OhdaModal
      v-model:visible="showCreateModalState"
      title="تسجيل فاتورة شراء وتوريد بضاعة"
      description="أدخل تفاصيل الفاتورة والمورد، وسيتم تحديث رصيد المخزون وحساب المورد فورياً في حركة مالية واحدة."
      :icon="ShoppingBag"
      maxWidth="max-w-4xl"
    >
      <form id="createPurchaseForm" @submit.prevent="submitCreatePurchase" class="space-y-5">
        <!-- 2-Column Grid: Supplier & Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              المورد <span class="text-red-500">*</span>
            </label>
            <select
              v-model="createForm.supplierId"
              required
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="" disabled>اختر المورد...</option>
              <option v-for="s in inventoryStore.suppliers" :key="s.id" :value="s.id">
                {{ s.companyName }} (الرصيد: {{ formatCurrency(s.currentBalance) }} ج.م)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              رقم الفاتورة (اختياري)
            </label>
            <input
              v-model="createForm.invoiceNumber"
              type="text"
              placeholder="يُولد تلقائياً إذا ترك فارغاً..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>
        </div>

        <!-- Line Items Section -->
        <div class="border border-brand-gray/15 rounded-2xl p-4 bg-brand-light/30 dark:bg-white/5 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Package class="w-4 h-4 text-brand-accent" />
              <span>بنود الأصناف المشتراة</span>
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
              v-for="(item, idx) in createForm.items"
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
                  <option value="" disabled>اختر الصنف من المخزن...</option>
                  <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
                    {{ p.name }} (الرصيد: {{ p.currentQuantity }})
                  </option>
                </select>
              </div>

              <div class="col-span-4 sm:col-span-2">
                <label class="block text-[10px] text-brand-gray mb-1">الكمية</label>
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
                  v-model.number="item.unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-lg px-2 py-1.5 text-xs text-brand-dark dark:text-white font-mono text-center"
                />
              </div>

              <div class="col-span-3 sm:col-span-2 text-center">
                <span class="block text-[10px] text-brand-gray mb-1">الإجمالي</span>
                <span class="font-mono font-bold text-xs text-brand-accent">
                  {{ formatCurrency(item.quantity * item.unitCost) }}
                </span>
              </div>

              <div class="col-span-1 flex justify-center">
                <button
                  type="button"
                  @click="removeItemRow(idx)"
                  :disabled="createForm.items.length <= 1"
                  class="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-20 cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2-Column Grid: Payment & Accounts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">طريقة الدفع</label>
            <select
              v-model="createForm.paymentType"
              @change="onPaymentTypeChange"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-semibold"
            >
              <option :value="1">دفع فوري بالكامل (نقدي / بنك)</option>
              <option :value="2">آجل بالكامل (على الحساب للمورد)</option>
              <option :value="3">دفع جزئي (مقدم + آجل)</option>
            </select>
          </div>

          <div v-if="createForm.paymentType !== 2">
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الخزينة / الحساب المالي</label>
            <select
              v-model="createForm.financialAccountId"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="">الخزينة النقدية الرئيسية</option>
              <option v-for="acc in financeStore.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} (الرصيد: {{ formatCurrency(acc.currentBalance) }} ج.م)
              </option>
            </select>
          </div>
        </div>

        <!-- Totals Summary & File Upload -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-brand-light/40 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/15">
          <!-- Totals Breakdown -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-brand-gray">إجمالي الفاتورة:</span>
              <span class="font-mono font-bold text-sm">{{ formatCurrency(totalInvoiceCost) }} ج.م</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-brand-gray">المدفوع حالياً:</span>
              <div class="w-32">
                <input
                  v-model.number="createForm.paidAmount"
                  type="number"
                  min="0"
                  :max="totalInvoiceCost"
                  step="0.01"
                  :disabled="createForm.paymentType === 1 || createForm.paymentType === 2"
                  class="w-full bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-lg px-2 py-1 text-xs text-emerald-600 font-mono font-bold text-center disabled:opacity-75"
                />
              </div>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-brand-gray/10">
              <span class="text-brand-gray">المتبقي على الحساب:</span>
              <span
                class="font-mono font-bold text-xs"
                :class="remainingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-brand-gray'"
              >
                {{ formatCurrency(remainingAmount) }} ج.م
              </span>
            </div>
          </div>

          <!-- Image Upload with Thumbnail Preview -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-brand-dark dark:text-white">صورة الفاتورة / إشعار الشراء</label>
            <div class="flex items-center gap-3">
              <input
                type="file"
                ref="fileInputRef"
                accept="image/*,.pdf"
                @change="handleFileUpload"
                class="hidden"
              />
              <button
                type="button"
                @click="$refs.fileInputRef.click()"
                class="px-3 py-2 bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-xl text-xs flex items-center gap-2 hover:border-brand-accent transition-colors cursor-pointer"
              >
                <Upload class="w-4 h-4 text-brand-accent" />
                <span>{{ uploadingFile ? 'جاري الرفع...' : 'رفع صورة الفاتورة' }}</span>
              </button>

              <!-- Thumbnail Preview -->
              <div
                v-if="createForm.invoiceImageUrl"
                class="w-12 h-12 rounded-xl overflow-hidden border border-brand-gray/20 relative group shrink-0"
              >
                <img :src="createForm.invoiceImageUrl" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="createForm.invoiceImageUrl = ''"
                  class="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">ملاحظات الفاتورة</label>
          <input
            v-model="createForm.notes"
            type="text"
            placeholder="ملاحظات توريد، شروط خاصة، أو رقم تسليم..."
            class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
          />
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
          form="createPurchaseForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>حفظ الفاتورة وتوريد المخزون</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Purchase Details Modal -->
    <OhdaModal
      v-model:visible="showDetailsModal"
      :title="`تفاصيل فاتورة شراء #${selectedPurchase?.invoiceNumber || ''}`"
      :description="`المورد: ${selectedPurchase?.supplierName} - التاريخ: ${formatDate(selectedPurchase?.purchaseDate)}`"
      :icon="FileText"
      maxWidth="max-w-3xl"
    >
      <div v-if="selectedPurchase" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-light/40 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block text-[10px]">إجمالي الفاتورة</span>
            <span class="font-mono font-bold text-sm text-brand-dark dark:text-white">{{ formatCurrency(selectedPurchase.totalAmount) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">المدفوع</span>
            <span class="font-mono font-bold text-sm text-emerald-600">{{ formatCurrency(selectedPurchase.paidAmount) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">المتبقي على الحساب</span>
            <span class="font-mono font-bold text-sm text-amber-600">{{ formatCurrency(selectedPurchase.remainingBalance) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">طريقة السداد</span>
            <span class="font-bold text-brand-dark dark:text-white">{{ getPaymentTypeText(selectedPurchase.paymentType) }}</span>
          </div>
        </div>

        <!-- Items Table -->
        <div class="border border-brand-gray/15 rounded-xl overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
              <tr>
                <th class="py-2.5 px-3">الصنف</th>
                <th class="py-2.5 px-3 text-center">الكمية</th>
                <th class="py-2.5 px-3 text-center">سعر الوحدة</th>
                <th class="py-2.5 px-3 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-for="item in selectedPurchase.items" :key="item.id">
                <td class="py-2 px-3 font-semibold">{{ item.productName }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ item.quantity }} {{ item.unit }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ formatCurrency(item.unitCost) }} ج.م</td>
                <td class="py-2 px-3 text-center font-mono font-bold text-brand-accent">{{ formatCurrency(item.totalCost) }} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Invoice Image Preview -->
        <div v-if="selectedPurchase.invoiceImageUrl" class="space-y-1.5 pt-2">
          <span class="text-brand-gray font-bold text-xs block">صورة الفاتورة المرفقة:</span>
          <a :href="selectedPurchase.invoiceImageUrl" target="_blank" class="inline-block border border-brand-gray/20 rounded-xl overflow-hidden max-w-xs shadow-sm">
            <img :src="selectedPurchase.invoiceImageUrl" class="max-h-48 object-contain" />
          </a>
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
import { useOhdaPurchaseStore } from "../stores/useOhdaPurchaseStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import { exportToExcelCsv } from "../utils/excelHelper";
import {
  ShoppingBag,
  Plus,
  Search,
  Package,
  Trash2,
  Upload,
  Eye,
  FileText,
  X,
  RefreshCw,
  Download
} from "lucide-vue-next";

const toast = useToast();
const purchaseStore = useOhdaPurchaseStore();
const inventoryStore = useOhdaInventoryStore();
const financeStore = useOhdaFinanceStore();

const searchQuery = ref("");
const showCreateModalState = ref(false);
const showDetailsModal = ref(false);
const selectedPurchase = ref(null);
const submitting = ref(false);
const uploadingFile = ref(false);
const fileInputRef = ref(null);

const tableColumns = [
  { field: "invoiceNumber", header: "رقم الفاتورة", width: "160px", sortable: true },
  { field: "purchaseDate", header: "تاريخ الشراء", width: "130px", sortable: true },
  { field: "supplierName", header: "المورد", sortable: true },
  { field: "totalAmount", header: "إجمالي الفاتورة", width: "130px", align: "center", sortable: true },
  { field: "paidAmount", header: "المدفوع", width: "120px", align: "center", sortable: true },
  { field: "remainingBalance", header: "المتبقي", width: "130px", align: "center", sortable: true },
  { field: "paymentType", header: "طريقة السداد", width: "130px", align: "center" },
  { field: "actions", header: "الإجراءات", width: "90px", align: "center" }
];

const createForm = ref({
  supplierId: "",
  invoiceNumber: "",
  purchaseDate: new Date().toISOString(),
  paymentType: 1,
  paidAmount: 0,
  financialAccountId: "",
  invoiceImageUrl: "",
  notes: "",
  items: [
    { productId: "", quantity: 1, unitCost: 0 }
  ]
});

onMounted(async () => {
  await Promise.all([
    purchaseStore.fetchPurchases(),
    inventoryStore.fetchSuppliers(),
    inventoryStore.fetchProducts(),
    financeStore.fetchAccounts()
  ]);
});

function onSearch() {
  purchaseStore.fetchPurchases({ search: searchQuery.value });
}

function openCreateModal() {
  createForm.value = {
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString(),
    paymentType: 1,
    paidAmount: 0,
    financialAccountId: "",
    invoiceImageUrl: "",
    notes: "",
    items: [
      { productId: "", quantity: 1, unitCost: 0 }
    ]
  };
  showCreateModalState.value = true;
}

function addItemRow() {
  createForm.value.items.push({ productId: "", quantity: 1, unitCost: 0 });
}

function removeItemRow(idx) {
  if (createForm.value.items.length > 1) {
    createForm.value.items.splice(idx, 1);
  }
}

function onProductSelect(item) {
  const prod = inventoryStore.products.find(p => p.id === item.productId);
  if (prod) {
    item.unitCost = prod.costPrice || 0;
  }
}

const totalInvoiceCost = computed(() => {
  return createForm.value.items.reduce((acc, i) => acc + ((i.quantity || 0) * (i.unitCost || 0)), 0);
});

const remainingAmount = computed(() => {
  return Math.max(0, totalInvoiceCost.value - (createForm.value.paidAmount || 0));
});

function onPaymentTypeChange() {
  if (createForm.value.paymentType === 1) {
    createForm.value.paidAmount = totalInvoiceCost.value;
  } else if (createForm.value.paymentType === 2) {
    createForm.value.paidAmount = 0;
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadingFile.value = true;
  const res = await purchaseStore.uploadInvoice(file);
  uploadingFile.value = false;
  if (res.success) {
    createForm.value.invoiceImageUrl = res.url;
    toast.add({ severity: "success", summary: "تم الرفع", detail: "تم رفع صورة الفاتورة بنجاح", life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

async function submitCreatePurchase() {
  if (!createForm.value.supplierId) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى اختيار المورد", life: 3000 });
    return;
  }
  if (!createForm.value.items.length || createForm.value.items.some(i => !i.productId || i.quantity <= 0)) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى التحقق من بنود الأصناف والكميات", life: 3000 });
    return;
  }

  if (createForm.value.paymentType === 1) {
    createForm.value.paidAmount = totalInvoiceCost.value;
  }

  submitting.value = true;
  const res = await purchaseStore.createPurchase({
    ...createForm.value,
    supplierId: parseInt(createForm.value.supplierId),
    financialAccountId: createForm.value.financialAccountId ? parseInt(createForm.value.financialAccountId) : null
  });
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم بنجاح", detail: res.message, life: 4000 });
    showCreateModalState.value = false;
    await inventoryStore.fetchProducts();
    await inventoryStore.fetchSuppliers();
  } else {
    toast.add({ severity: "error", summary: "فشل الحفظ", detail: res.message, life: 5000 });
  }
}

function viewDetails(p) {
  selectedPurchase.value = p;
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

function getPaymentTypeText(type) {
  switch (type) {
    case 1: return "مسدد فوري";
    case 2: return "آجل بالكامل";
    case 3: return "دفع جزئي";
    default: return "أخرى";
  }
}

function getPaymentTypeBadge(type) {
  switch (type) {
    case 1: return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
    case 2: return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
    case 3: return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30";
    default: return "bg-gray-500/15 text-gray-700 border border-gray-500/30";
  }
}

function exportPurchasesToExcel() {
  const exportCols = [
    { key: "invoiceNumber", label: "رقم الفاتورة" },
    { key: "purchaseDate", label: "تاريخ الشراء" },
    { key: "supplierName", label: "المورد" },
    { key: "totalAmount", label: "إجمالي الفاتورة (ج.م)" },
    { key: "paidAmount", label: "المدفوع (ج.م)" },
    { key: "remainingBalance", label: "المتبقي (ج.م)" },
    { key: "paymentType", label: "طريقة السداد" }
  ];

  const exportData = (purchaseStore.purchases || []).map(p => ({
    invoiceNumber: p.invoiceNumber || "",
    purchaseDate: formatDate(p.purchaseDate),
    supplierName: p.supplierName || "",
    totalAmount: p.totalAmount || 0,
    paidAmount: p.paidAmount || 0,
    remainingBalance: p.remainingBalance || 0,
    paymentType: getPaymentTypeText(p.paymentType)
  }));

  exportToExcelCsv("فواتير_المشتريات.csv", exportCols, exportData);
  toast.add({ severity: "success", summary: "تصدير Excel", detail: `تم تصدير ${exportData.length} فاتورة شراء بنجاح`, life: 3000 });
}
</script>
