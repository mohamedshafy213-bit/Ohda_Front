<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Package class="w-7 h-7 text-brand-accent" />
          <span>المخزون وقطع الغيار</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          إدارة الأصناف، الزيوت، الفلاتر، قطع الغيار، ومتابعة حركات الوارد والمنصرف والحدود الدنيا
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <router-link
          to="/ohda/barcode-print"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 transition-all shadow-xs"
          title="طباعة الباركود"
        >
          <Printer class="w-4 h-4 text-brand-accent" />
          <span>طباعة باركود</span>
        </router-link>

        <Button
          @click="downloadTemplate"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          title="تحميل شيت Excel فارغ لإدخال الأصناف"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>قالب Excel</span>
        </Button>

        <Button
          @click="exportExcel"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </Button>

        <Button
          @click="showImportModal = true"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          <span>استيراد Excel</span>
        </Button>

        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Package class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">عدد الأصناف</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ inventoryStore.totalProductsCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Boxes class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي قطع المخزون</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ totalQuantitySum }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">قيمة المخزون (شراء)</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ totalCostSum.toLocaleString('en-US', { maximumFractionDigits: 0 }) }} ج.م</span>
        </div>
      </div>

      <div
        @click="filterOnlyLowStock = !filterOnlyLowStock"
        class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all"
        :class="filterOnlyLowStock ? 'border-amber-500 bg-amber-500/10' : 'border-brand-gray/10 hover:border-amber-500/40'"
      >
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">تنبيهات نقص الرصيد</span>
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ lowStockItemsCount }}</span>
            <span v-if="filterOnlyLowStock" class="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">فلترة نشطة</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Low-Stock Alert Warning Banner -->
    <div
      v-if="lowStockItemsCount > 0 && !filterOnlyLowStock"
      class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200"
    >
      <div class="flex items-center gap-2.5">
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          يوجد <strong>{{ lowStockItemsCount }}</strong> أصناف وصلت لحد الأمان أو أوشكت على النفاد وتحتاج إلى إعادة طلب وتوريد.
        </span>
      </div>
      <button
        @click="filterOnlyLowStock = true"
        class="text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:text-amber-900 cursor-pointer"
      >
        عرض الأصناف المنخفضة فقط &larr;
      </button>
    </div>

    <!-- Category Filters Tabs & Search Bar -->
    <div class="space-y-3">
      <!-- Category Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="selectedCategory = null; filterOnlyLowStock = false"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="!selectedCategory && !filterOnlyLowStock ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          الكل ({{ inventoryStore.products.length }})
        </button>

        <button
          v-for="cat in inventoryStore.categories"
          :key="cat.id"
          type="button"
          @click="selectedCategory = cat.id; filterOnlyLowStock = false"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="selectedCategory === cat.id ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          {{ cat.name }} ({{ countProductsInCategory(cat.id) }})
        </button>
      </div>

      <!-- Search Field -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <searchField v-model="searchQuery" placeholder="ابحث باسم الصنف، الكود SKU، أو الباركود..." class="flex-1" />
        <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
          عرض {{ filteredProducts.length }} من {{ inventoryStore.products.length }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading && !inventoryStore.products.length" type="table" :count="8" />

    <!-- Products DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredProducts"
        paginator
        :rows="15"
        :rowsPerPageOptions="[10, 15, 30, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            title="لا توجد أصناف في المخزن مطابقة لبحثك"
            icon="Package"
            actionLabel="إضافة صنف جديد"
            @action="openAddModal"
          />
        </template>

        <!-- Product Name & Category -->
        <Column field="name" header="الصنف / المنتج" sortable headerClass="text-start">
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.name }}</span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400">{{ data.categoryName || 'عام' }}</span>
            </div>
          </template>
        </Column>

        <!-- Code / SKU -->
        <Column field="sku" header="كود الصنف (SKU)" sortable headerClass="text-start" style="width: 140px">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold select-all text-xs">{{ data.sku || '-' }}</span>
          </template>
        </Column>

        <!-- Unit -->
        <Column field="unit" header="الوحدة" headerClass="text-center" bodyClass="text-center" style="width: 80px">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
              {{ data.unit || 'قطعة' }}
            </span>
          </template>
        </Column>

        <!-- Cost Price (Purchase) -->
        <Column field="costPrice" header="سعر التكلفة" sortable headerClass="text-start" style="width: 110px">
          <template #body="{ data }">
            <span class="font-mono font-semibold text-brand-gray dark:text-slate-400 text-xs">
              {{ (data.costPrice ?? data.purchasePrice ?? 0).toLocaleString() }} ج.م
            </span>
          </template>
        </Column>

        <!-- Selling Price -->
        <Column field="sellingPrice" header="سعر البيع" sortable headerClass="text-start" style="width: 130px">
          <template #body="{ data }">
            <div class="flex items-center gap-1.5 group">
              <span class="font-mono font-bold text-brand-dark dark:text-white text-xs">
                {{ (data.sellingPrice ?? data.unitPrice ?? 0).toLocaleString() }} ج.م
              </span>
              <button
                type="button"
                @click="openQuickPriceModal(data)"
                class="opacity-0 group-hover:opacity-100 p-1 text-brand-accent hover:bg-brand-accent/10 rounded cursor-pointer transition"
                title="تعديل سريع للسعر"
              >
                <Edit class="w-3 h-3" />
              </button>
            </div>
          </template>
        </Column>

        <!-- Current Quantity -->
        <Column field="currentQuantity" header="الرصيد المتاح" sortable headerClass="text-center" bodyClass="text-center" style="width: 110px">
          <template #body="{ data }">
            <div class="inline-flex flex-col items-center">
              <span
                class="font-mono font-bold text-sm px-2 py-0.5 rounded-lg"
                :class="isLowStock(data) ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
              >
                {{ data.currentQuantity ?? data.quantity ?? 0 }}
              </span>
              <span v-if="isLowStock(data)" class="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                (منخفض)
              </span>
            </div>
          </template>
        </Column>

        <!-- Min Threshold -->
        <Column field="minQuantity" header="حد الطلب" headerClass="text-center" bodyClass="text-center" style="width: 80px">
          <template #body="{ data }">
            <span class="font-mono text-slate-400 text-xs">{{ data.minQuantity ?? data.minThreshold ?? 5 }}</span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="الإجراءات" headerClass="text-center" bodyClass="text-center" style="width: 170px; min-width: 170px">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-1.5">
              <!-- Quick Stock Movement Button (+ / -) -->
              <button
                type="button"
                @click="openStockMovementModal(data)"
                class="px-2 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-emerald-500/25"
                title="تسجيل حركة مخزون (توريد / تسوية)"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>حركة</span>
              </button>

              <!-- Movements History Button -->
              <button
                type="button"
                @click="openMovementsHistoryModal(data)"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
                title="سجل الحركات السابقة"
              >
                <History class="w-3.5 h-3.5" />
              </button>

              <!-- Edit Product -->
              <button
                type="button"
                @click="openEditModal(data)"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
                title="تعديل بيانات الصنف"
              >
                <Edit class="w-3.5 h-3.5" />
              </button>

              <!-- Delete Product -->
              <button
                type="button"
                @click="promptDelete(data)"
                class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer border border-red-500/20"
                title="حذف الصنف"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- 1. Add / Edit Product Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزون'"
      class="max-w-xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="saveProduct" class="space-y-4 text-xs pt-2">
        <!-- Product Name -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم الصنف / المنتج <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="form.name"
            required
            placeholder="مثال: زيت محرك شل 5W-40، فلتر زيت كورولا 2020، تيل فرامل أمامي..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-medium rounded-xl"
            autofocus
          />
        </div>

        <!-- Category & Unit -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              التصنيف / الفئة <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="form.categoryId"
              :options="inventoryStore.categories"
              optionLabel="name"
              optionValue="id"
              placeholder="اختر التصنيف..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              وحدة القياس <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="form.unit"
              :options="commonUnits"
              editable
              placeholder="اختر أو اكتب الوحدة..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
        </div>

        <!-- Cost Price & Selling Price -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              سعر الشراء / التكلفة (ج.م) <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.costPrice"
              :min="0"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              placeholder="0.00"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              سعر البيع للعميل (ج.م) <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.sellingPrice"
              :min="0"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              placeholder="0.00"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
            />
          </div>
        </div>

        <!-- Initial Quantity & Min Threshold -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              {{ isEditing ? 'الرصيد الحالي' : 'الرصيد المبدئي' }} <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.currentQuantity"
              :min="0"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              حد الطلب (تنبيه نقص الرصيد) <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.minQuantity"
              :min="1"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
            />
          </div>
        </div>

        <!-- SKU and Barcode (Optional with Auto-Generate Helper) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-semibold text-brand-dark dark:text-white">الكود / SKU (اختياري)</label>
              <button
                type="button"
                @click="generateSku"
                class="text-[10px] text-brand-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles class="w-3 h-3" />
                <span>توليد تلقائي</span>
              </button>
            </div>
            <InputText
              v-model="form.sku"
              placeholder="يتم التوليد تلقائياً إذا ترك فارغاً"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono rounded-xl uppercase"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-semibold text-brand-dark dark:text-white">الباركود (اختياري)</label>
              <button
                type="button"
                @click="generateBarcode"
                class="text-[10px] text-brand-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles class="w-3 h-3" />
                <span>توليد تلقائي</span>
              </button>
            </div>
            <InputText
              v-model="form.barcode"
              placeholder="مسح أو توليد باركود"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono rounded-xl"
            />
          </div>
        </div>

        <!-- Supplier & Description -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">المورد (اختياري)</label>
            <Select
              v-model="form.supplierId"
              :options="inventoryStore.suppliers"
              optionLabel="companyName"
              optionValue="id"
              showClear
              placeholder="اختر المورد..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">ملاحظات / وصف (اختياري)</label>
            <InputText
              v-model="form.description"
              placeholder="مواصفات أو أرقام بديلة..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
        </div>

        <!-- Dialog Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showModal = false"
            class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs font-semibold cursor-pointer"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            :disabled="saving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw v-if="saving" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'حفظ التعديلات' : 'إضافة الصنف' }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- 2. Stock Movement Modal (+ / -) -->
    <Dialog
      v-model:visible="showMovementModal"
      modal
      header="تسجيل حركة مخزون جديدة"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetProductForMovement" class="space-y-4 text-xs pt-2">
        <!-- Target Product Summary -->
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/10 flex items-center justify-between">
          <div>
            <span class="font-bold text-brand-dark dark:text-white block">{{ targetProductForMovement.name }}</span>
            <span class="text-[10px] text-brand-accent font-mono">{{ targetProductForMovement.sku }}</span>
          </div>
          <div class="text-end">
            <span class="text-[10px] text-brand-gray dark:text-slate-400 block">الرصيد الحالي:</span>
            <span class="font-mono font-bold text-sm text-brand-dark dark:text-white">
              {{ targetProductForMovement.currentQuantity ?? targetProductForMovement.quantity ?? 0 }} {{ targetProductForMovement.unit || 'قطعة' }}
            </span>
          </div>
        </div>

        <!-- Movement Type Selection -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">نوع الحركة</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition"
              :class="movementForm.movementType === 1 ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-brand-gray/20 hover:bg-white/5'"
            >
              <input type="radio" :value="1" v-model="movementForm.movementType" />
              <span>توريد / شراء جديد (+)</span>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition"
              :class="movementForm.movementType === 3 ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-bold' : 'border-brand-gray/20 hover:bg-white/5'"
            >
              <input type="radio" :value="3" v-model="movementForm.movementType" />
              <span>تسوية جردية (+/-)</span>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition"
              :class="movementForm.movementType === 4 ? 'bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 font-bold' : 'border-brand-gray/20 hover:bg-white/5'"
            >
              <input type="radio" :value="4" v-model="movementForm.movementType" />
              <span>مرتجع للمخزن (+)</span>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition"
              :class="movementForm.movementType === 2 ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold' : 'border-brand-gray/20 hover:bg-white/5'"
            >
              <input type="radio" :value="2" v-model="movementForm.movementType" />
              <span>صرف يدوي / تالف (-)</span>
            </label>
          </div>
        </div>

        <!-- Quantity & Calculated Preview -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">الكمية</label>
            <InputNumber
              v-model="movementForm.quantity"
              :min="0.1"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">الرصيد بعد الحركة</label>
            <div class="h-10 flex items-center px-3 rounded-xl bg-brand-light dark:bg-white/5 border border-brand-gray/20 font-mono font-bold text-sm text-brand-accent">
              {{ previewQuantityAfter }} {{ targetProductForMovement.unit || 'قطعة' }}
            </div>
          </div>
        </div>

        <!-- Reference & Notes -->
        <div class="space-y-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">البيان / رقم الفاتورة أو الإذن</label>
            <InputText
              v-model="movementForm.reference"
              placeholder="مثال: فاتورة توريد رقم 102، تسوية جرد أسبوعي..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">ملاحظات إضافية (اختياري)</label>
            <InputText
              v-model="movementForm.notes"
              placeholder="أي تفاصيل أو ملاحظات حول الحركة..."
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showMovementModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>

          <Button
            type="button"
            @click="submitStockMovement"
            :disabled="savingMovement"
            class="!bg-emerald-600 hover:!bg-emerald-500 !text-white !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="savingMovement" class="w-4 h-4 animate-spin" />
            <span>تأكيد وتسجيل الحركة</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- 3. Movements History Modal -->
    <Dialog
      v-model:visible="showHistoryModal"
      modal
      :header="`سجل حركات الصنف: ${targetProductForHistory?.name || ''}`"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs pt-2">
        <div v-if="loadingHistory" class="py-12 text-center text-slate-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-accent" />
          <span>جاري تحميل سجل الحركات...</span>
        </div>

        <div v-else-if="!productMovements.length" class="py-12 text-center text-slate-400">
          <History class="w-10 h-10 mx-auto mb-2 opacity-30" />
          <span>لا توجد حركات مسجلة لهذا الصنف حتى الآن</span>
        </div>

        <div v-else class="max-h-96 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="m in productMovements"
            :key="m.id"
            class="p-3 rounded-xl border border-brand-gray/10 bg-brand-light/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="getMovementBadgeClass(m.movementType)"
                >
                  {{ getMovementTypeName(m.movementType) }}
                </span>
                <span class="font-bold text-brand-dark dark:text-white font-mono text-xs">
                  {{ m.quantity > 0 ? `+${m.quantity}` : m.quantity }}
                </span>
                <span class="text-[10px] text-brand-gray dark:text-slate-400 font-mono">
                  (الرصيد: {{ m.quantityBefore }} &rarr; {{ m.quantityAfter }})
                </span>
              </div>

              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span v-if="m.reference" class="font-medium text-brand-dark dark:text-slate-300">{{ m.reference }} - </span>
                <span>{{ m.notes || 'لا توجد ملاحظات' }}</span>
              </div>
            </div>

            <div class="text-end shrink-0">
              <span class="text-[10px] text-brand-gray dark:text-slate-400 block font-mono">
                {{ formatDateTime(m.movementDate) }}
              </span>
              <span class="text-[10px] text-brand-accent font-semibold block">
                بواسطة: {{ m.userName || 'المسؤول' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showHistoryModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 !text-xs cursor-pointer"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- 4. Quick Price Edit Modal -->
    <Dialog
      v-model:visible="showQuickPriceModal"
      modal
      header="تعديل سريع لسعر البيع"
      class="max-w-xs w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetProductForPrice" class="space-y-4 text-xs pt-2">
        <p class="font-bold text-brand-dark dark:text-white">{{ targetProductForPrice.name }}</p>
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">سعر البيع الجديد (ج.م)</label>
          <InputNumber
            v-model="quickSellingPrice"
            :min="0"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono font-bold"
            autofocus
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showQuickPriceModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            @click="submitQuickPrice"
            class="!bg-brand-accent !text-brand-dark font-bold !rounded-xl !px-4 !py-2 !text-xs cursor-pointer shadow-sm"
          >
            حفظ السعر
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- 5. Delete Confirmation Modal -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      header="تأكيد حذف الصنف"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs pt-2">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في حذف الصنف <strong>"{{ deletingProduct?.name }}"</strong> من المخزن؟
        </p>
        <p class="text-[11px] text-amber-600 dark:text-amber-400">
          ملاحظة: لا يمكن حذف الصنف إذا كان مرتبطاً بفواتير أو أوامر شغل سابقة.
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
            @click="executeDeleteProduct"
            :disabled="isDeleting"
            class="!bg-red-600 hover:!bg-red-500 !text-white !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
            <span>نعم، حذف</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- 6. Excel Import Modal -->
    <Dialog
      v-model:visible="showImportModal"
      modal
      header="استيراد أصناف من ملف إكسل"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs pt-2">
        <p class="text-slate-600 dark:text-slate-300">
          اختر ملف Excel (.xlsx) يحتوي على الأصناف لإضافتها مباشرة إلى المخزن. يفضل استخدام نموذج Excel المتاح بالأعلى.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          @change="onFileSelected"
          class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-accent/20 file:text-brand-accent hover:file:bg-brand-accent/30 cursor-pointer"
        />

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showImportModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            @click="submitExcelImport"
            :disabled="!selectedFile || isImporting"
            class="!bg-brand-accent !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="isImporting" class="w-4 h-4 animate-spin" />
            <span>بدء الاستيراد</span>
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";

import {
  Package,
  Plus,
  Edit,
  Trash2,
  History,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Boxes,
  Coins,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-vue-next";

const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const selectedCategory = ref(null);
const filterOnlyLowStock = ref(false);

const commonUnits = ["قطعة", "لتر", "جالون", "طقم", "عبوة", "متر", "كرتونة"];

// Add/Edit Form State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = ref({
  name: "",
  categoryId: null,
  unit: "قطعة",
  costPrice: 0,
  sellingPrice: 0,
  currentQuantity: 0,
  minQuantity: 5,
  sku: "",
  barcode: "",
  supplierId: null,
  description: ""
});

// Stock Movement State
const showMovementModal = ref(false);
const targetProductForMovement = ref(null);
const savingMovement = ref(false);
const movementForm = ref({
  movementType: 1, // 1: PurchaseIn, 2: JobUsed, 3: ManualAdjustment, 4: Return
  quantity: 1,
  reference: "",
  notes: ""
});

// History State
const showHistoryModal = ref(false);
const targetProductForHistory = ref(null);
const productMovements = ref([]);
const loadingHistory = ref(false);

// Quick Price Edit State
const showQuickPriceModal = ref(false);
const targetProductForPrice = ref(null);
const quickSellingPrice = ref(0);

// Delete Modal State
const showDeleteModal = ref(false);
const deletingProduct = ref(null);
const isDeleting = ref(false);

// Import Modal State
const showImportModal = ref(false);
const selectedFile = ref(null);
const isImporting = ref(false);

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchProducts(),
    inventoryStore.fetchCategories(),
    inventoryStore.fetchSuppliers()
  ]);
});

