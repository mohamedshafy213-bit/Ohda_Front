<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Building class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.departments.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.departments.subTitle') }} ({{ departments.length }} قسم مسجل)
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Download Template (200 Departments) Button -->
        <Button
          @click="downloadTemplate"
          class="!bg-emerald-50 dark:!bg-emerald-950/40 hover:!bg-emerald-100 !text-emerald-700 dark:!text-emerald-400 !border !border-emerald-200 dark:!border-emerald-800 !font-semibold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
          title="تحميل نموذج Excel جاهز يحتوي على أكثر من 200 قسم للكلية"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تحميل نموذج (200 قسم)</span>
        </Button>

        <!-- Import from Excel Button -->
        <Button
          @click="openImportModal"
          class="!bg-blue-50 dark:!bg-blue-950/40 hover:!bg-blue-100 !text-blue-700 dark:!text-blue-400 !border !border-blue-200 dark:!border-blue-800 !font-semibold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          <Upload class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>استيراد من Excel</span>
        </Button>

        <!-- Export Button -->
        <Button
          @click="exportDepartments"
          class="!bg-brand-white dark:!bg-white/5 hover:!bg-brand-gray/10 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !font-semibold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
          title="تصدير الأقسام الحالية إلى Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير</span>
        </Button>

        <!-- Add Department Single Button -->
        <Button
          @click="openAdd"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.departments.addDepartment') }}
        </Button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="loading" type="table" :count="5" />

    <!-- Departments DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredDepartments"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 200]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.departments.emptyDepartments')"
            icon="Building"
            :actionLabel="$t('ohda.departments.addDepartment')"
            @action="openAdd"
          />
        </template>

        <Column field="name" :header="$t('ohda.departments.name')" sortable>
          <template #body="{ data }">
            <div class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center shrink-0">
                <Building class="w-4 h-4" />
              </div>
              <span>{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="description" :header="$t('ohda.departments.description')">
          <template #body="{ data }">
            <span class="text-brand-gray dark:text-slate-300">{{ data.description || '-' }}</span>
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

    <!-- Add/Edit Department Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.departments.editDepartment') : $t('ohda.departments.addDepartment')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="save" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.departments.name') }}
          </label>
          <InputText
            v-model="form.name"
            :placeholder="$t('ohda.departments.placeholderName')"
            required
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.departments.description') }}
          </label>
          <Textarea
            v-model="form.description"
            rows="3"
            :placeholder="$t('ohda.departments.placeholderDesc')"
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

    <!-- Import Excel Modal Dialog -->
    <Dialog
      v-model:visible="showImportModal"
      modal
      header="استيراد الأقسام من ملف Excel"
      class="max-w-lg w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs">
        <!-- Explanatory Banner -->
        <div class="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
          <div class="flex items-start gap-2.5">
            <FileSpreadsheet class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div class="space-y-1">
              <div class="font-bold">نموذج كليات متكامل جاهز (أكثر من 200 قسم)</div>
              <p class="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                يمكنك تحميل هذا النموذج الجاهز والتعديل عليه حسب رغبتك أو اعتماده ونشره مباشرة للنظام ليشمل كافة أقسام العمادة والشؤون الأكاديمية والطبية والمعامل والورش والمستودعات.
              </p>
              <button
                type="button"
                @click="downloadTemplate"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-900 cursor-pointer mt-1"
              >
                <Download class="w-3.5 h-3.5" />
                تحميل ملف النموذج الجاهز (College_Departments_Demo_200.xlsx)
              </button>
            </div>
          </div>
        </div>

        <!-- File Drop Area -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onFileDrop"
          class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer"
          :class="[
            isDragging
              ? 'border-brand-accent bg-brand-accent/5'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-brand-gray/25 hover:border-brand-accent/50 bg-brand-light dark:bg-white/5'
          ]"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="onFileSelected"
          />

          <div v-if="!selectedFile" class="space-y-2">
            <div class="w-12 h-12 mx-auto rounded-full bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center">
              <Upload class="w-6 h-6" />
            </div>
            <div class="font-semibold text-brand-dark dark:text-white">
              اسحب وأفلت ملف Excel هنا أو <span class="text-brand-accent underline">اضغط للاختيار من جهازك</span>
            </div>
            <div class="text-[11px] text-brand-gray dark:text-slate-400">
              صيغ الملفات المدعومة: .xlsx, .xls
            </div>
          </div>

          <div v-else class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/10 border border-emerald-300">
            <div class="flex items-center gap-2.5 text-right">
              <FileSpreadsheet class="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <div class="font-bold text-brand-dark dark:text-white">{{ selectedFile.name }}</div>
                <div class="text-[10px] text-brand-gray">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
            </div>
            <button
              type="button"
              @click.stop="selectedFile = null"
              class="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
              title="إلغاء الملف"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Import Result Banner -->
        <div v-if="importResult" class="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-blue-900 dark:text-blue-200">
          <div class="font-bold mb-1 flex items-center gap-1.5">
            <CheckCircle class="w-4 h-4 text-emerald-600" />
            <span>نتائج معالجة الاستيراد</span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center mt-2 text-[11px]">
            <div class="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40">
              <div class="font-bold text-emerald-800 dark:text-emerald-200 text-sm">{{ importResult.added }}</div>
              <div class="text-emerald-700 dark:text-emerald-400">أقسام جديدة</div>
            </div>
            <div class="p-2 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">
              <div class="font-bold text-blue-800 dark:text-blue-200 text-sm">{{ importResult.updated }}</div>
              <div class="text-blue-700 dark:text-blue-400">تم تحديثها</div>
            </div>
            <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div class="font-bold text-gray-700 dark:text-gray-300 text-sm">{{ importResult.skipped }}</div>
              <div class="text-gray-600 dark:text-gray-400">موجودة مسبقاً</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isImporting" @click="showImportModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="button"
            :disabled="!selectedFile || isImporting"
            @click="handleImport"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15 cursor-pointer"
          >
            <div v-if="isImporting" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isImporting ? 'جارِ قراءة واستيراد الأقسام...' : 'بدء الاستيراد والاعتماد' }}</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.departments.title')"
      :itemName="selectedItemForDelete?.name || ''"
      :confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '@/utilities/fetchApi';
