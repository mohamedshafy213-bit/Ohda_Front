<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0 shadow-sm">
          <MousePointerClick class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            {{ $t('ohda.untrackedItems.title') }}
          </h1>
          <p class="text-xs text-brand-gray dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {{ $t('ohda.untrackedItems.subTitle') }}
          </p>
        </div>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/15 cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.untrackedItems.addItem') }}
      </Button>
    </div>

    <!-- Status Tabs Beside Each Other (Interactive Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <!-- Tab 1: All Items -->
      <button
        type="button"
        @click="statusFilter = 'all'"
        class="p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between group"
        :class="statusFilter === 'all'
          ? 'bg-brand-soft/80 dark:bg-white/10 border-brand-accent/50 shadow-sm ring-1 ring-brand-accent/30'
          : 'bg-brand-white dark:bg-white/5 border-brand-gray/10 hover:border-brand-gray/30 hover:bg-brand-light/50'"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="statusFilter === 'all' ? 'bg-brand-accent text-brand-dark' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'"
          >
            <Tag class="w-5 h-5" />
          </div>
          <div>
            <span class="text-xs font-bold text-brand-dark dark:text-white block">
              {{ $t('ohda.common.all') }}
            </span>
            <span class="text-[11px] text-brand-gray dark:text-slate-400">
              كافة الأصناف غير المتتبعة
            </span>
          </div>
        </div>
        <span
          class="text-sm font-bold font-mono px-2.5 py-1 rounded-xl transition-colors"
          :class="statusFilter === 'all' ? 'bg-brand-accent/20 text-brand-dark dark:text-brand-accent' : 'bg-brand-light dark:bg-white/10 text-brand-gray dark:text-white'"
        >
          {{ untrackedStore.items.length }}
        </span>
      </button>

      <!-- Tab 2: Active Items -->
      <button
        type="button"
        @click="statusFilter = 'active'"
        class="p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between group"
        :class="statusFilter === 'active'
          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
          : 'bg-brand-white dark:bg-white/5 border-brand-gray/10 hover:border-brand-gray/30 hover:bg-brand-light/50'"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="statusFilter === 'active' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
          >
            <Check class="w-5 h-5" />
          </div>
          <div>
            <span class="text-xs font-bold text-brand-dark dark:text-white block">
              {{ $t('ohda.untrackedItems.active') }}
            </span>
            <span class="text-[11px] text-brand-gray dark:text-slate-400">
              أصناف نشطة متاحة للصرف
            </span>
          </div>
        </div>
        <span
          class="text-sm font-bold font-mono px-2.5 py-1 rounded-xl transition-colors"
          :class="statusFilter === 'active' ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
        >
          {{ activeCount }}
        </span>
      </button>

      <!-- Tab 3: Inactive Items -->
      <button
        type="button"
        @click="statusFilter = 'inactive'"
        class="p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between group"
        :class="statusFilter === 'inactive'
          ? 'bg-rose-500/10 border-rose-500/50 shadow-sm ring-1 ring-rose-500/30'
          : 'bg-brand-white dark:bg-white/5 border-brand-gray/10 hover:border-brand-gray/30 hover:bg-brand-light/50'"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="statusFilter === 'inactive' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
          >
            <X class="w-5 h-5" />
          </div>
          <div>
            <span class="text-xs font-bold text-brand-dark dark:text-white block">
              {{ $t('ohda.untrackedItems.inactive') }}
            </span>
            <span class="text-[11px] text-brand-gray dark:text-slate-400">
              أصناف معطلة موقوفة مؤقتاً
            </span>
          </div>
        </div>
        <span
          class="text-sm font-bold font-mono px-2.5 py-1 rounded-xl transition-colors"
          :class="statusFilter === 'inactive' ? 'bg-rose-500/25 text-rose-700 dark:text-rose-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
        >
          {{ inactiveCount }}
        </span>
      </button>
    </div>

    <!-- Search Toolbar & Info Tip -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3.5 rounded-2xl shadow-sm">
      <searchField
        v-model="searchQuery"
        :placeholder="$t('ohda.untrackedItems.searchPlaceholder')"
        class="max-w-md w-full"
      />

      <div class="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/30">
        <Info class="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>تضاف الأصناف غير المتتبعة لطلبات الصرف بالاسم ولا تؤثر على أرصدة المستودع</span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="untrackedStore.loading" type="table" :count="5" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredItems.length === 0"
      :title="$t('ohda.untrackedItems.emptyTitle')"
      :description="$t('ohda.untrackedItems.emptyDesc')"
      icon="MousePointerClick"
      :actionLabel="$t('ohda.untrackedItems.addItem')"
      @action="openAddModal"
    />

    <!-- Untracked Items DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredItems"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <Column field="name" :header="$t('ohda.untrackedItems.itemName')" sortable headerClass="text-start" style="width: 100%">
          <template #body="{ data }">
            <div class="font-bold text-brand-dark dark:text-white flex items-center gap-3 py-1 text-start">
              <div class="w-8 h-8 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center shrink-0 border border-brand-accent/20">
                <MousePointerClick class="w-4 h-4" />
              </div>
              <div>
                <span class="text-sm font-bold block">{{ data.name }}</span>
                <span class="block text-[11px] text-brand-gray font-normal">
                  ملحق صرف مباشر بدون تتبع كميات
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column field="isActive" :header="$t('ohda.untrackedItems.status')" sortable headerClass="text-center" bodyClass="text-center" style="width: 140px; min-width: 140px">
          <template #body="{ data }">
            <div class="flex items-center justify-center">
              <button
                @click="toggleActive(data)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer"
                :class="data.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                {{ data.isActive ? $t('ohda.untrackedItems.active') : $t('ohda.untrackedItems.inactive') }}
              </button>
            </div>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')" headerClass="text-center" bodyClass="text-center" style="width: 110px; min-width: 110px">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-1.5">
              <editButton @click="openEditModal(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add / Edit Modal (Floating Solid Dialog) -->
    <Dialog
      v-model:visible="modalVisible"
      modal
      :header="editingItem ? $t('ohda.untrackedItems.editItem') : $t('ohda.untrackedItems.addItem')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
      :pt="{
        mask: { class: 'bg-black/60 backdrop-blur-xs' },
        header: { class: '!bg-brand-white dark:!bg-brand-dark !border-b !border-brand-gray/10 !p-5' },
        content: { class: '!bg-brand-white dark:!bg-brand-dark !p-6' }
      }"
    >
      <form @submit.prevent="saveItem" class="space-y-4 pt-1">
        <div>
          <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
            {{ $t('ohda.untrackedItems.itemName') }} <span class="text-rose-500">*</span>
          </label>
          <InputText
            v-model="form.name"
            :placeholder="$t('ohda.untrackedItems.itemNamePlaceholder')"
            class="w-full !rounded-xl !text-xs !py-2.5 !bg-brand-light dark:!bg-white/5 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            required
            autofocus
          />
        </div>

        <div class="flex items-center gap-3 bg-brand-light dark:bg-white/5 p-3 rounded-xl border border-brand-gray/15">
          <Checkbox v-model="form.isActive" :binary="true" inputId="itemActive" />
          <label for="itemActive" class="text-xs font-semibold text-brand-dark dark:text-slate-200 cursor-pointer">
            {{ $t('ohda.untrackedItems.active') }} (متاح للاستخدام في الحزم وطلبات الصرف)
          </label>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-brand-gray/10">
          <Button
            type="button"
            :label="$t('ohda.common.cancel')"
            class="!text-xs !rounded-xl !bg-gray-100 dark:!bg-white/10 !text-gray-700 dark:!text-gray-300 !border-0 cursor-pointer"
            @click="modalVisible = false"
          />
          <Button
            type="submit"
            :label="editingItem ? $t('ohda.common.save') : $t('ohda.untrackedItems.addItem')"
            :loading="saving"
            class="!text-xs !rounded-xl !bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !border-0 cursor-pointer"
          />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :item-name="deletingItem?.name"
      :title="$t('ohda.untrackedItems.confirmDeleteTitle')"
      :subtitle="$t('ohda.untrackedItems.confirmDeleteMsg', { name: deletingItem?.name })"
      :loading="deleting"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOhdaUntrackedItemStore } from '@/projects/ohda/stores/useOhdaUntrackedItemStore';
