<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <FileText class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.exitRequests.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.exitRequests.subTitle') }}
        </p>
      </div>

      <Button
        @click="showCreateModal = true"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.exitRequests.createRequest') }}
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

    <!-- Exit Requests Volt DataTable (No raw tr/td) -->
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
              <div v-if="data.selectedSerials && data.selectedSerials.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                <span v-for="sn in data.selectedSerials" :key="sn" class="px-1.5 py-0.5 rounded bg-brand-light text-[9px] text-brand-dark border border-brand-gray/10 font-mono select-all">
                  {{ sn }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column field="requestedQuantity" :header="$t('ohda.exitRequests.qty')">
          <template #body="{ data }">
            <span class="font-bold text-brand-dark text-sm">{{ data.requestedQuantity }}</span>
          </template>
        </Column>

        <Column field="recipientName" :header="$t('ohda.exitRequests.recipientName')">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">{{ data.recipientName }}</div>
              <div class="text-[10px] text-brand-gray">{{ data.recipientDepartment }}</div>
            </div>
          </template>
        </Column>

        <Column field="departmentName" :header="'القسم'">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.departmentName || '-' }}</span>
          </template>
        </Column>

        <Column field="purpose" :header="$t('ohda.exitRequests.purpose')">
          <template #body="{ data }">
            <span class="text-brand-dark max-w-xs truncate block">{{ data.purpose }}</span>
          </template>
        </Column>

        <Column field="requestedByUsername" :header="$t('ohda.exitRequests.requestedBy')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.requestedByUsername }}</span>
          </template>
        </Column>

        <!-- 2-Step Signatures Audit -->
        <Column :header="$t('ohda.exitRequests.approversAudit')">
          <template #body="{ data }">
            <div class="flex flex-col gap-1 items-center">
              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-brand-gray">{{ $t('ohda.exitRequests.step1Manager') }}</span>
                <span v-if="data.managerApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/20 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.managerUsername || 'Manager' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-550 font-bold text-[10px]">❌</span>
                <span v-else class="text-brand-gray italic text-[10px]">بانتظار الاعتماد</span>
              </div>

              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-brand-gray">{{ $t('ohda.exitRequests.step2Supervisor') }}</span>
                <span v-if="data.supervisorApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/20 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.supervisorUsername || 'Supervisor' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-550 font-bold text-[10px]">❌</span>
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
            <p v-if="data.status === 4 && data.rejectionReason" class="text-[10px] text-red-500 mt-1 italic max-w-xs">
              السبب: {{ data.rejectionReason }}
            </p>
          </template>
        </Column>

        <!-- Actions Column -->
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

    <!-- Create Exit Request Volt Dialog -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.exitRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <form @submit.prevent="handleCreateExit" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.selectProduct') }}</label>
          <Select v-model="createForm.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.qty') }}</label>
            <InputNumber v-model="createForm.requestedQuantity" required readonly class="w-full !bg-brand-light !border-brand-gray/20 !text-brand-gray cursor-not-allowed" />
          </div>
        </div>

        <div v-if="createForm.productId" class="space-y-2 border-t border-brand-gray/10 pt-4">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-brand-dark">حدد الأرقام التسلسلية المراد صرفها:</span>
            <span class="text-brand-accent font-bold font-mono text-[10px]">المحدد: {{ createForm.selectedProductItemIds?.length || 0 }} جهاز</span>
          </div>

          <div v-if="loadingSerials" class="text-center py-4">
            <svg class="animate-spin h-5 w-5 text-brand-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="availableSerials.length === 0" class="p-3 text-center text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl">
            لا توجد أجهزة متوفرة في المخزن لهذا الصنف حالياً!
          </div>

          <div v-else class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-brand-gray/25 p-2.5 rounded-xl bg-brand-light pr-1">
            <label
              v-for="s in availableSerials"
              :key="s.id"
              class="flex items-center gap-2 p-1.5 border rounded-lg font-mono text-[10px] select-none cursor-pointer transition-colors"
              :class="createForm.selectedProductItemIds?.includes(s.id) ? 'border-brand-accent/60 bg-brand-soft text-brand-dark' : 'border-brand-gray/20 text-brand-gray hover:border-brand-accent/50'"
            >
              <input
                type="checkbox"
                :value="s.id"
                v-model="createForm.selectedProductItemIds"
                @change="handleSerialSelect"
                class="rounded text-brand-accent focus:ring-brand-accent border-brand-gray/30 h-3.5 w-3.5 cursor-pointer bg-brand-light"
              />
              <span class="font-semibold truncate">{{ s.serialNumber }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientName') }}</label>
          <InputText v-model="createForm.recipientName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أحمد محمود" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientDepartment') }}</label>
          <InputText v-model="createForm.recipientDepartment" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="قسم المالية" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">القسم (اختياري)</label>
          <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full" showClear />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.purpose') }}</label>
          <Textarea v-model="createForm.purpose" required rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="تسليم عهدة موظف جديد" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showCreateModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.exitRequests.createRequest') }}
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
import { ref, computed, onMounted, watch } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet } from "@/utilities/fetchApi";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

