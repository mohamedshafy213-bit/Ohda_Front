<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white">العملاء وحسابات المديونية</h1>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            إدارة بيانات العملاء، متابعة المديونيات والمستحقات، وسجل كشوفات الحساب والتحصيلات
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="openCreateModal"
          class="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>
    </div>

    <!-- Clients Table -->
    <OhdaDataTable
      :columns="tableColumns"
      :items="clientStore.clients"
      :loading="clientStore.loading"
      :rowsPerPage="10"
      emptyTitle="لا يوجد عملاء مسجلين"
      emptyMessage="قم بإضافة عملاء لتسجيل أوامر الشغل ومتابعة أرصدتهم وحركاتهم المالية."
      :emptyIcon="Users"
    >
      <template #toolbar>
        <div class="flex items-center gap-3 w-full sm:w-80">
          <div class="relative w-full">
            <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              @input="onSearch"
              type="text"
              placeholder="بحث بالاسم، رقم الهاتف، أو لوحة السيارة..."
              class="w-full bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-xl ps-9 pe-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>
        </div>
      </template>

      <template #name="{ data }">
        <div>
          <span class="font-bold text-brand-dark dark:text-white block">{{ data.name }}</span>
          <span v-if="data.carPlate" class="text-[10px] text-brand-gray font-mono">
            {{ data.carPlate }} {{ data.carModel ? `(${data.carModel})` : '' }}
          </span>
        </div>
      </template>

      <template #phone="{ data }">
        <span class="font-mono text-xs font-semibold">{{ data.phone }}</span>
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
          :class="data.currentBalance > 0 ? 'text-red-600 dark:text-red-400 font-bold' : data.currentBalance < 0 ? 'text-emerald-600' : 'text-brand-gray'"
        >
          {{ data.balanceStatus }}
        </span>
      </template>

      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1.5">
          <!-- Record Payment Action -->
          <button
            type="button"
            @click="openPaymentModal(data)"
            class="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="تحصيل دفعة مالية"
          >
            <Banknote class="w-3.5 h-3.5" />
            <span>تحصيل</span>
          </button>

          <!-- Statement Action -->
          <button
            type="button"
            @click="openStatementModal(data)"
            class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors"
            title="كشف حساب العميل"
          >
            <FileText class="w-4 h-4" />
          </button>

          <!-- Edit Action -->
          <button
            type="button"
            @click="openEditModal(data)"
            class="p-1.5 rounded-lg text-brand-dark hover:bg-brand-light dark:hover:bg-white/10 transition-colors"
            title="تعديل بيانات العميل"
          >
            <Edit2 class="w-4 h-4" />
          </button>

          <!-- Delete Action -->
          <button
            type="button"
            @click="confirmDelete(data)"
            class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
            title="حذف العميل"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>

      <template #empty-action>
        <button
          type="button"
          @click="openCreateModal"
          class="px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl cursor-pointer"
        >
          إضافة أول عميل
        </button>
      </template>
    </OhdaDataTable>

    <!-- Create / Edit Client Modal -->
    <OhdaModal
      v-model:visible="showClientModal"
      :title="isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'"
      :description="isEditing ? 'تعديل بيانات الاتصال ومعلومات السيارة' : 'تسجيل عميل جديد وتعيين رصيد افتتاحي إن وجد'"
      :icon="Users"
      maxWidth="max-w-2xl"
    >
      <form id="clientForm" @submit.prevent="submitClientForm" class="space-y-4">
        <!-- 2-Column Form Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              اسم العميل <span class="text-red-500">*</span>
            </label>
            <input
              v-model="clientForm.name"
              type="text"
              required
              placeholder="مثال: محمد أحمد علي..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
              رقم الهاتف <span class="text-red-500">*</span>
            </label>
            <input
              v-model="clientForm.phone"
              type="tel"
              required
              placeholder="01xxxxxxxxx"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رقم لوحة السيارة</label>
            <input
              v-model="clientForm.carPlate"
              type="text"
              placeholder="مثال: س ق ر 1234"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">طراز / موديل السيارة</label>
            <input
              v-model="clientForm.carModel"
              type="text"
              placeholder="مثال: تويوتا كورولا 2021"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">البريد الإلكتروني (اختياري)</label>
            <input
              v-model="clientForm.email"
              type="email"
              placeholder="name@example.com"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <div v-if="!isEditing">
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رصيد افتتاحي مديونية (ج.م)</label>
            <input
              v-model.number="clientForm.initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">العنوان / الملاحظات</label>
          <input
            v-model="clientForm.address"
            type="text"
            placeholder="عنوان أو ملاحظات خاصة بالعميل..."
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
          form="clientForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'تحديث البيانات' : 'حفظ العميل' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Record Payment Modal -->
    <OhdaModal
      v-model:visible="showPaymentModal"
      title="سداد / تحصيل دفعة من العميل"
      :description="`العميل: ${targetClient?.name || ''} - المديونية الحالية: ${formatCurrency(targetClient?.currentBalance || 0)} ج.م`"
      :icon="Banknote"
      maxWidth="max-w-md"
    >
      <form id="paymentForm" @submit.prevent="submitPaymentForm" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">
            المبلغ المحصل (ج.م) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="paymentForm.amount"
            type="number"
            min="1"
            step="0.01"
            required
            class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-600 font-mono"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">طريقة التحصيل</label>
            <select
              v-model="paymentForm.paymentMethod"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            >
              <option :value="1">نقدي (كاش)</option>
              <option :value="2">بطاقة بنكية (POS)</option>
              <option :value="3">محفظة إنستاباي</option>
              <option :value="4">تحويل بنكي</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">الخزينة المودع بها</label>
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
          <label class="block text-xs font-semibold text-brand-dark dark:text-white mb-1.5">رقم المرجع / سند القبض (اختياري)</label>
          <input
            v-model="paymentForm.reference"
            type="text"
            placeholder="سند قبض أو إيصال تحصيل..."
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
          form="paymentForm"
          :disabled="submitting"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>تأكيد التحصيل وإيداع المبلغ</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Client Account Statement Modal -->
    <OhdaModal
      v-model:visible="showStatementModal"
      :title="`كشف حساب العميل: ${targetClient?.name || ''}`"
      :description="`رقم الهاتف: ${targetClient?.phone} - الرصيد القائم: ${formatCurrency(targetClient?.currentBalance || 0)} ج.م`"
      :icon="FileText"
      maxWidth="max-w-4xl"
    >
      <div class="space-y-4">
        <!-- Balance Summary Bar -->
        <div class="flex items-center justify-between p-4 bg-brand-light/40 dark:bg-white/5 rounded-2xl border border-brand-gray/10 text-xs">
          <div>
            <span class="text-brand-gray block text-[10px]">الرصيد النهائي الحالي</span>
            <span
              class="font-mono font-bold text-base"
              :class="targetClient?.currentBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'"
            >
              {{ targetClient?.balanceStatus }}
            </span>
          </div>

          <button
            type="button"
            @click="openPaymentModal(targetClient)"
            class="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Banknote class="w-4 h-4" />
            <span>تسجيل سداد الآن</span>
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
                <th class="py-2.5 px-3 text-center text-red-600">مدين (+)</th>
                <th class="py-2.5 px-3 text-center text-emerald-600">دائن / مسدد (-)</th>
                <th class="py-2.5 px-3 text-center">الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody v-if="statementLoading" class="divide-y divide-brand-gray/10">
              <tr v-for="n in 3" :key="n" class="animate-pulse">
                <td colspan="6" class="py-3 px-3 text-center text-brand-gray">جاري تحميل كشف الحساب...</td>
              </tr>
            </tbody>
            <tbody v-else-if="clientStore.statement.length > 0" class="divide-y divide-brand-gray/10">
              <tr v-for="(item, idx) in clientStore.statement" :key="idx" class="hover:bg-brand-light/30">
                <td class="py-2 px-3 font-mono text-[11px]">{{ formatDate(item.date) }}</td>
                <td class="py-2 px-3 font-semibold">{{ item.type }}</td>
                <td class="py-2 px-3 text-brand-gray">{{ item.reference }} {{ item.notes ? `(${item.notes})` : '' }}</td>
                <td class="py-2 px-3 text-center font-mono font-bold text-red-600">
                  {{ item.debit > 0 ? `${formatCurrency(item.debit)} ج.م` : '—' }}
                </td>
                <td class="py-2 px-3 text-center font-mono font-bold text-emerald-600">
                  {{ item.credit > 0 ? `${formatCurrency(item.credit)} ج.م` : '—' }}
                </td>
                <td class="py-2 px-3 text-center font-mono font-bold text-brand-dark dark:text-white">
                  {{ formatCurrency(item.balanceAfter) }} ج.م
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="py-8 text-center text-brand-gray">لا توجد حركات مالية سابقة لهذا العميل</td>
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
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import {
  Users,
  UserPlus,
  Search,
  Banknote,
  FileText,
  Edit2,
  Trash2,
  RefreshCw
} from "lucide-vue-next";

