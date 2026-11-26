<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <Truck class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">الموردين وحسابات المشتريات</h1>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            إدارة بيانات الموردين، متابعة مديونيات وفواتير الشراء، سداد الدفعات، وكشوفات الحساب
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="exportSuppliersToExcel"
          class="px-3.5 py-2.5 bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="تصدير بيانات الموردين إلى ملف Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <button
          type="button"
          @click="showImportModal = true"
          class="px-3.5 py-2.5 bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="استيراد قائمة موردين من ملف Excel"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          <span>استيراد Excel</span>
        </button>

        <button
          type="button"
          @click="openAddModal"
          class="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>
    </div>

    <!-- Suppliers Table -->
    <OhdaDataTable
      :columns="tableColumns"
      :items="inventoryStore.suppliers"
      :loading="inventoryStore.loading"
      :rowsPerPage="10"
      emptyTitle="لا يوجد موردين مسجلين"
      emptyMessage="قم بإضافة موردين لتسجيل فواتير الشراء وتوريد قطع الغيار."
      :emptyIcon="Truck"
    >
      <template #companyName="{ data }">
        <div>
          <span class="font-bold text-brand-dark dark:text-white block">{{ data.companyName }}</span>
          <span v-if="data.contactName" class="text-[10px] text-brand-gray">
            المسؤول: {{ data.contactName }}
          </span>
        </div>
      </template>

      <template #phone="{ data }">
        <span class="font-mono text-xs font-semibold">{{ data.phone || '—' }}</span>
      </template>

      <template #currentBalance="{ data }">
        <span
          class="font-mono font-bold px-2.5 py-1 rounded-xl text-xs"
          :class="getBalanceBadgeClass(data.currentBalance)"
        >
          {{ formatCurrency(Math.abs(data.currentBalance)) }} ج.م
        </span>
      </template>

      <template #balanceStatus="{ data }">
        <span
          class="text-[11px] font-semibold"
          :class="data.currentBalance > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : data.currentBalance < 0 ? 'text-emerald-600' : 'text-brand-gray'"
        >
          {{ data.balanceStatus }}
        </span>
      </template>

      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1.5">
          <!-- Record Payment to Supplier -->
          <button
            type="button"
            @click="openPaymentModal(data)"
            class="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="سداد دفعة للمورد"
          >
            <Banknote class="w-3.5 h-3.5" />
            <span>سداد دفعة</span>
          </button>

          <!-- Statement Action -->
          <button
            type="button"
            @click="openStatementModal(data)"
            class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors"
            title="كشف حساب المورد"
          >
            <FileText class="w-4 h-4" />
          </button>

          <!-- Edit Action -->
          <button
            type="button"
            @click="editSupplier(data)"
            class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors"
            title="تعديل بيانات المورد"
          >
            <Edit2 class="w-4 h-4" />
          </button>

          <!-- Delete Action -->
          <button
            type="button"
            @click="promptDelete(data)"
            class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
            title="حذف المورد"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>

      <template #empty-action>
        <button
          type="button"
          @click="openAddModal"
          class="px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl cursor-pointer"
        >
          إضافة أول مورد
        </button>
      </template>
    </OhdaDataTable>

    <!-- Create / Edit Supplier Modal -->
    <OhdaModal
      v-model:visible="showModal"
      :title="isEditing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'"
      :description="isEditing ? 'تعديل بيانات الشركة ومعلومات الاتصال للمورد' : 'تسجيل شركة توريد أو تاجر قطع غيار جديد'"
      :icon="Truck"
      maxWidth="max-w-2xl"
    >
      <form id="supplierForm" @submit.prevent="saveSupplier" class="space-y-4">
        <!-- 2-Column Form Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              اسم الشركة / المورد <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.companyName"
              type="text"
              required
              placeholder="مثال: شركة النور لقطع الغيار..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الشخص المسؤول / مندوب المبيعات</label>
            <input
              v-model="form.contactName"
              type="text"
              placeholder="اسم مندوب الشركة..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رقم الهاتف</label>
            <input
              v-model="form.phone"
              @keypress="allowOnlyNumbers"
              @input="form.phone = filterPhone(form.phone)"
              maxlength="15"
              type="tel"
              placeholder="01xxxxxxxxx"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
            <p v-if="form.phone && !isValidPhone(form.phone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الرقم الضريبي / السجل التجاري</label>
            <input
              v-model="form.taxNumber"
              type="text"
              placeholder="رقم السجل أو البطاقة الضريبية..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">البريد الإلكتروني</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="info@supplier.com"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div v-if="!isEditing">
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رصيد افتتاحي مستحق للمورد (ج.م)</label>
            <input
              v-model.number="form.initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">العنوان وملاحظات التوريد</label>
          <input
            v-model="form.address"
            type="text"
            placeholder="مقر الشركة أو مواعيد التوريد..."
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
          form="supplierForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'تحديث البيانات' : 'حفظ المورد' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Record Payment to Supplier Modal -->
    <OhdaModal
      v-model:visible="showPaymentModal"
      title="سداد دفعة نقدية للمورد"
      :description="`المورد: ${targetSupplier?.companyName || ''} - الرصيد المستحق له حالياً: ${formatCurrency(targetSupplier?.currentBalance || 0)} ج.م`"
      :icon="Banknote"
      maxWidth="max-w-md"
    >
      <form id="supplierPaymentForm" @submit.prevent="submitPaymentForm" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
            المبلغ المسدد (ج.م) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="paymentForm.amount"
            type="number"
            min="1"
            step="0.01"
            required
            class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-600 font-mono"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">طريقة الصرف</label>
            <select
              v-model="paymentForm.paymentMethod"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option :value="1">نقدي (كاش)</option>
              <option :value="2">شيك بنكي</option>
              <option :value="3">محفظة إنستاباي</option>
              <option :value="4">تحويل بنكي</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الصرف من خزينة</label>
            <select
              v-model="paymentForm.financialAccountId"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option value="">الخزينة الرئيسية</option>
              <option v-for="acc in financeStore.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رقم السند / الشيك (اختياري)</label>
          <input
            v-model="paymentForm.reference"
            type="text"
            placeholder="سند صرف أو رقم الشيك..."
            class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">ملاحظات</label>
          <input
            v-model="paymentForm.notes"
            type="text"
            placeholder="ملاحظات السداد..."
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
          form="supplierPaymentForm"
          :disabled="submitting"
          class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>تأكيد الصرف للمورد</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Supplier Account Statement Modal -->
    <OhdaModal
      v-model:visible="showStatementModal"
      :title="`كشف حساب المورد: ${targetSupplier?.companyName || ''}`"
      :description="`المسؤول: ${targetSupplier?.contactName || '—'} - الرصيد القائم: ${formatCurrency(targetSupplier?.currentBalance || 0)} ج.م`"
      :icon="FileText"
      maxWidth="max-w-4xl"
    >
      <div class="space-y-4">
        <!-- Balance Summary Bar -->
        <div class="flex items-center justify-between p-4 bg-brand-light/40 dark:bg-white/5 rounded-2xl border border-brand-gray/10 text-xs">
          <div>
            <span class="text-brand-gray block text-[10px]">الرصيد النهائي المستحق للمورد</span>
            <span
              class="font-mono font-bold text-base"
              :class="targetSupplier?.currentBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'"
            >
              {{ targetSupplier?.balanceStatus }}
            </span>
          </div>

          <button
            type="button"
            @click="openPaymentModal(targetSupplier)"
            class="px-3.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Banknote class="w-4 h-4" />
            <span>سداد دفعة الآن</span>
          </button>
        </div>

        <!-- Statement Table -->
        <div class="border border-brand-gray/15 rounded-xl overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/70 dark:bg-white/5 text-brand-gray font-bold">
              <tr>
                <th class="py-2.5 px-3">التاريخ</th>
                <th class="py-2.5 px-3">نوع الحركة</th>
                <th class="py-2.5 px-3">المرجع / البيان</th>
                <th class="py-2.5 px-3 text-center text-amber-600">قيمة المشتريات (دائن +)</th>
                <th class="py-2.5 px-3 text-center text-emerald-600">المسدد / المرتجع (مدين -)</th>
                <th class="py-2.5 px-3 text-center">الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody v-if="statementLoading" class="divide-y divide-brand-gray/10">
              <tr v-for="n in 3" :key="n" class="animate-pulse">
                <td colspan="6" class="py-3 px-3 text-center text-brand-gray">جاري تحميل كشف الحساب...</td>
              </tr>
            </tbody>
            <tbody v-else-if="statementItems.length > 0" class="divide-y divide-brand-gray/10">
              <tr v-for="(item, idx) in statementItems" :key="idx" class="hover:bg-brand-light/30">
                <td class="py-2 px-3 font-mono text-[11px]">{{ formatDate(item.date) }}</td>
                <td class="py-2 px-3 font-semibold">{{ item.type }}</td>
                <td class="py-2 px-3 text-brand-gray">{{ item.reference }} {{ item.notes ? `(${item.notes})` : '' }}</td>
                <td class="py-2 px-3 text-center font-mono font-bold text-amber-600">
                  {{ item.credit > 0 ? `${formatCurrency(item.credit)} ج.م` : '—' }}
                </td>
                <td class="py-2 px-3 text-center font-mono font-bold text-emerald-600">
                  {{ item.debit > 0 ? `${formatCurrency(item.debit)} ج.م` : '—' }}
                </td>
                <td class="py-2 px-3 text-center font-mono font-bold text-brand-dark dark:text-white">
                  {{ formatCurrency(item.balanceAfter) }} ج.م
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="py-8 text-center text-brand-gray">لا توجد حركات مالية مسجلة لهذا المورد حتى الآن</td>
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
          إلغاء
        </button>
      </template>
    </OhdaModal>
    <!-- Excel Import Modal -->
    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="suppliers"
      entity-label="الموردين"
      @imported="inventoryStore.fetchSuppliers()"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import { filterPhone, isValidPhone, allowOnlyNumbers } from "@/utilities/validations";