import { useToastStore } from '@/stores/toastStore';
import { MousePointerClick, Plus, Tag, Check, X, Info } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import searchField from '@/components/searchField.vue';
import editButton from '@/components/editButton.vue';
import deleteButton from '@/components/deleteButton.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';

const untrackedStore = useOhdaUntrackedItemStore();
const toastStore = useToastStore();

const searchQuery = ref('');
const statusFilter = ref('all');
const modalVisible = ref(false);
const editingItem = ref(null);
const saving = ref(false);

const showDeleteDialog = ref(false);
const deletingItem = ref(null);
const deleting = ref(false);

const form = ref({
  name: '',
  isActive: true
});

onMounted(async () => {
  await untrackedStore.fetchItems();
});

const activeCount = computed(() => untrackedStore.items.filter((i) => i.isActive).length);
const inactiveCount = computed(() => untrackedStore.items.filter((i) => !i.isActive).length);

const filteredItems = computed(() => {
  let list = untrackedStore.items;
  if (statusFilter.value === 'active') {
    list = list.filter((i) => i.isActive);
  } else if (statusFilter.value === 'inactive') {
    list = list.filter((i) => !i.isActive);
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((i) => i.name?.toLowerCase().includes(q));
});

function openAddModal() {
  editingItem.value = null;
  form.value = {
    name: '',
    isActive: true
  };
  modalVisible.value = true;
}

function openEditModal(item) {
  editingItem.value = item;
  form.value = {
    name: item.name,
    isActive: item.isActive
  };
  modalVisible.value = true;
}

async function saveItem() {
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    if (editingItem.value) {
      await untrackedStore.updateItem(editingItem.value.id, {
        id: editingItem.value.id,
        name: form.value.name.trim(),
        isActive: form.value.isActive
      });
      toastStore.addSuccessToast('تم تحديث الصنف بنجاح');
    } else {
      await untrackedStore.createItem({
        name: form.value.name.trim(),
        isActive: form.value.isActive
      });
      toastStore.addSuccessToast('تمت إضافة الصنف بنجاح');
    }
    modalVisible.value = false;
  } catch (err) {
    toastStore.addErrorToast('حدث خطأ أثناء حفظ الصنف');
  } finally {
    saving.value = false;
  }
}

async function toggleActive(item) {
  try {
    await untrackedStore.toggleActive(item.id);
    toastStore.addSuccessToast(item.isActive ? 'تم إلغاء تفعيل الصنف' : 'تم تفعيل الصنف');
  } catch (err) {
    toastStore.addErrorToast('تعذر تغيير حالة التفعيل');
  }
}

function promptDelete(item) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

async function executeDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await untrackedStore.deleteItem(deletingItem.value.id);
    toastStore.addSuccessToast('تم حذف الصنف بنجاح');
    showDeleteDialog.value = false;
  } catch (err) {
    toastStore.addErrorToast('تعذر حذف الصنف');
  } finally {
    deleting.value = false;
    deletingItem.value = null;
  }
}
</script>
