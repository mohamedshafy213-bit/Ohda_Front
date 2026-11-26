<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2.5">
          <Database class="w-6 h-6 text-brand-accent" />
          <span>البيانات الأساسية والقوائم المنسدلة (Lookups)</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-1">
          إدارة الخيارات المتاحة في القوائم المنسدلة للنظام (ماركات، ألوان، أنواع وقود، مصادر حجز، وسوم العملاء) بما يناسب طبيعة مركزك.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="showImportModal = true"
          class="px-4 py-2 rounded-xl border border-brand-gray/25 hover:border-brand-accent text-brand-dark dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          <span>استيراد Excel</span>
        </button>

        <button
          type="button"
          @click="handleSeedDefaults"
          :disabled="lookupStore.loading"
          class="px-4 py-2 rounded-xl border border-brand-gray/25 hover:border-brand-accent text-brand-dark dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw class="w-4 h-4 text-brand-accent" />
          <span>استعادة القوائم الافتراضية</span>
        </button>

        <button
          type="button"
          @click="openAddValueModal"
          :disabled="!selectedType"
          class="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة عنصر إلى "{{ selectedType?.nameAr || 'التصنيف' }}"</span>
        </button>
      </div>
    </div>

    <!-- Main Two-Panel Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Right / Navigation Panel: Lookup Types -->
      <div class="lg:col-span-4 bg-brand-white dark:bg-brand-dark rounded-2xl border border-brand-gray/15 p-4 space-y-3 shadow-xs">
        <div class="flex items-center justify-between pb-2 border-b border-brand-gray/10">
          <h2 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <ListFilter class="w-4 h-4 text-brand-accent" />
            <span>قوائم النظام الأساسية ({{ lookupStore.types.length }})</span>
          </h2>
          <span class="text-[10px] text-brand-gray font-mono">{{ totalAllValuesCount }} عنصر</span>
        </div>

        <!-- Search Types -->
        <div class="relative">
          <input
            v-model="searchTypeQuery"
            type="text"
            placeholder="بحث في التصنيفات..."
            class="w-full pl-3 pr-8 py-2 rounded-xl border border-brand-gray/20 bg-brand-light/40 dark:bg-white/5 text-xs text-brand-dark dark:text-white placeholder:text-brand-gray/60 focus:border-brand-accent transition-all"
          />
          <Search class="w-4 h-4 text-brand-gray/60 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Types List -->
        <div class="space-y-1.5 max-h-[620px] overflow-y-auto pr-0.5">
          <button
            v-for="t in filteredTypes"
            :key="t.id"
            type="button"
            @click="selectType(t)"
            class="w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group"
            :class="selectedType?.id === t.id
              ? 'border-brand-accent bg-brand-soft/70 dark:bg-brand-accent/15 text-brand-dark dark:text-white font-bold shadow-xs'
              : 'border-transparent hover:bg-brand-light/50 dark:hover:bg-white/5 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors"
                :class="selectedType?.id === t.id ? 'bg-brand-accent text-brand-dark' : 'bg-brand-gray/10 text-brand-gray group-hover:bg-brand-gray/20'"
              >
                <component :is="getTypeIcon(t.code)" class="w-4 h-4" />
              </div>
              <div class="truncate text-right">
                <div class="text-xs truncate font-medium" :class="selectedType?.id === t.id ? 'font-bold' : ''">
                  {{ t.nameAr }}
                </div>
                <div class="text-[10px] text-brand-gray/70 font-mono truncate">
                  {{ t.code }}
                </div>
              </div>
            </div>

            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0"
              :class="selectedType?.id === t.id ? 'bg-brand-accent/30 text-brand-dark dark:text-white' : 'bg-black/5 dark:bg-white/10 text-brand-gray'"
            >
              {{ t.valuesCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Left / Details Panel: Values of Selected Type -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Selected Type Banner -->
        <div v-if="selectedType" class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-brand-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
              <h3 class="text-sm font-bold text-brand-dark dark:text-white">
                {{ selectedType.nameAr }}
              </h3>
              <span class="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-mono text-brand-gray">
                {{ selectedType.code }}
              </span>
            </div>
            <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-1">
              {{ selectedType.description || 'إدارة الخيارات المدرجة في هذا التصنيف وتفعيلها أو إيقافها حسب حاجة العمل.' }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
              {{ activeValuesCount }} نشط
            </span>
            <span v-if="inactiveValuesCount > 0" class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
              {{ inactiveValuesCount }} معطل
            </span>
          </div>
        </div>

        <!-- Values Data Table -->
        <OhdaDataTable
          :columns="tableColumns"
          :items="currentValues"
          :loading="lookupStore.loading"
          empty-title="لا توجد عناصر مسجلة في هذا التصنيف"
          empty-message="أضف خيارات جديدة لتظهر في القوائم المنسدلة عند تحرير العملاء أو المركبات أو الحجوزات."
          :rows-per-page="15"
        >
          <!-- Search / Actions in Table Toolbar -->
          <template #toolbar>
            <div class="flex items-center justify-between gap-3 w-full">
              <div class="relative w-full sm:w-64">
                <input
                  v-model="searchValueQuery"
                  type="text"
                  placeholder="بحث في العناصر..."
                  class="w-full pl-3 pr-8 py-2 rounded-xl border border-brand-gray/20 bg-brand-white dark:bg-white/5 text-xs text-brand-dark dark:text-white focus:border-brand-accent transition-all"
                />
                <Search class="w-4 h-4 text-brand-gray/60 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <div class="text-[11px] text-brand-gray">
                إجمالي العناصر: <span class="font-bold font-mono text-brand-dark dark:text-white">{{ currentValues.length }}</span>
              </div>
            </div>
          </template>

          <!-- Label Column (With Color Chip if any) -->
          <template #labelAr="{ row, data }">
            <div class="flex items-center gap-2">
              <span
                v-if="(row || data)?.colorCode"
                class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/15 shadow-2xs"
                :style="{ backgroundColor: (row || data)?.colorCode }"
              ></span>
              <span class="font-bold text-brand-dark dark:text-white">{{ (row || data)?.labelAr }}</span>
              <span v-if="(row || data)?.isDefault" class="px-1.5 py-0.2 rounded text-[9px] bg-brand-accent/30 text-brand-dark dark:text-white font-bold">
                افتراضي
              </span>
            </div>
          </template>

          <!-- Code Column -->
          <template #value="{ row, data }">
            <span class="font-mono text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-brand-gray">
              {{ (row || data)?.value }}
            </span>
          </template>

          <!-- English Label Column -->
          <template #labelEn="{ row, data }">
            <span class="text-xs text-brand-gray font-sans">{{ (row || data)?.labelEn || '—' }}</span>
          </template>

          <!-- Sort Order Column -->
          <template #sortOrder="{ row, data }">
            <span class="font-mono text-xs text-slate-500">{{ (row || data)?.sortOrder }}</span>
          </template>

          <!-- Status Column (Toggle) -->
          <template #isActive="{ row, data }">
            <button
              type="button"
              @click="toggleActiveStatus(row || data)"
              class="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
              :class="(row || data)?.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25'"
            >
              {{ (row || data)?.isActive ? 'نشط' : 'معطل' }}
            </button>
          </template>

          <!-- Actions Column -->
          <template #actions="{ row, data }">
            <div class="flex items-center justify-center gap-1.5">
              <button
                type="button"
                @click="openEditValueModal(row || data)"
                title="تعديل"
                class="p-1.5 rounded-lg text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Edit3 class="w-4 h-4" />
              </button>

              <button
                type="button"
                @click="confirmDeleteValue(row || data)"
                title="حذف"
                class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </template>
        </OhdaDataTable>
      </div>
    </div>

    <!-- Modal: Add / Edit Lookup Value -->
    <!-- CRITICAL RULE: closeOnBackdrop=false ensures user cannot lose form by misclicking -->
    <OhdaModal
      :visible="showModal"
      :close-on-backdrop="false"
      @close="showModal = false"
      :title="editingId ? 'تعديل عنصر البيانات' : 'إضافة عنصر جديد'"
      :description="`إضافة خيار جديد إلى قائمة '${selectedType?.nameAr || ''}'`"
      :icon="editingId ? Edit3 : Plus"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitValueForm" id="valueForm" class="space-y-4 text-xs">
        <!-- Label Arabic -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            الاسم بالعربي <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.labelAr"
            type="text"
            required
            placeholder="مثال: تويوتا، أحمر، فيسبوك..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all text-xs"
          />
        </div>

        <!-- Label English -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            الاسم بالإنجليزي (اختياري)
          </label>
          <input
            v-model="form.labelEn"
            type="text"
            placeholder="e.g. Toyota, Red, Facebook..."
            dir="ltr"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all text-xs text-left"
          />
        </div>

        <!-- Code / Value Key -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            الكود البرمجي (Value Key) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.value"
            type="text"
            required
            placeholder="مثال: toyota, red, facebook"
            dir="ltr"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all text-left"
          />
          <span class="text-[10px] text-brand-gray mt-1 block">يُستخدم كمعرّف ثابت ومميّز للعنصر.</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Sort Order -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              ترتيب الظهور
            </label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Color Code (Optional for tags/colors) -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              رمز اللون (Badge / Hex)
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.colorCode"
                type="color"
                class="w-8 h-8 rounded-lg border border-brand-gray/20 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                v-model="form.colorCode"
                type="text"
                placeholder="#3b82f6"
                dir="ltr"
                class="flex-1 px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all text-left"
              />
            </div>
          </div>
        </div>

        <!-- Toggles: Active & Default -->
        <div class="flex items-center gap-6 pt-2 border-t border-brand-gray/10">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="rounded border-brand-gray/30 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
            />
            <span class="font-medium text-xs text-brand-dark dark:text-white">مفعّل ويظهر في القوائم</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              v-model="form.isDefault"
              type="checkbox"
              class="rounded border-brand-gray/30 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
            />
            <span class="font-medium text-xs text-brand-dark dark:text-white">خيار افتراضي تلقائي</span>
          </label>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light dark:hover:bg-white/10 font-semibold text-xs cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="valueForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Check class="w-4 h-4" />
          <span>{{ submitting ? 'جاري الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إضافة العنصر') }}</span>
        </button>
      </template>
    </OhdaModal>

    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="lookups"
      entity-label="القوائم الأساسية"
      @imported="lookupStore.fetchTypes()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaLookupStore } from "../stores/useOhdaLookupStore";
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import OhdaModal from "../components/OhdaModal.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import {
  Database,
  Plus,
  RotateCcw,
  Upload,
  Search,
  ListFilter,
  Edit3,
  Trash2,
  Check,
  Car,
  Palette,
  Fuel,
  Users,
  Tag,
  CalendarCheck,
  Wrench,
  HelpCircle
} from "lucide-vue-next";

const lookupStore = useOhdaLookupStore();
const toast = useToast();

const searchTypeQuery = ref("");
const searchValueQuery = ref("");
const showModal = ref(false);
const showImportModal = ref(false);
const editingId = ref(null);
const submitting = ref(false);

const form = ref({
  value: "",
  labelAr: "",
  labelEn: "",
  sortOrder: 1,
  isActive: true,
  isDefault: false,
  colorCode: ""
});

const selectedType = computed(() => lookupStore.selectedType);

const filteredTypes = computed(() => {
  const q = searchTypeQuery.value.trim().toLowerCase();
  if (!q) return lookupStore.types;
  return lookupStore.types.filter(
    t => t.nameAr.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
  );
});

const totalAllValuesCount = computed(() => {
  return lookupStore.types.reduce((sum, t) => sum + (t.valuesCount || 0), 0);
});

const currentValues = computed(() => {
  const vals = selectedType.value?.values || [];
  const q = searchValueQuery.value.trim().toLowerCase();
  if (!q) return vals;
  return vals.filter(
    v => (v.labelAr && v.labelAr.toLowerCase().includes(q)) ||
         (v.labelEn && v.labelEn.toLowerCase().includes(q)) ||
         (v.value && v.value.toLowerCase().includes(q))
  );
});

const activeValuesCount = computed(() => {
  return (selectedType.value?.values || []).filter(v => v.isActive).length;
});

const inactiveValuesCount = computed(() => {
  return (selectedType.value?.values || []).filter(v => !v.isActive).length;
});

const tableColumns = [
  { field: "labelAr", header: "الاسم بالعربي", sortable: true, width: "30%" },
  { field: "value", header: "الكود (Key)", sortable: true, width: "20%" },
  { field: "labelEn", header: "الاسم بالإنجليزي", sortable: true, width: "20%" },
  { field: "sortOrder", header: "الترتيب", sortable: true, width: "10%", align: "center" },
  { field: "isActive", header: "الحالة", sortable: true, width: "10%", align: "center" },
  { field: "actions", header: "الإجراءات", width: "10%", align: "center" }
];

function getTypeIcon(code) {
  switch (code) {
    case "vehicle_brand": return Car;
    case "vehicle_color": return Palette;
    case "fuel_type": return Fuel;
    case "customer_source": return Users;
    case "customer_tag": return Tag;
    case "booking_source": return CalendarCheck;
    case "bay_type": return Wrench;
    default: return HelpCircle;
  }
}

async function selectType(t) {
  searchValueQuery.value = "";
  await lookupStore.fetchTypeByCode(t.code);
}

function openAddValueModal() {
  editingId.value = null;
  const count = (selectedType.value?.values || []).length;
  form.value = {
    value: "",
    labelAr: "",
    labelEn: "",
    sortOrder: count + 1,
    isActive: true,
    isDefault: false,
    colorCode: ""
  };
  showModal.value = true;
}

function openEditValueModal(row) {
  editingId.value = row.id;
  form.value = {
    value: row.value,
    labelAr: row.labelAr,
    labelEn: row.labelEn || "",
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    isDefault: row.isDefault,
    colorCode: row.colorCode || ""
  };
  showModal.value = true;
}

async function submitValueForm() {
  submitting.value = true;
  try {
    let res;
    if (editingId.value) {
      res = await lookupStore.updateValue(editingId.value, {
        value: form.value.value,
        labelAr: form.value.labelAr,
        labelEn: form.value.labelEn,
        sortOrder: Number(form.value.sortOrder) || 0,
        isActive: form.value.isActive,
        isDefault: form.value.isDefault,
        colorCode: form.value.colorCode
      });
    } else {
      res = await lookupStore.createValue({
        lookupTypeId: selectedType.value?.id,
        lookupTypeCode: selectedType.value?.code,
        value: form.value.value,
        labelAr: form.value.labelAr,
        labelEn: form.value.labelEn,
        sortOrder: Number(form.value.sortOrder) || 0,
        isActive: form.value.isActive,
        isDefault: form.value.isDefault,
        colorCode: form.value.colorCode
      });
    }

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم بنجاح",
        detail: res.message,
        life: 3000
      });
      showModal.value = false;
      await lookupStore.fetchTypes();
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function toggleActiveStatus(row) {
  const updatedActive = !row.isActive;
  const res = await lookupStore.updateValue(row.id, {
    value: row.value,
    labelAr: row.labelAr,
    labelEn: row.labelEn,
    sortOrder: row.sortOrder,
    isActive: updatedActive,
    isDefault: row.isDefault,
    colorCode: row.colorCode
  });
  if (res.success) {
    toast.add({
      severity: "info",
      summary: "تم تغيير الحالة",
      detail: `تم ${updatedActive ? 'تفعيل' : 'تعطيل'} العنصر "${row.labelAr}"`,
      life: 2500
    });
  }
}

async function confirmDeleteValue(row) {
  const ok = await confirmStore.showConfirm({
    title: "حذف عنصر القائمة",
    message: `هل أنت متأكد من رغبتك في حذف العنصر "${row.labelAr}"؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (ok) {
    const res = await lookupStore.deleteValue(row.id);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم الحذف",
        detail: res.message,
        life: 3000
      });
      await lookupStore.fetchTypes();
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  }
}

async function handleSeedDefaults() {
  const ok = await confirmStore.showConfirm({
    title: "استعادة القوائم الافتراضية",
    message: "هل تريد استعادة البيانات الافتراضية لقوائم النظام الأساسية؟",
    confirmText: "نعم، استعادة",
    isDestructive: false
  });
  if (ok) {
    const res = await lookupStore.seedDefaults();
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تمت الاستعادة",
        detail: res.message,
        life: 4000
      });
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  }
}

onMounted(async () => {
  await lookupStore.fetchTypes();
});
</script>
