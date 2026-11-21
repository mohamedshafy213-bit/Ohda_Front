<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Wrench class="w-7 h-7 text-brand-accent" />
          <span>قائمة الخدمات وأسعار الصيانة</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          إدارة باقات وخدمات الورشة، أسعار المصنعيات، والقطع المستهلكة تلقائياً مع كل خدمة
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="openAddModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Wrench class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي الخدمات</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ serviceStore.totalServicesCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">فئات الخدمات</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ availableCategories.length }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">متوسط سعر الخدمة</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ formatCurrency(serviceStore.averagePrice) }}
          </span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Tag class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">الخدمات النشطة</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ serviceStore.activeServicesCount || serviceStore.activeServices?.length || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Category Filters Tabs & Search Bar -->
    <div class="space-y-3">
      <!-- Category Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="selectedCategory = null"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="selectedCategory === null ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          الكل ({{ serviceStore.services.length }})
        </button>

        <button
          v-for="cat in availableCategories"
          :key="cat"
          type="button"
          @click="selectedCategory = cat"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="selectedCategory === cat ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          {{ cat }} ({{ countServicesInCategory(cat) }})
        </button>
      </div>

      <!-- Search Field -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <searchField v-model="searchQuery" placeholder="ابحث باسم الخدمة أو الوصف..." class="flex-1" />
        <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
          عرض {{ filteredServices.length }} من {{ serviceStore.services.length }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="serviceStore.loading && !serviceStore.services.length" type="table" :count="6" />

    <!-- Services DataTable using OhdaDataTable -->
    <OhdaDataTable
      v-else
      :items="filteredServices"
      :columns="serviceColumns"
      :loading="serviceStore.loading"
      empty-title="لا توجد خدمات مضافة حالياً"
      empty-message="يمكنك إضافة خدمات صيانة جديدة بالنقر على الزر أدناه."
      :rows-per-page="15"
    >
      <template #empty-action>
        <button
          type="button"
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </template>

      <!-- Service Name & Description -->
      <template #name="{ data }">
        <div>
          <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.name }}</span>
          <span v-if="data.description" class="text-[11px] text-brand-gray dark:text-slate-400 line-clamp-1 mt-0.5">
            {{ data.description }}
          </span>
        </div>
      </template>

      <!-- Category -->
      <template #category="{ data }">
        <span
          class="px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block"
          :class="getCategoryBadgeClass(data.category)"
        >
          {{ data.category }}
        </span>
      </template>

      <!-- Price -->
      <template #price="{ data }">
        <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          {{ formatCurrency(data?.price) }}
        </span>
      </template>

      <!-- Duration -->
      <template #estimatedDurationMinutes="{ data }">
        <div class="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Clock class="w-3.5 h-3.5 text-brand-accent" />
          <span class="font-mono font-bold">{{ data.estimatedDurationMinutes || 30 }} دقيقة</span>
        </div>
      </template>

      <!-- Consumed Products -->
      <template #consumedProducts="{ data }">
        <div v-if="data.consumedProducts && data.consumedProducts.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="cp in data.consumedProducts"
            :key="cp.id || cp.productId"
            class="px-2 py-0.5 rounded-md bg-brand-light dark:bg-white/10 text-[10px] border border-brand-gray/15 flex items-center gap-1 font-mono"
          >
            <Package class="w-3 h-3 text-brand-accent" />
            <span class="font-sans font-semibold text-brand-dark dark:text-slate-200">{{ cp.productName }}</span>
            <span class="text-brand-accent font-bold">({{ cp.quantity }} {{ cp.unit || 'قطعة' }})</span>
          </span>
        </div>
        <span v-else class="text-slate-400 text-[11px]">- مصنعية فقط -</span>
      </template>

      <!-- Status -->
      <template #isActive="{ data }">
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
          :class="data.isActive !== false ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600'"
        >
          {{ data.isActive !== false ? 'متاحة' : 'معطلة' }}
        </span>
      </template>

      <!-- Actions -->
      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1.5">
          <button
            type="button"
            @click="openEditModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="تعديل الخدمة"
          >
            <Edit class="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            @click="promptDelete(data)"
            class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer border border-red-500/20"
            title="حذف الخدمة"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </OhdaDataTable>

    <!-- Add/Edit Service Modal using OhdaModal -->
    <OhdaModal
      :visible="showModal"
      @close="showModal = false"
      :title="isEditing ? 'تعديل بيانات الخدمة' : 'إضافة خدمة صيانة جديدة'"
      description="أدخل تفاصيل الخدمة، الفئة، سعر المصنعية، والقطع المستهلكة من المخزن"
      :icon="Wrench"
      max-width="max-w-2xl"
    >
      <form @submit.prevent="saveService" id="serviceForm" class="space-y-4 text-xs">
        <!-- Service Name (Full Width) -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم الخدمة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            required
            type="text"
            placeholder="مثال: تغيير زيت وفلتر، صيانة فرامل، غسيل شامل وتلميع..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all text-xs"
          />
        </div>

        <!-- Consistent 2-Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              فئة الخدمة <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-medium focus:border-brand-accent transition-all"
            >
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Price -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              سعر الخدمة / المصنعية (ج.م) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.price"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Estimated Duration -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              المدة التقديرية (بالدقائق)
            </label>
            <input
              v-model.number="form.estimatedDurationMinutes"
              type="number"
              min="5"
              step="5"
              placeholder="30"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Is Active Status -->
          <div class="flex items-center pt-6">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="form.isActive"
                class="rounded border-brand-gray/30 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
              />
              <span class="text-xs font-semibold text-brand-dark dark:text-white">الخدمة متاحة للعمل والحجز حالياً</span>
            </label>
          </div>

          <!-- Description (Full Width) -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">وصف الخدمة وملاحظات (اختياري)</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="وصف تفصيلي للخدمة أو شروط تقديمها..."
              class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Consumed Products linking -->
        <div class="p-3 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/10 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block">قطع الغيار والزيوت المستهلكة تلقائياً</span>
              <span class="text-[10px] text-brand-gray">تخصم من المخزن تلقائياً عند تنفيذ أمر الشغل لهذه الخدمة</span>
            </div>
            <button
              type="button"
              @click="addConsumedRow"
              class="px-2.5 py-1 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>ربط صنف</span>
            </button>
          </div>

          <div v-if="form.consumedProducts.length" class="space-y-2 pt-1">
            <div
              v-for="(cp, idx) in form.consumedProducts"
              :key="idx"
              class="flex items-center gap-2 bg-white dark:bg-brand-dark p-2 rounded-xl border border-brand-gray/15"
            >
              <select
                v-model="cp.productId"
                class="flex-1 px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs text-brand-dark dark:text-white focus:border-brand-accent"
              >
                <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (متاح: {{ p.currentQuantity ?? p.quantity }})
                </option>
              </select>

              <input
                v-model.number="cp.quantity"
                type="number"
                step="any"
                min="0.1"
                placeholder="الكمية"
                class="w-20 px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs font-mono font-bold text-brand-dark dark:text-white text-center focus:border-brand-accent"
              />

              <button
                type="button"
                @click="removeConsumedRow(idx)"
                class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-2 text-slate-400 text-[11px]">
            لا توجد أصناف مرتبطة. (الخدمة عبارة عن مصنعية يدوية بدون استهلاك قطع)
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="serviceForm"
          :disabled="saving"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw v-if="saving" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'حفظ التعديلات' : 'إضافة الخدمة' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Delete Confirmation Modal using OhdaModal -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="تأكيد حذف الخدمة"
      description="يرجى الانتباه قبل حذف أي خدمة مسجلة"
      :icon="Trash2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في حذف الخدمة <strong>"{{ deletingService?.name }}"</strong>؟
        </p>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="executeDeleteService"
          :disabled="isDeleting"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
          <span>نعم، حذف</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Tag,
  Coins,
  Layers,
  Clock,
  Package,
  RefreshCw,
  X
} from "lucide-vue-next";

