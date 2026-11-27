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
      <div class="flex flex-wrap items-center gap-2">
        <!-- Primary Action 1: Add New Product -->
        <button
          type="button"
          @click="openAddModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-black rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          title="تعريف صنف جديد في دليل الأصناف"
        >
          <Plus class="w-4 h-4" />
          <span>+ تعريف صنف جديد</span>
        </button>

        <!-- Primary Action 2: Purchase / Stock Entry -->
        <router-link
          to="/ohda/purchases"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          title="تسجيل فاتورة شراء وتوريد لزيادة رصيد المخزون فعلياً"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>توريد بضاعة (شراء)</span>
        </router-link>

        <div class="h-6 w-px bg-brand-gray/20 mx-1 hidden sm:block"></div>

        <!-- Utility Tools -->
        <button
          type="button"
          @click="showImportModal = true"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
        >
          <Upload class="w-3.5 h-3.5 text-blue-500" />
          <span>استيراد Excel</span>
        </button>

        <button
          type="button"
          @click="exportExcel"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
        >
          <Download class="w-3.5 h-3.5 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <router-link
          to="/ohda/barcode-print"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          title="طباعة الباركود"
        >
          <Printer class="w-3.5 h-3.5 text-brand-accent" />
          <span>طباعة باركود</span>
        </router-link>

        <button
          type="button"
          @click="downloadTemplate"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          title="تحميل شيت Excel فارغ لإدخال الأصناف"
        >
          <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>قالب Excel</span>
        </button>

        <button
          type="button"
          @click="openDiagnosticModal"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          title="فحص مطابقة رصيد المخزون مع الدفعات والحركات"
        >
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
          <span>فحص المطابقة</span>
        </button>
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

      <!-- Search Field & View Mode Toggle -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <searchField v-model="searchQuery" placeholder="ابحث باسم الصنف، الكود SKU، أو الباركود..." class="flex-1 min-w-[220px]" />
        
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            @click="filterOnlyMissingSerials = !filterOnlyMissingSerials"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5"
            :class="filterOnlyMissingSerials ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30'"
          >
            <QrCode class="w-3.5 h-3.5" />
            <span>ناقص سيريال ({{ missingSerialsProductsCount }})</span>
          </button>

          <!-- Bulk Fix Button if missing serials exist -->
          <button
            v-if="missingSerialsProductsCount > 0"
            type="button"
            @click="disableAllSerialsTrackingBulk"
            :disabled="disablingAllSerials"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            title="حل الخطأ التجاري: إلغاء تتبع السيريالات لكافة الأصناف دفعة واحدة وجعلها أصناف كميات عادية"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>{{ disablingAllSerials ? 'جاري التحويل...' : 'إلغاء تتبع السيريالات للكل (حل الخطأ)' }}</span>
          </button>

          <!-- View Mode Toggle (جدول / بطاقات) -->
          <div class="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/10 border border-brand-gray/15">
            <button
              type="button"
              @click="setViewMode('table')"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="viewMode === 'table' ? 'bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
              title="عرض جدول منظم ومبسط"
            >
              <List class="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
            <button
              type="button"
              @click="setViewMode('grid')"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="viewMode === 'grid' ? 'bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
              title="عرض كروت وبطاقات مرئية"
            >
              <LayoutGrid class="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
          </div>

          <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-1">
            {{ filteredProducts.length }} صنف
          </span>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading && !inventoryStore.products.length" type="table" :count="8" />

    <!-- 1. SIMPLIFIED & STREAMLINED TABLE VIEW -->
    <OhdaDataTable
      v-else-if="viewMode === 'table'"
      :items="filteredProducts"
      :columns="productColumns"
      :loading="inventoryStore.loading"
      empty-title="لا توجد أصناف في المخزن مطابقة لبحثك"
      empty-message="يمكنك إضافة أصناف جديدة بالضغط على زر إضافة صنف بالأعلى أو استخدام قالب الإكسل."
      :rows-per-page="15"
    >
      <!-- Empty State Action -->
      <template #empty-action>
        <button
          type="button"
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </template>

      <!-- Name & Meta Slot -->
      <template #name="{ data }">
        <div class="flex items-center gap-3 py-1">
          <div class="w-9 h-9 rounded-xl bg-brand-accent/15 text-brand-dark dark:text-brand-accent flex items-center justify-center font-bold text-xs shrink-0 border border-brand-accent/20">
            <Package class="w-4 h-4 text-brand-accent" />
          </div>
          <div class="min-w-0">
            <span class="font-bold text-brand-dark dark:text-white text-xs block truncate" :title="data.name">{{ data.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/5 dark:bg-white/10 text-brand-gray dark:text-slate-300">
                {{ data.categoryName || 'عام' }}
              </span>
              <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-soft/60 dark:bg-brand-accent/10 text-brand-accent font-semibold border border-brand-accent/20">
                {{ data.sku || '-' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">
                ({{ data.unit || 'قطعة' }})
              </span>
              <span
                v-if="data.missingSerialsCount > 0"
                class="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 cursor-pointer"
                @click="openSerialsModal(data)"
              >
                ناقص سيريال: {{ data.missingSerialsCount }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Pricing & Margin Slot -->
      <template #pricing="{ data }">
        <div class="py-1">
          <div class="flex items-center gap-1.5 group">
            <span class="font-mono font-black text-brand-dark dark:text-white text-xs">
              {{ (data.sellingPrice ?? data.unitPrice ?? 0).toLocaleString() }} ج.م
            </span>
            <button
              type="button"
              @click="openQuickPriceModal(data)"
              class="p-0.5 text-brand-accent hover:bg-brand-accent/10 rounded cursor-pointer transition"
              title="تعديل سريع للسعر"
            >
              <Edit class="w-3 h-3" />
            </button>
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-[11px] text-brand-gray dark:text-slate-400 font-mono">
            <span>تكلفة: {{ (data.costPrice ?? data.purchasePrice ?? 0).toLocaleString() }} ج.م</span>
            <span
              v-if="(data.sellingPrice || 0) > (data.costPrice || 0) && (data.costPrice || 0) > 0"
              class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded"
            >
              +{{ Math.round((((data.sellingPrice || 0) - (data.costPrice || 0)) / data.costPrice) * 100) }}%
            </span>
          </div>
        </div>
      </template>

      <!-- Stock Status Slot -->
      <template #currentQuantity="{ data }">
        <div class="flex flex-col items-center py-1">
          <div class="flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="(data.currentQuantity ?? data.quantity ?? 0) <= 0 ? 'bg-red-500 animate-pulse' : (isLowStock(data) ? 'bg-amber-500' : 'bg-emerald-500')"
            ></span>
            <span
              class="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg border"
              :class="(data.currentQuantity ?? data.quantity ?? 0) <= 0
                ? 'bg-red-500/15 text-red-600 border-red-500/30'
                : (isLowStock(data) ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')"
            >
              {{ data.currentQuantity ?? data.quantity ?? 0 }} {{ data.unit || 'قطعة' }}
            </span>
          </div>
          <span class="text-[10px] text-slate-400 mt-0.5 font-medium">
            حد الأمان: {{ data.minQuantity ?? data.minThreshold ?? 5 }}
          </span>
        </div>
      </template>

      <!-- Batches & Shelf Location Slot -->
      <template #batches="{ data }">
        <div class="flex flex-col items-center gap-1 py-1">
          <button
            type="button"
            @click="openBatchesModal(data)"
            class="px-2.5 py-1 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-blue-500/25"
            title="عرض دفعات وشحنات الصنف ومواقع الرفوف"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>الدفعات</span>
          </button>
          <span v-if="data.warehouseBinName" class="text-[10px] text-slate-400 font-mono">
            رف: {{ data.warehouseBinName }}
          </span>
        </div>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1 py-1">
          <!-- Edit Product -->
          <button
            type="button"
            @click="openEditModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="تعديل بيانات الصنف"
          >
            <Edit class="w-4 h-4" />
          </button>

          <!-- Movements History Button -->
          <button
            type="button"
            @click="openMovementsHistoryModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="سجل الحركات السابقة"
          >
            <History class="w-4 h-4" />
          </button>

          <!-- Packages Button -->
          <button
            type="button"
            @click="openPackagesModal(data)"
            class="p-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 transition cursor-pointer border border-purple-500/25"
            title="خيارات التعبئة والكراتين"
          >
            <Boxes class="w-4 h-4" />
          </button>

          <!-- Serials Button (if tracked) -->
          <button
            v-if="data.trackSerialNumbers || data.missingSerialsCount > 0"
            type="button"
            @click="openSerialsModal(data)"
            class="p-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
            :class="data.missingSerialsCount > 0 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'"
            title="الأرقام التسلسلية"
          >
            <QrCode class="w-4 h-4" />
          </button>

          <!-- Delete Product -->
          <button
            type="button"
            @click="promptDelete(data)"
            class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer border border-red-500/20"
            title="حذف الصنف"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </OhdaDataTable>

    <!-- 2. MODERN CARDS / GRID VIEW -->
    <div v-else-if="viewMode === 'grid'" class="space-y-4">
      <div v-if="!filteredProducts.length" class="bg-brand-white dark:bg-white/5 p-12 rounded-2xl border border-brand-gray/10 text-center space-y-3">
        <Package class="w-12 h-12 text-slate-300 mx-auto" />
        <h3 class="text-base font-bold text-brand-dark dark:text-white">لا توجد أصناف مطابقة لبحثك</h3>
        <p class="text-xs text-brand-gray">يمكنك إضافة أصناف جديدة بالضغط على زر إضافة صنف بالأعلى.</p>
        <button
          type="button"
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="p in filteredProducts"
          :key="p.id"
          class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
        >
          <!-- Card Header: Category & SKU & Stock Badge -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/5 dark:bg-white/10 text-brand-gray dark:text-slate-300">
                {{ p.categoryName || 'عام' }}
              </span>
              <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-soft/60 dark:bg-brand-accent/10 text-brand-accent font-semibold border border-brand-accent/20">
                {{ p.sku || '-' }}
              </span>
            </div>
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
              :class="(p.currentQuantity ?? p.quantity ?? 0) <= 0 ? 'bg-red-500 animate-pulse' : (isLowStock(p) ? 'bg-amber-500' : 'bg-emerald-500')"
              :title="(p.currentQuantity ?? p.quantity ?? 0) <= 0 ? 'نفد الرصيد' : (isLowStock(p) ? 'رصيد منخفض' : 'متوفر')"
            ></span>
          </div>

          <!-- Card Body: Title & Unit -->
          <div>
            <h3 class="font-bold text-brand-dark dark:text-white text-sm line-clamp-2 group-hover:text-brand-accent transition-colors" :title="p.name">
              {{ p.name }}
            </h3>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 mt-0.5 block">الوحدة: {{ p.unit || 'قطعة' }}</span>
          </div>

          <!-- Stock Level Visual Gauge -->
          <div class="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">الرصيد المتاح:</span>
              <span
                class="font-mono font-black"
                :class="(p.currentQuantity ?? p.quantity ?? 0) <= 0 ? 'text-red-500' : (isLowStock(p) ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400')"
              >
                {{ p.currentQuantity ?? p.quantity ?? 0 }} {{ p.unit || 'قطعة' }}
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="(p.currentQuantity ?? p.quantity ?? 0) <= 0 ? 'bg-red-500' : (isLowStock(p) ? 'bg-amber-500' : 'bg-emerald-500')"
                :style="{ width: Math.min(100, Math.max(10, (((p.currentQuantity ?? p.quantity ?? 0) / Math.max(1, p.minQuantity ?? 5)) * 100))) + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>حد الأمان: {{ p.minQuantity ?? 5 }}</span>
              <span v-if="p.warehouseBinName">رف: {{ p.warehouseBinName }}</span>
            </div>
          </div>

          <!-- Price & Profit Margin -->
          <div class="flex items-center justify-between pt-1 border-t border-brand-gray/10">
            <div>
              <span class="text-[10px] text-slate-400 block">سعر البيع</span>
              <span class="font-mono font-black text-sm text-brand-dark dark:text-white">
                {{ (p.sellingPrice ?? p.unitPrice ?? 0).toLocaleString() }} ج.م
              </span>
            </div>
            <div class="text-left">
              <span class="text-[10px] text-slate-400 block">التكلفة</span>
              <span class="font-mono text-xs text-brand-gray dark:text-slate-400">
                {{ (p.costPrice ?? p.purchasePrice ?? 0).toLocaleString() }} ج.م
              </span>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="pt-2 border-t border-brand-gray/10 flex items-center justify-between gap-1.5">
            <button
              type="button"
              @click="openBatchesModal(p)"
              class="flex-1 py-1.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 border border-blue-500/20"
              title="عرض الدفعات وتواريخ الصلاحية"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>الدفعات</span>
            </button>
            <button
              type="button"
              @click="openEditModal(p)"
              class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
              title="تعديل بيانات الصنف"
            >
              <Edit class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="openMovementsHistoryModal(p)"
              class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray transition cursor-pointer border border-brand-gray/15"
              title="سجل الحركات"
            >
              <History class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="promptDelete(p)"
              class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer border border-red-500/20"
              title="حذف الصنف"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Add / Edit Product Modal using Reusable OhdaModal -->
    <OhdaModal
      :visible="showModal"
      @close="showModal = false"
      :title="isEditing ? 'تعديل بيانات الصنف' : 'تعريف صنف جديد بالدليل (رصيد ابتدائي صفر)'"
      description="تعريف الصنف وتصنيفه وأسعاره بالدليل. تنبيه: الرصيد يبدأ بصفر، وزيادة رصيد المخزون تتم حصراً عبر فواتير المشتريات من المورد."
      :icon="Package"
      max-width="max-w-2xl"
    >
      <form @submit.prevent="saveProduct" id="productForm" class="space-y-4 text-xs">
        <!-- Product Name (Full Width) -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم الصنف / المنتج <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            required
            type="text"
            placeholder="مثال: زيت محرك شل 5W-40، فلتر زيت كورولا 2020، تيل فرامل أمامي..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all text-xs"
          />
        </div>

        <!-- Consistent 2-Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              التصنيف / الفئة <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.categoryId"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-medium focus:border-brand-accent transition-all"
            >
              <option :value="null" disabled>اختر التصنيف...</option>
              <option v-for="cat in inventoryStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Unit -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              وحدة القياس <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.unit"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs font-medium focus:border-brand-accent transition-all cursor-pointer"
            >
              <option v-for="u in commonUnits" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>

          <!-- Cost Price -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              سعر الشراء / التكلفة (ج.م) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.costPrice"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Selling Price -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              سعر البيع للعميل (ج.م) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.sellingPrice"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Quantity Note (Strict Document-Only) -->
          <div class="sm:col-span-2 p-3 bg-brand-light/70 dark:bg-white/5 rounded-xl border border-brand-gray/15">
            <div class="flex items-center justify-between">
              <div>
                <span class="block font-semibold text-brand-dark dark:text-white text-xs">
                  {{ isEditing ? 'رصيد المخزون الحالي' : 'رصيد المخزون الأولي' }}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ isEditing ? 'الرصيد يتم حسابه تلقائياً من دفعات فواتير المشتريات والمبيعات' : 'الأصناف الجديدة تبدأ برصيد صفر. يتم تسجيل رصيد المخزون والتكلفة عبر فواتير المشتريات فقط.' }}
                </span>
              </div>
              <div class="text-end">
                <span class="font-mono font-bold text-sm text-brand-accent px-3 py-1 bg-brand-accent/10 rounded-lg border border-brand-accent/20">
                  {{ form.currentQuantity || 0 }} {{ form.unit }}
                </span>
              </div>
            </div>
          </div>

          <!-- Default Shelf Location -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">موقع الرف الافتراضي</label>
            <input
              v-model="form.defaultShelfLocation"
              type="text"
              placeholder="مثال: رف A-12، عمود 3، مخزن الزيوت..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Min Threshold -->
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              حد الطلب (تنبيه نقص الرصيد) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.minQuantity"
              type="number"
              min="1"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Advanced Options (IsMeasurable, HasExpiryDate, TrackSerialNumbers) -->
          <div class="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1 p-2.5 bg-brand-light/30 dark:bg-white/5 rounded-xl border border-brand-gray/10">
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-dark dark:text-white">
              <input type="checkbox" v-model="form.trackSerialNumbers" class="rounded text-brand-accent focus:ring-brand-accent" />
              <span>يتطلب أرقاماً تسلسلية (Serial Numbers)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-dark dark:text-white">
              <input type="checkbox" v-model="form.hasExpiryDate" class="rounded text-brand-accent focus:ring-brand-accent" />
              <span>صنف له تاريخ صلاحية وانتهاء</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-dark dark:text-white">
              <input type="checkbox" v-model="form.isMeasurable" class="rounded text-brand-accent focus:ring-brand-accent" />
              <span>يقبل كسور وأوزان (مثل لتر بالكسر أو كجم)</span>
            </label>
          </div>

          <!-- SKU with Generator -->
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
            <input
              v-model="form.sku"
              placeholder="يتم التوليد تلقائياً إذا ترك فارغاً"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs uppercase focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Barcode with Generator -->
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
            <input
              v-model="form.barcode"
              placeholder="مسح أو توليد باركود"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Supplier (Optional) -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">المورد المفضل (اختياري)</label>
            <select
              v-model="form.supplierId"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-medium focus:border-brand-accent transition-all"
            >
              <option :value="null">اختر المورد...</option>
              <option v-for="s in inventoryStore.suppliers" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>

          <!-- Description (Optional, Full Width) -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">ملاحظات / وصف (اختياري)</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="مواصفات أو أرقام بديلة أو ملاحظات الاستخدام..."
              class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </form>

      <!-- Sticky Footer Actions -->
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
          form="productForm"
          :disabled="saving"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw v-if="saving" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'حفظ التعديلات' : 'إضافة الصنف' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Batches Modal (الدفعات والشحنات) using OhdaModal -->
    <OhdaModal
      :visible="showBatchesModal"
      @close="showBatchesModal = false"
      :title="`شحنات ودفعات الصنف: ${targetProductForBatches?.name || ''}`"
      description="تتبع شحنات التوريد بتواريخها، مواقع الرفوف، وتكلفة الشراء بنظام FIFO"
      :icon="Layers"
      max-width="max-w-3xl"
    >
      <div class="space-y-4 text-xs">
        <div v-if="loadingBatches" class="py-12 text-center text-slate-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-accent" />
          <span>جاري تحميل بيانات الشحنات...</span>
        </div>

        <div v-else-if="!productBatches.length" class="py-12 text-center text-slate-400">
          <Layers class="w-10 h-10 mx-auto mb-2 opacity-30" />
          <span>لا توجد دفعات نشطة بمخزون متبقٍ لهذا الصنف</span>
        </div>

        <div v-else class="space-y-3">
          <div class="overflow-x-auto border border-brand-gray/10 rounded-2xl">
            <table class="w-full text-right text-xs">
              <thead class="bg-brand-light/70 dark:bg-white/5 border-b border-brand-gray/10 text-brand-dark dark:text-white font-bold">
                <tr>
                  <th class="p-3">كود الدفعة</th>
                  <th class="p-3">تاريخ التوريد</th>
                  <th class="p-3">الصلاحية</th>
                  <th class="p-3">موقع الرف</th>
                  <th class="p-3">التكلفة / وحدة</th>
                  <th class="p-3">الوارد</th>
                  <th class="p-3">المتبقي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-gray/10 text-brand-dark dark:text-slate-300">
                <tr v-for="b in productBatches" :key="b.id" class="hover:bg-brand-soft/20 dark:hover:bg-white/5 transition">
                  <td class="p-3 font-mono font-bold text-brand-accent select-all">{{ b.batchCode }}</td>
                  <td class="p-3 font-mono text-[11px]">{{ formatDateTime(b.receivedDate) }}</td>
                  <td class="p-3 font-mono text-[11px]">{{ b.expiryDate ? formatDateTime(b.expiryDate) : 'غير محدد' }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-md bg-brand-light dark:bg-white/10 font-medium">
                      {{ b.shelfLocation || 'الرف الرئيسي' }}
                    </span>
                  </td>
                  <td class="p-3 font-mono font-semibold">{{ b.costPerBaseUnit?.toLocaleString() }} ج.م</td>
                  <td class="p-3 font-mono text-slate-500">{{ b.quantityReceived }}</td>
                  <td class="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">{{ b.quantityRemaining }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>

    <!-- 2.1 Packaging Modal (خيارات التعبئة والكراتين) using OhdaModal -->
    <OhdaModal
      :visible="showPackagesModal"
      @close="showPackagesModal = false"
      :title="`خيارات التعبئة والتجزئة: ${targetProductForPackages?.name || ''}`"
      description="إدارة أحجام العبوات والكراتين (مثال: كرتونة = 24 علبة) للشراء والبيع بالتجزئة والجملة"
      :icon="Boxes"
      max-width="max-w-xl"
    >
      <div class="space-y-4 text-xs">
        <!-- Existing Packaging Options Table -->
        <div v-if="productPackages.length" class="border border-brand-gray/10 rounded-2xl overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/70 dark:bg-white/5 border-b border-brand-gray/10 text-brand-dark dark:text-white font-bold">
              <tr>
                <th class="p-3">اسم العبوة</th>
                <th class="p-3">المعامل (وحدات أساسية)</th>
                <th class="p-3">الباركود</th>
                <th class="p-3">سعر البيع</th>
                <th class="p-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-for="pkg in productPackages" :key="pkg.id" class="hover:bg-brand-soft/20 dark:hover:bg-white/5">
                <td class="p-3 font-bold text-brand-dark dark:text-white">{{ pkg.name }}</td>
                <td class="p-3 font-mono">{{ pkg.multiplier }} {{ targetProductForPackages?.unit || 'قطعة' }}</td>
                <td class="p-3 font-mono text-[11px] text-brand-accent">{{ pkg.barcode || '-' }}</td>
                <td class="p-3 font-mono font-semibold">{{ pkg.salePrice ? `${pkg.salePrice.toLocaleString()} ج.م` : '-' }}</td>
                <td class="p-3 text-center">
                  <button
                    type="button"
                    @click="deletePackage(pkg.id)"
                    class="p-1 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition"
                    title="حذف خيار التعبئة"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-4 bg-brand-light/40 dark:bg-white/5 rounded-2xl text-center text-slate-400">
          لا توجد خيارات تعبئة مسجلة لهذا الصنف (يباع ويشترى بالوحدة الأساسية فقط).
        </div>

        <!-- Add New Package Form -->
        <div class="p-4 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <h4 class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Plus class="w-4 h-4 text-brand-accent" />
            <span>إضافة حجم عبوة جديد</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1 text-brand-dark dark:text-white">اسم العبوة *</label>
              <input
                v-model="newPackageForm.name"
                placeholder="مثال: كرتونة 24 علبة، طرد 12..."
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white focus:border-brand-accent"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-brand-dark dark:text-white">المعامل بالوحدات الأساسية *</label>
              <input
                v-model.number="newPackageForm.multiplier"
                type="number"
                min="1"
                placeholder="24"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs font-mono font-bold text-brand-dark dark:text-white focus:border-brand-accent"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-brand-dark dark:text-white">باركود العبوة (اختياري)</label>
              <input
                v-model="newPackageForm.barcode"
                placeholder="مسح باركود الكرتونة"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs font-mono text-brand-dark dark:text-white focus:border-brand-accent"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-brand-dark dark:text-white">سعر بيع العبوة (ج.م - اختياري)</label>
              <input
                v-model.number="newPackageForm.salePrice"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs font-mono text-brand-dark dark:text-white focus:border-brand-accent"
              />
            </div>
          </div>

          <button
            type="button"
            @click="submitNewPackage"
            :disabled="savingPackage || !newPackageForm.name || !newPackageForm.multiplier"
            class="px-4 py-2 bg-brand-accent text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90 disabled:opacity-50"
          >
            <RefreshCw v-if="savingPackage" class="w-3.5 h-3.5 animate-spin" />
            <span>حفظ خيار التعبئة</span>
          </button>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>

    <!-- 2.2 Diagnostic Check Modal (فحص مطابقة المخزون والنزاهة) using OhdaModal -->
    <OhdaModal
      :visible="showDiagnosticModal"
      @close="showDiagnosticModal = false"
      title="تقرير فحص مطابقة المخزون والنزاهة المحاسبية"
      description="التحقق التلقائي من تطابق رصيد كل صنف مع مجموع الشحنات (Batches) وسجل الحركات"
      :icon="ShieldCheck"
      max-width="max-w-2xl"
    >
      <div class="space-y-4 text-xs">
        <div v-if="loadingDiagnostic" class="py-12 text-center text-slate-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-accent" />
          <span>جاري مطابقة الأرصدة والدفعات عبر قاعدة البيانات...</span>
        </div>

        <div v-else-if="diagnosticResult" class="space-y-4">
          <!-- Summary Banner -->
          <div
            class="p-4 rounded-2xl border flex items-center gap-3"
            :class="diagnosticResult.hasMismatches ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'"
          >
            <ShieldCheck class="w-6 h-6 shrink-0" />
            <div>
              <strong class="text-sm font-bold block">
                {{ diagnosticResult.hasMismatches ? `تنبيه: تم رصد ${diagnosticResult.mismatchesCount} فروقات في مطابقة الدفعات!` : 'المخزون سليم 100% ومطابق لجميع دفعات التوريد' }}
              </strong>
              <span class="text-xs">
                تم فحص {{ diagnosticResult.totalCheckedProducts }} صنف في الفرع الحالي وفق قاعدة البيانات.
              </span>
            </div>
          </div>

          <!-- Mismatches List if any -->
          <div v-if="diagnosticResult.hasMismatches" class="space-y-2">
            <h4 class="font-bold text-brand-dark dark:text-white">الأصناف التي بها فروقات:</h4>
            <div
              v-for="item in diagnosticResult.discrepancies"
              :key="item.productId"
              class="p-3 bg-brand-light/50 dark:bg-white/5 rounded-xl border border-red-500/20 flex items-center justify-between"
            >
              <div>
                <span class="font-bold text-brand-dark dark:text-white block">{{ item.productName }}</span>
                <span class="text-[10px] text-brand-accent font-mono">{{ item.sku }}</span>
              </div>
              <div class="text-end">
                <span class="font-mono text-xs block text-slate-500">رصيد الصنف: {{ item.productCurrentQuantity }} | مجموع الدفعات: {{ item.sumBatchesRemaining }}</span>
                <span class="text-[10px] text-red-500 font-bold font-mono">الفرق: {{ item.difference }} ({{ item.status }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Movements History Modal using OhdaModal -->
    <OhdaModal
      :visible="showHistoryModal"
      @close="showHistoryModal = false"
      :title="`سجل حركات الصنف: ${targetProductForHistory?.name || ''}`"
      description="تتبع جميع حركات التوريد والصرف والتسويات الجردية السابقة"
      :icon="History"
      max-width="max-w-2xl"
    >
      <div class="space-y-4 text-xs">
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
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>

    <!-- 4. Quick Price Edit Modal using OhdaModal -->
    <OhdaModal
      :visible="showQuickPriceModal"
      @close="showQuickPriceModal = false"
      title="تعديل سريع لسعر البيع"
      :subtitle="targetProductForPrice?.name || ''"
      :icon="Coins"
      max-width="max-w-sm"
    >
      <div v-if="targetProductForPrice" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">سعر البيع الجديد (ج.م)</label>
          <input
            v-model.number="quickSellingPrice"
            type="number"
            step="any"
            min="0"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold text-sm focus:border-brand-accent transition-all"
            autofocus
          />
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="submitQuickPrice"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark cursor-pointer shadow-sm hover:bg-brand-accent/90"
        >
          حفظ السعر
        </button>
      </template>
    </OhdaModal>

    <!-- 5. Delete Confirmation Modal using OhdaModal -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="تأكيد حذف الصنف"
      description="يرجى الانتباه قبل حذف أي صنف مسجل"
      :icon="Trash2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في حذف الصنف <strong>"{{ deletingProduct?.name }}"</strong> من المخزن؟
        </p>
        <p class="text-[11px] text-amber-600 dark:text-amber-400 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          ملاحظة: لا يمكن حذف الصنف إذا كان مرتبطاً بفواتير أو أوامر شغل سابقة.
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
          @click="executeDeleteProduct"
          :disabled="isDeleting"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
          <span>نعم، حذف</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 7. Serials Management & Traceability Modal -->
    <OhdaModal
      :visible="showSerialsModal"
      @close="showSerialsModal = false"
      :title="`سيريالات الصنف: ${targetProductForSerials?.name || ''}`"
      :description="`تتبع حالة كل وحدة (بالمخزن / مباعة / تالفة / مرتجعة) واستكمال الأرقام الناقصة`"
      :icon="QrCode"
      max-width="max-w-4xl"
    >
      <div class="space-y-4 text-xs">
        <div v-if="targetProductForSerials?.missingSerialsCount > 0" class="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2">
          <div class="font-bold text-orange-700 dark:text-orange-300">
            تنبيه: يوجد {{ targetProductForSerials.missingSerialsCount }} وحدة بالمخزن بدون أرقام تسلسلية مسجلة (لا يمكن بيعها قبل استكمال السيريالات).
          </div>
          <div class="flex flex-wrap gap-2">
            <input
              v-model="newSerialsInput"
              type="text"
              placeholder="امسح أو الصق السيريالات الجديدة مفصولة بفاصلة أو مسافة..."
              class="flex-1 px-3 py-2 rounded-xl border border-orange-500/30 bg-white dark:bg-slate-900 font-mono text-xs"
            />
            <button
              type="button"
              @click="submitAddMissingSerials"
              :disabled="savingSerials"
              class="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold cursor-pointer"
            >
              {{ savingSerials ? 'جاري الحفظ...' : 'إضافة السيريالات' }}
            </button>
          </div>
          <div class="mt-2 pt-2 border-t border-orange-500/20 flex items-center justify-between gap-2 flex-wrap">
            <span class="text-[11px] text-orange-800 dark:text-orange-200">
              هل قمت بتفعيل السيريالات بالخطأ أثناء الشراء؟ يمكنك فوراً تحويله لصنف كميات عادي:
            </span>
            <button
              type="button"
              @click="disableSerialTrackingForTarget"
              :disabled="disablingSerials"
              class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>{{ disablingSerials ? 'جاري التحويل...' : 'إلغاء تتبع السيريالات وتحويله لكميات' }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <input
            v-model="serialSearchFilter"
            type="text"
            placeholder="بحث برقم السيريال أو اسم العميل أو الفاتورة..."
            class="flex-1 px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/40 dark:bg-white/5 font-mono text-xs"
          />
          <span class="text-brand-gray font-mono">الإجمالي: {{ filteredProductSerials.length }}</span>
        </div>

        <div v-if="loadingSerials" class="py-10 text-center text-slate-400">جاري تحميل السيريالات...</div>
        <div v-else class="max-h-96 overflow-y-auto border border-brand-gray/15 rounded-xl">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
              <tr>
                <th class="p-2.5">السيريال</th>
                <th class="p-2.5">الحالة</th>
                <th class="p-2.5">الدفعة / تاريخ الشراء</th>
                <th class="p-2.5">المورد</th>
                <th class="p-2.5">فاتورة البيع / العميل</th>
                <th class="p-2.5">انتهاء الضمان</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-if="filteredProductSerials.length === 0">
                <td colspan="6" class="p-6 text-center text-slate-400">لا توجد سيريالات مطابقة</td>
              </tr>
              <tr v-for="s in filteredProductSerials" :key="s.id" class="hover:bg-black/5 dark:hover:bg-white/5">
                <td class="p-2.5 font-mono font-bold text-brand-accent">{{ s.serialNumber }}</td>
                <td class="p-2.5">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="s.status === 1 ? 'bg-emerald-500/15 text-emerald-700' : s.status === 2 ? 'bg-blue-500/15 text-blue-700' : 'bg-red-500/15 text-red-700'"
                  >
                    {{ s.statusName }}
                  </span>
                </td>
                <td class="p-2.5 font-mono text-[11px]">
                  {{ s.batchCode || '—' }}
                  <span class="block text-[10px] text-slate-400">{{ s.purchaseDate ? formatDateTime(s.purchaseDate) : '' }}</span>
                </td>
                <td class="p-2.5">{{ s.supplierName || '—' }}</td>
                <td class="p-2.5">
                  <span class="font-mono font-bold block">{{ s.saleInvoiceNumber || '—' }}</span>
                  <span class="text-[10px] text-slate-400">{{ s.customerName || '' }}</span>
                </td>
                <td class="p-2.5 font-mono text-[11px]">{{ s.warrantyEndDate ? formatDateTime(s.warrantyEndDate) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer="{ close }">
        <div class="flex items-center justify-between w-full gap-2">
          <button
            type="button"
            @click="disableSerialTrackingForTarget"
            :disabled="disablingSerials"
            class="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/30 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="تحويل الصنف لصنف عادي يباع بالكميات وإلغاء السيريالات المعلقة بالمخزن"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>{{ disablingSerials ? 'جاري التحويل...' : 'تحويل لصنف كميات عادي (إلغاء السيريالات)' }}</span>
          </button>
          <button type="button" @click="close" class="px-5 py-2 rounded-xl bg-brand-light dark:bg-white/10 text-xs font-bold cursor-pointer">إغلاق</button>
        </div>
      </template>
    </OhdaModal>

    <!-- 6. Unified Excel Import Modal -->
    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="products"
      entity-label="الأصناف (تعريف فقط)"
      @imported="inventoryStore.fetchProducts()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

import { apiGet, apiPost } from "@/utilities/fetchApi";
import {
  Package,
  Plus,
  ShoppingCart,
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
  Sparkles,
  Layers,
  ShieldCheck,
  QrCode,
  LayoutGrid,
  List
} from "lucide-vue-next";

const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const viewMode = ref(localStorage.getItem("ohda_products_view_mode") || "table");
function setViewMode(mode) {
  viewMode.value = mode;
  localStorage.setItem("ohda_products_view_mode", mode);
}

const searchQuery = ref("");
const selectedCategory = ref(null);
const filterOnlyLowStock = ref(false);
const filterOnlyMissingSerials = ref(false);

const commonUnits = ["قطعة", "لتر", "طقم", "كرتونة", "عبوة", "علبة", "جالون", "متر", "كجم", "برميل"];

// Columns Definition for Reusable OhdaDataTable (Simplified & balanced)
const productColumns = [
  { field: "name", header: "الصنف والبيانات", sortable: true, width: "34%" },
  { field: "pricing", header: "سعر البيع والتكلفة", sortable: true, width: "22%" },
  { field: "currentQuantity", header: "حالة ورصيد المخزون", sortable: true, align: "center", width: "18%" },
  { field: "batches", header: "الدفعات والرف", align: "center", width: "12%" },
  { field: "actions", header: "الإجراءات", align: "center", width: "14%" }
];

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
  description: "",
  isMeasurable: false,
  trackSerialNumbers: false,
  hasExpiryDate: false,
  defaultShelfLocation: ""
});

// Serials State
const showSerialsModal = ref(false);
const targetProductForSerials = ref(null);
const productSerials = ref([]);
const loadingSerials = ref(false);
const serialSearchFilter = ref("");
const newSerialsInput = ref("");
const savingSerials = ref(false);

async function openSerialsModal(product) {
  targetProductForSerials.value = product;
  showSerialsModal.value = true;
  loadingSerials.value = true;
  serialSearchFilter.value = "";
  newSerialsInput.value = "";
  try {
    const res = await apiGet(`/api/ProductItem/product/${product.id}`);
    productSerials.value = res?.data?.objects || [];
  } catch {
    productSerials.value = [];
  } finally {
    loadingSerials.value = false;
  }
}

const filteredProductSerials = computed(() => {
  if (!serialSearchFilter.value?.trim()) return productSerials.value;
  const q = serialSearchFilter.value.toLowerCase().trim();
  return productSerials.value.filter(s =>
    (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
    (s.customerName && s.customerName.toLowerCase().includes(q)) ||
    (s.saleInvoiceNumber && s.saleInvoiceNumber.toLowerCase().includes(q)) ||
    (s.batchCode && s.batchCode.toLowerCase().includes(q))
  );
});

async function submitAddMissingSerials() {
  if (!targetProductForSerials.value || !newSerialsInput.value.trim()) return;
  const tokens = newSerialsInput.value.split(/[\s,;،\n]+/).map(s => s.trim()).filter(Boolean);
  if (!tokens.length) return;
  savingSerials.value = true;
  try {
    const res = await apiPost("/api/ProductItem/add-serials", {
      productId: targetProductForSerials.value.id,
      serialNumbers: tokens
    });
    if (res?.data?.isDone) {
      toastStore.addSuccessToast(res.data.returnMessage);
      newSerialsInput.value = "";
      await Promise.all([
        openSerialsModal(targetProductForSerials.value),
        inventoryStore.fetchProducts()
      ]);
    } else {
      toastStore.addErrorToast(res?.data?.returnMessage || "فشل إضافة السيريالات");
    }
  } finally {
    savingSerials.value = false;
  }
}

const disablingSerials = ref(false);
const disablingAllSerials = ref(false);

async function disableSerialTrackingForTarget() {
  if (!targetProductForSerials.value) return;
  const p = targetProductForSerials.value;
  if (!confirm(`هل أنت متأكد من إلغاء تتبع السيريالات للصنف (${p.name})؟\nسيتم تحويله إلى صنف عادي يباع بالكمية فقط وتصفية السيريالات المعلقة بالمخزن مع الحفاظ على رصيد المخزون وأسعار الشراء بالكامل.`)) {
    return;
  }
  disablingSerials.value = true;
  try {
    const res = await apiPost(`/api/Product/${p.id}/disable-serial-tracking`);
    if (res?.data?.isDone) {
      toastStore.addSuccessToast(res.data.returnMessage || "تم تحويل الصنف لصنف كميات عادي بنجاح");
      showSerialsModal.value = false;
      await inventoryStore.fetchProducts();
    } else {
      toastStore.addErrorToast(res?.data?.returnMessage || "تعذر إلغاء تتبع السيريالات");
    }
  } catch (err) {
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "حدث خطأ أثناء إلغاء تتبع السيريالات");
  } finally {
    disablingSerials.value = false;
  }
}

async function disableAllSerialsTrackingBulk() {
  if (!confirm("هل تريد إلغاء تتبع السيريالات لجميع الأصناف بالفرع دفعة واحدة؟\nسيتم تحويل كافة الأصناف التي كانت تطلب سيريالات إلى أصناف كميات عادية تباع بالعدد مباشرة دون طلب سيريالات، مع الحفاظ على كامل أرصدة المخزون وسجلات الشراء.")) {
    return;
  }
  disablingAllSerials.value = true;
  try {
    const res = await apiPost("/api/Product/disable-all-serials-tracking");
    if (res?.data?.isDone) {
      toastStore.addSuccessToast(res.data.returnMessage || "تم تحويل جميع الأصناف إلى أصناف كميات عادية بنجاح");
      filterOnlyMissingSerials.value = false;
      await inventoryStore.fetchProducts();
    } else {
      toastStore.addErrorToast(res?.data?.returnMessage || "تعذر إلغاء تتبع السيريالات للكل");
    }
  } catch (err) {
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "حدث خطأ أثناء إلغاء تتبع السيريالات للكل");
  } finally {
    disablingAllSerials.value = false;
  }
}

// Batches State
const showBatchesModal = ref(false);
const targetProductForBatches = ref(null);
const productBatches = ref([]);
const loadingBatches = ref(false);

async function openBatchesModal(product) {
  targetProductForBatches.value = product;
  showBatchesModal.value = true;
  loadingBatches.value = true;
  try {
    productBatches.value = await inventoryStore.fetchProductBatches(product.id);
  } catch (err) {
    productBatches.value = [];
  } finally {
    loadingBatches.value = false;
  }
}

// Packages State
const showPackagesModal = ref(false);
const targetProductForPackages = ref(null);
const productPackages = ref([]);
const loadingPackages = ref(false);
const savingPackage = ref(false);
const newPackageForm = ref({
  name: "",
  multiplier: 1,
  barcode: "",
  salePrice: null
});

async function openPackagesModal(product) {
  targetProductForPackages.value = product;
  showPackagesModal.value = true;
  loadingPackages.value = true;
  newPackageForm.value = { name: "", multiplier: 1, barcode: "", salePrice: null };
  try {
    productPackages.value = await inventoryStore.fetchProductPackages(product.id);
  } catch (err) {
    productPackages.value = [];
  } finally {
    loadingPackages.value = false;
  }
}

async function submitNewPackage() {
  if (!targetProductForPackages.value || !newPackageForm.value.name || !newPackageForm.value.multiplier) return;
  savingPackage.value = true;
  try {
    const res = await inventoryStore.addProductPackage(targetProductForPackages.value.id, {
      name: newPackageForm.value.name.trim(),
      multiplier: Number(newPackageForm.value.multiplier),
      barcode: newPackageForm.value.barcode?.trim() || null,
      salePrice: newPackageForm.value.salePrice ? Number(newPackageForm.value.salePrice) : null
    });
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تمت إضافة خيار التعبئة بنجاح");
      productPackages.value = await inventoryStore.fetchProductPackages(targetProductForPackages.value.id);
      newPackageForm.value = { name: "", multiplier: 1, barcode: "", salePrice: null };
    } else {
      toastStore.addErrorToast(res.message);
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء إضافة خيار التعبئة");
  } finally {
    savingPackage.value = false;
  }
}

async function deletePackage(packageId) {
  try {
    const res = await inventoryStore.deleteProductPackage(packageId);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حذف خيار التعبئة");
      productPackages.value = productPackages.value.filter(p => p.id !== packageId);
    } else {
      toastStore.addErrorToast(res.message);
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء الحذف");
  }
}

// Diagnostic State
const showDiagnosticModal = ref(false);
const loadingDiagnostic = ref(false);
const diagnosticResult = ref(null);

async function openDiagnosticModal() {
  showDiagnosticModal.value = true;
  loadingDiagnostic.value = true;
  try {
    const res = await inventoryStore.runInventoryDiagnosticCheck();
    if (res.success) {
      diagnosticResult.value = res.data;
    } else {
      toastStore.addErrorToast(res.message);
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء تشغيل فحص المطابقة");
  } finally {
    loadingDiagnostic.value = false;
  }
}

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

const missingSerialsProductsCount = computed(() => {
  return (inventoryStore.products || []).filter(p => (p.missingSerialsCount || 0) > 0).length;
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

  if (filterOnlyMissingSerials.value) {
    list = list.filter(p => (p.missingSerialsCount || 0) > 0);
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
    description: "",
    isMeasurable: false,
    trackSerialNumbers: false,
    hasExpiryDate: false,
    defaultShelfLocation: ""
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
    description: product.description || "",
    isMeasurable: Boolean(product.isMeasurable),
    trackSerialNumbers: Boolean(product.trackSerialNumbers),
    hasExpiryDate: Boolean(product.hasExpiryDate),
    defaultShelfLocation: product.defaultShelfLocation || ""
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
      currentQuantity: 0, // Strict rule: new definitions have 0 stock
      amount: 0,
      minQuantity: form.value.minQuantity || 5,
      minThreshold: form.value.minQuantity || 5,
      sku: form.value.sku?.trim() || null,
      barcode: form.value.barcode?.trim() || null,
      supplierId: form.value.supplierId || null,
      description: form.value.description || null,
      isMeasurable: form.value.isMeasurable,
      hasExpiryDate: form.value.hasExpiryDate,
      defaultShelfLocation: form.value.defaultShelfLocation?.trim() || null,
      inventoryType: 1
    };

    let res;
    if (isEditing.value) {
      payload.id = editingId.value;
      payload.currentQuantity = form.value.currentQuantity; // preserve existing read-only value
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
    case 1: return "شراء وتوريد جديد";
    case 2: return "صرف مبيعات";
    case 5: return "مرتجع لمورد";
    case 6: return "مرتجع من عميل";
    case 7: return "تالف / هالك";
    default: return "حركة مخزون";
  }
}

function getMovementBadgeClass(type) {
  switch (type) {
    case 1: return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";
    case 2: return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25";
    case 5: return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25";
    case 6: return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25";
    case 7: return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25";
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