// Computed Metrics
const totalQuantitySum = computed(() => {
  return inventoryStore.products.reduce((acc, p) => acc + (Number(p.currentQuantity ?? p.quantity) || 0), 0);
});

const totalCostSum = computed(() => {
  return inventoryStore.products.reduce((acc, p) => {
    const qty = Number(p.currentQuantity ?? p.quantity) || 0;
    const cost = Number(p.costPrice ?? p.purchasePrice) || 0;
    return acc + (qty * cost);
  }, 0);
});

const lowStockItemsCount = computed(() => {
  return inventoryStore.products.filter(p => isLowStock(p)).length;
});

function isLowStock(product) {
  const current = Number(product.currentQuantity ?? product.quantity) || 0;
  const min = Number(product.minQuantity ?? product.minThreshold) || 5;
  return current <= min;
}

function countProductsInCategory(catId) {
  return inventoryStore.products.filter(p => p.categoryId === catId).length;
}

// Filtered Products
const filteredProducts = computed(() => {
  let list = inventoryStore.products || [];

  if (filterOnlyLowStock.value) {
    list = list.filter(p => isLowStock(p));
  }

  if (selectedCategory.value) {
    list = list.filter(p => p.categoryId === selectedCategory.value);
  }

  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  }

  return list;
});

// Preview Quantity After Movement
const previewQuantityAfter = computed(() => {
  if (!targetProductForMovement.value) return 0;
  const current = Number(targetProductForMovement.value.currentQuantity ?? targetProductForMovement.value.quantity) || 0;
  const qty = Number(movementForm.value.quantity) || 0;

  if (movementForm.value.movementType === 2) {
    // Deduct
    return Math.max(0, current - qty);
  } else {
    // Add / Purchase / Return / Adjustment
    return current + qty;
  }
});