import OhdaModal from "../components/OhdaModal.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import { exportToExcelCsv } from "../utils/excelHelper";
import {
  Truck,
  Plus,
  Banknote,
  FileText,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Upload
} from "lucide-vue-next";

const toast = useToast();
const inventoryStore = useOhdaInventoryStore();
const financeStore = useOhdaFinanceStore();
const confirmStore = useOhdaConfirmStore();

const showModal = ref(false);
const showPaymentModal = ref(false);
const showStatementModal = ref(false);
const showImportModal = ref(false);
const isEditing = ref(false);
const targetSupplier = ref(null);
const submitting = ref(false);
const statementLoading = ref(false);
const statementItems = ref([]);

const supplierTemplateColumns = [
  { key: "companyName", label: "اسم الشركة / المورد *" },
  { key: "contactName", label: "اسم مسؤول التواصل" },
  { key: "phone", label: "رقم الهاتف" },
  { key: "email", label: "البريد الإلكتروني" },
  { key: "taxNumber", label: "الرقم الضريبي" },
  { key: "address", label: "العنوان وملاحظات التوريد" },
  { key: "initialBalance", label: "الرصيد الافتتاحي (ج.م)" }
];

const supplierSampleRows = [
  {
    companyName: "شركة الأهرام لقطع الغيار",
    contactName: "م. محمد حسن",
    phone: "01012345678",
    email: "ahram@parts.com",
    taxNumber: "123-456-789",
    address: "ش التوفيقية، وسط البلد، القاهرة",
    initialBalance: "0"
  },
  {
    companyName: "مؤسسة الفلاتر والزيوت العالمية",
    contactName: "أحمد سيد",
    phone: "01123456789",
    email: "oils@filters.com",
    taxNumber: "987-654-321",
    address: "المنطقة الصناعية، جسر السويس",
    initialBalance: "5000"
  }
];

