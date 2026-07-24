<template>
  <div class="space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <Download class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.entryRequests.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.entryRequests.subTitle') }}
        </p>
      </div>

      <Button
        @click="showCreateModal = true"
        class="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.entryRequests.createRequest') }}
      </Button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-700/60 pb-3 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:text-slate-200'"
      >
        <span>{{ tab.name }}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/60 text-slate-300">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Entry Requests Volt DataTable (No raw tr/td) -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="filteredRequests" class="w-full text-xs">
        <Column field="id" :header="$t('ohda.exitRequests.requestID')">
          <template #body="{ data }">
            <span class="font-mono text-emerald-400 font-bold">#{{ data.id }}</span>
          </template>
        </Column>

        <Column field="productName" :header="$t('ohda.dashboard.productName')">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-white">{{ data.productName }}</div>
              <div class="text-[10px] text-slate-400 font-mono">{{ data.productSKU }}</div>
            </div>
          </template>
        </Column>

        <Column field="enteredQuantity" :header="$t('ohda.entryRequests.enteredQty')">
          <template #body="{ data }">
            <span class="font-bold text-emerald-400 text-sm">+{{ data.enteredQuantity }}</span>
          </template>
        </Column>

        <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')">
          <template #body="{ data }">
            <span class="font-semibold text-slate-200">{{ data.fromSource }}</span>
          </template>
        </Column>

        <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')">
          <template #body="{ data }">
            <span class="font-mono text-slate-300">{{ data.invoiceNumber }}</span>
          </template>
        </Column>

        <Column field="notes" :header="$t('ohda.entryRequests.notes')">
          <template #body="{ data }">
            <span class="text-slate-400 max-w-xs truncate block">{{ data.notes || '-' }}</span>
          </template>
        </Column>

        <Column :header="$t('ohda.exitRequests.approversAudit')">
          <template #body="{ data }">
            <div class="flex flex-col gap-1 items-center">
              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-slate-400">{{ $t('ohda.exitRequests.step1Manager') }}</span>
                <span v-if="data.managerApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.managerUsername || 'Manager' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-400 font-bold text-[10px]">❌</span>
                <span v-else class="text-slate-500 italic text-[10px]">بانتظار الاعتماد</span>
              </div>

              <div class="flex items-center gap-1.5 text-[11px]">
                <span class="text-slate-400">{{ $t('ohda.exitRequests.step2Supervisor') }}</span>
                <span v-if="data.supervisorApprove" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check class="w-3 h-3" /> {{ data.supervisorUsername || 'Supervisor' }}
                </span>
                <span v-else-if="data.status === 4" class="text-red-400 font-bold text-[10px]">❌</span>
                <span v-else class="text-slate-500 italic text-[10px]">بانتظار التوثيق</span>
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
                v-if="(authStore.isManager || authStore.isAdmin) && data.status === 1"
                @click="approveManager(data.id)"
                class="!w-full !px-3 !py-1 !bg-amber-500/20 hover:!bg-amber-500/30 !text-amber-300 !border !border-amber-500/40 !rounded-lg !text-[11px] !font-bold flex items-center justify-center gap-1"
              >
                <Check class="w-3 h-3" />
                {{ $t('ohda.exitRequests.managerApproveBtn') }}
              </Button>

              <Button
                v-if="(authStore.isSupervisor || authStore.isAdmin) && data.status === 3"
                @click="approveSupervisor(data.id)"
                class="!w-full !px-3 !py-1 !bg-emerald-500/20 hover:!bg-emerald-500/30 !text-emerald-300 !border !border-emerald-500/40 !rounded-lg !text-[11px] !font-bold flex items-center justify-center gap-1"
              >
                <Check class="w-3 h-3" />
                {{ $t('ohda.exitRequests.supervisorApproveBtn') }}
              </Button>

              <Button
                v-if="(authStore.isManager || authStore.isSupervisor || authStore.isAdmin) && (data.status === 1 || data.status === 3)"
                @click="openRejectModal(data.id)"
                class="!w-full !px-3 !py-1 !bg-red-500/10 hover:!bg-red-500/20 !text-red-400 !border !border-red-500/30 !rounded-lg !text-[11px] !font-semibold flex items-center justify-center gap-1"
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
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.entryRequests.createRequest')" class="!bg-slate-800 !border-slate-700 max-w-lg w-full">
      <form @submit.prevent="handleCreateEntry" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.exitRequests.selectProduct') }}</label>
          <Select v-model="createForm.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.entryRequests.enteredQty') }}</label>
            <InputText v-model.number="createForm.enteredQuantity" type="number" min="1" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.entryRequests.fromSource') }}</label>
            <InputText v-model="createForm.fromSource" required class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="مؤسسة التوريدات الحديثة" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.entryRequests.invoiceNumber') }}</label>
          <InputText v-model="createForm.invoiceNumber" required class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="INV-2026-881" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.entryRequests.notes') }}</label>
          <Textarea v-model="createForm.notes" rows="3" class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="ملاحظات حول أرقام الشحنة والمستندات..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showCreateModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-emerald-500 !text-slate-950 !font-bold">
            {{ $t('ohda.entryRequests.createRequest') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Rejection Reason Volt Dialog -->
    <Dialog v-model:visible="showRejectModal" modal :header="$t('ohda.exitRequests.rejectBtn')" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="confirmRejection" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.exitRequests.rejectionReason') }}</label>
          <Textarea v-model="rejectionReason" required rows="3" class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="أدخل سبب الرفض بالتفصيل..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showRejectModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-red-500 !text-white !font-bold">
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

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();

onMounted(() => {
  requestsStore.fetchEntryRequests();
  inventoryStore.fetchProducts();
});

const activeTab = ref("all");
const showCreateModal = ref(false);
const showRejectModal = ref(false);
const rejectingId = ref(null);
const rejectionReason = ref("");

const createForm = ref({
  productId: inventoryStore.products[0]?.id || 1,
  enteredQuantity: 10,
  fromSource: "",
  invoiceNumber: "",
  notes: ""
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
  if (status === 1) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (status === 3) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (status === 2) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (status === 4) return "bg-red-500/20 text-red-300 border-red-500/30";
  return "bg-slate-700 text-slate-300";
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
</script>