// Modal Actions
function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    name: "",
    categoryId: inventoryStore.categories[0]?.id || null,
    unit: "قطعة",
    costPrice: 0,
    sellingPrice: 0,
    currentQuantity: 0,
    minQuantity: 5,
    sku: "",
    barcode: "",
    supplierId: null,
    description: ""
  };
  generateSku();
  showModal.value = true;
}

function openEditModal(product) {
  isEditing.value = true;
  editingId.value = product.id;
  form.value = {
    name: product.name,
    categoryId: product.categoryId,
    unit: product.unit || "قطعة",
    costPrice: Number(product.costPrice ?? product.purchasePrice) || 0,
    sellingPrice: Number(product.sellingPrice ?? product.unitPrice) || 0,
    currentQuantity: Number(product.currentQuantity ?? product.quantity) || 0,
    minQuantity: Number(product.minQuantity ?? product.minThreshold) || 5,
    sku: product.sku || "",
    barcode: product.barcode || "",
    supplierId: product.supplierId || null,
    description: product.description || ""
  };
  showModal.value = true;
}

function generateSku() {
  const d = new Date();
  const yr = String(d.getFullYear()).slice(-2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  form.value.sku = `PRD-${yr}${mo}-${rand}`;
}

function generateBarcode() {
  const rand = Math.floor(100000000000 + Math.random() * 900000000000);
  form.value.barcode = `629${rand.toString().slice(-9)}`;
}

async function saveProduct() {
  if (!form.value.name?.trim()) {
    toastStore.addErrorToast("اسم الصنف مطلوب");
    return;
  }
  if (!form.value.categoryId) {
    toastStore.addErrorToast("يرجى اختيار تصنيف الصنف");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      categoryId: form.value.categoryId,
      unit: form.value.unit || "قطعة",
      costPrice: form.value.costPrice || 0,
      purchasePrice: form.value.costPrice || 0,
      sellingPrice: form.value.sellingPrice || 0,
      unitPrice: form.value.sellingPrice || 0,
      currentQuantity: form.value.currentQuantity || 0,
      amount: form.value.currentQuantity || 0,
      minQuantity: form.value.minQuantity || 5,
      minThreshold: form.value.minQuantity || 5,
      sku: form.value.sku?.trim() || null,
      barcode: form.value.barcode?.trim() || null,
      supplierId: form.value.supplierId || null,
      description: form.value.description || null,
      inventoryType: 1 // Default consumable/merchandise
    };

    let res;
    if (isEditing.value) {
      payload.id = editingId.value;
      res = await inventoryStore.updateProduct(editingId.value, payload);
    } else {
      res = await inventoryStore.addProduct(payload);
    }

    if (res.success) {
      toastStore.addSuccessToast(res.message || (isEditing.value ? "تم تحديث الصنف بنجاح" : "تمت إضافة الصنف بنجاح"));
      showModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشلت العملية");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حفظ الصنف");
  } finally {
    saving.value = false;
  }
}