function exportSuppliersToExcel() {
  const exportCols = [
    { key: "companyName", label: "اسم المورد / الشركة" },
    { key: "contactName", label: "المسؤول" },
    { key: "phone", label: "رقم الهاتف" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "taxNumber", label: "الرقم الضريبي" },
    { key: "currentBalance", label: "الرصيد الحالي (ج.م)" },
    { key: "balanceStatus", label: "الحالة المالية" },
    { key: "address", label: "العنوان وملاحظات التوريد" }
  ];

  const exportData = (inventoryStore.suppliers || []).map(s => ({
    companyName: s.companyName || "",
    contactName: s.contactName || "",
    phone: s.phone || "",
    email: s.email || "",
    taxNumber: s.taxNumber || "",
    currentBalance: s.currentBalance || 0,
    balanceStatus: s.balanceStatus || (s.currentBalance > 0 ? "مستحق له" : s.currentBalance < 0 ? "مدين للورشة" : "خالص"),
    address: s.address || ""
  }));

  exportToExcelCsv("قائمة_الموردين.csv", exportCols, exportData);
  toast.add({ severity: "success", summary: "تصدير Excel", detail: `تم تصدير ${exportData.length} مورد بنجاح`, life: 3000 });
}

async function handleSuppliersImport(rows) {
  let successCount = 0;
  let failCount = 0;

  for (const r of rows) {
    const companyName = r.companyName || r["اسم الشركة / المورد *"] || r["اسم المورد"] || r["اسم الشركة"];
    if (!companyName || !companyName.toString().trim()) {
      continue;
    }

    try {
      const payload = {
        companyName: companyName.toString().trim(),
        contactName: (r.contactName || r["اسم مسؤول التواصل"] || "").toString().trim(),
        phone: (r.phone || r["رقم الهاتف"] || "").toString().trim(),
        email: (r.email || r["البريد الإلكتروني"] || "").toString().trim(),
        taxNumber: (r.taxNumber || r["الرقم الضريبي"] || "").toString().trim(),
        address: (r.address || r["العنوان وملاحظات التوريد"] || "").toString().trim(),
        initialBalance: Number(r.initialBalance || r["الرصيد الافتتاحي (ج.م)"] || 0) || 0
      };

      const res = await inventoryStore.addSupplier(payload);
      if (res && res.success !== false) {
        successCount++;
      } else {
        failCount++;
      }
    } catch {
      failCount++;
    }
  }

  return {
    success: successCount > 0,
    message: `تم استيراد ${successCount} مورد بنجاح${failCount > 0 ? ` (فشل ${failCount})` : ''}`
  };
}