import apiClient from '@/utilities/apiClient';
import { useToastStore } from '@/stores/toastStore';
import { useI18n } from 'vue-i18n';
import DeleteDialog from '@/components/DeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import { FileSpreadsheet, Upload, Download, Plus, Building, X, CheckCircle } from 'lucide-vue-next';

const { t } = useI18n();
const toastStore = useToastStore();

const departments = ref([]);
const loading = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({ name: '', description: '' });

const showDeleteDialog = ref(false);
const selectedItemForDelete = ref(null);

// Import Modal State
const showImportModal = ref(false);
const fileInputRef = ref(null);
const selectedFile = ref(null);
const isDragging = ref(false);
const isImporting = ref(false);
const importResult = ref(null);

const filteredDepartments = computed(() => {
  if (!searchQuery.value?.trim()) return departments.value;
  const q = searchQuery.value.toLowerCase().trim();
  return departments.value.filter(
    d => d.name?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
  );
});

async function load() {
  loading.value = true;
  try {
    const res = await apiGet('/api/Department?pageSize=1000');
    const data = res?.data?.objects || res?.data?.Objects || res?.data?.singleObject || res?.data?.SingleObject || [];
    departments.value = Array.isArray(data) ? data : (data ? [data] : []);
  } catch (err) {
    console.error('Failed to load departments', err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openAdd() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', description: '' };
  showModal.value = true;
}

function editItem(item) {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = { name: item.name, description: item.description || '' };
  showModal.value = true;
}

async function save() {
  if (!form.value.name?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await apiPut(`/api/Department/${editingId.value}`, form.value);
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
    } else {
      await apiPost('/api/Department', form.value);
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
    }
    showModal.value = false;
  } catch (err) {
    console.error('Save department failed', err);
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
    const res = await apiDelete(`/api/Department/${selectedItemForDelete.value.id}`, {}, false);
    if (res?.data?.isDone) {
      toastStore.addSuccessToast(t('ohda.common.operationSuccess'));
      await load();
      return { success: true };
    }
    const msg = res?.data?.returnMessage || "تعذر حذف القسم لوجود ارتباطات نشطة";
    toastStore.addErrorToast(msg);
    return { success: false, message: msg };
  } catch (err) {
    console.error('Delete department failed', err);
    const msg = err?.response?.data?.returnMessage || err?.message || "تعذر حذف القسم";
    toastStore.addErrorToast(msg);
    throw err;
  } finally {
    selectedItemForDelete.value = null;
  }
}

// Download Template
async function downloadTemplate() {
  try {
    const res = await apiClient.get('/api/Department/template', { responseType: 'blob' });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'College_Departments_Demo_200.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toastStore.addSuccessToast('تم تحميل نموذج Excel الجاهز بنجاح');
  } catch (err) {
    console.warn('Backend template download failed, using local public file fallback', err);
    const link = document.createElement('a');
    link.href = '/College_Departments_Demo_200.xlsx';
    link.setAttribute('download', 'College_Departments_Demo_200.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// Export Existing Departments
async function exportDepartments() {
  try {
    const res = await apiClient.get('/api/Department/export', { responseType: 'blob' });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `College_Departments_${now}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toastStore.addSuccessToast('تم تصدير الأقسام إلى ملف Excel بنجاح');
  } catch (err) {
    console.error('Export failed', err);
    toastStore.addErrorToast('فشل تصدير الأقسام إلى Excel');
  }
}

// Import Modal Handlers
function openImportModal() {
  selectedFile.value = null;
  importResult.value = null;
  showImportModal.value = true;
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onFileSelected(e) {
  const files = e.target.files;
  if (files && files[0]) {
    selectedFile.value = files[0];
  }
}

function onFileDrop(e) {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    selectedFile.value = files[0];
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function handleImport() {
  if (!selectedFile.value) {
    toastStore.addWarningToast('يرجى اختيار ملف Excel أولاً');
    return;
  }
  isImporting.value = true;
  importResult.value = null;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const res = await apiClient.post('/api/Department/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res?.data?.isDone) {
      toastStore.addSuccessToast(res.data.returnMessage || 'تم استيراد الأقسام بنجاح');
      importResult.value = res.data.singleObject || res.data.SingleObject;
      await load();
      setTimeout(() => {
        showImportModal.value = false;
        selectedFile.value = null;
        importResult.value = null;
      }, 4000);
    } else {
      toastStore.addErrorToast(res?.data?.returnMessage || 'تعذر استيراد الأقسام');
    }
  } catch (err) {
    console.error('Import failed', err);
    const msg = err?.response?.data?.returnMessage || 'حدث خطأ أثناء رفع ومعالجة ملف Excel';
    toastStore.addErrorToast(msg);
  } finally {
    isImporting.value = false;
  }
}
</script>
