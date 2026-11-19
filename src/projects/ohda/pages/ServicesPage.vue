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
          تسعير خدمات الصيانة الميكانيكية، الكهربائية، تغيير الزيوت، الغسيل والتلميع، وربطها بالمواد المستهلكة
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Wrench class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">عدد الخدمات</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ serviceStore.totalServicesCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Tag class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">فئات الخدمات</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ availableCategories.length }} فئات</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">متوسط سعر الخدمة</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ serviceStore.averageServicePrice }} ج.م</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">تخصم مواد تلقائياً</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ serviceStore.servicesWithConsumptionCount }}</span>
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
          :class="!selectedCategory ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
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
        <searchField v-model="searchQuery" placeholder="ابحث باسم الخدمة أو الفئة أو الوصف..." class="flex-1" />
        <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
          عرض {{ filteredServices.length }} من {{ serviceStore.services.length }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="serviceStore.loading && !serviceStore.services.length" type="table" :count="6" />

    <!-- Services DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredServices"
        paginator
        :rows="15"
        :rowsPerPageOptions="[10, 15, 30]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            title="لا توجد خدمات مضافة حالياً"
            icon="Wrench"
            actionLabel="إضافة خدمة جديدة"
            @action="openAddModal"
          />
        </template>

        <!-- Service Name & Description -->
        <Column field="name" header="الخدمة" sortable headerClass="text-start">
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.name }}</span>
              <span v-if="data.description" class="text-[11px] text-brand-gray dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ data.description }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Category -->
        <Column field="category" header="الفئة" sortable headerClass="text-start" style="width: 140px">
          <template #body="{ data }">
            <span
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block"
              :class="getCategoryBadgeClass(data.category)"
            >
              {{ data.category }}
            </span>
          </template>
        </Column>

        <!-- Price -->
        <Column field="price" header="السعر (المصنعية)" sortable headerClass="text-start" style="width: 130px">
          <template #body="{ data }">
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {{ (Number(data.price) || 0).toLocaleString() }} ج.م
            </span>
          </template>
        </Column>

        <!-- Duration -->
        <Column field="estimatedDurationMinutes" header="المدة التقديرية" sortable headerClass="text-center" bodyClass="text-center" style="width: 120px">
          <template #body="{ data }">
            <div class="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock class="w-3.5 h-3.5 text-brand-accent" />
              <span class="font-mono font-bold">{{ data.estimatedDurationMinutes || 30 }} دقيقة</span>
            </div>
          </template>
        </Column>

        <!-- Consumed Products -->
        <Column header="المواد المستهلكة تلقائياً" headerClass="text-start">
          <template #body="{ data }">
            <div v-if="data.consumedProducts && data.consumedProducts.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="cp in data.consumedProducts"
                :key="cp.id || cp.productId"
                class="px-2 py-0.5 rounded-md bg-brand-light dark:bg-white/10 text-[10px] border border-brand-gray/15 flex items-center gap-1 font-mono"
              >
                <Package class="w-3 h-3 text-brand-accent" />
                <span class="font-sans font-semibold text-brand-dark dark:text-slate-200">{{ cp.productName }}</span>
                <span class="text-brand-accent font-bold">({{ cp.quantity }} {{ cp.unit }})</span>
              </span>
            </div>
            <span v-else class="text-slate-400 text-[11px]">- لا يوجد (مصنعية فقط) -</span>
          </template>
        </Column>

        <!-- Status -->
        <Column field="isActive" header="الحالة" headerClass="text-center" bodyClass="text-center" style="width: 90px">
          <template #body="{ data }">
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
              :class="data.isActive !== false ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600'"
            >
              {{ data.isActive !== false ? 'متاحة' : 'معطلة' }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="الإجراءات" headerClass="text-center" bodyClass="text-center" style="width: 110px">
          <template #body="{ data }">
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
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Service Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? 'تعديل بيانات الخدمة' : 'إضافة خدمة صيانة جديدة'"
      class="max-w-xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="saveService" class="space-y-4 text-xs pt-2">
        <!-- Service Name -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم الخدمة <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="form.name"
            required
            placeholder="مثال: تغيير زيت وفلتر، صيانة فرامل، غسيل شامل وتلميع..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-medium rounded-xl"
            autofocus
          />
        </div>

        <!-- Category & Price -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              فئة الخدمة <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="form.category"
              :options="commonCategories"
              editable
              placeholder="اختر أو اكتب الفئة..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              السعر (ج.م) <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.price"
              :min="0"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              placeholder="0.00"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono font-bold"
            />
          </div>
        </div>

        <!-- Estimated Duration & Active Toggle -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              المدة التقديرية (بالدقائق)
            </label>
            <InputNumber
              v-model="form.estimatedDurationMinutes"
              :min="5"
              :step="5"
              placeholder="30"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
            />
          </div>

          <div class="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isActiveCheck"
              v-model="form.isActive"
              class="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent cursor-pointer"
            />
            <label for="isActiveCheck" class="font-semibold text-brand-dark dark:text-white cursor-pointer">
              خدمة نشطة ومتاحة في أوامر الشغل
            </label>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">الوصف والتفاصيل (اختياري)</label>
          <Textarea
            v-model="form.description"
            rows="2"
            placeholder="أي تفاصيل أو خطوات تشملها الخدمة..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
          />
        </div>

        <!-- Consumed Products Builder Section -->
        <div class="p-3.5 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block flex items-center gap-1.5">
                <Package class="w-4 h-4 text-brand-accent" />
                <span>ربط مواد وقطع غيار مستهلكة تلقائياً (اختياري)</span>
              </span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400">
                يتم خصم هذه الكميات من المخزن تلقائياً عند تنفيذ الخدمة (مثل 4 لتر زيت + 1 فلتر)
              </span>
            </div>

            <button
              type="button"
              @click="addConsumedRow"
              class="px-2.5 py-1 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div v-if="form.consumedProducts.length" class="space-y-2 pt-1">
            <div
              v-for="(row, idx) in form.consumedProducts"
              :key="idx"
              class="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-black/30 border border-brand-gray/15"
            >
              <!-- Product Select -->
              <div class="flex-1">
                <Select
                  v-model="row.productId"
                  :options="inventoryStore.products"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="اختر الصنف من المخزن..."
                  class="w-full !text-xs !rounded-lg"
                />
              </div>

              <!-- Quantity Input -->
              <div class="w-24">
                <InputNumber
                  v-model="row.quantity"
                  :min="0.1"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  placeholder="الكمية"
                  class="w-full !text-xs !font-mono !rounded-lg"
                />
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                @click="removeConsumedRow(idx)"
                class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition shrink-0"
                title="إزالة هذا الصنف"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-2 text-slate-400 text-[11px]">
            لا توجد أصناف مرتبطة. (الخدمة عبارة عن مصنعية يدوية بدون استهلاك قطع)
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            :disabled="saving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="saving" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'حفظ التعديلات' : 'إضافة الخدمة' }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Modal -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      header="تأكيد حذف الخدمة"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs pt-2">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في حذف الخدمة <strong>"{{ deletingService?.name }}"</strong>؟
        </p>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showDeleteModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            @click="executeDeleteService"
            :disabled="isDeleting"
            class="!bg-red-600 hover:!bg-red-500 !text-white !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
            <span>نعم، حذف</span>
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";

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