async function onSuppliersImported() {
  await inventoryStore.fetchSuppliers();
}

const tableColumns = [
  { field: "companyName", header: "اسم المورد / الشركة", sortable: true },
  { field: "phone", header: "رقم الهاتف", width: "140px", sortable: true },
  { field: "currentBalance", header: "الرصيد القائم", width: "140px", align: "center", sortable: true },
  { field: "balanceStatus", header: "الحالة المالية للمورد", width: "180px" },
  { field: "actions", header: "الإجراءات", width: "190px", align: "center" }
];

const form = ref({
  companyName: "",
  contactName: "",
  phone: "",
  email: "",
  taxNumber: "",
  address: "",
  initialBalance: 0
});

const paymentForm = ref({
  amount: 0,
  paymentMethod: 1,
  financialAccountId: "",
  reference: "",
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchSuppliers(),
    financeStore.fetchAccounts()
  ]);
});

function openAddModal() {
  isEditing.value = false;
  form.value = {
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
    initialBalance: 0
  };
  showModal.value = true;
}

function editSupplier(s) {
  isEditing.value = true;
  targetSupplier.value = s;
  form.value = {
    companyName: s.companyName,
    contactName: s.contactName || "",
    phone: s.phone || "",
    email: s.email || "",
    taxNumber: s.taxNumber || "",
    address: s.address || ""
  };
  showModal.value = true;
}

async function saveSupplier() {
  if (form.value.phone && !isValidPhone(form.value.phone)) {
    toast.add({ severity: "warn", summary: "رقم الهاتف غير صالح", detail: "رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً وبدون حروف أو رموز.", life: 4000 });
    return;
  }
  submitting.value = true;
  let res;
  if (isEditing.value) {
    res = await inventoryStore.updateSupplier(targetSupplier.value.id, form.value);
  } else {
    res = await inventoryStore.addSupplier(form.value);
  }
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم بنجاح", detail: "تم حفظ بيانات المورد", life: 3000 });
    showModal.value = false;
    await inventoryStore.fetchSuppliers();
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

function openPaymentModal(s) {
  targetSupplier.value = s;
  paymentForm.value = {
    amount: s.currentBalance > 0 ? s.currentBalance : 0,
    paymentMethod: 1,
    financialAccountId: "",
    reference: "",
    notes: ""
  };
  showPaymentModal.value = true;
}

async function submitPaymentForm() {
  if (paymentForm.value.amount <= 0) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى إدخال مبلغ سداد أكبر من صفر", life: 3000 });
    return;
  }

  submitting.value = true;
  const res = await inventoryStore.recordSupplierPayment({
    supplierId: targetSupplier.value.id,
    amount: paymentForm.value.amount,
    paymentMethod: paymentForm.value.paymentMethod,
    financialAccountId: paymentForm.value.financialAccountId ? parseInt(paymentForm.value.financialAccountId) : null,
    reference: paymentForm.value.reference,
    notes: paymentForm.value.notes
  });
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم الصرف", detail: res.message, life: 4000 });
    showPaymentModal.value = false;
    await inventoryStore.fetchSuppliers();
    await financeStore.fetchAccounts();
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

async function openStatementModal(s) {
  targetSupplier.value = s;
  showStatementModal.value = true;
  statementLoading.value = true;
  statementItems.value = await inventoryStore.fetchSupplierStatement(s.id);
  statementLoading.value = false;
}

async function promptDelete(s) {
  const ok = await confirmStore.showConfirm({
    title: "حذف المورد",
    message: `هل أنت متأكد من رغبتك في حذف بيانات المورد "${s.companyName}"؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (ok) {
    const res = await inventoryStore.deleteSupplier(s.id);
    if (res.success) {
      toast.add({ severity: "success", summary: "تم الحذف", detail: "تم حذف المورد بنجاح", life: 3000 });
    } else {
      toast.add({ severity: "error", summary: "تعذر الحذف", detail: res.message, life: 4000 });
    }
  }
}

function formatCurrency(val) {
  if (!val && val !== 0) return "0.00";
  return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function getBalanceBadgeClass(val) {
  if (val > 0) return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
  if (val < 0) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
  return "bg-gray-500/15 text-gray-700 border border-gray-500/30";
}
</script>
