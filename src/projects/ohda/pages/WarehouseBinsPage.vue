<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <Layers class="w-6 h-6 text-brand-accent" />
          {{ $t('ohda.warehouseBins.title') || 'أماكن وأرفف التخزين (Warehouse Bins)' }}
        </h2>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.warehouseBins.subtitle') || 'تنظيم الأرفف والخانات بالمستودع لتسهيل التوريد والسحب وتحديد مواقع الأجهزة بدقة' }}
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

      <!-- Occupied Bins -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">أرفف مشغولة بأجهزة</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ binStore.occupiedBinsCount }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Box class="w-5 h-5" />
        </div>
      </div>

      <!-- Empty Bins -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">أرفف شاغرة</span>
          <h3 class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {{ binStore.emptyBinsCount }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Stored Items -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray">إجمالي القطع المخزنة</span>
          <h3 class="text-2xl font-extrabold text-brand-accent font-mono">
            {{ binStore.totalItemsInBins }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-accent/20 text-brand-dark dark:text-brand-accent flex items-center justify-center">
          <Boxes class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:w-96">
        <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث بكود الرف، الاسم، أو الممر..."
          class="w-full ps-9 pe-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent"
        />
      </div>

      <!-- Department Filter -->
      <div class="flex items-center gap-2 w-full md:w-auto">
        <span class="text-xs font-semibold text-brand-gray whitespace-nowrap">تصفية حسب القسم:</span>
        <select
          v-model="selectedDept"
          @change="onDepartmentFilterChange"
          class="px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent cursor-pointer min-w-[180px]"
        >
          <option :value="null">جميع الأقسام والمستودعات</option>
          <option v-for="d in binStore.departments" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>
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

        <!-- Department -->
        <Column field="departmentName" header="المستودع / القسم">
          <template #body="{ data }">
            <span class="text-brand-dark dark:text-brand-light font-medium">{{ data.departmentName }}</span>
          </template>
        </Column>

        <!-- Aisle & Shelf -->
        <Column header="الممر / الرف">
          <template #body="{ data }">
            <span class="font-mono text-xs text-brand-gray">
              ممر {{ data.aisle || '-' }} / رف {{ data.shelf || '-' }}
            </span>
          </template>
        </Column>

        <!-- Capacity -->
        <Column field="capacity" header="السعة القصوى">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">
              {{ data.capacity ? `${data.capacity} قطعة` : 'غير محدد' }}
            </span>
          </template>
        </Column>

        <!-- Items Count -->
        <Column field="itemsCount" header="القطع المخزنة">
          <template #body="{ data }">
            <button
              type="button"
              @click="viewBinItems(data)"
              class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border"
              :class="data.itemsCount > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-brand-light text-brand-gray border-brand-gray/20'"
            >
              <Box class="w-3.5 h-3.5" />
              <span>{{ data.itemsCount || 0 }} قطعة</span>
            </button>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="الإجراءات" class="text-end">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-1.5">
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
      :header="`الأجهزة المخزنة في الرف: ${selectedBin?.code || ''} (${selectedBin?.name || ''})`"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-3xl w-full !text-brand-dark dark:!text-white"
    >
      <div class="space-y-4 text-xs">
        <div class="flex items-center justify-between p-3 bg-brand-light dark:bg-white/5 rounded-xl border border-brand-gray/10">
          <div class="flex items-center gap-2">
            <span class="text-brand-gray">المستودع:</span>
            <span class="font-bold text-brand-dark dark:text-white">{{ selectedBin?.departmentName }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-brand-gray">إجمالي الأجهزة:</span>
            <span class="font-bold text-brand-accent font-mono">{{ binStore.selectedBinItems.length }}</span>
          </div>
        </div>

        <DataTable
          :value="binStore.selectedBinItems"
          :loading="binStore.loadingItems"
          paginator
          :rows="6"
          class="text-xs"
          emptyMessage="الرف شاغر حالياً ولا يحتوي على أي أجهزة."
        >
          <Column field="serialNumber" header="الرقم التسلسلي">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent select-all">{{ data.serialNumber }}</span>
            </template>
          </Column>
          <Column field="productName" header="اسم الصنف"></Column>
          <Column field="productSKU" header="SKU" class="font-mono"></Column>
          <Column field="statusLabel" header="الحالة">
            <template #body="{ data }">
              <span
                class="px-2 py-0.5 rounded-md font-bold text-[10px]"
                :class="data.status === 1 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'"
              >
                {{ data.statusLabel }}
              </span>
            </template>
          </Column>
        </DataTable>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showItemsModal = false">
            إغلاق
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Add / Edit Bin Dialog -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? 'تعديل بيانات الرف' : 'إضافة رف / خانة تخزين جديدة'"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-lg w-full !text-brand-dark dark:!text-white"
    >
      <form @submit.prevent="handleSaveBin" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">كود الرف (Code)</label>
            <InputText
              v-model="form.code"
              required
              placeholder="مثال: A-01-R01"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">المستودع / القسم</label>
            <select
              v-model="form.departmentId"
              required
              class="w-full px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              <option v-for="d in binStore.departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">اسم الرف / الموقع</label>
          <InputText
            v-model="form.name"
            required
            placeholder="مثال: رف حواسيب Dell المحمولة"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">الممر (Aisle)</label>
            <InputText
              v-model="form.aisle"
              placeholder="مثال: A"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">الرف (Shelf)</label>
            <InputText
              v-model="form.shelf"
              placeholder="مثال: 01"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">السعة القصوى</label>
            <InputText
              v-model.number="form.capacity"
              type="number"
              min="1"
              placeholder="مثال: 50"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1">وصف وملاحظات</label>
          <Textarea
            v-model="form.description"
            rows="2"
            placeholder="ملاحظات حول نوع الأجهزة أو محتويات هذا الرف..."
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

const binStore = useOhdaWarehouseBinStore();

const searchQuery = ref("");
const selectedDept = ref(null);
const showModal = ref(false);
const showItemsModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const selectedBin = ref(null);

const form = ref({
  code: "",
  name: "",
  departmentId: 1,
  aisle: "",
  shelf: "",
  capacity: 50,
  description: "",
  isActive: true
});

onMounted(async () => {
  await binStore.fetchDepartments();
  await binStore.fetchBins();
  if (binStore.departments.length > 0) {
    form.value.departmentId = binStore.departments[0].id;
  }
});

const filteredBins = computed(() => {
  let list = binStore.bins;
  if (selectedDept.value) {
    list = list.filter((b) => b.departmentId === selectedDept.value);
  }
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (b) =>
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.aisle?.toLowerCase().includes(q) ||
      b.shelf?.toLowerCase().includes(q) ||
      b.departmentName?.toLowerCase().includes(q)
  );
});

function onDepartmentFilterChange() {
  binStore.fetchBins(selectedDept.value);
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    code: `BIN-${Math.floor(10 + Math.random() * 90)}-R01`,
    name: "",
    departmentId: binStore.departments[0]?.id || 1,
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
    departmentId: bin.departmentId,
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

async function handleDeleteBin(bin) {
  if (confirm(`هل أنت متأكد من حذف الرف (${bin.code})؟`)) {
    await binStore.deleteBin(bin.id);
  }
}
</script>