// Stock Movement
function openStockMovementModal(product) {
  targetProductForMovement.value = product;
  movementForm.value = {
    movementType: 1, // PurchaseIn
    quantity: 1,
    reference: "",
    notes: ""
  };
  showMovementModal.value = true;
}

async function submitStockMovement() {
  if (!targetProductForMovement.value) return;
  if (!movementForm.value.quantity || movementForm.value.quantity <= 0) {
    toastStore.addErrorToast("الكمية يجب أن تكون أكبر من صفر");
    return;
  }

  savingMovement.value = true;
  try {
    const payload = {
      productId: targetProductForMovement.value.id,
      movementType: movementForm.value.movementType,
      quantity: movementForm.value.quantity,
      costPrice: targetProductForMovement.value.costPrice ?? targetProductForMovement.value.purchasePrice,
      sellingPrice: targetProductForMovement.value.sellingPrice ?? targetProductForMovement.value.unitPrice,
      reference: movementForm.value.reference?.trim() || null,
      notes: movementForm.value.notes?.trim() || null
    };

    const res = await inventoryStore.recordStockMovement(payload);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم تسجيل حركة المخزون بنجاح");
      showMovementModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشل تسجيل الحركة");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء تسجيل حركة المخزون");
  } finally {
    savingMovement.value = false;
  }
}