const serviceStore = useOhdaServiceStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const selectedCategory = ref(null);

const commonCategories = [
  "ميكانيكا",
  "كهرباء",
  "تغيير زيوت وسوائل",
  "غسيل وتلميع",
  "عفشة وتكييف",
  "فحص وتكويد كمبيوتر",
  "كاوتش وضبط زوايا"
];

const serviceColumns = [
  { field: "name", header: "الخدمة", sortable: true, width: "24%" },
  { field: "category", header: "الفئة", sortable: true, width: "15%" },
  { field: "price", header: "السعر (المصنعية)", sortable: true, width: "14%" },
  { field: "estimatedDurationMinutes", header: "المدة التقديرية", sortable: true, align: "center", width: "13%" },
  { field: "consumedProducts", header: "المواد المستهلكة تلقائياً", width: "18%" },
  { field: "isActive", header: "الحالة", align: "center", width: "8%" },
  { field: "actions", header: "الإجراءات", align: "center", width: "8%" }
];

// Add/Edit State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = ref({
  name: "",
  category: "ميكانيكا",
  price: 0,
  estimatedDurationMinutes: 30,
  description: "",
  isActive: true,
  consumedProducts: []
});

// Delete State
const showDeleteModal = ref(false);
const deletingService = ref(null);
const isDeleting = ref(false);

