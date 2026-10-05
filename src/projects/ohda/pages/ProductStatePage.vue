<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Activity class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.productStates.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.productStates.subTitle') }}
        </p>
      </div>

      <Button
        @click="openAdd"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.productStates.addState') }}
      </Button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="loading" type="table" :count="5" />

    <!-- Product States DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredStates"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.productStates.emptyStates')"
            icon="Activity"
            :actionLabel="$t('ohda.productStates.addState')"
            @action="openAdd"
          />
        </template>

        <Column field="name" :header="$t('ohda.productStates.name')" sortable>
          <template #body="{ data }">
            <div class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center shrink-0">
                <Activity class="w-4 h-4" />
              </div>
              <span>{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="code" :header="$t('ohda.productStates.code')" sortable>
          <template #body="{ data }">
            <span class="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-brand-light dark:bg-white/5 border border-brand-gray/15 text-brand-dark dark:text-slate-300">
              {{ data.code || '-' }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')" style="width: 110px">
          <template #body="{ data }">
            <div class="flex items-center gap-1.5">
              <editButton @click="editItem(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Product State Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.productStates.editState') : $t('ohda.productStates.addState')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="save" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.productStates.name') }}
          </label>
          <InputText
            v-model="form.name"
            :placeholder="$t('ohda.productStates.placeholderName')"
            required
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.productStates.code') }}
          </label>
          <InputText
            v-model="form.code"
            :placeholder="$t('ohda.productStates.placeholderCode')"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
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

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.productStates.title')"
      :itemName="selectedItemForDelete?.name || ''"
      :confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '@/utilities/fetchApi';
import { useToastStore } from '@/stores/toastStore';
import { useI18n } from 'vue-i18n';
import DeleteDialog from '@/components/DeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';

const { t } = useI18n();
const toastStore = useToastStore();

const states = ref([]);
const loading = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({ name: '', code: '' });

const showDeleteDialog = ref(false);
const selectedItemForDelete = ref(null);

const filteredStates = computed(() => {
  if (!searchQuery.value?.trim()) return states.value;
  const q = searchQuery.value.toLowerCase().trim();
  return states.value.filter(
    s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
  );
});

async function load() {
  loading.value = true;
  try {
    const res = await apiGet('/api/ProductState');
    const data = res?.data?.objects || res?.data?.singleObject || [];
    states.value = Array.isArray(data) ? data : [data];
  } catch (err) {
    console.error('Failed to load product states', err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openAdd() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', code: '' };
  showModal.value = true;
}

function editItem(item) {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = { name: item.name, code: item.code || '' };
  showModal.value = true;
}

async function save() {
  if (!form.value.name?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await apiPut(`/api/ProductState/${editingId.value}`, form.value);
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
    } else {
      await apiPost('/api/ProductState', form.value);
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
    }
    showModal.value = false;
  } catch (err) {
    console.error('Save product state failed', err);
  } finally {
    isSaving.value = false;
  }
}

function promptDelete(item) {
  selectedItemForDelete.value = item;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  if (!selectedItemForDelete.value) return;
  try {
    const res = await apiDelete(`/api/ProductState/${selectedItemForDelete.value.id}`, {}, false);
    if (res?.data?.isDone) {
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
      return { success: true };
    }
    const msg = res?.data?.returnMessage || "تعذر حذف الحالة لوجود ارتباطات نشطة";
    toastStore.addErrorToast(msg);
    return { success: false, message: msg };
  } catch (err) {
    console.error('Delete product state failed', err);
    const msg = err?.response?.data?.returnMessage || err?.message || "تعذر حذف الحالة";
    toastStore.addErrorToast(msg);
    throw err;
  } finally {
    selectedItemForDelete.value = null;
  }
}
</script>
