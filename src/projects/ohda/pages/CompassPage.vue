<template>
  <div class="space-y-6 font-sans">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Compass class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.nav.compass') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          البحث التاريخي والتدقيق لصرف العهد والأجهزة والتحقق من وجهتها بالأرقام التسلسلية
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3">
        <Button
          @click="downloadTemplate"
          class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs !font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          تحميل نموذج البوصلة الفارغ
        </Button>

        <Button
          @click="showUploadModal = true"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Upload class="w-4 h-4" />
          رفع مستند البوصلة (.xlsx)
        </Button>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="bg-brand-white border border-brand-gray/10 shadow-sm p-5 rounded-2xl space-y-4">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <button @click="filtersCollapsed = !filtersCollapsed" class="text-sm text-brand-accent font-bold">
              {{ filtersCollapsed ? 'إظهار عوامل التصفية' : 'إخفاء عوامل التصفية' }}
            </button>
          </div>

          <div v-if="!filtersCollapsed" class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-[12px] mb-1">🔍 بحث نصي</label>
              <InputText v-model="filters.query" placeholder="ابحث برقم الجهاز، اسم المنتج، أو المستلم" @input="debouncedSearch" />
            </div>

            <div>
              <label class="block text-[12px] mb-1">🏢 القسم</label>
              <Select v-model="filters.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full" showClear />
            </div>

            <div>
              <label class="block text-[12px] mb-1">🔄 نوع الحركة</label>
              <Select v-model="filters.type" :options="[{ label: 'الكل', value: null },{ label: 'دخول', value: 1 },{ label: 'خروج', value: 2 }]" optionLabel="label" optionValue="value" class="w-full" />
            </div>

            <div>
              <label class="block text-[12px] mb-1">📦 حالة المنتج</label>
              <Select v-model="filters.stateId" :options="productStates" optionLabel="name" optionValue="id" class="w-full" showClear />
            </div>

            <div>
              <label class="block text-[12px] mb-1">📅 من تاريخ</label>
              <InputText v-model="filters.startDate" type="date" class="w-full" />
            </div>

            <div>
              <label class="block text-[12px] mb-1">📅 إلى تاريخ</label>
              <InputText v-model="filters.endDate" type="date" class="w-full" />
            </div>
          </div>
        </div>

        <div class="w-44 flex flex-col gap-2">
          <Button @click="performSearch" class="!bg-brand-accent">بحث</Button>
          <SecondaryButton @click="resetFilters">إعادة تعيين</SecondaryButton>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="compassLogs" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs" :loading="loading">
        <Column field="serialNumber" header="الرقم التسلسلي (S/N)">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold select-all text-sm">{{ data.serialNumber }}</span>
          </template>
        </Column>

        <Column field="productName" header="اسم الصنف / الجهاز">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">{{ data.productName }}</div>
            </div>
          </template>
        </Column>

        <Column field="recipientName" header="المستلم">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.recipientName }}</span>
          </template>
        </Column>

        <Column field="place" header="الجهة / مكان الصرف">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.place }}</span>
          </template>
        </Column>

        <Column field="departmentName" header="القسم">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.departmentName || '-' }}</span>
          </template>
        </Column>

        <Column field="productStateName" header="الحالة">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.productStateName || '-' }}</span>
          </template>
        </Column>

        <Column header="نوع الحركة">
          <template #body="{ data }">
            <span v-if="data.type === 1" class="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">دخول</span>
            <span v-else-if="data.type === 2" class="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">خروج</span>
            <span v-else class="text-brand-gray">-</span>
          </template>
        </Column>

        <Column field="exitDate" header="التاريخ">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ formatDate(data.exitDate) }}</span>
          </template>
        </Column>

        <Column field="notes" header="ملاحظات">
          <template #body="{ data }">
            <span class="text-brand-gray max-w-xs truncate block">{{ data.notes || '-' }}</span>
          </template>
        </Column>
        <Column field="productExitRequestId" header="رقم الطلب المرجعي">
          <template #body="{ data }">
            <span v-if="data.productExitRequestId" class="font-mono text-brand-gray bg-brand-light px-2 py-0.5 rounded border border-brand-gray/10">#{{ data.productExitRequestId }}</span>
            <span v-else class="text-brand-gray italic">إدخال يدوي/أرشيفي</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Upload Modal Dialog -->
    <Dialog v-model:visible="showUploadModal" modal header="استيراد بوصلة صرف الأجهزة" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <div class="space-y-4 text-xs">
        <div
          class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onFileDrop"
          @click="triggerFileSelect"
        >
          <FileSpreadsheet class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="font-semibold text-brand-dark mb-1">اسحب ملف إكسل البوصلة هنا أو اضغط للاختيار</p>
          <span class="text-[10px] text-brand-gray block mb-4">يدعم فقط صيغ Excel (.xlsx, .xls)</span>
          <input type="file" ref="fileInput" accept=".xlsx, .xls" class="hidden" @change="onFileSelected" />
          <button class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer">
            تصفح الملفات
          </button>
        </div>

        <div v-if="uploading" class="space-y-2">
          <div class="flex justify-between text-brand-gray">
            <span>جاري استيراد وتدقيق البيانات...</span>
            <span class="font-bold text-brand-accent">50%</span>
          </div>
          <div class="w-full bg-brand-light rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full animate-pulse" style="width: 50%"></div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showUploadModal = false">إلغاء</SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { apiGet } from "@/utilities/fetchApi";
import axios from "@/utilities/apiClient";

const departments = ref([]);
const productStates = ref([]);
const filters = ref({ query: '', departmentId: null, type: null, stateId: null, startDate: null, endDate: null });
const filtersCollapsed = ref(false);

const compassLogs = ref([]);
const searchQuery = ref("");
const loading = ref(false);
const showUploadModal = ref(false);
const uploading = ref(false);
const fileInput = ref(null);

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

async function performSearch() {
  loading.value = true;
  try {
    const params = [];
    if (filters.value.query) params.push(`query=${encodeURIComponent(filters.value.query)}`);
    if (filters.value.departmentId) params.push(`departmentId=${filters.value.departmentId}`);
    if (filters.value.type) params.push(`type=${filters.value.type}`);
    if (filters.value.stateId) params.push(`stateId=${filters.value.stateId}`);
    if (filters.value.startDate) params.push(`startDate=${encodeURIComponent(filters.value.startDate)}`);
    if (filters.value.endDate) params.push(`endDate=${encodeURIComponent(filters.value.endDate)}`);
    const q = params.length ? `?${params.join('&')}` : '';
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

async function downloadTemplate() {
  try {
    const res = await axios.get("/api/Compass/template", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Compass_Template.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("فشل تحميل نموذج إكسل.");
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
      alert(data.returnMessage || data.ReturnMessage || "تم استيراد مستند البوصلة بنجاح!");
      showUploadModal.value = false;
      performSearch();
    } else {
      alert(data?.returnMessage || data?.ReturnMessage || "فشل استيراد المستند.");
    }
  } catch (err) {
    alert("حدث خطأ أثناء رفع الملف.");
  } finally {
    uploading.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
</script>
