<template>
  <div class="space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Download class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.entryRequests.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.entryRequests.subTitle') }}
        </p>
      </div>

      <Button
        @click="showCreateModal = true"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.entryRequests.createRequest') }}
      </Button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-brand-gray/10 pb-3 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === tab.id ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'bg-brand-white text-brand-gray border border-brand-gray/10 hover:text-brand-dark shadow-sm'"
      >
        <span>{{ tab.name }}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-brand-light text-brand-dark font-bold">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Entry Requests Volt DataTable (No raw tr/td) -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="filteredRequests" class="w-full text-xs">
        <Column field="id" :header="$t('ohda.exitRequests.requestID')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold">#{{ data.id }}</span>
          </template>
        </Column>

        <Column field="productName" :header="$t('ohda.dashboard.productName')">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">{{ data.productName }}</div>
              <div class="text-[10px] text-brand-gray font-mono">{{ data.productSKU }}</div>
            </div>
          </template>
        </Column>

        <Column field="enteredQuantity" :header="$t('ohda.entryRequests.enteredQty')">
          <template #body="{ data }">
            <span class="font-bold text-brand-accent text-sm">+{{ data.enteredQuantity }}</span>
          </template>
        </Column>

        <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.fromSource }}</span>
          </template>
        </Column>

        <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')">
          <template #body="{ data }">
            <span class="font-mono text-brand-dark">{{ data.invoiceNumber }}</span>
          </template>
        </Column>

        <Column field="departmentName" :header="'القسم'">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.departmentName || '-' }}</span>
          </template>
        </Column>

        <Column field="productStateName" :header="'حالة المنتج'">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.productStateName || '-' }}</span>
          </template>
        </Column>

        <Column field="notes" :header="$t('ohda.entryRequests.notes')">
          <template #body="{ data }">
            <span class="text-brand-gray max-w-xs truncate block">{{ data.notes || '-' }}</span>
          </template>
        </Column>

        <Column :header="$t('ohda.exitRequests.approversAudit')">
          <template #body="{ data }">
            <div class="flex flex-col gap-1 items-center">
              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-brand-gray">{{ $t('ohda.exitRequests.step1Manager') }}</span>
                <span v-if="data.managerApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/20 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.managerUsername || 'Manager' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-500 font-bold text-[10px]">❌</span>
                <span v-else class="text-brand-gray italic text-[10px]">بانتظار الاعتماد</span>
              </div>

              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-brand-gray">{{ $t('ohda.exitRequests.step2Supervisor') }}</span>
                <span v-if="data.supervisorApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/20 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.supervisorUsername || 'Supervisor' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-500 font-bold text-[10px]">❌</span>
                <span v-else class="text-brand-gray italic text-[10px]">بانتظار التوثيق</span>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="$t('ohda.common.status')">
          <template #body="{ data }">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-bold border inline-block"
              :class="getStatusClass(data.status)"
            >
              {{ getStatusLabel(data.status) }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex flex-col gap-1.5 items-center justify-center">
              <Button
                v-if="canApproveAsManager && data.status === 1"
                @click="approveManager(data.id)"
                class="!w-full !px-3 !py-1 !bg-amber-500/10 hover:!bg-amber-500/20 !text-amber-700 !border !border-amber-500/30 !rounded-lg !text-[11px] !font-bold flex items-center justify-center gap-1"
              >
                <Check class="w-3 h-3" />
                {{ $t('ohda.exitRequests.managerApproveBtn') }}
              </Button>

              <Button
                v-if="canApproveAsSupervisor && data.status === 3"
                @click="approveSupervisor(data.id)"
                class="!w-full !px-3 !py-1 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/20 !rounded-lg !text-[11px] !font-bold flex items-center justify-center gap-1"
              >
                <Check class="w-3 h-3" />
                {{ $t('ohda.exitRequests.supervisorApproveBtn') }}
              </Button>

              <Button
                v-if="canReject && (data.status === 1 || data.status === 3)"
                @click="openRejectModal(data.id)"
                class="!w-full !px-3 !py-1 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !rounded-lg !text-[11px] !font-semibold flex items-center justify-center gap-1"
              >
                <X class="w-3 h-3" />
                {{ $t('ohda.exitRequests.rejectBtn') }}
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Entry Request Volt Dialog -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.entryRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <form @submit.prevent="handleCreateEntry" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.selectProduct') }}</label>
          <Select v-model="createForm.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.entryRequests.enteredQty') }}</label>
            <InputText v-model.number="createForm.enteredQuantity" type="number" min="1" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.entryRequests.fromSource') }}</label>
            <InputText v-model="createForm.fromSource" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="مؤسسة التوريدات الحديثة" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.entryRequests.invoiceNumber') }}</label>
          <InputText v-model="createForm.invoiceNumber" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="INV-2026-881" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">القسم (اختياري)</label>
            <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full" showClear />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark mb-1">حالة المنتج (اختياري)</label>
            <Select v-model="createForm.productStateId" :options="productStates" optionLabel="name" optionValue="id" class="w-full" showClear />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.entryRequests.notes') }}</label>
          <Textarea v-model="createForm.notes" rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="ملاحظات حول أرقام الشحنة والمستندات..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showCreateModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.entryRequests.createRequest') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Rejection Reason Volt Dialog -->
    <Dialog v-model:visible="showRejectModal" modal :header="$t('ohda.exitRequests.rejectBtn')" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="confirmRejection" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.rejectionReason') }}</label>
          <Textarea v-model="rejectionReason" required rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أدخل سبب الرفض بالتفصيل..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showRejectModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
            {{ $t('ohda.exitRequests.confirmRejection') }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet } from '@/utilities/fetchApi';

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

onMounted(async () => {
  await Promise.all([
    requestsStore.fetchEntryRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    (async () => {
      try {
        const d = await apiGet('/api/Department');
        departments.value = d?.data?.objects || d?.data?.singleObject || [];
      } catch (e) { console.warn('Departments load failed', e); }
    })(),
    (async () => {
      try {
        const s = await apiGet('/api/ProductState');
        productStates.value = s?.data?.objects || s?.data?.singleObject || [];
      } catch (e) { console.warn('ProductStates load failed', e); }
    })()
  ]);
});

const activeTab = ref("all");
const showCreateModal = ref(false);
const showRejectModal = ref(false);
const rejectingId = ref(null);
const rejectionReason = ref("");

const departments = ref([]);
const productStates = ref([]);

const createForm = ref({
  productId: inventoryStore.products[0]?.id || 1,
  enteredQuantity: 10,
  fromSource: "",
  invoiceNumber: "",
  notes: "",
  departmentId: null,
  productStateId: null
});

const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.entryRequests.length },
  { id: "pending", name: "قيد الانتظار (مرحلة 1)", count: requestsStore.entryRequests.filter(r => r.status === 1).length },
  { id: "managerApproved", name: "موافقة المدير (مرحلة 2)", count: requestsStore.entryRequests.filter(r => r.status === 3).length },
  { id: "supervisorApproved", name: "مكتمل وموثق", count: requestsStore.entryRequests.filter(r => r.status === 2).length },
  { id: "rejected", name: "مرفوض", count: requestsStore.entryRequests.filter(r => r.status === 4).length }
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "pending") return requestsStore.entryRequests.filter(r => r.status === 1);
  if (activeTab.value === "managerApproved") return requestsStore.entryRequests.filter(r => r.status === 3);
  if (activeTab.value === "supervisorApproved") return requestsStore.entryRequests.filter(r => r.status === 2);
  if (activeTab.value === "rejected") return requestsStore.entryRequests.filter(r => r.status === 4);
  return requestsStore.entryRequests;
});

