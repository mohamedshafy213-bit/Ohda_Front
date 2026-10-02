<template>
  <div class="space-y-6 font-sans">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm transition-colors">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-3">
          <Compass class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.compass.title') }}
        </h1>
        <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
          {{ $t('ohda.compass.subTitle') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Export to Excel Button -->
        <Button
          @click="exportToExcel"
          :loading="exporting"
          class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
        >
          <FileSpreadsheet class="w-4 h-4" />
          {{ $t('ohda.compass.exportExcel') }}
        </Button>

        <Button
          @click="downloadTemplate"
          class="!bg-surface-100 dark:!bg-surface-800 hover:!bg-surface-200 dark:hover:!bg-surface-700 !text-surface-800 dark:!text-surface-200 !border !border-surface-300 dark:!border-surface-700 !rounded-xl !px-4 !py-2.5 !text-xs !font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.compass.downloadTemplate') }}
        </Button>

        <Button
          @click="showUploadModal = true"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-surface-900 !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
        >
          <Upload class="w-4 h-4" />
          {{ $t('ohda.compass.uploadDocument') }}
        </Button>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm p-5 rounded-2xl space-y-4 transition-colors">
      <div class="flex flex-col lg:flex-row items-start gap-4">
        <div class="flex-1 w-full">
          <div class="flex items-center justify-between">
            <button
              @click="filtersCollapsed = !filtersCollapsed"
              class="text-xs text-brand-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Filter class="w-3.5 h-3.5" />
              {{ filtersCollapsed ? $t('ohda.compass.showFilters') : $t('ohda.compass.hideFilters') }}
            </button>
            <span class="text-[11px] text-surface-400">
              {{ compassLogs.length }} {{ $t('ohda.inventory.recordsCount') }}
            </span>
          </div>

          <div v-if="!filtersCollapsed" class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                🔍 {{ $t('ohda.compass.textSearch') }}
              </label>
              <InputText
                v-model="filters.query"
                :placeholder="$t('ohda.compass.searchPlaceholder')"
                class="w-full text-xs"
                @input="debouncedSearch"
              />
            </div>

            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                🏢 {{ $t('ohda.compass.department') }}
              </label>
              <Select
                v-model="filters.departmentId"
                :options="departments"
                optionLabel="name"
                optionValue="id"
                class="w-full text-xs"
                showClear
                :placeholder="$t('ohda.common.all')"
                @change="performSearch"
              />
            </div>

            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                🔄 {{ $t('ohda.compass.movementType') }}
              </label>
              <Select
                v-model="filters.type"
                :options="[
                  { label: $t('ohda.compass.allTypes'), value: null },
                  { label: $t('ohda.compass.inflow'), value: 1 },
                  { label: $t('ohda.compass.outflow'), value: 2 }
                ]"
                optionLabel="label"
                optionValue="value"
                class="w-full text-xs"
                @change="performSearch"
              />
            </div>

            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                📦 {{ $t('ohda.compass.productState') }}
              </label>
              <Select
                v-model="filters.stateId"
                :options="productStates"
                optionLabel="name"
                optionValue="id"
                class="w-full text-xs"
                showClear
                :placeholder="$t('ohda.common.all')"
                @change="performSearch"
              />
            </div>

            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                📅 {{ $t('ohda.compass.fromDate') }}
              </label>
              <InputText
                v-model="filters.startDate"
                type="date"
                class="w-full text-xs"
                @change="performSearch"
              />
            </div>

            <div>
              <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                📅 {{ $t('ohda.compass.toDate') }}
              </label>
              <InputText
                v-model="filters.endDate"
                type="date"
                class="w-full text-xs"
                @change="performSearch"
              />
            </div>
          </div>
        </div>

        <div class="w-full lg:w-44 flex flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-6">
          <Button @click="performSearch" class="flex-1 !bg-brand-accent !text-surface-900 !font-bold !text-xs !py-2.5">
            {{ $t('ohda.common.search') }}
          </Button>
          <SecondaryButton @click="resetFilters" class="flex-1 !text-xs !py-2.5">
            {{ $t('ohda.common.reset') }}
          </SecondaryButton>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
      <div v-if="loading" class="p-6">
        <LoadingSkeleton type="table" :rows="8" />
      </div>

      <DataTable
        v-else
        :value="compassLogs"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        class="w-full text-xs"
      >
        <template #empty>
          <div class="p-8">
            <EmptyState
              :title="$t('ohda.compass.emptyTitle')"
              :description="$t('ohda.compass.emptyDesc')"
              :showAction="false"
            />
          </div>
        </template>

        <Column :header="$t('ohda.compass.documentNumber')">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-mono text-surface-900 dark:text-surface-100 font-bold text-xs">
                {{ data.documentNumber || (data.type === 2 ? `DOC-OUT-${data.productExitRequestId || data.id}` : `DOC-IN-${data.productEntryRequestId || data.id}`) }}
              </span>
              <span v-if="data.type === 1 && (data.originalExitDocumentNumber || data.productExitRequestId)" class="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                {{ $t('ohda.compass.linkedTo') }} {{ data.originalExitDocumentNumber || `DOC-OUT-${data.productExitRequestId}` }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="serialNumber" :header="$t('ohda.compass.serialNumber')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold select-all text-xs bg-brand-soft dark:bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
              {{ data.serialNumber }}
            </span>
          </template>
        </Column>

        <Column field="productName" :header="$t('ohda.compass.productName')">
          <template #body="{ data }">
            <span class="font-bold text-surface-900 dark:text-surface-100">{{ data.productName }}</span>
          </template>
        </Column>

        <Column :header="$t('ohda.compass.movementType')">
          <template #body="{ data }">
            <span v-if="data.type === 1" class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
              {{ $t('ohda.compass.inflow') }}
            </span>
            <span v-else-if="data.type === 2" class="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
              {{ $t('ohda.compass.outflow') }}
            </span>
            <span v-else class="text-surface-400">-</span>
          </template>
        </Column>

        <Column field="recipientName" :header="$t('ohda.compass.recipient')">
          <template #body="{ data }">
            <span class="font-semibold text-surface-800 dark:text-surface-200">{{ data.recipientName || '-' }}</span>
          </template>
        </Column>

        <Column field="delivererName" :header="$t('ohda.compass.deliverer')">
          <template #body="{ data }">
            <span class="text-surface-700 dark:text-surface-300 font-medium">{{ data.delivererName || '-' }}</span>
          </template>
        </Column>

        <Column field="departmentName" :header="$t('ohda.compass.deptAndPlace')">
          <template #body="{ data }">
            <span class="text-surface-600 dark:text-surface-400">{{ data.departmentName || data.place || '-' }}</span>
          </template>
        </Column>

        <Column field="exitDate" :header="$t('ohda.compass.date')">
          <template #body="{ data }">
            <span class="font-mono text-surface-500 dark:text-surface-400 text-[11px]">{{ formatDate(data.exitDate) }}</span>
          </template>
        </Column>

        <Column field="productStateName" :header="$t('ohda.compass.state')">
          <template #body="{ data }">
            <span class="text-surface-600 dark:text-surface-400 text-[11px]">{{ data.productStateName || '-' }}</span>
          </template>
        </Column>

        <!-- Actions / Details Eye Icon -->
        <Column :header="$t('ohda.compass.details')" headerClass="text-center" bodyClass="text-center" style="width: 80px">
          <template #body="{ data }">
            <button
              @click="openDetailsModal(data)"
              :title="$t('ohda.compass.viewDetails')"
              class="w-8 h-8 rounded-xl bg-brand-soft dark:bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/25 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 mx-auto"
            >
              <Eye class="w-4 h-4" />
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Movement & Approval Details Modal -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      :header="$t('ohda.compass.modalTitle', { name: selectedItem?.productName || '' })"
      class="max-w-2xl w-full"
    >
      <div v-if="selectedItem" class="space-y-5 text-xs">
        <!-- Top Status Banner -->
        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[10px] text-surface-500 dark:text-surface-400 font-semibold block mb-0.5">
              {{ $t('ohda.compass.serialNumber') }}
            </span>
            <span class="font-mono text-base font-black text-brand-accent select-all">{{ selectedItem.serialNumber }}</span>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="px-3 py-1 rounded-xl text-xs font-black"
              :class="selectedItem.type === 1 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'"
            >
              {{ selectedItem.type === 1 ? $t('ohda.compass.inflowBadge') : $t('ohda.compass.outflowBadge') }}
            </span>
          </div>
        </div>

        <!-- 2-Column Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Parties Card -->
          <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-850 space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-100 dark:border-surface-700 pb-2">
              <Users class="w-4 h-4 text-brand-accent" />
              {{ $t('ohda.compass.partiesTitle') }}
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.delivererApplicant') }}</span>
                <span class="font-bold text-surface-900 dark:text-surface-100">{{ selectedItem.delivererName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientHolder') }}</span>
                <span class="font-bold text-brand-accent">{{ selectedItem.recipientName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientDept') }}</span>
                <span class="font-semibold text-surface-800 dark:text-surface-200">{{ selectedItem.departmentName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientPlace') }}</span>
                <span class="text-surface-700 dark:text-surface-300">{{ selectedItem.place || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Movement Info Card -->
          <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-850 space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-100 dark:border-surface-700 pb-2">
              <Calendar class="w-4 h-4 text-brand-accent" />
              {{ $t('ohda.compass.movementDataTitle') }}
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.movementDate') }}</span>
                <span class="font-mono font-semibold text-surface-800 dark:text-surface-200">{{ formatDate(selectedItem.exitDate) }}</span>
              </div>
              <div v-if="selectedItem.requesterConfirmedDate" class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.confirmationDate') }}</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ formatDate(selectedItem.requesterConfirmedDate) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.deviceState') }}</span>
                <span class="font-bold text-surface-800 dark:text-surface-200">{{ selectedItem.productStateName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.docNumber') }}</span>
                <span class="font-mono text-surface-800 dark:text-surface-200 px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 font-bold">
                  {{ selectedItem.documentNumber || (selectedItem.type === 2 ? `DOC-OUT-${selectedItem.productExitRequestId || selectedItem.id}` : `DOC-IN-${selectedItem.productEntryRequestId || selectedItem.id}`) }}
                </span>
              </div>
              <div v-if="selectedItem.type === 1 && (selectedItem.originalExitDocumentNumber || selectedItem.productExitRequestId)" class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.originalDocNumber') }}</span>
                <span class="font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  {{ selectedItem.originalExitDocumentNumber || `DOC-OUT-${selectedItem.productExitRequestId}` }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Workflow & Approver Names -->
        <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 space-y-3">
          <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-200/50 dark:border-surface-700 pb-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {{ $t('ohda.compass.workflowTitle') }}
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 block">{{ $t('ohda.compass.firstApprover') }}</span>
              <span class="font-bold text-surface-800 dark:text-surface-200 text-xs mt-0.5 block">{{ selectedItem.supervisorName || $t('ohda.compass.autoApproved') }}</span>
            </div>

            <div class="p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 block">{{ $t('ohda.compass.secondApprover') }}</span>
              <span class="font-bold text-surface-800 dark:text-surface-200 text-xs mt-0.5 block">{{ selectedItem.managerName || $t('ohda.compass.autoApproved') }}</span>
            </div>
          </div>

          <!-- Dynamic Approval Trail Timeline if present -->
          <div v-if="parsedApprovalTrail.length > 0" class="pt-2">
            <span class="text-[11px] font-bold text-surface-800 dark:text-surface-200 block mb-2">{{ $t('ohda.compass.timelineTitle') }}</span>
            <div class="space-y-2">
              <div
                v-for="(step, idx) in parsedApprovalTrail"
                :key="idx"
                class="flex items-start gap-3 p-2.5 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700"
              >
                <div class="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-surface-800 dark:text-surface-200">{{ step.stepName || step.action }}</span>
                    <span class="text-[10px] font-mono text-surface-500 dark:text-surface-400">{{ formatDate(step.date) }}</span>
                  </div>
                  <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
                    {{ $t('ohda.compass.byUser') }} <strong class="text-surface-800 dark:text-surface-200">{{ step.userName || step.user || '-' }}</strong>
                    <span v-if="step.notes" class="ms-2 text-surface-700 dark:text-surface-300">({{ step.notes }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes / Purpose -->
        <div v-if="selectedItem.purpose || selectedItem.notes" class="p-3.5 rounded-xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700">
          <span class="font-bold text-surface-800 dark:text-surface-200 block mb-1">{{ $t('ohda.compass.notesTitle') }}</span>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed text-[11px]">
            {{ selectedItem.purpose ? `[${selectedItem.purpose}] ` : '' }}{{ selectedItem.notes || '' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton @click="showDetailsModal = false">{{ $t('ohda.common.close') }}</SecondaryButton>
        </div>
      </template>
    </Dialog>

    <!-- Upload Modal Dialog -->
    <Dialog
      v-model:visible="showUploadModal"
      modal
      :header="$t('ohda.compass.importModalTitle')"
      class="max-w-md w-full"
    >
      <div class="space-y-4 text-xs">
        <div
          class="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-brand-accent rounded-2xl p-8 text-center bg-surface-50 dark:bg-surface-800/50 transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onFileDrop"
          @click="triggerFileSelect"
        >
          <FileSpreadsheet class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="font-semibold text-surface-800 dark:text-surface-200 mb-1">{{ $t('ohda.compass.dropZoneText') }}</p>
          <span class="text-[10px] text-surface-500 dark:text-surface-400 block mb-4">{{ $t('ohda.compass.dropZoneHint') }}</span>
          <input type="file" ref="fileInput" accept=".xlsx, .xls" class="hidden" @change="onFileSelected" />
          <button class="px-4 py-2 bg-brand-soft dark:bg-brand-accent/10 text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer">
            {{ $t('ohda.compass.browseFiles') }}
          </button>
        </div>

        <div v-if="uploading" class="space-y-2">
          <div class="flex justify-between text-surface-500 dark:text-surface-400">
            <span>{{ $t('ohda.compass.importingProgress') }}</span>
            <span class="font-bold text-brand-accent">50%</span>
          </div>
          <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full animate-pulse" style="width: 50%"></div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton :disabled="uploading" @click="showUploadModal = false">{{ $t('ohda.common.cancel') }}</SecondaryButton>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { apiGet } from "@/utilities/fetchApi";
import axios from "@/utilities/apiClient";
import { useToastStore } from "@/stores/toastStore";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const { t, locale } = useI18n();
const toastStore = useToastStore();

const departments = ref([]);
const productStates = ref([]);
const filters = ref({ query: '', departmentId: null, type: null, stateId: null, startDate: null, endDate: null });
const filtersCollapsed = ref(false);

const compassLogs = ref([]);
const loading = ref(false);
const exporting = ref(false);
const showUploadModal = ref(false);
const uploading = ref(false);
const fileInput = ref(null);

// Details Modal State
const showDetailsModal = ref(false);
const selectedItem = ref(null);

const parsedApprovalTrail = computed(() => {
  if (!selectedItem.value?.approvalTrail) return [];
  try {
    const parsed = typeof selectedItem.value.approvalTrail === "string"
      ? JSON.parse(selectedItem.value.approvalTrail)
      : selectedItem.value.approvalTrail;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
});

function openDetailsModal(item) {
  selectedItem.value = item;
  showDetailsModal.value = true;
}

onMounted(() => {
  performSearch();
  // load filter lists
  (async () => {
    try {
      const d = await apiGet('/api/Department');
      departments.value = d?.data?.objects || d?.data?.singleObject || [];
    } catch (e) { console.warn('Departments fetch failed', e); }
  })();
  (async () => {
    try {
      const s = await apiGet('/api/ProductState');
      productStates.value = s?.data?.objects || s?.data?.singleObject || [];
    } catch (e) { console.warn('ProductStates fetch failed', e); }
  })();
});

let searchTimeout = null;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 400);
}

function buildQueryParams() {
  const params = [];
  if (filters.value.query) params.push(`query=${encodeURIComponent(filters.value.query)}`);
  if (filters.value.departmentId) params.push(`departmentId=${filters.value.departmentId}`);
  if (filters.value.type) params.push(`type=${filters.value.type}`);
  if (filters.value.stateId) params.push(`stateId=${filters.value.stateId}`);
  if (filters.value.startDate) params.push(`startDate=${encodeURIComponent(filters.value.startDate)}`);
  if (filters.value.endDate) params.push(`endDate=${encodeURIComponent(filters.value.endDate)}`);
  return params.length ? `?${params.join('&')}` : '';
}

async function performSearch() {
  loading.value = true;
  try {
    const q = buildQueryParams();
    const res = await apiGet(`/api/Compass/search${q}`);
    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      compassLogs.value = data.singleObject || data.SingleObject || data.objects || [];
    }
  } catch (err) {
    console.error("Compass search failed", err);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = { query: '', departmentId: null, type: null, stateId: null, startDate: null, endDate: null };
  performSearch();
}

async function exportToExcel() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const q = buildQueryParams();
    const res = await axios.get(`/api/Compass/export${q}`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ohda_Compass_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    toastStore.addSuccessToast({ title: t('ohda.compass.exportSuccess') });
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.exportFailed') });
  } finally {
    exporting.value = false;
  }
}

async function downloadTemplate() {
  try {
    const res = await axios.get("/api/Compass/template", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Compass_Template.xlsx";
    link.click();
    URL.revokeObjectURL(url);
    toastStore.addSuccessToast({ title: t('ohda.compass.templateSuccess') });
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.templateFailed') });
  }
}

function triggerFileSelect() {
  fileInput.value.click();
}

function onFileSelected(e) {
  const file = e.target.files[0];
  if (file) {
    uploadFile(file);
  }
}

function onFileDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) {
    uploadFile(file);
  }
}

async function uploadFile(file) {
  uploading.value = true;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post("/api/Compass/import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      toastStore.addSuccessToast({ title: data.returnMessage || data.ReturnMessage || t('ohda.compass.importSuccess') });
      showUploadModal.value = false;
      performSearch();
    } else {
      toastStore.addErrorToast({ title: data?.returnMessage || data?.ReturnMessage || t('ohda.compass.importFailed') });
    }
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.importFailed') });
  } finally {
    uploading.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_) {
    return dateStr;
  }
}
</script>
