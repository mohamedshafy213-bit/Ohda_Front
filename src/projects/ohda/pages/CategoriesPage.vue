<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Folder class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.categories.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.categories.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="exportCategoriesToExcel"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="تصدير تصنيفات المخزن إلى Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.categories.addCategory') }}
        </Button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading" type="cards" :count="6" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredCategories.length === 0"
      :title="$t('ohda.categories.emptyCategories')"
      icon="Folder"
      :actionLabel="$t('ohda.categories.addCategory')"
      @action="openAddModal"
    />

    <!-- Categories Grid Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-5 shadow-sm space-y-3 relative group hover:border-brand-accent/40 dark:hover:border-brand-accent/40 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 bg-brand-soft dark:bg-white/10 rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20 shrink-0">
              <Folder class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-brand-dark dark:text-white text-sm truncate">{{ cat.name }}</h3>
              <span class="text-[10px] font-mono text-brand-accent uppercase font-bold">{{ cat.code }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              v-if="getCategoryProductsCount(cat.id) > 0"
              type="button"
              @click="openBulkMove(cat)"
              class="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
              title="نقل أصناف هذا التصنيف لتصنيف آخر"
            >
              <ArrowRightLeft class="w-4 h-4" />
            </button>
            <editButton @click="editCategory(cat)" />
            <deleteButton @click="promptDelete(cat)" />
          </div>
        </div>

        <p class="text-xs text-brand-gray dark:text-slate-400 min-h-[36px] line-clamp-2">
          {{ cat.description || $t('ohda.categories.noDescription') }}
        </p>

        <div class="pt-2 border-t border-brand-gray/10 dark:border-white/10 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-brand-gray dark:text-slate-400">
            <span>{{ $t('ohda.categories.productsCount') }}:</span>
            <span class="font-bold text-brand-dark dark:text-white bg-brand-light dark:bg-white/10 px-2 py-0.5 rounded-full border border-brand-gray/15">
              {{ getCategoryProductsCount(cat.id) }} {{ $t('ohda.common.item') }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-brand-gray dark:text-slate-400">{{ $t('ohda.categories.totalStock') }}:</span>
            <span
              class="font-mono font-bold px-2.5 py-0.5 rounded-full text-xs border"
              :class="getCategoryStockCount(cat.id) > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' : 'bg-red-500/10 text-red-600 border-red-500/25'"
            >
              {{ getCategoryStockCount(cat.id) }} {{ $t('ohda.common.piece') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- OhdaModal for Category Modal -->
    <OhdaModal
      :visible="showModal"
      @close="showModal = false"
      :title="isEditing ? $t('ohda.categories.editCategory') : $t('ohda.categories.addCategory')"
      description="إدخال تفاصيل التصنيف أو فئة قطع الغيار والزيوت"
      max-width="max-w-md"
    >
      <form @submit.prevent="saveCategory" id="categoryForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.categories.name') }}
          </label>
          <input
            v-model="form.name"
            required
            type="text"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.categories.code') }}
          </label>
          <input
            v-model="form.code"
            required
            type="text"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono uppercase focus:border-brand-accent transition-all text-xs"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.categories.description') }}
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          :disabled="isSaving"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          {{ $t('ohda.common.cancel') }}
        </button>
        <button
          type="submit"
          form="categoryForm"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <div v-if="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
          <span>{{ isSaving ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Bulk Move Modal -->
    <OhdaModal
      :visible="showBulkMoveModal"
      @close="showBulkMoveModal = false"
      title="نقل الأصناف لتصنيف آخر"
      description="نقل كافة الأصناف التابعة لهذا التصنيف إلى تصنيف بديل دفعة واحدة"
      max-width="max-w-md"
    >
      <div class="space-y-4 text-xs">
        <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400">
          سيتم نقل عدد <strong class="font-bold">({{ getCategoryProductsCount(bulkMoveSourceCategory?.id) }})</strong> صنف من تصنيف <strong class="font-bold">"{{ bulkMoveSourceCategory?.name }}"</strong> إلى التصنيف الجديد.
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            التصنيف الجديد المستهدف
          </label>
          <select
            v-model="bulkMoveTargetId"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          >
            <option :value="null" disabled>اختر التصنيف الجديد...</option>
            <option
              v-for="cat in availableTargetCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          :disabled="isMoving"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          {{ $t('ohda.common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="isMoving || !bulkMoveTargetId"
          @click="executeBulkMove"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <div v-if="isMoving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
          <span>نقل الأصناف الآن</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.categories.title')"
      :itemName="selectedCategoryForDelete?.name || ''"
      :canDelete="getCategoryProductsCount(selectedCategoryForDelete?.id) === 0"
      :warningMessage="getCategoryProductsCount(selectedCategoryForDelete?.id) > 0 ? `لا يمكن حذف هذا التصنيف لوجود (${getCategoryProductsCount(selectedCategoryForDelete?.id)}) أصناف/أجهزة مرتبطة به في المخزون حالياً. يرجى نقل أو معالجة الأصناف التابعة له أولاً.` : ''"
      :confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import OhdaModal from "../components/OhdaModal.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import { Download, ArrowRightLeft } from "lucide-vue-next";
import { exportToExcelCsv } from "../utils/excelHelper";

const { t } = useI18n();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref(null);

const showDeleteDialog = ref(false);
const selectedCategoryForDelete = ref(null);

const showBulkMoveModal = ref(false);
const bulkMoveSourceCategory = ref(null);
const bulkMoveTargetId = ref(null);
const isMoving = ref(false);

const availableTargetCategories = computed(() => {
  if (!bulkMoveSourceCategory.value) return [];
  return (inventoryStore.categories || []).filter(c => c.id !== bulkMoveSourceCategory.value.id);
});

function openBulkMove(cat) {
  bulkMoveSourceCategory.value = cat;
  bulkMoveTargetId.value = null;
  showBulkMoveModal.value = true;
}

async function executeBulkMove() {
  if (!bulkMoveSourceCategory.value || !bulkMoveTargetId.value) return;
  isMoving.value = true;
  try {
    const res = await inventoryStore.bulkMoveCategory(
      bulkMoveSourceCategory.value.id,
      bulkMoveTargetId.value
    );
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم نقل الأصناف بنجاح");
      showBulkMoveModal.value = false;
      bulkMoveSourceCategory.value = null;
    } else {
      toastStore.addErrorToast(res.message);
    }
  } catch (err) {
    toastStore.addErrorToast(err?.message || "فشل نقل الأصناف");
  } finally {
    isMoving.value = false;
  }
}

const form = ref({
  name: "",
  code: "",
  description: ""
});

onMounted(() => {
  inventoryStore.fetchCategories();
  inventoryStore.fetchProducts();
});

const filteredCategories = computed(() => {
  if (!searchQuery.value?.trim()) return inventoryStore.categories || [];
  const q = searchQuery.value.toLowerCase().trim();
  return (inventoryStore.categories || []).filter(
    c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  );
});

function getCategoryProductsCount(catId) {
  if (!catId) return 0;
  return (inventoryStore.products || []).filter(p => p.categoryId === catId).length;
}

function getCategoryStockCount(catId) {
  if (!catId) return 0;
  return (inventoryStore.products || [])
    .filter(p => p.categoryId === catId)
    .reduce((sum, p) => sum + (p.quantity ?? p.amount ?? 0), 0);
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: "", code: "", description: "" };
  showModal.value = true;
}

function editCategory(cat) {
  isEditing.value = true;
  editingId.value = cat.id;
  form.value = { ...cat };
  showModal.value = true;
}

async function saveCategory() {
  if (!form.value.name?.trim() || !form.value.code?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await inventoryStore.updateCategory(editingId.value, form.value);
    } else {
      await inventoryStore.addCategory(form.value);
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    showModal.value = false;
  } catch (err) {
    console.error("Save category failed", err);
  } finally {
    isSaving.value = false;
  }
}

function promptDelete(cat) {
  selectedCategoryForDelete.value = cat;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  if (!selectedCategoryForDelete.value) return;
  try {
    const res = await inventoryStore.deleteCategory(selectedCategoryForDelete.value.id);
    if (res && res.success === false) {
      toastStore.addErrorToast(res.message || "تعذر حذف التصنيف لوجود ارتباطات");
      return res;
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
  } catch (err) {
    console.error("Delete category failed", err);
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "تعذر حذف التصنيف");
    throw err;
  } finally {
    selectedCategoryForDelete.value = null;
  }
}

function exportCategoriesToExcel() {
  const exportCols = [
    { key: "code", label: "كود التصنيف" },
    { key: "name", label: "اسم التصنيف" },
    { key: "productsCount", label: "عدد الأصناف التابعة" }
  ];

  const exportData = (inventoryStore.categories || []).map(c => ({
    code: c.code || "",
    name: c.name || "",
    productsCount: getCategoryProductsCount(c.id)
  }));

  exportToExcelCsv("تصنيفات_المخزن.csv", exportCols, exportData);
  toastStore.addSuccessToast(`تم تصدير ${exportData.length} تصنيف إلى Excel بنجاح`);
}
</script>