function getStatusClass(status) {
  if (status === 1) return "bg-brand-light text-brand-gray border-brand-gray/20";
  if (status === 3) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (status === 2) return "bg-brand-soft text-brand-accent border-brand-accent/25";
  if (status === 4) return "bg-red-500/10 text-red-700 border-red-500/20";
  return "bg-brand-light text-brand-gray";
}

function getStatusLabel(status) {
  if (status === 1) return "قيد الانتظار (مرحلة 1)";
  if (status === 3) return "موافقة المدير (مرحلة 2)";
  if (status === 2) return "مكتمل وموثق نهائياً";
  if (status === 4) return "مرفوض";
  return "غير معروف";
}

async function handleCreateEntry() {
  const result = await requestsStore.createEntryRequest(createForm.value, authStore.user);
  if (result.success) {
    showCreateModal.value = false;
    createForm.value = {
      productId: inventoryStore.products[0]?.id || 1,
      enteredQuantity: 10,
      fromSource: "",
      invoiceNumber: "",
      notes: ""
    };
  } else {
    alert(result.message || "فشل إنشاء طلب التوريد");
  }
}

async function approveManager(id) {
  await requestsStore.managerApproveEntry(id, authStore.user);
}

async function approveSupervisor(id) {
  await requestsStore.supervisorApproveEntry(id, authStore.user);
}

function openRejectModal(id) {
  rejectingId.value = id;
  rejectionReason.value = "";
  showRejectModal.value = true;
}

async function confirmRejection() {
  if (rejectingId.value && rejectionReason.value) {
    await requestsStore.rejectEntryRequest(rejectingId.value, rejectionReason.value, authStore.user);
    showRejectModal.value = false;
  }
}

const canApproveAsManager = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 3);
});

const canReject = computed(() => {
  return canApproveAsManager.value || canApproveAsSupervisor.value;
});
</script>
