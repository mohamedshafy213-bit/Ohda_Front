<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <Layers class="w-6 h-6 text-brand-accent" />
          {{ $t('ohda.warehouseBins.title') || 'أرفف وخانات التخزين' }}
        </h2>
        <p class="text-xs text-brand-gray mt-1">
          إدارة أرفف المخزون المستودعي، تحديد السعة القصوى، تتبع المساحات الشاغرة، وتسكين الأصناف
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 !px-4 !py-2 !rounded-xl !shadow-sm cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('ohda.warehouseBins.addBin') || 'إضافة رف جديد' }}</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Bins -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">إجمالي الأرفف</span>
          <h3 class="text-2xl font-extrabold text-brand-dark dark:text-white font-mono">
            {{ binStore.totalBinsCount }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-soft text-brand-accent flex items-center justify-center">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Capacity -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">إجمالي السعة التخزينية</span>
          <h3 class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {{ binStore.totalCapacity }}
            <span class="text-xs font-normal text-brand-gray">وحدة</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Boxes class="w-5 h-5" />
        </div>
      </div>

      <!-- Occupied Items -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">الأصناف المشغولة حالياً</span>
          <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {{ binStore.totalItemsInBins }}
            <span class="text-xs font-normal text-brand-gray">قطعة</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Box class="w-5 h-5" />
        </div>
      </div>

      <!-- Remaining Space -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">المساحة المتبقية الشاغرة</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ binStore.totalRemainingSpace }}
            <span class="text-xs font-normal text-brand-gray">مكان شاغر</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-96">
        <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث بكود الرف، الاسم، أو الممر..."
          class="w-full ps-9 pe-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent"
        />
      </div>

      <div class="text-xs text-brand-gray flex items-center gap-3">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          مساحة كافية
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          قريب من الامتلاء
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          ممتلئ بالكامل
        </span>
      </div>
    </div>

    <!-- Bins Table -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 rounded-2xl shadow-sm overflow-hidden">
      <DataTable
        :value="filteredBins"
        :loading="binStore.loading"
        paginator
        :rows="10"
        responsiveLayout="scroll"
        class="text-xs"
        emptyMessage="لا توجد أرفف تخزين مسجلة. اضغط على '+ إضافة رف جديد' لإنشاء أول رف."
      >
        <!-- Bin Code -->
        <Column field="code" header="كود الرف">
          <template #body="{ data }">
            <span class="px-2.5 py-1 rounded-lg bg-brand-soft text-brand-accent font-mono font-bold text-xs border border-brand-accent/25">
              {{ data.code }}
            </span>
          </template>
        </Column>

        <!-- Bin Name -->
        <Column field="name" header="اسم الرف / الوصف">
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block">{{ data.name }}</span>
              <span class="text-[10px] text-brand-gray" v-if="data.description">{{ data.description }}</span>
            </div>
          </template>
        </Column>

        <!-- Aisle & Shelf -->
        <Column header="الممر / المستوى">
          <template #body="{ data }">
            <span class="font-mono text-xs text-brand-gray">
              ممر {{ data.aisle || '-' }} / مستوى {{ data.shelf || '-' }}
            </span>
          </template>
        </Column>

        <!-- Capacity -->
        <Column field="capacity" header="السعة القصوى (العدد الذي يتحمله)">
          <template #body="{ data }">
            <span class="font-mono font-bold text-brand-dark dark:text-white">
              {{ data.capacity ? `${data.capacity} قطعة` : 'غير محدد' }}
            </span>
          </template>
        </Column>

        <!-- Items Count -->
        <Column field="itemsCount" header="القطع المشغولة">
          <template #body="{ data }">
            <button
              type="button"
              @click="viewBinItems(data)"
              class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border"
              :class="(data.itemsCount || 0) > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20' : 'bg-brand-light text-brand-gray border-brand-gray/20'"
            >
              <Box class="w-3.5 h-3.5" />
              <span>{{ data.itemsCount || 0 }} قطعة</span>
            </button>
          </template>
        </Column>

        <!-- Remaining Space (Visualized) -->
        <Column header="المساحة المتبقية (Remaining)">
          <template #body="{ data }">
            <div class="space-y-1.5 min-w-[170px]">
              <div class="flex items-center justify-between text-xs">
                <span
                  class="font-mono font-bold text-xs px-2 py-0.5 rounded-md"
                  :class="getRemainingBadgeClass(data)"
                >
                  {{ getRemainingSpace(data) > 0 ? `متبقي ${getRemainingSpace(data)} مكان` : 'ممتلئ بالكامل' }}
                </span>
                <span class="text-[10px] text-brand-gray font-mono">
                  {{ Math.round(getUsedPercentage(data)) }}% مشغول
                </span>
              </div>
              <!-- Progress Bar -->
              <div class="w-full h-2 bg-brand-light dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300 rounded-full"
                  :class="getProgressBarClass(data)"
                  :style="{ width: `${Math.min(100, getUsedPercentage(data))}%` }"
                ></div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="الإجراءات" class="text-end">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-1.5">
              <!-- Assign Product Button -->
              <button
                type="button"
                @click="openAssignModal(data)"
                class="px-2 py-1 rounded-lg bg-brand-accent/15 text-brand-dark dark:text-brand-accent hover:bg-brand-accent/25 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="تسكين أصناف في هذا الرف"
              >
                <PackagePlus class="w-3.5 h-3.5" />
                <span>تسكين صنف</span>
              </button>

              <!-- View Items Button -->
              <button
                type="button"
                @click="viewBinItems(data)"
                class="p-1.5 rounded-lg text-brand-gray hover:text-brand-accent hover:bg-brand-soft transition-colors cursor-pointer"
                title="معاينة محتويات الرف"
              >
                <Eye class="w-4 h-4" />
              </button>

              <!-- Edit Bin Button -->
              <button
                type="button"
                @click="openEditModal(data)"
                class="p-1.5 rounded-lg text-brand-gray hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                title="تعديل بيانات الرف"
              >
                <Pencil class="w-4 h-4" />
              </button>

              <!-- Delete Bin Button -->
              <button
                type="button"
                @click="handleDeleteBin(data)"
                class="p-1.5 rounded-lg text-brand-gray hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="حذف الرف"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- View Bin Items Dialog -->
    <Dialog
      v-model:visible="showItemsModal"
      modal
      :header="`محتويات الرف: ${selectedBin?.code || ''} - ${selectedBin?.name || ''}`"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-3xl w-full !text-brand-dark dark:!text-white"
    >
      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-3 gap-3 p-3 bg-brand-light dark:bg-white/5 rounded-xl border border-brand-gray/10 text-center">
          <div>
            <span class="text-brand-gray block text-[11px]">السعة القصوى</span>
            <span class="font-bold text-brand-dark dark:text-white font-mono text-base">{{ selectedBin?.capacity || 0 }}</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[11px]">القطع المشغولة</span>
            <span class="font-bold text-amber-500 font-mono text-base">{{ binStore.selectedBinItems.length }}</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[11px]">المساحة المتبقية</span>
            <span class="font-bold text-emerald-500 font-mono text-base">
              {{ Math.max(0, (selectedBin?.capacity || 0) - binStore.selectedBinItems.length) }}
            </span>
          </div>
        </div>

        <DataTable
          :value="binStore.selectedBinItems"
          :loading="binStore.loadingItems"
          paginator
          :rows="6"
          class="text-xs"
          emptyMessage="الرف شاغر حالياً ولا يحتوي على أي أجهزة مسكنة."
        >
          <Column field="serialNumber" header="الرقم التسلسلي">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent select-all">{{ data.serialNumber }}</span>
            </template>
          </Column>
          <Column field="productName" header="اسم الصنف"></Column>
          <Column field="productSKU" header="SKU" class="font-mono"></Column>
          <Column header="إلغاء التسكين" class="text-end">
            <template #body="{ data }">
              <button
                type="button"
                @click="handleUnassignItem(data)"
                class="px-2 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 text-[11px] font-semibold transition cursor-pointer"
                title="إخراج القطعة من هذا الرف"
              >
                إلغاء التسكين
              </button>
            </template>
          </Column>
        </DataTable>

        <div class="flex items-center justify-between pt-3 border-t border-brand-gray/10">
          <Button
            @click="openAssignModal(selectedBin)"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-1.5 !px-3 !py-1.5 !rounded-lg text-xs"
          >
            <PackagePlus class="w-3.5 h-3.5" />
            <span>تسكين صنف جديد هنا</span>
          </Button>

          <SecondaryButton @click="showItemsModal = false">
            إغلاق
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Assign Product to Bin Dialog -->
    <Dialog
      v-model:visible="showAssignModal"
      modal
      :header="`تسكين أصناف في الرف: ${targetBin?.code || ''} (${targetBin?.name || ''})`"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-md w-full !text-brand-dark dark:!text-white"
    >
      <form @submit.prevent="handleAssignProduct" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-soft/50 dark:bg-white/5 rounded-xl border border-brand-accent/20 flex items-center justify-between">
          <div>
            <span class="text-brand-gray block text-[11px]">المساحة المتبقية الشاغرة بالرف:</span>
            <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {{ getRemainingSpace(targetBin) }} مكان شاغر
            </span>
          </div>
          <span class="text-xs text-brand-gray font-mono">
            السعة: {{ targetBin?.capacity || 0 }}
          </span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">اختر الصنف المراد تسكينه</label>
          <select
            v-model="assignForm.productId"
            required
            class="w-full px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            <option :value="null" disabled>-- اختر الصنف من المخزون --</option>
            <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
              {{ p.name }} (المتوفر بالمخزن: {{ p.quantity || 0 }})
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">الكمية المراد تسكينها على الرف</label>
          <input
            v-model.number="assignForm.quantity"
            type="number"
            min="1"
            :max="getRemainingSpace(targetBin) > 0 ? getRemainingSpace(targetBin) : 1"
            required
            class="w-full px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-mono font-bold"
          />
          <p class="text-[10px] text-brand-gray mt-1">
            أقصى كمية يمكن إضافتها حالياً: {{ getRemainingSpace(targetBin) }} قطعة
          </p>
        </div>

        <div v-if="assignStatusMessage" class="p-2.5 rounded-lg text-xs" :class="assignStatusError ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'">
          {{ assignStatusMessage }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/15">
          <SecondaryButton type="button" @click="showAssignModal = false">
            إلغاء
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="getRemainingSpace(targetBin) <= 0 || isAssigning"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold disabled:opacity-50"
          >
            {{ isAssigning ? 'جاري التسكين...' : 'تأكيد تسكين الأصناف' }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Add / Edit Bin Dialog -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? 'تعديل بيانات الرف' : 'إضافة رف جديد في المخزن'"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-lg w-full !text-brand-dark dark:!text-white"
    >
      <form @submit.prevent="handleSaveBin" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">كود الرف (Code)</label>
            <InputText
              v-model="form.code"
              required
              placeholder="مثال: SH-01-A"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">السعة القصوى (العدد الذي يتحمله)</label>
            <InputText
              v-model.number="form.capacity"
              type="number"
              min="1"
              required
              placeholder="مثال: 50"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">اسم الرف / التوصيف</label>
          <InputText
            v-model="form.name"
            required
            placeholder="مثال: رف حواسيب Dell المحمولة أو رف الشاشات"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">الممر (Aisle) - اختياري</label>
            <InputText
              v-model="form.aisle"
              placeholder="مثال: A"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">المستوى / الخانة (Level) - اختياري</label>
            <InputText
              v-model="form.shelf"
              placeholder="مثال: 01"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1">وصف وملاحظات</label>
          <Textarea
            v-model="form.description"
            rows="2"
            placeholder="ملاحظات حول طبيعة الأصناف أو الأجهزة الخاصة بهذا الرف..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/15">
          <SecondaryButton type="button" @click="showModal = false">
            إلغاء
          </SecondaryButton>
          <Button
            type="submit"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold"
          >
            حفظ البيانات
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import {
  Layers,
  Plus,
  Box,
  Boxes,
  CheckCircle2,
  Search,
  Eye,
  Pencil,
  Trash2,
  PackagePlus
} from "lucide-vue-next";

const binStore = useOhdaWarehouseBinStore();
const inventoryStore = useOhdaInventoryStore();

const searchQuery = ref("");
const showModal = ref(false);
const showItemsModal = ref(false);
const showAssignModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const selectedBin = ref(null);
const targetBin = ref(null);
const isAssigning = ref(false);
const assignStatusMessage = ref("");
const assignStatusError = ref(false);

const form = ref({
  code: "",
  name: "",
  aisle: "",
  shelf: "",
  capacity: 50,
  description: "",
  isActive: true
});

const assignForm = ref({
  productId: null,
  quantity: 1
});

onMounted(async () => {
  await Promise.all([
    binStore.fetchBins(),
    inventoryStore.fetchProducts()
  ]);
});

function getRemainingSpace(bin) {
  if (!bin) return 0;
  if (bin.remainingCapacity != null) return bin.remainingCapacity;
  const cap = bin.capacity || 0;
  const items = bin.itemsCount || 0;
  return Math.max(0, cap - items);
}

function getUsedPercentage(bin) {
  if (!bin || !bin.capacity) return 0;
  const items = bin.itemsCount || 0;
  return Math.min(100, (items / bin.capacity) * 100);
}

function getRemainingBadgeClass(bin) {
  const rem = getRemainingSpace(bin);
  if (rem <= 0) {
    return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30";
  }
  const cap = bin.capacity || 1;
  const ratio = rem / cap;
  if (ratio <= 0.25) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30";
  }
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
}

function getProgressBarClass(bin) {
  const rem = getRemainingSpace(bin);
  if (rem <= 0) return "bg-red-500";
  const cap = bin.capacity || 1;
  const ratio = rem / cap;
  if (ratio <= 0.25) return "bg-amber-500";
  return "bg-emerald-500";
}

const filteredBins = computed(() => {
  let list = binStore.bins;
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (b) =>
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.aisle?.toLowerCase().includes(q) ||
      b.shelf?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
  );
});

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    code: `SH-${Math.floor(10 + Math.random() * 90)}-01`,
    name: "",
    aisle: "A",
    shelf: "01",
    capacity: 40,
    description: "",
    isActive: true
  };
  showModal.value = true;
}

