<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Layers class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.warehouseBins.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.warehouseBins.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 !px-4 !py-2.5 !rounded-xl !shadow-md shadow-brand-accent/10 cursor-pointer text-xs"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('ohda.warehouseBins.addBin') }}</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Bins -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalBins') }}</span>
          <h3 class="text-2xl font-extrabold text-brand-dark dark:text-white font-mono">
            {{ binStore.totalBinsCount }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Capacity -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalCapacity') }}</span>
          <h3 class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {{ binStore.totalCapacity }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.unit') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
          <Boxes class="w-5 h-5" />
        </div>
      </div>

      <!-- Occupied Items -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalItemsOccupied') }}</span>
          <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {{ binStore.totalItemsInBins }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.piece') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
          <Box class="w-5 h-5" />
        </div>
      </div>

      <!-- Remaining Space -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalSpaceAvailable') }}</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ binStore.totalRemainingSpace }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.piece') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search Bar & Status Legend -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="w-full md:w-96">
        <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
      </div>

      <div class="text-xs text-brand-gray dark:text-slate-400 flex items-center gap-3">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusAvailable') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusNearFull') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusFull') }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="binStore.loading" type="table" :count="6" />

    <!-- Bins Table -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 rounded-2xl shadow-sm overflow-hidden">
      <DataTable
        :value="filteredBins"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        responsiveLayout="scroll"
        class="text-xs w-full"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.warehouseBins.emptyBins')"
            icon="Layers"
            :actionLabel="$t('ohda.warehouseBins.addBin')"
            @action="openAddModal"
          />
        </template>

        <!-- Bin Code -->
        <Column field="code" :header="$t('ohda.warehouseBins.code')" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-brand-dark dark:text-white">{{ data.code }}</span>
            </div>
          </template>
        </Column>

        <!-- Bin Name & Description -->
        <Column field="name" :header="$t('ohda.warehouseBins.name')" sortable>
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block">{{ data.name }}</span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400 mt-0.5 block" v-if="data.description">{{ data.description }}</span>
            </div>
          </template>
        </Column>

        <!-- Aisle & Shelf -->
        <Column :header="$t('ohda.warehouseBins.aisle')">
          <template #body="{ data }">
            <span class="font-mono text-xs text-brand-gray dark:text-slate-400">
              {{ data.aisle ? `${data.aisle} / ${data.shelf || '-'}` : '-' }}
            </span>
          </template>
        </Column>

        <!-- Capacity -->
        <Column field="capacity" :header="$t('ohda.warehouseBins.maxCapacity')" sortable>
          <template #body="{ data }">
            <span class="font-mono font-bold text-brand-dark dark:text-white">
              {{ data.capacity ? `${data.capacity} ${$t('ohda.common.piece')}` : '-' }}
            </span>
          </template>
        </Column>

        <!-- Items Count -->
        <Column field="itemsCount" :header="$t('ohda.warehouseBins.currentStock')" sortable>
          <template #body="{ data }">
            <button
              type="button"
              @click="viewBinItems(data)"
              class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border"
              :class="(data.itemsCount || 0) > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20' : 'bg-brand-light dark:bg-white/5 text-brand-gray border-brand-gray/20'"
            >
              <Box class="w-3.5 h-3.5" />
              <span>{{ data.itemsCount || 0 }} {{ $t('ohda.common.piece') }}</span>
            </button>
          </template>
        </Column>

        <!-- Remaining Capacity Progress Meter -->
        <Column :header="$t('ohda.warehouseBins.remainingSpace')">
          <template #body="{ data }">
            <div class="space-y-1.5 min-w-[130px]">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="font-bold" :class="getRemainingSpace(data) === 0 ? 'text-red-500 font-extrabold' : 'text-brand-dark dark:text-white'">
                  {{ getRemainingSpace(data) }} {{ $t('ohda.common.piece') }}
                </span>
                <span class="text-brand-gray dark:text-slate-400 text-[10px]">
                  {{ Math.round(getUsedPercentage(data)) }}%
                </span>
              </div>
              <div class="w-full bg-brand-light dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getProgressBarClass(data)"
                  :style="{ width: `${getUsedPercentage(data)}%` }"
                ></div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column :header="$t('ohda.common.actions')" style="width: 130px">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <!-- Quick Assign Button -->
              <Button
                type="button"
                @click="openAssignModal(data)"
                class="bg-transparent !rounded-xl w-8 h-8 !p-1 border border-transparent hover:!border-brand-accent/30 hover:!bg-brand-accent/10 text-brand-accent transition-all cursor-pointer flex items-center justify-center shadow-none"
                :title="$t('ohda.entryRequests.assignBin')"
              >
                <PackagePlus class="w-3.5 h-3.5" />
              </Button>
              <editButton @click="openEditModal(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create/Edit Bin Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.warehouseBins.editBin') : $t('ohda.warehouseBins.addBin')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="handleSaveBin" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.code') }}
            </label>
            <InputText
              v-model="form.code"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono uppercase"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.name') }}
            </label>
            <InputText
              v-model="form.name"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
              autofocus
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              {{ $t('ohda.warehouseBins.aisle') }}
            </label>
            <InputText
              v-model="form.aisle"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              {{ $t('ohda.warehouseBins.shelfLevel') }}
            </label>
            <InputText
              v-model="form.shelf"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.maxCapacity') }}
            </label>
            <InputNumber
              v-model="form.capacity"
              :min="1"
              :max="10000"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.categories.description') }}
          </label>
          <Textarea
            v-model="form.description"
            rows="2"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isSaving" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSaving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isSaving ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Quick Assign Product Modal -->
    <Dialog
      v-model:visible="showAssignModal"
      modal
      :header="$t('ohda.entryRequests.assignBin')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetBin" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-soft dark:bg-white/10 rounded-xl border border-brand-accent/20 flex items-center justify-between">
          <div>
            <span class="font-bold text-brand-dark dark:text-white">{{ targetBin.name }}</span>
            <span class="text-[10px] text-brand-accent font-mono block">{{ targetBin.code }}</span>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-600">
            {{ getRemainingSpace(targetBin) }} {{ $t('ohda.common.piece') }} شاغر
          </span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.products.title') }}
          </label>
          <Select
            v-model="assignForm.productId"
            :options="inventoryStore.products"
            optionLabel="name"
            optionValue="id"
            filter
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.products.qty') }}
          </label>
          <InputNumber
            v-model="assignForm.quantity"
            :min="1"
            :max="getRemainingSpace(targetBin) || 1"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isAssigning" @click="showAssignModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="button"
            :disabled="isAssigning || !assignForm.productId"
            @click="handleAssignProduct"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isAssigning" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isAssigning ? $t('ohda.common.saving') : $t('ohda.common.confirm') }}</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- View Bin Items Modal -->
    <Dialog
      v-model:visible="showItemsModal"
      modal
      :header="`${$t('ohda.warehouseBins.currentStock')} - ${selectedBin?.name || ''}`"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="selectedBin" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-xl border border-brand-gray/15 flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="font-bold text-brand-dark dark:text-white">{{ selectedBin.name }} ({{ selectedBin.code }})</span>
            <span class="text-[11px] text-brand-gray block">{{ selectedBin.aisle ? `ممر ${selectedBin.aisle} / رف ${selectedBin.shelf}` : '' }}</span>
          </div>
          <span class="font-mono font-bold text-brand-accent">{{ binStore.binItems?.length || 0 }} قطعة مسكنة</span>
        </div>

        <div class="max-h-80 overflow-y-auto space-y-2">
          <div
            v-for="item in binStore.binItems"
            :key="item.id"
            class="p-3 bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="font-bold text-brand-dark dark:text-white">{{ item.productName }}</span>
              <span class="font-mono text-xs text-brand-accent block">SN: {{ item.serialNumber || 'N/A' }}</span>
            </div>
            <Button
              type="button"
              @click="promptUnassignItem(item)"
              class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/20 !px-3 !py-1 !text-[11px] !rounded-lg"
            >
              إلغاء التسكين
            </Button>
          </div>
          <div v-if="!binStore.binItems || binStore.binItems.length === 0" class="text-center py-6 text-brand-gray">
            لا توجد أجهزة أو أصناف مسكنة في هذا الرف حالياً.
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showItemsModal = false">{{ $t('ohda.common.close') }}</SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.warehouseBins.title')"
      :itemName="selectedBinForDelete?.code || selectedBinForDelete?.name || ''"
      :confirm="handleDeleteBin"
    />

    <!-- Unassign Item Confirmation Dialog -->
    <ConfirmDialog
      v-model="showUnassignDialog"
      :title="$t('ohda.common.confirm')"
      message="هل أنت متأكد من إلغاء تسكين هذا الجهاز من الرف؟"
      :itemName="selectedItemForUnassign?.serialNumber || selectedItemForUnassign?.productName || ''"
      :confirm="handleUnassignItem"
      severity="warning"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const { t } = useI18n();
const binStore = useOhdaWarehouseBinStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const showModal = ref(false);
const showItemsModal = ref(false);
const showAssignModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isAssigning = ref(false);
const editingId = ref(null);
const selectedBin = ref(null);
const targetBin = ref(null);

const showDeleteDialog = ref(false);
const selectedBinForDelete = ref(null);

const showUnassignDialog = ref(false);
const selectedItemForUnassign = ref(null);

const form = ref({
  code: "",
  name: "",
  aisle: "",
  shelf: "",
  capacity: 50,
  departmentId: null,
  description: "",
  isActive: true
});

const assignForm = ref({
  productId: null,
  quantity: 1
});

onMounted(async () => {
  await Promise.all([
    binStore.fetchBins(),
    binStore.fetchDepartments(),
    inventoryStore.fetchProducts()
  ]);
});

function getRemainingSpace(bin) {
  if (!bin) return 0;
  if (bin.remainingCapacity != null) return bin.remainingCapacity;
  const cap = bin.capacity || 0;
  const items = bin.itemsCount || 0;
  return Math.max(0, cap - items);
}

function getUsedPercentage(bin) {
  if (!bin || !bin.capacity) return 0;
  const items = bin.itemsCount || 0;
  return Math.min(100, (items / bin.capacity) * 100);
}

function getProgressBarClass(bin) {
  const rem = getRemainingSpace(bin);
  if (rem <= 0) return "bg-red-500";
  const cap = bin.capacity || 1;
  const ratio = rem / cap;
  if (ratio <= 0.25) return "bg-amber-500";
  return "bg-emerald-500";
}

const filteredBins = computed(() => {
  let list = binStore.bins || [];
  if (!searchQuery.value?.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (b) =>
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.aisle?.toLowerCase().includes(q) ||
      b.shelf?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
  );
});

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    code: `SH-${Math.floor(10 + Math.random() * 90)}-01`,
    name: "",
    aisle: "A",
    shelf: "01",
    capacity: 40,
    departmentId: null,
    description: "",
    isActive: true
  };
  showModal.value = true;
}

