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
          البحث التاريخي والتدقيق لصرف العهد والأجهزة والتحقق من وجهتها ومسار اعتمادها بالأرقام التسلسلية
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Export to Excel Button -->
        <Button
          @click="exportToExcel"
          :loading="exporting"
          class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-emerald-600/15 cursor-pointer transition-colors"
        >
          <FileSpreadsheet class="w-4 h-4" />
          تصدير إلى إكسل (.xlsx)
        </Button>

        <Button
          @click="downloadTemplate"
          class="!bg-brand-light hover:!bg-brand-light/80 !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs !font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          نموذج البوصلة الفارغ
        </Button>

        <Button
          @click="showUploadModal = true"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Upload class="w-4 h-4" />
          رفع مستند البوصلة
        </Button>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="bg-brand-white border border-brand-gray/10 shadow-sm p-5 rounded-2xl space-y-4">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <button @click="filtersCollapsed = !filtersCollapsed" class="text-sm text-brand-accent font-bold cursor-pointer">
              {{ filtersCollapsed ? 'إظهار عوامل التصفية' : 'إخفاء عوامل التصفية' }}
            </button>
          </div>

          <div v-if="!filtersCollapsed" class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">🔍 بحث نصي</label>
              <InputText v-model="filters.query" placeholder="ابحث برقم الجهاز، اسم المنتج، أو المستلم" class="w-full text-xs" @input="debouncedSearch" />
            </div>

            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">🏢 القسم</label>
              <Select v-model="filters.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full text-xs" showClear placeholder="الكل" />
            </div>

            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">🔄 نوع الحركة</label>
              <Select v-model="filters.type" :options="[{ label: 'الكل', value: null },{ label: 'دخول', value: 1 },{ label: 'خروج', value: 2 }]" optionLabel="label" optionValue="value" class="w-full text-xs" />
            </div>

            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">📦 حالة المنتج</label>
              <Select v-model="filters.stateId" :options="productStates" optionLabel="name" optionValue="id" class="w-full text-xs" showClear placeholder="الكل" />
            </div>

            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">📅 من تاريخ</label>
              <InputText v-model="filters.startDate" type="date" class="w-full text-xs" />
            </div>

            <div>
              <label class="block text-[12px] mb-1 font-semibold text-brand-dark">📅 إلى تاريخ</label>
              <InputText v-model="filters.endDate" type="date" class="w-full text-xs" />
            </div>
          </div>
        </div>

        <div class="w-44 flex flex-col gap-2">
          <Button @click="performSearch" class="!bg-brand-accent !text-brand-dark !font-bold !text-xs !py-2.5">بحث</Button>
          <SecondaryButton @click="resetFilters" class="!text-xs !py-2.5">إعادة تعيين</SecondaryButton>
        </div>
      </div>
    </div>

    <!-- Results Table (Essentials Only in Row + Eye Icon for Details) -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="compassLogs"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        class="w-full text-xs"
        :loading="loading"
        emptyMessage="لا توجد حركات عهدة أو أجهزة مسجلة تطابق معايير البحث."
      >
        <Column field="serialNumber" header="الرقم التسلسلي (S/N)">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold select-all text-xs bg-brand-soft px-2 py-0.5 rounded border border-brand-accent/20">
              {{ data.serialNumber }}
            </span>
          </template>
        </Column>

        <Column field="productName" header="اسم الصنف / الجهاز">
          <template #body="{ data }">
            <span class="font-bold text-brand-dark">{{ data.productName }}</span>
          </template>
        </Column>

        <Column header="نوع الحركة">
          <template #body="{ data }">
            <span v-if="data.type === 1" class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20">دخول</span>
            <span v-else-if="data.type === 2" class="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold border border-rose-500/20">خروج</span>
            <span v-else class="text-brand-gray">-</span>
          </template>
        </Column>

        <Column field="recipientName" header="المستلم">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.recipientName || '-' }}</span>
          </template>
        </Column>

        <Column field="delivererName" header="المسلم">
          <template #body="{ data }">
            <span class="text-brand-dark font-medium">{{ data.delivererName || '-' }}</span>
          </template>
        </Column>

        <Column field="departmentName" header="القسم والجهة">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.departmentName || data.place || '-' }}</span>
          </template>
        </Column>

        <Column field="exitDate" header="التاريخ">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray text-[11px]">{{ formatDate(data.exitDate) }}</span>
          </template>
        </Column>

        <Column field="productStateName" header="الحالة">
          <template #body="{ data }">
            <span class="text-brand-gray text-[11px]">{{ data.productStateName || '-' }}</span>
          </template>
        </Column>

        <!-- Actions / Details Eye Icon -->
        <Column header="التفاصيل" headerClass="text-center" bodyClass="text-center" style="width: 80px">
          <template #body="{ data }">
            <button
              @click="openDetailsModal(data)"
              title="عرض كافة تفاصيل ومسار حركة العهدة"
              class="w-8 h-8 rounded-xl bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/25 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 mx-auto"
            >
              <Eye class="w-4 h-4" />
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Movement & Approval Details Modal (Eye Action) -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      :header="`تفاصيل حركة الجهاز: ${selectedItem?.productName || ''}`"
      class="!bg-brand-white !border-brand-gray/15 max-w-2xl w-full !text-brand-dark"
    >
      <div v-if="selectedItem" class="space-y-5 text-xs">
        <!-- Top Status Banner -->
        <div class="p-4 rounded-2xl bg-brand-light border border-brand-gray/15 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[10px] text-brand-gray font-semibold block mb-0.5">الرقم التسلسلي للجهاز (S/N)</span>
            <span class="font-mono text-base font-black text-brand-accent select-all">{{ selectedItem.serialNumber }}</span>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="px-3 py-1 rounded-xl text-xs font-black"
              :class="selectedItem.type === 1 ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'"
            >
              {{ selectedItem.type === 1 ? 'حركة توريد / دخول مخزون' : 'حركة صرف / خروج عهدة' }}
            </span>
          </div>
        </div>

        <!-- 2-Column Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Parties Card -->
          <div class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-white space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-brand-dark flex items-center gap-2 border-b border-brand-gray/10 pb-2">
              <Users class="w-4 h-4 text-brand-accent" />
              أطراف حركة العهدة
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">المسلم / مقدم الطلب:</span>
                <span class="font-bold text-brand-dark">{{ selectedItem.delivererName || 'غير مسجل' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">المستلم / حامل العهدة:</span>
                <span class="font-bold text-brand-accent">{{ selectedItem.recipientName || 'غير مسجل' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">القسم المستلم:</span>
                <span class="font-semibold text-brand-dark">{{ selectedItem.departmentName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">الجهة / مكان الصرف:</span>
                <span class="text-brand-dark">{{ selectedItem.place || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Movement Info Card -->
          <div class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-white space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-brand-dark flex items-center gap-2 border-b border-brand-gray/10 pb-2">
              <Calendar class="w-4 h-4 text-brand-accent" />
              بيانات ومواعيد الحركة
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">تاريخ الحركة:</span>
                <span class="font-mono font-semibold text-brand-dark">{{ formatDate(selectedItem.exitDate) }}</span>
              </div>
              <div v-if="selectedItem.requesterConfirmedDate" class="flex items-center justify-between">
                <span class="text-brand-gray">تاريخ تأكيد واستلام العهدة:</span>
                <span class="font-mono text-emerald-700 font-bold">{{ formatDate(selectedItem.requesterConfirmedDate) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">حالة الجهاز:</span>
                <span class="font-bold text-brand-dark">{{ selectedItem.productStateName || 'سليم / افتراضي' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-brand-gray">السند المرجعي:</span>
                <span class="font-mono bg-brand-light px-2 py-0.5 rounded border border-brand-gray/10 font-bold">
                  {{ selectedItem.productExitRequestId ? `#طلب صرف ${selectedItem.productExitRequestId}` : (selectedItem.productEntryRequestId ? `#طلب توريد ${selectedItem.productEntryRequestId}` : 'إدخال يدوي/أرشيفي') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Workflow & Approver Names -->
        <div class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-light/50 space-y-3">
          <h4 class="font-bold text-xs text-brand-dark flex items-center gap-2 border-b border-brand-gray/10 pb-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600" />
            دورة الاعتماد وأسماء المعتمدين
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3 bg-brand-white rounded-xl border border-brand-gray/10">
              <span class="text-[10px] text-brand-gray block">المعتمد الأول (المشرف / الفاحص):</span>
              <span class="font-bold text-brand-dark text-xs mt-0.5 block">{{ selectedItem.supervisorName || 'معتمد آلياً / غير مطلوب' }}</span>
            </div>

            <div class="p-3 bg-brand-white rounded-xl border border-brand-gray/10">
              <span class="text-[10px] text-brand-gray block">المعتمد الثاني (المدير):</span>
              <span class="font-bold text-brand-dark text-xs mt-0.5 block">{{ selectedItem.managerName || 'معتمد آلياً / غير مطلوب' }}</span>
            </div>
          </div>

          <!-- Dynamic Approval Trail Timeline if present -->
          <div v-if="parsedApprovalTrail.length > 0" class="pt-2">
            <span class="text-[11px] font-bold text-brand-dark block mb-2">سجل الخطوات والقرارات الزمني:</span>
            <div class="space-y-2">
              <div
                v-for="(step, idx) in parsedApprovalTrail"
                :key="idx"
                class="flex items-start gap-3 p-2.5 bg-brand-white rounded-xl border border-brand-gray/10"
              >
                <div class="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-black text-[10px] shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-brand-dark">{{ step.stepName || step.action }}</span>
                    <span class="text-[10px] font-mono text-brand-gray">{{ formatDate(step.date) }}</span>
                  </div>
                  <div class="text-[11px] text-brand-gray mt-0.5">
                    بواسطة: <strong class="text-brand-dark">{{ step.userName || step.user || 'المسؤول' }}</strong>
                    <span v-if="step.notes" class="ms-2 text-brand-dark">({{ step.notes }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes / Purpose -->
        <div v-if="selectedItem.purpose || selectedItem.notes" class="p-3.5 rounded-xl bg-brand-white border border-brand-gray/15">
          <span class="font-bold text-brand-dark block mb-1">البيان والملاحظات:</span>
          <p class="text-brand-gray leading-relaxed text-[11px]">
            {{ selectedItem.purpose ? `[الغرض]: ${selectedItem.purpose}. ` : '' }}{{ selectedItem.notes || '' }}
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showDetailsModal = false">إغلاق</SecondaryButton>
        </div>
      </div>
    </Dialog>

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
import { ref, computed, onMounted } from "vue";
import { apiGet } from "@/utilities/fetchApi";
import axios from "@/utilities/apiClient";

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
  } catch (err) {
    alert("فشل تصدير بيانات البوصلة إلى ملف إكسل.");
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
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return dateStr;
  }
}
</script>