// Movements History
async function openMovementsHistoryModal(product) {
  targetProductForHistory.value = product;
  showHistoryModal.value = true;
  loadingHistory.value = true;
  try {
    productMovements.value = await inventoryStore.fetchProductMovements(product.id);
  } catch (err) {
    productMovements.value = [];
  } finally {
    loadingHistory.value = false;
  }
}

function getMovementTypeName(type) {
  switch (type) {
    case 1: return "توريد / شراء جديد";
    case 2: return "صرف لعملية صيانة";
    case 3: return "تسوية جردية";
    case 4: return "مرتجع للمخزن";
    default: return "حركة مخزون";
  }
}

function getMovementBadgeClass(type) {
  switch (type) {
    case 1: return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";
    case 2: return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25";
    case 3: return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25";
    case 4: return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25";
    default: return "bg-slate-500/15 text-slate-600 border border-slate-500/25";
  }
}

function formatDateTime(dtStr) {
  if (!dtStr) return "-";
  try {
    const d = new Date(dtStr);
    return d.toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dtStr;
  }
}

// Quick Price Edit
function openQuickPriceModal(product) {
  targetProductForPrice.value = product;
  quickSellingPrice.value = Number(product.sellingPrice ?? product.unitPrice) || 0;
  showQuickPriceModal.value = true;
}

