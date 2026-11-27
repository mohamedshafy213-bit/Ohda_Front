<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Boxes class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.inventory.title') || 'إدارة المخزون والأرصدة' }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.inventory.subTitle') || 'متابعة كميات قطع الغيار، حركات التوريد والصرف، والجرد الفعلي للأصناف' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- 1. Print Stocktaking Audit Sheet PDF -->
        <button
          type="button"
          @click="printStocktakingSheet"
          :disabled="isPrintingSheet"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition disabled:opacity-50"
          title="طباعة استمارة ورقية رسمية لكافة الأصناف للقيام بالجرد اليدوي في الورشة والمستودع"
        >
          <Printer class="w-4 h-4" />
          <span>{{ isPrintingSheet ? 'جاري تجهيز الاستمارة...' : 'طباعة استمارة الجرد (PDF)' }}</span>
        </button>

        <!-- 2. Physical Stocktaking & Discrepancy Reconciliation Button -->
        <button
          type="button"
          @click="openStockAuditModal"
          class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition"
          title="فتح شاشة مقارنة الجرد الفعلي برصيد السيستم وتسوية الفروقات والعجز"
        >
          <ClipboardCheck class="w-4 h-4" />
          <span>جرد المخزون الفعلي والمطابقة</span>
        </button>

        <!-- 3. Import PDF -->
        <button
          type="button"
          @click="showPdfModal = true"
          class="px-4 py-2.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
        >
          <Upload class="w-4 h-4 text-brand-accent" />
          <span>{{ $t('ohda.inventory.pdfImportTitle') || 'استيراد PDF' }}</span>
        </button>

        <!-- 4. Export Excel -->
        <button
          type="button"
          @click="inventoryStore.exportToExcel('products')"
          class="px-4 py-2.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>{{ $t('ohda.common.exportExcel') || 'تصدير Excel' }}</span>
        </button>
      </div>
    </div>

    <!-- Inventory KPI Overview Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs text-brand-gray dark:text-slate-400 block">إجمالي الأصناف</span>
          <strong class="text-xl font-black text-brand-dark dark:text-white font-mono mt-0.5 block">
            {{ totalProductsCount }}
          </strong>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-soft/70 dark:bg-white/10 flex items-center justify-center text-brand-accent">
          <Boxes class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs text-brand-gray dark:text-slate-400 block">إجمالي قطع المخزن</span>
          <strong class="text-xl font-black text-brand-dark dark:text-white font-mono mt-0.5 block">
            {{ totalStockQuantity.toLocaleString() }}
          </strong>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs text-brand-gray dark:text-slate-400 block">قيمة المخزون (بالتكلفة)</span>
          <strong class="text-xl font-black text-brand-dark dark:text-white font-mono mt-0.5 block">
            {{ totalValuationCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} <span class="text-xs font-normal text-brand-gray">ج.م</span>
          </strong>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs text-brand-gray dark:text-slate-400 block">أصناف منخفضة / نفدت</span>
          <strong class="text-xl font-black text-red-600 font-mono mt-0.5 block">
            {{ lowOrOutOfStockCount }}
          </strong>
        </div>
        <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
          <AlertTriangle class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="w-full md:w-96">
        <searchField v-model="searchQuery" :placeholder="'ابحث باسم الصنف، كود SKU، التصنيف، أو الباركود...'" />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="stockFilter = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'all' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.common.all') || 'الكل' }} ({{ totalProductsCount }})
        </button>
        <button
          type="button"
          @click="stockFilter = 'low'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'low' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.inventory.lowStock') || 'منخفض الرصيد' }} ({{ lowStockCount }})
        </button>
        <button
          type="button"
          @click="stockFilter = 'out'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
          :class="stockFilter === 'out' ? 'bg-red-500/15 text-red-600 border-red-500/30 font-bold' : 'text-brand-gray dark:text-slate-400 border-brand-gray/10 hover:bg-brand-light dark:hover:bg-white/5'"
        >
          {{ $t('ohda.inventory.outOfStock') || 'نفد الرصيد (0)' }} ({{ outOfStockCount }})
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading" type="table" :count="6" />

    <!-- Modern Clean Inventory Stock DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredProducts"
        paginator
        :rows="12"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.inventory.emptyInventory') || 'لا توجد أصناف مسجلة في المخزن'"
            icon="Boxes"
          />
        </template>

        <!-- Product & Info -->
        <Column field="name" header="الصنف وبياناته" sortable>
          <template #body="{ data }">
            <div class="py-1">
              <div class="font-bold text-sm text-brand-dark dark:text-white flex items-center gap-1.5">
                <span>{{ data.name }}</span>
                <span v-if="data.trackSerialNumbers" class="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-normal">
                  سيريالات
                </span>
              </div>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-brand-gray dark:text-slate-400">
                <span class="font-mono text-brand-accent font-semibold">{{ data.sku || '-' }}</span>
                <span class="text-slate-300 dark:text-slate-600">•</span>
                <span>{{ data.categoryName || 'عام' }}</span>
                <span v-if="data.defaultShelfLocation" class="px-1.5 py-0.5 rounded bg-brand-light dark:bg-white/5 text-[10px] font-mono">
                  رف: {{ data.defaultShelfLocation }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Current Available Stock -->
        <Column field="quantity" header="الرصيد المتاح" sortable>
          <template #body="{ data }">
            <div class="flex items-baseline gap-1.5">
              <span class="font-black text-base font-mono" :class="getStockColorClass(data)">
                {{ Number(data.quantity ?? data.amount ?? 0).toLocaleString() }}
              </span>
              <span class="text-[10px] text-brand-gray">{{ data.unit || 'قطعة' }}</span>
            </div>
          </template>
        </Column>

        <!-- Cost & Selling Valuation -->
        <Column header="التكلفة / البيع">
          <template #body="{ data }">
            <div class="space-y-0.5 text-[11px]">
              <div>
                <span class="text-brand-gray">تكلفة: </span>
                <span class="font-mono font-bold">{{ Number(data.costPrice ?? data.purchasePrice ?? 0).toFixed(2) }} ج.م</span>
              </div>
              <div>
                <span class="text-brand-gray">بيع: </span>
                <span class="font-mono font-bold text-brand-accent">{{ Number(data.sellingPrice ?? data.unitPrice ?? 0).toFixed(2) }} ج.م</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Stock Level Progress Meter -->
        <Column header="مستوى حد الأمان" class="w-40">
          <template #body="{ data }">
            <div class="space-y-1">
              <div class="w-full bg-brand-light dark:bg-white/10 rounded-full h-2 overflow-hidden border border-brand-gray/15">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getBarColor(data)"
                  :style="{ width: `${getBarWidth(data)}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-brand-gray font-mono">
                <span>حد الأمان: {{ getMinThreshold(data) }}</span>
                <span>{{ getSafePercentage(data) }}%</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Stock Status Badge -->
        <Column header="الحالة">
          <template #body="{ data }">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block"
              :class="getStatusBadgeClass(data)"
            >
              {{ getStatusText(data) }}
            </span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="الإجراءات" class="w-24 text-center">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-1">
              <button
                type="button"
                @click="promptAdjustStock(data)"
                class="p-1.5 rounded-lg text-brand-dark dark:text-slate-300 hover:text-brand-accent hover:bg-brand-soft/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="تعديل سريع للرصيد"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                type="button"
                @click="promptDeleteProduct(data)"
                class="p-1.5 rounded-lg text-brand-dark dark:text-slate-300 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="حذف الصنف ورصيده"
              >
                <Trash class="w-4 h-4" />
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- 1. Quick Adjust Stock Modal (OhdaModal) -->
    <OhdaModal
      :visible="showAdjustModal"
      @close="showAdjustModal = false"
      :title="'تعديل رصيد المخزون'"
      :description="'تعديل الكمية المسجلة للصنف يدوياً'"
      :icon="Edit3"
      max-width="max-w-md"
    >
      <div v-if="selectedProductForAdjust" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/10 space-y-1">
          <div class="font-bold text-sm text-brand-dark dark:text-white">{{ selectedProductForAdjust.name }}</div>
          <div class="text-[11px] text-brand-gray font-mono">SKU: {{ selectedProductForAdjust.sku }}</div>
          <div class="text-[11px] text-brand-accent font-bold">
            الرصيد الحالي بالمخزن: {{ selectedProductForAdjust.quantity || selectedProductForAdjust.amount || 0 }}
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block font-semibold text-brand-dark dark:text-slate-200">الرصيد الجديد بالمخزون:</label>
          <input
            type="number"
            min="0"
            v-model.number="newStockQuantity"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-white dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            @click="newStockQuantity = 0"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 cursor-pointer"
          >
            تصفية الرصيد إلى (0)
          </button>
          <button
            type="button"
            @click="newStockQuantity = (selectedProductForAdjust.quantity || selectedProductForAdjust.amount || 0) + 5"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-soft text-brand-accent hover:bg-brand-soft/80 border border-brand-accent/20 cursor-pointer"
          >
            +5 إضافة
          </button>
          <button
            type="button"
            @click="newStockQuantity = (selectedProductForAdjust.quantity || selectedProductForAdjust.amount || 0) + 10"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-soft text-brand-accent hover:bg-brand-soft/80 border border-brand-accent/20 cursor-pointer"
          >
            +10 إضافة
          </button>
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-brand-gray hover:bg-brand-light dark:hover:bg-white/5 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            :disabled="isSubmittingAdjust"
            @click="submitStockAdjustment"
            class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs shadow-md cursor-pointer transition disabled:opacity-50"
          >
            {{ isSubmittingAdjust ? 'جاري الحفظ...' : 'حفظ الرصيد' }}
          </button>
        </div>
      </template>
    </OhdaModal>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="'الصنف'"
      :itemName="selectedProductForDelete?.name || ''"
      :canDelete="true"
      :warningMessage="(selectedProductForDelete?.quantity ?? selectedProductForDelete?.amount ?? 0) > 0 ? `سيتم حذف هذا الصنف ورصيده في المخزون (${selectedProductForDelete?.quantity ?? selectedProductForDelete?.amount ?? 0}) نهائياً.` : ''"
      @confirm="handleDeleteProduct"
    />

    <!-- 2. PDF Upload Modal (OhdaModal) -->
    <OhdaModal
      :visible="showPdfModal"
      @close="showPdfModal = false"
      :title="$t('ohda.inventory.pdfImportModalTitle') || 'استيراد فواتير المخزون عبر PDF'"
      :description="'رفع وتحليل فواتير المشتريات والمخزون'"
      :icon="Upload"
      max-width="max-w-lg"
    >
      <div class="space-y-4 text-xs">
        <div
          class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light dark:bg-white/5 transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onPdfDrop"
          @click="triggerPdfSelect"
        >
          <Upload class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="font-bold text-brand-dark dark:text-white mb-1">
            {{ $t('ohda.inventory.pdfImportSub') || 'اسحب وأفلت ملف PDF هنا' }}
          </p>
          <span class="text-[10px] text-brand-gray dark:text-slate-400 block mb-4">
            {{ $t('ohda.inventory.pdfOnlyNotice') || 'يدعم ملفات PDF فقط' }}
          </span>
          <input type="file" ref="pdfInput" accept=".pdf" class="hidden" @change="onPdfSelected" />
          <button
            type="button"
            class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            {{ $t('ohda.inventory.browseFiles') || 'تصفح الملفات' }}
          </button>
        </div>

        <div v-if="uploadingPdf" class="space-y-2">
          <div class="flex justify-between text-brand-gray dark:text-slate-400">
            <span>{{ $t('ohda.inventory.analyzingPdf') || 'جاري تحليل ملف PDF...' }}</span>
            <span class="font-bold text-brand-accent">PDF...</span>
          </div>
          <div class="w-full bg-brand-light dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div class="bg-brand-accent h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
          </div>
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-end w-full">
          <button
            type="button"
            @click="close"
            class="px-5 py-2 rounded-xl text-xs font-bold text-brand-gray hover:bg-brand-light dark:hover:bg-white/5 transition cursor-pointer"
          >
            {{ $t('ohda.common.close') || 'إغلاق' }}
          </button>
        </div>
      </template>
    </OhdaModal>

    <!-- ======================================================== -->
    <!-- 3. PHYSICAL STOCK AUDIT MODAL (OhdaModal - max-w-6xl)   -->
    <!-- ======================================================== -->
    <OhdaModal
      :visible="showStockAuditModal"
      @close="showStockAuditModal = false"
      :title="'شاشة جرد المخزون الفعلي ومطابقة الفروقات'"
      :description="'مقارنة الجرد الفعلي للمستودع برصيد السيستم واعتماد الفروقات والتسويات'"
      :icon="ClipboardCheck"
      max-width="max-w-6xl"
    >
      <div class="space-y-4 text-xs">
        <!-- Live Audit Discrepancies KPI Ribbon -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/10">
            <span class="text-[11px] text-brand-gray block">إجمالي أصناف الجرد</span>
            <strong class="text-base font-black text-brand-dark dark:text-white font-mono block mt-0.5">
              {{ auditItems.length }} صنف
            </strong>
          </div>

          <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <span class="text-[11px] text-emerald-700 dark:text-emerald-300 block">أصناف مطابقة تماماً</span>
            <strong class="text-base font-black text-emerald-600 font-mono block mt-0.5">
              {{ auditMatchingCount }} صنف ({{ Math.round((auditMatchingCount / (auditItems.length || 1)) * 100) }}%)
            </strong>
          </div>

          <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <span class="text-[11px] text-red-700 dark:text-red-300 block">أصناف بها عجز (نقص)</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <strong class="text-base font-black text-red-600 font-mono">
                {{ auditShortageCount }} صنف
              </strong>
              <span class="text-[10px] text-red-500 font-mono font-bold">
                (خسارة: {{ auditTotalShortageCost.toFixed(2) }} ج.م)
              </span>
            </div>
          </div>

          <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <span class="text-[11px] text-blue-700 dark:text-blue-300 block">أصناف بها زيادة</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <strong class="text-base font-black text-blue-600 font-mono">
                {{ auditSurplusCount }} صنف
              </strong>
              <span class="text-[10px] text-blue-500 font-mono font-bold">
                (+{{ auditTotalSurplusCost.toFixed(2) }} ج.م)
              </span>
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-brand-light/50 dark:bg-white/5 p-3 rounded-2xl border border-brand-gray/10">
          <div class="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              v-model="auditSearchQuery"
              placeholder="ابحث في كشف الجرد بالاسم أو كود SKU..."
              class="w-full px-3 py-1.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              @click="showDiscrepanciesOnly = !showDiscrepanciesOnly"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5"
              :class="showDiscrepanciesOnly ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-white/5 text-brand-dark dark:text-white border-brand-gray/20'"
            >
              <span>عرض الفروقات فقط</span>
              <span class="font-mono">({{ auditShortageCount + auditSurplusCount }})</span>
            </button>

            <button
              type="button"
              @click="fillAllActualWithSystem"
              class="px-3 py-1.5 rounded-xl bg-brand-soft text-brand-accent border border-brand-accent/25 hover:bg-brand-soft/80 text-xs font-bold cursor-pointer transition"
              title="ملء جميع خانات الجرد الفعلي برصيد السيستم لتسهيل تعديل الأصناف المختلفة فقط"
            >
              ملء برصيد السيستم
            </button>

            <button
              type="button"
              @click="resetAllActualToZero"
              class="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold cursor-pointer transition"
              title="تصفير خانات الجرد الفعلي بالكامل"
            >
              تصفير الكل
            </button>
          </div>
        </div>

        <!-- Audit Items Table -->
        <div v-if="loadingAuditSheet" class="py-12 text-center text-brand-gray">
          جاري تحميل بيانات كشف الجرد...
        </div>
        <div v-else class="max-h-[50vh] overflow-y-auto border border-brand-gray/15 rounded-2xl">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/70 dark:bg-white/10 text-brand-gray font-bold sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th class="p-2.5">كود الصنف</th>
                <th class="p-2.5">اسم الصنف والتصنيف</th>
                <th class="p-2.5">الرف</th>
                <th class="p-2.5 text-center">رصيد السيستم</th>
                <th class="p-2.5 text-center min-w-[140px]">الجرد الفعلي</th>
                <th class="p-2.5 text-center">الفارق</th>
                <th class="p-2.5 text-center">أثر التكلفة</th>
                <th class="p-2.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-if="filteredAuditItems.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-400">لا توجد أصناف مطابقة للبحث أو الفلتر.</td>
              </tr>
              <tr
                v-for="item in filteredAuditItems"
                :key="item.productId"
                class="hover:bg-black/5 dark:hover:bg-white/5 transition"
                :class="item.diff < 0 ? 'bg-red-500/5' : item.diff > 0 ? 'bg-blue-500/5' : ''"
              >
                <td class="p-2.5 font-mono font-bold text-brand-accent select-all">{{ item.sku }}</td>
                <td class="p-2.5">
                  <div class="font-bold text-brand-dark dark:text-white">{{ item.name }}</div>
                  <div class="text-[10px] text-brand-gray">{{ item.categoryName }} • {{ item.unit }}</div>
                </td>
                <td class="p-2.5 font-mono text-[11px] text-brand-gray">{{ item.defaultShelfLocation || '—' }}</td>
                <td class="p-2.5 text-center font-mono font-bold text-sm">{{ item.systemQuantity }}</td>
                <td class="p-2.5">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      @click="item.actualQuantity = Math.max(0, (item.actualQuantity || 0) - 1)"
                      class="w-6 h-6 rounded-lg bg-brand-light dark:bg-white/10 hover:bg-brand-gray/20 font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      v-model.number="item.actualQuantity"
                      class="w-16 px-2 py-1 text-center font-mono font-black text-sm rounded-lg border border-brand-gray/25 bg-white dark:bg-slate-900 focus:outline-none focus:border-brand-accent"
                    />
                    <button
                      type="button"
                      @click="item.actualQuantity = (item.actualQuantity || 0) + 1"
                      class="w-6 h-6 rounded-lg bg-brand-light dark:bg-white/10 hover:bg-brand-gray/20 font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      @click="item.actualQuantity = item.systemQuantity"
                      class="p-1 rounded-md text-[10px] bg-brand-soft text-brand-accent hover:bg-brand-soft/80 cursor-pointer"
                      title="مطابقة رصيد السيستم"
                    >
                      =
                    </button>
                  </div>
                </td>
                <td class="p-2.5 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block"
                    :class="item.diff === 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : item.diff < 0 ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'"
                  >
                    {{ item.diff === 0 ? 'مطابق ✓' : item.diff < 0 ? `عجز (${item.diff})` : `زيادة (+${item.diff})` }}
                  </span>
                </td>
                <td class="p-2.5 text-center font-mono font-bold" :class="item.diffCost < 0 ? 'text-red-600' : item.diffCost > 0 ? 'text-blue-600' : 'text-slate-400'">
                  {{ item.diffCost === 0 ? '0.00' : (item.diffCost > 0 ? `+${item.diffCost.toFixed(2)}` : item.diffCost.toFixed(2)) }}
                </td>
                <td class="p-2.5">
                  <input
                    type="text"
                    v-model="item.notes"
                    placeholder="ملاحظات..."
                    class="w-full px-2 py-1 rounded-lg border border-brand-gray/15 bg-white dark:bg-white/5 text-[11px] focus:outline-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-between w-full">
          <button
            type="button"
            @click="close"
            class="px-5 py-2.5 rounded-xl bg-brand-light dark:bg-white/10 text-xs font-bold cursor-pointer hover:bg-black/5 transition"
          >
            إغلاق
          </button>

          <button
            type="button"
            @click="handleProceedReconcile"
            :disabled="isReconciling"
            class="px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition disabled:opacity-50"
            :class="auditShortageCount > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>
              {{ auditShortageCount > 0 ? 'تسوية فروقات العجز واعتماد الجرد' : (auditSurplusCount > 0 ? 'اعتماد الجرد وتوريد الزيادات' : 'اعتماد الجرد (الأرصدة متطابقة تماماً)') }}
            </span>
          </button>
        </div>
      </template>
    </OhdaModal>

    <!-- ======================================================== -->
    <!-- 4. ADMIN SETTLEMENT DECISION MODAL (OhdaModal - max-w-2xl)-->
    <!-- ======================================================== -->
    <OhdaModal
      :visible="showSettlementDialog"
      @close="showSettlementDialog = false"
      :title="'خيارات الإدارة لتسوية العجز المخزني'"
      :description="'تحديد المعالجة الإدارية والمحاسبية المعتمدة للعجز في الجرد'"
      :icon="AlertTriangle"
      max-width="max-w-2xl"
    >
      <div class="space-y-4 text-xs">
        <!-- Shortage Summary Card -->
        <div class="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-2">
          <div class="flex items-center justify-between">
            <strong class="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle class="w-4 h-4" />
              تم رصد عجز في الجرد الفعلي لعدد {{ auditShortageCount }} صنف
            </strong>
            <span class="text-xs font-mono font-bold text-red-600">
              إجمالي قيمة العجز: {{ auditTotalShortageCost.toFixed(2) }} ج.م (تكلفة)
            </span>
          </div>
          <p class="text-[11px] text-red-800 dark:text-red-200">
            يرجى تحديد الطريقة المحاسبية والإدارية المعتمدة لتسوية هذا العجز وضبط أرصدة المخزون:
          </p>
        </div>

        <!-- 3 Settlement Options -->
        <div class="space-y-3">
          <!-- Option 1: Deduct from Employee / Storekeeper Salary -->
          <label
            class="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
            :class="settlementType === 1 ? 'border-brand-accent bg-brand-soft/40 dark:bg-brand-accent/10 shadow-xs' : 'border-brand-gray/20 hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <input
              type="radio"
              name="settlement"
              :value="1"
              v-model="settlementType"
              class="mt-1 text-brand-accent focus:ring-brand-accent"
            />
            <div class="flex-1 space-y-2">
              <div class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <UserCheck class="w-4 h-4 text-brand-accent" />
                <span>1. تحميل العجز على أمين المخزن أو الموظف المسؤول (خصم من الراتب)</span>
              </div>
              <p class="text-[11px] text-brand-gray">
                يتم تسجيل بند خصم رسمي على راتب الموظف في مسير الرواتب المعتمد لهذا الشهر أو الشهر القادم، وتعديل أرصدة الأصناف.
              </p>

              <!-- Option 1 Sub-Form -->
              <div v-if="settlementType === 1" class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/70 dark:bg-black/20 p-3 rounded-xl border border-brand-gray/15">
                <div>
                  <label class="block text-[11px] font-bold text-brand-dark dark:text-slate-300 mb-1">
                    الموظف / أمين المخزن المسؤول: *
                  </label>
                  <select
                    v-model="selectedEmployeeId"
                    class="w-full px-3 py-2 rounded-xl border border-brand-gray/20 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-brand-accent"
                  >
                    <option :value="null">-- اختر الموظف لتحميل العجز عليه --</option>
                    <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">
                      {{ emp.name }} ({{ emp.jobTitle || 'موظف' }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-brand-dark dark:text-slate-300 mb-1">
                    شهر وسنة الخصم:
                  </label>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="deductionMonth"
                      class="flex-1 px-3 py-2 rounded-xl border border-brand-gray/20 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                    >
                      <option v-for="m in 12" :key="m" :value="m">شهر {{ m }}</option>
                    </select>
                    <select
                      v-model="deductionYear"
                      class="w-24 px-3 py-2 rounded-xl border border-brand-gray/20 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                    >
                      <option :value="2026">2026</option>
                      <option :value="2027">2027</option>
                    </select>
                  </div>
                </div>

                <div class="sm:col-span-2 flex items-center gap-2">
                  <label class="flex items-center gap-2 cursor-pointer text-[11px] text-brand-dark dark:text-white">
                    <input
                      type="checkbox"
                      v-model="useSellingPriceForDeduction"
                      class="rounded text-brand-accent"
                    />
                    <span>
                      محاسبة الموظف بسعر البيع ({{ auditTotalShortageSelling.toFixed(2) }} ج.م) بدلاً من سعر التكلفة ({{ auditTotalShortageCost.toFixed(2) }} ج.م)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </label>

          <!-- Option 2: Write Off Damage (Approved Loss - لا يتحمله أحد) -->
          <label
            class="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
            :class="settlementType === 2 ? 'border-brand-accent bg-brand-soft/40 dark:bg-brand-accent/10 shadow-xs' : 'border-brand-gray/20 hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <input
              type="radio"
              name="settlement"
              :value="2"
              v-model="settlementType"
              class="mt-1 text-brand-accent focus:ring-brand-accent"
            />
            <div class="flex-1">
              <div class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <FileText class="w-4 h-4 text-amber-600" />
                <span>2. تسجيل العجز كأمر هالك وتالف معتمد للمركز (خسارة مركز - لا يتحمله أحد)</span>
              </div>
              <p class="text-[11px] text-brand-gray mt-1">
                يصدر النظام سند إتلاف مخزني رسمي بسبب الفقد والضياع، وتُدرج قيمته كخسارة هالك معتمدة في التقرير المالي لإقفال الشهر دون تحميل أي موظف.
              </p>
            </div>
          </label>

          <!-- Option 3: Convert to Sales Invoice -->
          <label
            class="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
            :class="settlementType === 3 ? 'border-brand-accent bg-brand-soft/40 dark:bg-brand-accent/10 shadow-xs' : 'border-brand-gray/20 hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <input
              type="radio"
              name="settlement"
              :value="3"
              v-model="settlementType"
              class="mt-1 text-brand-accent focus:ring-brand-accent"
            />
            <div class="flex-1">
              <div class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <DollarSign class="w-4 h-4 text-emerald-600" />
                <span>3. إصدار فاتورة مبيعات مباشرة بالعجز</span>
              </div>
              <p class="text-[11px] text-brand-gray mt-1">
                يقوم النظام بإصدار فاتورة بيع مباشرة للأصناف الناقصة لإثبات خروجها بيعاً، وضبط رصيد النقدية والمبيعات.
              </p>
            </div>
          </label>
        </div>

        <!-- Surplus Notice if any -->
        <div v-if="auditSurplusCount > 0" class="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
          <strong>ملاحظة الزيادات:</strong> يوجد {{ auditSurplusCount }} صنف به زيادة (+{{ auditTotalSurplusCost.toFixed(2) }} ج.م) — سيقوم النظام تلقائياً بإنشاء دفعة تسوية واردة للمخزن وإضافتها للرصيد المتاح.
        </div>

        <!-- Settlement Notes -->
        <div class="space-y-1">
          <label class="block text-[11px] font-semibold text-brand-dark dark:text-slate-300">
            ملاحظات وتوجيهات الإدارة على محضر الجرد والتسوية:
          </label>
          <input
            type="text"
            v-model="settlementNotes"
            placeholder="مثال: جرد نهاية شهر معتمد، تم التوجيه بالخصم..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-white dark:bg-white/5 text-xs focus:outline-none focus:border-brand-accent"
          />
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-brand-gray hover:bg-brand-light dark:hover:bg-white/5 transition cursor-pointer"
          >
            تراجع
          </button>
          <button
            type="button"
            @click="executeFinalReconciliation"
            :disabled="isReconciling"
            class="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-black text-xs shadow-md cursor-pointer transition disabled:opacity-50"
          >
            {{ isReconciling ? 'جاري تنفيذ التسوية...' : 'تأكيد واعتماد التسوية وتحديث المخزون' }}
          </button>
        </div>
      </template>
    </OhdaModal>

    <!-- ======================================================== -->
    <!-- 5. CONFIRM MATCHING / SURPLUS RECONCILIATION MODAL      -->
    <!-- ======================================================== -->
    <OhdaModal
      :visible="showConfirmReconcileModal"
      @close="showConfirmReconcileModal = false"
      :title="auditSurplusCount > 0 ? 'اعتماد الجرد وتوريد الزيادات' : 'اعتماد محضر الجرد (الأرصدة متطابقة)'"
      :description="'تثبيت نتيجة الجرد الفعلي في سجلات النظام الرسمية'"
      :icon="auditSurplusCount > 0 ? Boxes : CheckCircle2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <div
          class="p-4 rounded-2xl border"
          :class="auditSurplusCount > 0 ? 'bg-blue-500/10 border-blue-500/25 text-blue-800 dark:text-blue-200' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'"
        >
          <p class="font-bold text-sm mb-1">
            {{ auditSurplusCount > 0 ? `يوجد ${auditSurplusCount} أصناف بها زيادة بقيمة (+${auditTotalSurplusCost.toFixed(2)} ج.م)` : 'كافة الأصناف مطابقة تماماً لرصيد السيستم بدون أي عجز!' }}
          </p>
          <p class="text-[11px] leading-relaxed">
            {{ auditSurplusCount > 0 ? 'عند الاعتماد، سيقوم النظام تلقائياً بإنشاء دفعة تسوية واردة وتحديث رصيد المخزون ليطابق العد الفعلي.' : 'سيتم توثيق تاريخ الجرد واعتماد المطابقة التامة في تقارير المخزون.' }}
          </p>
        </div>
      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-brand-gray hover:bg-brand-light dark:hover:bg-white/5 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            @click="executeFinalReconciliation"
            :disabled="isReconciling"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {{ isReconciling ? 'جاري الاعتماد...' : 'تأكيد واعتماد الجرد' }}
          </button>
        </div>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import apiClient from "@/utilities/apiClient";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import OhdaModal from "../components/OhdaModal.vue";
import searchField from "@/components/searchField.vue";
import { downloadServerPdf } from "../utils/pdfHelper";

import {
  Boxes,
  Upload,
  Download,
  Printer,
  ClipboardCheck,
  Edit3,
  Trash,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  UserCheck,
  FileText
} from "lucide-vue-next";

const { t } = useI18n();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const stockFilter = ref("all");
const showPdfModal = ref(false);
const uploadingPdf = ref(false);
const pdfInput = ref(null);
const isPrintingSheet = ref(false);

const showAdjustModal = ref(false);
const selectedProductForAdjust = ref(null);
const newStockQuantity = ref(0);
const isSubmittingAdjust = ref(false);

const showDeleteDialog = ref(false);
const selectedProductForDelete = ref(null);

// -------------------------------------------------------------
// Stock Audit & Reconciliation State
// -------------------------------------------------------------
const showStockAuditModal = ref(false);
const loadingAuditSheet = ref(false);
const auditItems = ref([]);
const auditSearchQuery = ref("");
const showDiscrepanciesOnly = ref(false);

// Settlement Dialog State
const showSettlementDialog = ref(false);
const showConfirmReconcileModal = ref(false);
const isReconciling = ref(false);
const settlementType = ref(2); // 1 = DeductFromEmployee, 2 = WriteOffDamage, 3 = ConvertToSalesInvoice
const selectedEmployeeId = ref(null);
const deductionMonth = ref(new Date().getMonth() + 1);
const deductionYear = ref(new Date().getFullYear());
const useSellingPriceForDeduction = ref(false);
const settlementNotes = ref("");
const employeesList = ref([]);

onMounted(() => {
  inventoryStore.fetchProducts();
  inventoryStore.fetchInventory();
  loadEmployees();
});

async function loadEmployees() {
  try {
    const res = await apiClient.get("/api/Employee");
    employeesList.value = res.data?.objects || res.data?.Objects || [];
  } catch (err) {
    console.warn("Failed to load employees for settlement:", err);
  }
}

// -------------------------------------------------------------
// Inventory Statistics Computations
// -------------------------------------------------------------
const allProducts = computed(() => inventoryStore.products || []);

const totalProductsCount = computed(() => allProducts.value.length);

const totalStockQuantity = computed(() => {
  return allProducts.value.reduce((sum, p) => sum + Number(p.quantity ?? p.amount ?? 0), 0);
});

const totalValuationCost = computed(() => {
  return allProducts.value.reduce((sum, p) => {
    const qty = Number(p.quantity ?? p.amount ?? 0);
    const cost = Number(p.costPrice ?? p.purchasePrice ?? 0);
    return sum + (qty * cost);
  }, 0);
});

const lowStockCount = computed(() => {
  return allProducts.value.filter(p => {
    const qty = Number(p.quantity ?? p.amount ?? 0);
    const min = getMinThreshold(p);
    return qty > 0 && qty <= min;
  }).length;
});

const outOfStockCount = computed(() => {
  return allProducts.value.filter(p => Number(p.quantity ?? p.amount ?? 0) === 0).length;
});

const lowOrOutOfStockCount = computed(() => lowStockCount.value + outOfStockCount.value);

const filteredProducts = computed(() => {
  let list = allProducts.value;

  if (stockFilter.value === "low") {
    list = list.filter(p => {
      const min = getMinThreshold(p);
      const qty = Number(p.quantity || p.amount || 0);
      return qty > 0 && qty <= min;
    });
  } else if (stockFilter.value === "out") {
    list = list.filter(p => Number(p.quantity || p.amount || 0) === 0);
  }

  if (searchQuery.value?.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      p => p.name?.toLowerCase().includes(q) ||
           p.sku?.toLowerCase().includes(q) ||
           p.categoryName?.toLowerCase().includes(q) ||
           p.barcode?.toLowerCase().includes(q)
    );
  }

  return list;
});

// -------------------------------------------------------------
// Print Stocktaking Audit Sheet PDF
// -------------------------------------------------------------
async function printStocktakingSheet() {
  isPrintingSheet.value = true;
  try {
    await downloadServerPdf(
      "/api/ReportsPdf/stocktaking-sheet?paperSize=A4Landscape",
      `استمارة_جرد_المخزون_${new Date().toISOString().slice(0, 10)}.pdf`
    );
    toastStore.addSuccessToast("تم تحميل استمارة جرد المخزون الرسمية للطباعة بنجاح");
  } catch (err) {
    toastStore.addErrorToast("تعذر تحميل استمارة الجرد");
  } finally {
    isPrintingSheet.value = false;
  }
}

// -------------------------------------------------------------
// Stock Audit Modal Handlers
// -------------------------------------------------------------
async function openStockAuditModal() {
  showStockAuditModal.value = true;
  loadingAuditSheet.value = true;
  auditSearchQuery.value = "";
  showDiscrepanciesOnly.value = false;
  try {
    const res = await apiClient.get("/api/StockAudit/sheet");
    const prods = res.data?.objects || [];
    auditItems.value = prods.map(p => ({
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      categoryName: p.categoryName,
      unit: p.unit,
      defaultShelfLocation: p.defaultShelfLocation,
      costPrice: p.costPrice || 0,
      sellingPrice: p.sellingPrice || 0,
      systemQuantity: p.systemQuantity || 0,
      actualQuantity: p.systemQuantity || 0, // defaults to system quantity for fast entry
      notes: ""
    }));
  } catch (err) {
    toastStore.addErrorToast("تعذر تحميل كشف الجرد من الخادم");
    auditItems.value = [];
  } finally {
    loadingAuditSheet.value = false;
  }
}

function fillAllActualWithSystem() {
  auditItems.value.forEach(i => {
    i.actualQuantity = i.systemQuantity;
  });
  toastStore.addSuccessToast("تم ملء الكميات الفعلية برصيد السيستم");
}

function resetAllActualToZero() {
  auditItems.value.forEach(i => {
    i.actualQuantity = 0;
  });
}

// Computed for each item's difference
const auditItemsWithDiff = computed(() => {
  return auditItems.value.map(i => {
    const act = Number(i.actualQuantity || 0);
    const sys = Number(i.systemQuantity || 0);
    const diff = act - sys;
    const diffCost = diff * Number(i.costPrice || 0);
    const diffSelling = diff * Number(i.sellingPrice || 0);
    return {
      ...i,
      diff,
      diffCost,
      diffSelling
    };
  });
});

const filteredAuditItems = computed(() => {
  let list = auditItemsWithDiff.value;
  if (showDiscrepanciesOnly.value) {
    list = list.filter(i => i.diff !== 0);
  }
  if (auditSearchQuery.value?.trim()) {
    const q = auditSearchQuery.value.toLowerCase().trim();
    list = list.filter(
      i => i.name?.toLowerCase().includes(q) ||
           i.sku?.toLowerCase().includes(q) ||
           i.categoryName?.toLowerCase().includes(q)
    );
  }
  return list;
});

const auditMatchingCount = computed(() => {
  return auditItemsWithDiff.value.filter(i => i.diff === 0).length;
});

const auditShortageCount = computed(() => {
  return auditItemsWithDiff.value.filter(i => i.diff < 0).length;
});

const auditSurplusCount = computed(() => {
  return auditItemsWithDiff.value.filter(i => i.diff > 0).length;
});

const auditTotalShortageCost = computed(() => {
  return auditItemsWithDiff.value
    .filter(i => i.diff < 0)
    .reduce((sum, i) => sum + Math.abs(i.diffCost), 0);
});

const auditTotalShortageSelling = computed(() => {
  return auditItemsWithDiff.value
    .filter(i => i.diff < 0)
    .reduce((sum, i) => sum + Math.abs(i.diffSelling), 0);
});

const auditTotalSurplusCost = computed(() => {
  return auditItemsWithDiff.value
    .filter(i => i.diff > 0)
    .reduce((sum, i) => sum + i.diffCost, 0);
});

// Proceed to reconcile
function handleProceedReconcile() {
  if (auditShortageCount.value > 0) {
    settlementNotes.value = `محضر جرد مخزون بتاريخ ${new Date().toLocaleDateString('ar-EG')}`;
    showSettlementDialog.value = true;
  } else {
    showConfirmReconcileModal.value = true;
  }
}

async function executeFinalReconciliation() {
  if (auditShortageCount.value > 0 && settlementType.value === 1 && !selectedEmployeeId.value) {
    toastStore.addErrorToast("يرجى اختيار الموظف أو أمين المخزن المسؤول لتحميل العجز على راتبه.");
    return;
  }

  isReconciling.value = true;
  try {
    const payload = {
      items: auditItems.value.map(i => ({
        productId: i.productId,
        actualQuantity: Number(i.actualQuantity || 0),
        notes: i.notes?.trim() || null
      })),
      shortageSettlement: settlementType.value,
      responsibleEmployeeId: settlementType.value === 1 ? selectedEmployeeId.value : null,
      deductionMonth: settlementType.value === 1 ? deductionMonth.value : null,
      deductionYear: settlementType.value === 1 ? deductionYear.value : null,
      useSellingPriceForDeduction: useSellingPriceForDeduction.value,
      settlementNotes: settlementNotes.value?.trim() || null
    };

    const res = await apiClient.post("/api/StockAudit/reconcile", payload);
    if (res.data?.isDone) {
      toastStore.addSuccessToast(res.data.returnMessage || "تمت تسوية واعتماد جرد المخزون بنجاح");
      showSettlementDialog.value = false;
      showConfirmReconcileModal.value = false;
      showStockAuditModal.value = false;
      await Promise.all([
        inventoryStore.fetchProducts(),
        inventoryStore.fetchInventory()
      ]);
    } else {
      toastStore.addErrorToast(res.data?.returnMessage || "تعذر إتمام التسوية");
    }
  } catch (err) {
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "حدث خطأ أثناء تسوية الجرد");
  } finally {
    isReconciling.value = false;
  }
}

// -------------------------------------------------------------
// Quick Adjust Stock
// -------------------------------------------------------------
function promptAdjustStock(product) {
  selectedProductForAdjust.value = product;
  newStockQuantity.value = Number(product.quantity || product.amount || 0);
  showAdjustModal.value = true;
}

async function submitStockAdjustment() {
  if (!selectedProductForAdjust.value) return;
  isSubmittingAdjust.value = true;
  try {
    const res = await inventoryStore.adjustStock(
      selectedProductForAdjust.value.id,
      newStockQuantity.value
    );
    if (res && res.success) {
      toastStore.addSuccessToast(res.message || "تم تحديث رصيد المخزون بنجاح");
      showAdjustModal.value = false;
    } else {
      toastStore.addErrorToast(res?.message || "فشل تحديث الرصيد");
    }
  } catch (err) {
    toastStore.addErrorToast(err?.message || "فشل تحديث الرصيد");
  } finally {
    isSubmittingAdjust.value = false;
  }
}

// -------------------------------------------------------------
// Delete Product
// -------------------------------------------------------------
function promptDeleteProduct(product) {
  selectedProductForDelete.value = product;
  showDeleteDialog.value = true;
}

async function handleDeleteProduct() {
  if (!selectedProductForDelete.value) return;
  try {
    const res = await inventoryStore.deleteProduct(selectedProductForDelete.value.id);
    if (res && res.success === false) {
      toastStore.addErrorToast(res.message || "تعذر حذف الصنف لوجود ارتباطات سارية");
      return res;
    }
    toastStore.addSuccessToast("تم حذف الصنف ورصيده في المخزن بنجاح");
    await inventoryStore.fetchProducts();
    await inventoryStore.fetchInventory();
  } catch (err) {
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "تعذر حذف الصنف");
    throw err;
  } finally {
    selectedProductForDelete.value = null;
  }
}

// -------------------------------------------------------------
// PDF Upload Handlers
// -------------------------------------------------------------
function triggerPdfSelect() {
  pdfInput.value?.click();
}

function onPdfDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) uploadPdfFile(file);
}