onMounted(async () => {
  await Promise.all([
    serviceStore.fetchServices(),
    inventoryStore.fetchProducts()
  ]);
});

// Categories list combining predefined and existing in db
const availableCategories = computed(() => {
  const fromServices = serviceStore.categories;
  const merged = Array.from(new Set([...commonCategories, ...fromServices]));
  return merged;
});

function countServicesInCategory(cat) {
  return serviceStore.services.filter(s => s.category === cat).length;
}

const filteredServices = computed(() => {
  let list = serviceStore.services || [];

  if (selectedCategory.value) {
    list = list.filter(s => s.category === selectedCategory.value);
  }

  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  return list;
});

function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return "0 ج.م";
  return (Number(val) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " ج.م";
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case "ميكانيكا":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25";
    case "كهرباء":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25";
    case "تغيير زيوت وسوائل":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25";
    case "غسيل وتلميع":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25";
    case "عفشة وتكييف":
      return "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/25";
  }
}

// Modal open
function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    name: "",
    category: "ميكانيكا",
    price: 0,
    estimatedDurationMinutes: 30,
    description: "",
    isActive: true,
    consumedProducts: []
  };
  showModal.value = true;
}

function openEditModal(service) {
  isEditing.value = true;
  editingId.value = service.id;
  form.value = {
    name: service.name,
    category: service.category || "ميكانيكا",
    price: Number(service.price) || 0,
    estimatedDurationMinutes: service.estimatedDurationMinutes || 30,
    description: service.description || "",
    isActive: service.isActive !== false,
    consumedProducts: (service.consumedProducts || []).map(cp => ({
      productId: cp.productId,
      quantity: Number(cp.quantity) || 1,
      notes: cp.notes || ""
    }))
  };
  showModal.value = true;
}

function addConsumedRow() {
  form.value.consumedProducts.push({
    productId: inventoryStore.products[0]?.id || null,
    quantity: 1,
    notes: ""
  });
}

function removeConsumedRow(index) {
  form.value.consumedProducts.splice(index, 1);
}

async function saveService() {
  if (!form.value.name?.trim()) {
    toastStore.addErrorToast("اسم الخدمة مطلوب");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      category: form.value.category?.trim() || "ميكانيكا",
      price: form.value.price || 0,
      estimatedDurationMinutes: form.value.estimatedDurationMinutes || 30,
      description: form.value.description?.trim() || null,
      isActive: form.value.isActive !== false,
      consumedProducts: form.value.consumedProducts.filter(x => x.productId && x.quantity > 0)
    };

    let res;
    if (isEditing.value) {
      payload.id = editingId.value;
      res = await serviceStore.updateService(editingId.value, payload);
    } else {
      res = await serviceStore.addService(payload);
    }

    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حفظ الخدمة بنجاح");
      showModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشلت العملية");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حفظ الخدمة");
  } finally {
    saving.value = false;
  }
}

// Delete
function promptDelete(service) {
  deletingService.value = service;
  showDeleteModal.value = true;
}

async function executeDeleteService() {
  if (!deletingService.value) return;
  isDeleting.value = true;
  try {
    const res = await serviceStore.deleteService(deletingService.value.id);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حذف الخدمة بنجاح");
      showDeleteModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشل حذف الخدمة");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حذف الخدمة");
  } finally {
    isDeleting.value = false;
  }
}
</script>
