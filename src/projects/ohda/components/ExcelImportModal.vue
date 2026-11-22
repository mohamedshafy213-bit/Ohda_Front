<template>
  <OhdaModal
    :visible="visible"
    @close="close"
    :title="title || `استيراد ${entityName} من ملف Excel`"
    subtitle="ارفع ملف Excel أو CSV لإضافة أو تحديث البيانات دفعة واحدة"
    :icon="FileSpreadsheet"
    z-index="z-[60]"
    max-width="max-w-xl"
    :close-on-backdrop="false"
  >
    <div class="space-y-4 text-xs">
      <!-- 1. Download Template Banner -->
      <div class="p-3.5 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15 flex items-center justify-between gap-3">
        <div>
          <div class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
            <Download class="w-4 h-4 text-brand-accent" />
            <span>تحميل نموذج Excel الفارغ</span>
          </div>
          <p class="text-[11px] text-brand-gray mt-0.5">
            يُفضل استخدام النموذج الجاهز لضمان توافق أسماء الأعمدة والحقول
          </p>
        </div>

        <button
          type="button"
          @click="downloadTemplate"
          class="px-3 py-1.5 rounded-xl border border-brand-accent/40 bg-brand-accent/15 hover:bg-brand-accent/25 text-brand-dark dark:text-brand-accent font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <FileSpreadsheet class="w-3.5 h-3.5" />
          <span>تحميل النموذج</span>
        </button>
      </div>

      <!-- 2. File Upload Dropzone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative"
        :class="[
          isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-gray/25 hover:border-brand-accent/60 bg-white dark:bg-brand-dark',
          selectedFile ? 'border-emerald-500 bg-emerald-500/5' : ''
        ]"
        @click="fileInputRef && fileInputRef.click()"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx, .xls, .csv"
          class="hidden"
          @change="onFileSelected"
        />

        <div v-if="!selectedFile" class="space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-brand-light dark:bg-white/5 text-brand-gray flex items-center justify-center mx-auto">
            <Upload class="w-6 h-6 text-brand-accent" />
          </div>
          <div class="font-bold text-brand-dark dark:text-white">
            اسحب وأفلت ملف Excel (.xlsx أو .csv) هنا
          </div>
          <p class="text-[11px] text-brand-gray">
            أو اضغط لاختيار الملف من جهازك
          </p>
        </div>

        <div v-else class="space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div class="font-bold text-brand-dark dark:text-white flex items-center justify-center gap-2 font-mono">
            <span>{{ selectedFile.name }}</span>
            <span class="text-xs text-brand-gray">({{ (selectedFile.size / 1024).toFixed(1) }} KB)</span>
          </div>
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            تم تجهيز الملف للمعالجة
          </p>
        </div>
      </div>

      <!-- 3. Progress / Loading Indicator -->
      <div v-if="uploading" class="p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 space-y-2">
        <div class="flex items-center justify-between font-bold text-xs">
          <span class="flex items-center gap-1.5 text-brand-dark dark:text-white">
            <RefreshCw class="w-3.5 h-3.5 text-brand-accent animate-spin" />
            <span>جاري استيراد ومعالجة البيانات...</span>
          </span>
          <span class="font-mono text-brand-accent">{{ progressPct }}%</span>
        </div>
        <div class="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            class="h-full bg-brand-accent transition-all duration-300 rounded-full"
            :style="{ width: `${progressPct}%` }"
          ></div>
        </div>
      </div>

      <!-- 4. Result Banner -->
      <div
        v-if="importResult"
        class="p-3.5 rounded-xl border text-xs space-y-1"
        :class="importResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'"
      >
        <div class="font-bold flex items-center gap-1.5">
          <CheckCircle2 v-if="importResult.success" class="w-4 h-4 text-emerald-600 shrink-0" />
          <AlertTriangle v-else class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ importResult.message }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="close"
        :disabled="uploading"
        class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer disabled:opacity-50"
      >
        إلغاء
      </button>

      <button
        type="button"
        @click="startImport"
        :disabled="!selectedFile || uploading"
        class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
      >
        <Upload class="w-4 h-4" />
        <span>{{ uploading ? 'جاري الاستيراد...' : 'بدء الاستيراد الآن' }}</span>
      </button>
    </template>
  </OhdaModal>
</template>

<script setup>
import { ref } from "vue";
import OhdaModal from "./OhdaModal.vue";
import { downloadTemplateCsv, parseCsvFile } from "../utils/excelHelper";
import apiClient from "@/utilities/apiClient";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-vue-next";

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  entityName: { type: String, default: "البيانات" },
  templateFilename: { type: String, default: "template" },
  templateColumns: { type: Array, default: () => [] },
  sampleRows: { type: Array, default: () => [] },
  endpoint: { type: String, default: "" },
  customImportHandler: { type: Function, default: null }
});

const emit = defineEmits(["update:visible", "close", "success"]);

const fileInputRef = ref(null);
const isDragging = ref(false);
const selectedFile = ref(null);
const uploading = ref(false);
const progressPct = ref(0);
const importResult = ref(null);

function close() {
  selectedFile.value = null;
  importResult.value = null;
  uploading.value = false;
  emit("update:visible", false);
  emit("close");
}

function onFileSelected(e) {
  const files = e.target.files;
  if (files && files[0]) {
    selectedFile.value = files[0];
    importResult.value = null;
  }
}

function onDrop(e) {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files && files[0]) {
    selectedFile.value = files[0];
    importResult.value = null;
  }
}

function downloadTemplate() {
  if (props.templateColumns && props.templateColumns.length > 0) {
    downloadTemplateCsv(props.templateFilename || "template", props.templateColumns, props.sampleRows || []);
  } else if (props.endpoint) {
    window.open(`/api/Excel/export/template/${props.templateFilename}`, "_blank");
  }
}

async function startImport() {
  if (!selectedFile.value) return;

  uploading.value = true;
  progressPct.value = 15;
  importResult.value = null;

  try {
    // 1. Try server-side endpoint first if provided
    let endpointSuccess = false;
    if (props.endpoint) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile.value);
        progressPct.value = 40;

        const res = await apiClient.post(props.endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (res.data?.isDone || res.status === 200) {
          progressPct.value = 100;
          endpointSuccess = true;
          importResult.value = {
            success: true,
            message: res.data?.returnMessage || "تم استيراد الملف بنجاح"
          };
          emit("success");
          return;
        }
      } catch (err) {
        console.warn("Backend Excel upload error, checking client fallback:", err);
      }
    }

    // 2. Client-side fallback if customImportHandler is provided
    if (!endpointSuccess && props.customImportHandler) {
      progressPct.value = 50;
      const { rows } = await parseCsvFile(selectedFile.value);
      if (!rows || rows.length === 0) {
        throw new Error("الملف فارغ أو تعذر قراءة الصفوف");
      }

      progressPct.value = 75;
      const res = await props.customImportHandler(rows);
      progressPct.value = 100;
      importResult.value = {
        success: res.success !== false,
        message: res.message || `تمت معالجة واستيراد ${rows.length} سجل بنجاح`
      };
      emit("success");
      return;
    }

    if (!endpointSuccess) {
      throw new Error("تعذر إتمام الاستيراد من الخادم، يرجى التأكد من صحة تنسيق الملف");
    }
  } catch (err) {
    importResult.value = {
      success: false,
      message: err.message || "حدث خطأ أثناء معالجة الملف"
    };
  } finally {
    uploading.value = false;
  }
}
</script>