const toast = useToast();
const clientStore = useOhdaClientStore();
const financeStore = useOhdaFinanceStore();

const searchQuery = ref("");
const showClientModal = ref(false);
const showPaymentModal = ref(false);
const showStatementModal = ref(false);
const isEditing = ref(false);
const targetClient = ref(null);
const submitting = ref(false);
const statementLoading = ref(false);

const tableColumns = [
  { field: "name", header: "اسم العميل والسيارة", sortable: true },
  { field: "phone", header: "رقم الهاتف", width: "140px", sortable: true },
  { field: "currentBalance", header: "الرصيد القائم", width: "140px", align: "center", sortable: true },
  { field: "balanceStatus", header: "الحالة المالية", width: "180px" },
  { field: "actions", header: "الإجراءات", width: "190px", align: "center" }
];

const clientForm = ref({
  name: "",
  phone: "",
  carPlate: "",
  carModel: "",
  email: "",
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
    clientStore.fetchClients(),
    financeStore.fetchAccounts()
  ]);
});

function onSearch() {
  clientStore.fetchClients(searchQuery.value);
}

function openCreateModal() {
  isEditing.value = false;
  clientForm.value = {
    name: "",
    phone: "",
    carPlate: "",
    carModel: "",
    email: "",
    address: "",
    initialBalance: 0
  };
  showClientModal.value = true;
}