const availableSerials = ref([]);
const loadingSerials = ref(false);
const departments = ref([]);

onMounted(async () => {
  await Promise.all([
    requestsStore.fetchExitRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    (async () => {
      try {
        const d = await apiGet('/api/Department');
        departments.value = d?.data?.objects || d?.data?.singleObject || [];
      } catch (e) { console.warn('Departments load failed', e); }
    })()
  ]);
});

const activeTab = ref("all");
const showCreateModal = ref(false);
const showRejectModal = ref(false);
const rejectingId = ref(null);
const rejectionReason = ref("");

const createForm = ref({
  productId: null,
  requestedQuantity: 0,
  recipientName: "",
  recipientDepartment: "",
  purpose: "",
  selectedProductItemIds: [],
  departmentId: null
});

watch(() => createForm.value.productId, async (newVal) => {
  createForm.value.selectedProductItemIds = [];
  createForm.value.requestedQuantity = 0;
  availableSerials.value = [];
  if (!newVal) return;

  loadingSerials.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/product/${newVal}/instock`);
    if (res?.data?.isDone) {
      availableSerials.value = res.data.singleObject || [];
    }
  } catch (err) {
    console.error("Error loading serials", err);
  } finally {
    loadingSerials.value = false;
  }
});

function handleSerialSelect() {
  createForm.value.requestedQuantity = createForm.value.selectedProductItemIds.length;
}


const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.exitRequests.length },
  { id: "pending", name: "قيد الانتظار (مرحلة 1)", count: requestsStore.exitRequests.filter(r => r.status === 1).length },
  { id: "managerApproved", name: "موافقة المدير (مرحلة 2)", count: requestsStore.exitRequests.filter(r => r.status === 3).length },
  { id: "supervisorApproved", name: "مكتمل وموثق", count: requestsStore.exitRequests.filter(r => r.status === 2).length },
  { id: "rejected", name: "مرفوض", count: requestsStore.exitRequests.filter(r => r.status === 4).length }
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "pending") return requestsStore.exitRequests.filter(r => r.status === 1);
  if (activeTab.value === "managerApproved") return requestsStore.exitRequests.filter(r => r.status === 3);
  if (activeTab.value === "supervisorApproved") return requestsStore.exitRequests.filter(r => r.status === 2);
  if (activeTab.value === "rejected") return requestsStore.exitRequests.filter(r => r.status === 4);
  return requestsStore.exitRequests;
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

async function handleCreateExit() {
  if (createForm.value.selectedProductItemIds.length === 0) {
    alert("يرجى اختيار رقم تسلسلي واحد على الأقل للمتابعة.");
    return;
  }
  const result = await requestsStore.createExitRequest(createForm.value, authStore.user);
  if (result.success) {
    showCreateModal.value = false;
    createForm.value = {
      productId: null,
      requestedQuantity: 0,
      recipientName: "",
      recipientDepartment: "",
      purpose: "",
      selectedProductItemIds: []
    };
    availableSerials.value = [];
    requestsStore.fetchExitRequests();
  } else {
    alert(result.message || "فشل إنشاء طلب الصرف");
  }
}

async function approveManager(id) {
  await requestsStore.managerApproveExit(id, authStore.user);
}

async function approveSupervisor(id) {
  await requestsStore.supervisorApproveExit(id, authStore.user);
}

function openRejectModal(id) {
  rejectingId.value = id;
  rejectionReason.value = "";
  showRejectModal.value = true;
}

async function confirmRejection() {
  if (rejectingId.value && rejectionReason.value) {
    await requestsStore.rejectExitRequest(rejectingId.value, rejectionReason.value, authStore.user);
    showRejectModal.value = false;
  }
}

const canApproveAsManager = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 3);
});

const canReject = computed(() => {
  return canApproveAsManager.value || canApproveAsSupervisor.value;
});
</script>