function onPdfSelected(e) {
  const file = e.target.files[0];
  if (file) uploadPdfFile(file);
}

const uploadPdfFile = async (file) => {
  uploadingPdf.value = true;
  const formData = new FormData();
  formData.append("file", file);
  try {
    await inventoryStore.importPdf(formData);
    toastStore.addSuccessToast(t("ohda.inventory.pdfImportSuccess"));
    showPdfModal.value = false;
  } catch (err) {
    console.error("PDF upload failed", err);
    toastStore.addErrorToast(t("ohda.inventory.pdfImportError"));
  } finally {
    uploadingPdf.value = false;
  }
};

// -------------------------------------------------------------
// Styling & Status Helpers
// -------------------------------------------------------------
function getMinThreshold(product) {
  if (!product) return 5;
  const val = Number(product.minThreshold);
  return (!isNaN(val) && val > 0) ? val : 5;
}

function getSafePercentage(product) {
  if (!product) return 0;
  const min = getMinThreshold(product);
  const qty = Number(product.quantity || product.amount || 0);
  if (min <= 0) return 100;
  return Math.round((qty / min) * 100);
}

function getBarWidth(product) {
  return Math.min(100, Math.max(0, getSafePercentage(product)));
}

function getStockColorClass(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "text-red-600 dark:text-red-400";
  if (qty <= min) return "text-amber-600 dark:text-amber-400";
  return "text-brand-accent";
}

function getBarColor(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "bg-red-500";
  if (qty <= min) return "bg-amber-500";
  return "bg-brand-accent";
}

function getStatusBadgeClass(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  if (qty <= min) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
}

function getStatusText(product) {
  const qty = Number(product?.quantity || product?.amount || 0);
  const min = getMinThreshold(product);
  if (qty === 0) return t("ohda.inventory.outOfStock") || "نفد الرصيد";
  if (qty <= min) return t("ohda.inventory.lowStock") || "منخفض الرصيد";
  return t("ohda.inventory.sufficient") || "متوفر";
}
</script>
