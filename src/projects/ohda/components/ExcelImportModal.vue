<template>
  <OhdaModal
    :visible="visible"
    @close="closeModal"
    :title="`استيراد ${resolvedLabel} من ملف Excel`"
    description="تحميل القالب، معاينة الصفوف سطراً بسطر، معالجة المكرر، واعتماد الاستيراد بأمان"
    :icon="FileSpreadsheet"
    max-width="max-w-4xl"
  >
    <div class="space-y-4 text-xs">
      <!-- Step 1: Download Template & Upload -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-brand-light/40 dark:bg-white/5 border border-brand-gray/15">
        <div class="space-y-1.5">
          <span class="font-bold block">1. تحميل قالب الإكسل المعتمد</span>
          <button
            type="button"
            @click="downloadTemplate"
            class="px-4 py-2 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-2 cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>تحميل قالب {{ resolvedLabel }} (.xlsx)</span>
          </button>
        </div>

        <div class="space-y-1.5">
          <span class="font-bold block">2. رفع الملف للمعاينة والتحقق</span>
          <input
            type="file"
            accept=".xlsx"
            @change="onFileSelect"
            class="w-full text-xs file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-accent file:text-brand-dark file:font-bold cursor-pointer"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="previewLoading" class="py-10 text-center text-brand-gray">جاري قراءة وفحص صفوف الملف...</div>

      <!-- Preview Results -->
      <template v-else-if="previewData">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-black/5 dark:bg-white/5">
            <span class="text-[10px] text-brand-gray block">إجمالي الصفوف</span>
            <strong class="font-mono text-base">{{ previewData.totalRows }}</strong>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-700">
            <span class="text-[10px] block">صالحة للاستيراد</span>
            <strong class="font-mono text-base">{{ previewData.validCount }}</strong>
          </div>
          <div class="p-3 rounded-xl bg-orange-500/10 text-orange-700">
            <span class="text-[10px] block">مكررة / تنبيهات</span>
            <strong class="font-mono text-base">{{ previewData.warningCount }}</strong>
          </div>
          <div class="p-3 rounded-xl bg-red-500/10 text-red-600">
            <span class="text-[10px] block">أخطاء مرفوضة</span>
            <strong class="font-mono text-base">{{ previewData.errorCount }}</strong>
          </div>
        </div>

        <!-- Import Policy Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-brand-gray/15">
          <div>
            <label class="block font-bold mb-1">التعامل مع السجلات المكررة</label>
            <select v-model="duplicateStrategy" class="w-full p-2 rounded-lg border border-brand-gray/25 bg-transparent">
              <option value="skip">تخطي المكرر (عدم التعديل)</option>
              <option value="update">تحديث السجلات الموجودة</option>
              <option value="stop">إيقاف العملية بالكامل إذا وُجد مكرر</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">سياسة الصفوف الخاطئة</label>
            <select v-model="importMode" class="w-full p-2 rounded-lg border border-brand-gray/25 bg-transparent">
              <option value="valid_only">استيراد الصفوف الصحيحة فقط وتصدير الأخطاء</option>
              <option value="all_or_nothing">الكل أو لا شيء (إلغاء عند وجود أي خطأ)</option>
            </select>
          </div>
        </div>

        <!-- Error export bar -->
        <div v-if="errorRows.length > 0 || postFailedRows.length > 0" class="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300">
          <span>يوجد {{ errorRows.length || postFailedRows.length }} صفوف بها أخطاء تحتاج تصحيحاً.</span>
          <button type="button" @click="exportErrorCsv" class="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold cursor-pointer">
            تصدير تقرير الأخطاء (.csv)
          </button>
        </div>

        <!-- Row-by-Row Preview Table -->
        <div class="max-h-64 overflow-y-auto border border-brand-gray/15 rounded-xl">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/70 dark:bg-white/5 font-bold text-brand-gray">
              <tr>
                <th class="p-2">صف</th>
                <th class="p-2">الحالة</th>
                <th class="p-2">المحتوى</th>
                <th class="p-2">ملاحظة الفحص</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr
                v-for="r in previewData.rows"
                :key="r.rowNumber + r.sheetName"
                :class="r.status === 'error' ? 'bg-red-500/10' : r.status === 'warning' ? 'bg-orange-500/10' : ''"
              >
                <td class="p-2 font-mono">{{ r.rowNumber }}</td>
                <td class="p-2 font-bold">
                  <span v-if="r.status === 'valid'" class="text-emerald-600">سليم ✓</span>
                  <span v-else-if="r.status === 'warning'" class="text-orange-600">تنبيه / مكرر</span>
                  <span v-else class="text-red-600">خطأ ✗</span>
                </td>
                <td class="p-2 font-mono text-[11px] truncate max-w-xs">{{ Object.values(r.data).filter(Boolean).join(' • ') }}</td>
                <td class="p-2">{{ r.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <template #footer="{ close }">
      <button type="button" @click="close" class="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer">إغلاق</button>
      <button
        v-if="previewData"
        type="button"
        @click="commitImport"
        :disabled="committing"
        class="px-5 py-2 rounded-xl bg-brand-accent text-brand-dark text-xs font-extrabold cursor-pointer disabled:opacity-50"
      >
        {{ committing ? 'جاري التنفيذ...' : 'اعتماد واستيراد البيانات الآن' }}
      </button>
    </template>
  </OhdaModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import apiClient from "@/utilities/apiClient";
import OhdaModal from "./OhdaModal.vue";
import { FileSpreadsheet, Download } from "lucide-vue-next";

const props = defineProps({
  visible: Boolean,
  entityType: { type: String, required: true },
  entityLabel: { type: String, default: "" },
  entityName: { type: String, default: "" },
  supplierId: { type: Number, default: null }
});

const emit = defineEmits(["update:visible", "close", "imported", "success"]);
const toast = useToast();

const resolvedLabel = computed(() => props.entityLabel || props.entityName || "البيانات");
const previewLoading = ref(false);
const committing = ref(false);
const previewData = ref(null);
const postFailedRows = ref([]);
const duplicateStrategy = ref("skip");
const importMode = ref("valid_only");

const errorRows = computed(() => (previewData.value?.rows || []).filter(r => r.status === "error"));

function closeModal() {
  emit("update:visible", false);
  emit("close");
}

function exportErrorCsv() {
  const rowsToExport = postFailedRows.value.length ? postFailedRows.value : errorRows.value;
  if (!rowsToExport.length) return;
  const header = ["الصف", "الورقة", "السبب", "البيانات"];
  const lines = rowsToExport.map(r => [
    r.rowNumber ?? "",
    r.sheetName ?? "",
    (r.reason || r.message || "").replace(/"/g, '""'),
    JSON.stringify(r.data || {}).replace(/"/g, '""')
  ].map(v => `"${v}"`).join(","));
  const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.entityType}_errors.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadTemplate() {
  try {
    const res = await apiClient.get(`/api/UniversalImport/template/${props.entityType}`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.entityType}_template.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    toast.add({ severity: "error", summary: "خطأ", detail: "فشل تحميل القالب", life: 3000 });
  }
}

async function onFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  previewLoading.value = true;
  previewData.value = null;
  postFailedRows.value = [];
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiClient.post(`/api/UniversalImport/preview/${props.entityType}`, fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res?.data?.isDone) previewData.value = res.data.singleObject;
  } catch (err) {
    toast.add({ severity: "error", summary: "خطأ", detail: err?.response?.data?.returnMessage || "فشل فحص الملف", life: 3500 });
  } finally {
    previewLoading.value = false;
  }
}

async function commitImport() {
  if (!previewData.value) return;
  committing.value = true;
  postFailedRows.value = [];
  try {
    const res = await apiClient.post(`/api/UniversalImport/commit/${props.entityType}`, {
      duplicateStrategy: duplicateStrategy.value,
      importMode: importMode.value,
      createMissingCategories: true,
      supplierId: props.supplierId,
      rows: previewData.value.rows
    });
    if (res?.data?.isDone) {
      const obj = res.data.singleObject || {};
      postFailedRows.value = obj.failedRows || [];
      toast.add({ severity: "success", summary: "اكتمل الاستيراد", detail: res.data.returnMessage, life: 4500 });
      emit("imported", obj);
      emit("success", obj);
      if (!postFailedRows.value.length) {
        closeModal();
        previewData.value = null;
      }
    }
  } catch (err) {
    toast.add({ severity: "error", summary: "فشل الاعتماد", detail: err?.response?.data?.returnMessage || "حدث خطأ", life: 4500 });
  } finally {
    committing.value = false;
  }
}
</script>