function openEditModal(bin) {
  isEditing.value = true;
  editingId.value = bin.id;
  form.value = {
    code: bin.code,
    name: bin.name,
    aisle: bin.aisle || "",
    shelf: bin.shelf || "",
    capacity: bin.capacity || 50,
    description: bin.description || "",
    isActive: bin.isActive ?? true
  };
  showModal.value = true;
}

async function handleSaveBin() {
  if (isEditing.value) {
    await binStore.updateBin(editingId.value, form.value);
  } else {
    await binStore.createBin(form.value);
  }
  showModal.value = false;
}

async function viewBinItems(bin) {
  selectedBin.value = bin;
  showItemsModal.value = true;
  await binStore.fetchBinItems(bin.id);
}

function openAssignModal(bin) {
  targetBin.value = bin;
  assignStatusMessage.value = "";
  assignStatusError.value = false;
  const rem = getRemainingSpace(bin);
  assignForm.value = {
    productId: inventoryStore.products[0]?.id || null,
    quantity: rem > 0 ? 1 : 0
  };
  showAssignModal.value = true;
}

async function handleAssignProduct() {
  if (!targetBin.value || !assignForm.value.productId) return;
  isAssigning.value = true;
  assignStatusMessage.value = "";
  assignStatusError.value = false;

  const res = await binStore.assignProductToBin(
    targetBin.value.id,
    assignForm.value.productId,
    assignForm.value.quantity
  );

  isAssigning.value = false;
  if (res.success) {
    assignStatusMessage.value = res.message || "تم تسكين الأصناف بنجاح";
    assignStatusError.value = false;
    setTimeout(() => {
      showAssignModal.value = false;
    }, 1200);
  } else {
    assignStatusMessage.value = res.message || "فشل تسكين الأصناف في الرف";
    assignStatusError.value = true;
  }
}

async function handleUnassignItem(item) {
  if (!selectedBin.value) return;
  if (confirm(`هل أنت متأكد من إلغاء تسكين الجهاز رقم (${item.serialNumber}) من هذا الرف؟`)) {
    await binStore.unassignItem(selectedBin.value.id, item.id);
  }
}

async function handleDeleteBin(bin) {
  if (confirm(`هل أنت متأكد من حذف الرف (${bin.code})؟`)) {
    await binStore.deleteBin(bin.id);
  }
}
</script>