async function submitQuickPrice() {
  if (!targetProductForPrice.value) return;
  try {
    const res = await inventoryStore.quickUpdateProduct({
      id: targetProductForPrice.value.id,
      sellingPrice: quickSellingPrice.value
    });
    if (res.success) {
      toastStore.addSuccessToast("تم تحديث سعر البيع بنجاح");
      showQuickPriceModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشل التحديث");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء تحديث السعر");
  }
}

// Delete Product
function promptDelete(product) {
  deletingProduct.value = product;
  showDeleteModal.value = true;
}

async function executeDeleteProduct() {
  if (!deletingProduct.value) return;
  isDeleting.value = true;
  try {
    const res = await inventoryStore.deleteProduct(deletingProduct.value.id);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حذف الصنف بنجاح");
      showDeleteModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشل حذف الصنف");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حذف الصنف");
  } finally {
    isDeleting.value = false;
  }
}

// Excel Actions
function exportExcel() {
  inventoryStore.exportExcel("products");
}

function downloadTemplate() {
  inventoryStore.downloadExcelTemplate();
}

function onFileSelected(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
}

async function submitExcelImport() {
  if (!selectedFile.value) return;
  isImporting.value = true;
  try {
    const res = await inventoryStore.importExcelProducts(selectedFile.value);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم استيراد الأصناف بنجاح");
      showImportModal.value = false;
      selectedFile.value = null;
    } else {
      toastStore.addErrorToast(res.message || "فشل استيراد الملف");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء الاستيراد");
  } finally {
    isImporting.value = false;
  }
}
</script>