function openEditModal(client) {
  isEditing.value = true;
  targetClient.value = client;
  clientForm.value = {
    name: client.name,
    phone: client.phone,
    carPlate: client.carPlate || "",
    carModel: client.carModel || "",
    email: client.email || "",
    address: client.address || ""
  };
  showClientModal.value = true;
}

async function submitClientForm() {
  submitting.value = true;
  let res;
  if (isEditing.value) {
    res = await clientStore.updateClient(targetClient.value.id, clientForm.value);
  } else {
    res = await clientStore.createClient(clientForm.value);
  }
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم بنجاح", detail: res.message, life: 3000 });
    showClientModal.value = false;
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

function openPaymentModal(client) {
  targetClient.value = client;
  paymentForm.value = {
    amount: client.currentBalance > 0 ? client.currentBalance : 0,
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
  const res = await clientStore.recordPayment({
    clientId: targetClient.value.id,
    amount: paymentForm.value.amount,
    paymentMethod: paymentForm.value.paymentMethod,
    financialAccountId: paymentForm.value.financialAccountId ? parseInt(paymentForm.value.financialAccountId) : null,
    reference: paymentForm.value.reference,
    notes: paymentForm.value.notes
  });
  submitting.value = false;

  if (res.success) {
    toast.add({ severity: "success", summary: "تم التحصيل", detail: res.message, life: 4000 });
    showPaymentModal.value = false;
    await financeStore.fetchAccounts();
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

async function openStatementModal(client) {
  targetClient.value = client;
  showStatementModal.value = true;
  statementLoading.value = true;
  await clientStore.fetchStatement(client.id);
  statementLoading.value = false;
}

async function confirmDelete(client) {
  if (confirm(`هل أنت متأكد من حذف العميل "${client.name}"؟`)) {
    const res = await clientStore.deleteClient(client.id);
    if (res.success) {
      toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
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
  if (val > 0) return "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30";
  if (val < 0) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
  return "bg-gray-500/15 text-gray-700 border border-gray-500/30";
}
</script>