function openEditModal(bin) {
  isEditing.value = true;
  editingId.value = bin.id;
  form.value = {
    code: bin.code,
    name: bin.name,
    aisle: bin.aisle || "",
    shelf: bin.shelf || "",
    capacity: bin.capacity || 50,
    departmentId: bin.departmentId || null,
    description: bin.description || "",
    isActive: bin.isActive ?? true
  };
  showModal.value = true;
}

async function handleSaveBin() {
  if (!form.value.code?.trim() || !form.value.name?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await binStore.updateBin(editingId.value, form.value);
    } else {
      await binStore.createBin(form.value);
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    showModal.value = false;
  } catch (err) {
    console.error("Save bin error:", err);
  } finally {
    isSaving.value = false;
  }
}

async function viewBinItems(bin) {
  selectedBin.value = bin;
  showItemsModal.value = true;
  await binStore.fetchBinItems(bin.id);
}

function openAssignModal(bin) {
  targetBin.value = bin;
  const rem = getRemainingSpace(bin);
  assignForm.value = {
    productId: inventoryStore.products[0]?.id || null,
    quantity: rem > 0 ? 1 : 0
  };
  showAssignModal.value = true;
}

async function handleAssignProduct() {
  if (!targetBin.value || !assignForm.value.productId) return;
  isAssigning.value = true;
  try {
    const res = await binStore.assignProductToBin(
      targetBin.value.id,
      assignForm.value.productId,
      assignForm.value.quantity
    );
    if (res.success) {
      toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
      showAssignModal.value = false;
    }
  } catch (err) {
    console.error("Assign product error:", err);
  } finally {
    isAssigning.value = false;
  }
}

function promptDelete(bin) {
  selectedBinForDelete.value = bin;
  showDeleteDialog.value = true;
}

async function handleDeleteBin() {
  if (!selectedBinForDelete.value) return;
  try {
    await binStore.deleteBin(selectedBinForDelete.value.id);
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
  } catch (err) {
    console.error("Delete bin error:", err);
  } finally {
    selectedBinForDelete.value = null;
  }
}

function promptUnassignItem(item) {
  selectedItemForUnassign.value = item;
  showUnassignDialog.value = true;
}

async function handleUnassignItem() {
  if (!selectedBin.value || !selectedItemForUnassign.value) return;
  try {
    await binStore.unassignItem(selectedBin.value.id, selectedItemForUnassign.value.id);
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    await binStore.fetchBinItems(selectedBin.value.id);
  } catch (err) {
    console.error("Unassign error:", err);
  } finally {
    selectedItemForUnassign.value = null;
  }
}
</script>
