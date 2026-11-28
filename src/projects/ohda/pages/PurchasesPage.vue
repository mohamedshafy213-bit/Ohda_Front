<template>
  <div class="space-y-6 pb-24">
    <!-- ==================== VIEW 1: PURCHASES LIST ==================== -->
    <template v-if="viewMode === 'list'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-brand-dark dark:text-white">المشتريات وتوريد البضاعة</h1>
            <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
              إصدار فواتير الشراء، إدخال السيريالات والدفعات، زيادة أرصدة المخزون، وحفظ المسودات
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="showImportModal = true"
            class="px-3.5 py-2.5 bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Upload class="w-4 h-4 text-blue-500" />
            <span>استيراد رصيد أول المدة (Excel)</span>
          </button>

          <button
            type="button"
            @click="exportPurchasesToExcel"
            class="px-3.5 py-2.5 bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Download class="w-4 h-4 text-brand-accent" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            @click="openCreatePage"
            class="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>+ فاتورة شراء جديدة</span>
          </button>
        </div>
      </div>

      <OhdaDataTable
        :columns="tableColumns"
        :items="purchaseStore.purchases"
        :loading="purchaseStore.loading"
        :rowsPerPage="12"
        emptyTitle="لا توجد فواتير شراء مسجلة"
        emptyMessage="ابدأ بتسجيل أول فاتورة شراء لتوريد قطع الغيار وزيادة المخزون."
        :emptyIcon="ShoppingBag"
      >
        <template #toolbar>
          <div class="flex items-center gap-3 w-full sm:w-80">
            <div class="relative w-full">
              <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                @input="onSearch"
                type="text"
                placeholder="بحث برقم الفاتورة أو اسم المورد..."
                class="w-full bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-xl ps-9 pe-3 py-2 text-xs text-brand-dark dark:text-white"
              />
            </div>
          </div>
        </template>

        <template #invoiceNumber="{ data }">
          <div>
            <span class="font-mono font-bold text-brand-accent block">{{ data.invoiceNumber }}</span>
            <span v-if="data.supplierInvoiceNumber" class="font-mono text-[10px] text-brand-gray">مورد: {{ data.supplierInvoiceNumber }}</span>
          </div>
        </template>

        <template #purchaseDate="{ data }">
          <span class="font-mono text-xs">{{ formatDate(data.purchaseDate) }}</span>
        </template>

        <template #supplierName="{ data }">
          <span class="font-semibold">{{ data.supplierName }}</span>
        </template>

        <template #totalAmount="{ data }">
          <span class="font-mono font-bold">{{ formatCurrency(data.totalAmount) }} ج.م</span>
        </template>

        <template #paidAmount="{ data }">
          <span class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatCurrency(data.paidAmount) }} ج.م</span>
        </template>

        <template #remainingBalance="{ data }">
          <span
            class="font-mono font-bold px-2 py-0.5 rounded-lg text-[11px]"
            :class="data.remainingBalance > 0 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'text-brand-gray'"
          >
            {{ formatCurrency(data.remainingBalance) }} ج.م
          </span>
        </template>

        <template #paymentType="{ data }">
          <div class="flex flex-col items-center gap-1">
            <span
              v-if="data.isDraft"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
            >
              مسودة (غير مرحلة)
            </span>
            <span
              v-else
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              :class="getPaymentTypeBadge(data.paymentType)"
            >
              {{ getPaymentTypeText(data.paymentType) }}
            </span>
          </div>
        </template>

        <template #actions="{ data }">
          <div class="flex items-center justify-center gap-1">
            <button
              type="button"
              @click="viewDetails(data)"
              class="p-1.5 rounded-lg text-brand-dark dark:text-white hover:bg-brand-light dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="عرض التفاصيل"
            >
              <Eye class="w-4 h-4" />
            </button>
            <button
              v-if="data.isDraft"
              type="button"
              @click="postExistingDraft(data)"
              class="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
              title="اعتماد وترحيل"
            >
              ترحيل
            </button>
            <button
              v-if="data.isDraft"
              type="button"
              @click="deleteExistingDraft(data)"
              class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
              title="حذف المسودة"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </OhdaDataTable>
    </template>

    <!-- ==================== VIEW 2: FULL-PAGE PURCHASE ENTRY (NO MODAL / NO NESTED SCROLL) ==================== -->
    <template v-else-if="viewMode === 'create'">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="viewMode = 'list'"
            class="p-2.5 rounded-xl border border-brand-gray/20 hover:bg-brand-light dark:hover:bg-white/5 cursor-pointer"
            title="العودة لقائمة المشتريات"
          >
            <ArrowRight class="w-4 h-4" />
          </button>
          <div>
            <h1 class="text-lg font-bold text-brand-dark dark:text-white">تسجيل فاتورة شراء وتوريد بضاعة</h1>
            <p class="text-xs text-brand-gray">شاشة إدخال كاملة بدون تداخل نوافذ — ترحّل الدفعات والسيريالات والخزينة في خطوة واحدة</p>
          </div>
        </div>

        <!-- Fast Barcode Scanner Input -->
        <div class="w-full sm:w-80 relative">
          <Barcode class="w-4 h-4 text-brand-accent absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            ref="barcodeScannerRef"
            v-model="headerBarcodeInput"
            @keydown.enter.prevent="handleHeaderBarcodeScan"
            type="text"
            placeholder="امسح باركود الصنف لإضافته أو زيادة كميته..."
            class="w-full bg-brand-accent/5 border border-brand-accent/40 rounded-xl ps-9 pe-3 py-2 text-xs font-mono text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </div>

      <!-- Header Details Card -->
      <div class="bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <!-- Supplier + Balance -->
          <div class="lg:col-span-2">
            <label class="block font-bold text-brand-dark dark:text-white mb-1">
              المورد <span class="text-red-500">*</span>
            </label>
            <select
              v-model="createForm.supplierId"
              @change="checkDuplicateSupplierInvoice"
              required
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2.5 text-xs text-brand-dark dark:text-white font-semibold"
            >
              <option value="" disabled>اختر المورد...</option>
              <option v-for="s in inventoryStore.suppliers" :key="s.id" :value="s.id" class="bg-white dark:bg-slate-800">
                {{ s.companyName }} (رصيده الحالي: {{ formatCurrency(s.currentBalance) }} ج.م)
              </option>
            </select>
            <div v-if="selectedSupplier" class="mt-1.5 flex items-center gap-3 text-[11px] bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
              <span>رصيد المورد الحالي: <strong class="font-mono">{{ formatCurrency(selectedSupplier.currentBalance) }} ج.م</strong></span>
              <span class="text-brand-gray">&larr;</span>
              <span>رصيده بعد الفاتورة: <strong class="font-mono text-amber-600">{{ formatCurrency((selectedSupplier.currentBalance || 0) + remainingAmount) }} ج.م</strong></span>
            </div>
          </div>

          <!-- Supplier Invoice Number + Duplicate warning -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">رقم فاتورة المورد</label>
            <input
              v-model="createForm.supplierInvoiceNumber"
              @blur="checkDuplicateSupplierInvoice"
              type="text"
              placeholder="مثال: INV-5021"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2.5 text-xs font-mono text-brand-dark dark:text-white"
            />
            <p v-if="duplicateWarning" class="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ duplicateWarning }}</span>
            </p>
          </div>

          <!-- Internal Invoice No -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">رقم القيد الداخلي (اختياري)</label>
            <input
              v-model="createForm.invoiceNumber"
              type="text"
              placeholder="يُولّد تلقائياً..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2.5 text-xs font-mono text-brand-dark dark:text-white"
            />
          </div>

          <!-- Invoice Date -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">تاريخ الفاتورة</label>
            <input
              v-model="createForm.purchaseDate"
              type="date"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <!-- Received Date -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">تاريخ الاستلام (تاريخ الدفعة)</label>
            <input
              v-model="createForm.receivedDate"
              type="date"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <!-- Payment Type -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">طريقة الدفع</label>
            <select
              v-model.number="createForm.paymentType"
              @change="onPaymentTypeChange"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white font-semibold"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">دفع فوري بالكامل (كاش / بنك)</option>
              <option :value="2" class="bg-white dark:bg-slate-800">آجل بالكامل (على الحساب للمورد)</option>
              <option :value="3" class="bg-white dark:bg-slate-800">دفع جزئي (مقدم + آجل)</option>
            </select>
          </div>

          <div v-if="createForm.paymentType !== 2" class="sm:col-span-2">
            <MultiPaymentMethodSelector
              v-model="createForm.splits"
              :total-amount="Number(createForm.paidAmount) || 0"
              @update:valid="isPurchaseSplitValid = $event"
              label="توزيع طرق سداد فاتورة المشتريات (كاش / بنك / إنستاباي)"
            />
          </div>

          <div v-if="createForm.paymentType === 2 || createForm.paymentType === 3">
            <label class="block font-bold text-brand-dark dark:text-white mb-1">تاريخ استحقاق السداد</label>
            <input
              v-model="createForm.dueDate"
              type="date"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>

          <!-- Discount & Invoice Image & Notes -->
          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">خصم إجمالي على الفاتورة (ج.م)</label>
            <input
              v-model.number="createForm.discountAmount"
              type="number"
              min="0"
              step="0.01"
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs font-mono text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block font-bold text-brand-dark dark:text-white mb-1">صورة فاتورة المورد</label>
            <div class="flex items-center gap-2">
              <label class="flex-1 px-3 py-2 bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl text-xs flex items-center gap-2 hover:border-brand-accent cursor-pointer">
                <Upload class="w-4 h-4 text-brand-accent" />
                <span>{{ uploadingFile ? 'جاري الرفع...' : (createForm.invoiceImageUrl ? 'تغيير الصورة ✓' : 'إرفاق صورة') }}</span>
                <input type="file" accept="image/*,.pdf" @change="handleFileUpload" class="hidden" />
              </label>
              <a
                v-if="createForm.invoiceImageUrl"
                :href="getImageUrl(createForm.invoiceImageUrl)"
                target="_blank"
                class="w-9 h-9 rounded-xl overflow-hidden border border-brand-gray/20 shrink-0 block"
              >
                <img :src="getImageUrl(createForm.invoiceImageUrl)" class="w-full h-full object-cover" />
              </a>
            </div>
          </div>

          <div class="sm:col-span-2">
            <label class="block font-bold text-brand-dark dark:text-white mb-1">ملاحظات الفاتورة</label>
            <input
              v-model="createForm.notes"
              type="text"
              placeholder="ملاحظات توريد، شروط خاصة، أو اسم المندوب..."
              class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Line Items Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Package class="w-5 h-5 text-brand-accent" />
            <span>بنود الأصناف المشتراة ({{ createForm.items.length }})</span>
          </h2>
          <button
            type="button"
            @click="addItemRow"
            class="px-4 py-2 bg-brand-accent/20 hover:bg-brand-accent text-brand-dark font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus class="w-4 h-4" />
            <span>إضافة بند (أو اضغط Enter)</span>
          </button>
        </div>

        <div
          v-for="(item, idx) in createForm.items"
          :key="idx"
          class="bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs space-y-4"
          @keydown.enter.ctrl="addItemRow"
        >
          <!-- Row Top Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-brand-gray/10 text-xs">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-lg bg-brand-accent/15 text-brand-dark dark:text-brand-accent font-bold">بند #{{ idx + 1 }}</span>
              <button
                type="button"
                @click="toggleInlineNewProduct(item)"
                class="px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                :class="item.isNewProduct ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' : 'bg-black/5 dark:bg-white/10 text-brand-gray hover:text-brand-dark'"
              >
                {{ item.isNewProduct ? '✓ تعريف صنف جديد غير مسجل (انقر للعودة للاختيار)' : '+ لم تجد الصنف؟ عرّف صنفاً جديداً هنا' }}
              </button>
            </div>

            <button
              type="button"
              @click="removeItemRow(idx)"
              :disabled="createForm.items.length <= 1"
              class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-25 cursor-pointer"
              title="حذف البند"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Inline New Product Form -->
          <div v-if="item.isNewProduct" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-xs">
            <div class="lg:col-span-2">
              <label class="block font-bold mb-1">اسم الصنف الجديد <span class="text-red-500">*</span></label>
              <input
                v-model="item.newProductName"
                required
                placeholder="مثال: زيت توتال كوارتز 10W-40..."
                class="w-full bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label class="block font-bold mb-1">التصنيف (إلزامي) <span class="text-red-500">*</span></label>
              <select v-model="item.newProductCategoryId" required class="w-full bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-2.5 py-2">
                <option v-for="c in inventoryStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">الوحدة الأساسية</label>
              <select v-model="item.newProductBaseUnit" class="w-full bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-2.5 py-2">
                <option v-for="u in ['قطعة', 'زجاجة', 'لتر', 'عبوة', 'طقم', 'كجم', 'برميل']" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">الباركود (اختياري)</label>
              <input v-model="item.newProductBarcode" placeholder="تلقائي إذا ترك فارغاً" class="w-full bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-2.5 py-2 font-mono" />
            </div>
            <div class="flex flex-col justify-center gap-1.5 pt-2">
              <label class="flex items-center gap-1.5 cursor-pointer font-semibold">
                <input type="checkbox" v-model="item.newProductTrackSerials" class="rounded text-brand-accent" />
                <span>يحتاج أرقام تسلسلية</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer font-semibold">
                <input type="checkbox" v-model="item.newProductHasExpiry" class="rounded text-brand-accent" />
                <span>له تاريخ صلاحية</span>
              </label>
            </div>
          </div>

          <!-- Existing Product Search & Selector with Category Filter -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end text-xs">
            <!-- 1. Category Filter -->
            <div class="lg:col-span-3">
              <label class="block font-bold mb-1 text-brand-dark dark:text-white">
                1. فلترة حسب التصنيف
              </label>
              <select
                v-model="item.selectedCategoryId"
                @change="onCategoryChange(item)"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs font-semibold text-brand-dark dark:text-white focus:border-brand-accent cursor-pointer"
              >
                <option value="">كل التصنيفات (عرض الكل)</option>
                <option v-for="c in inventoryStore.categories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>

            <!-- 2. Product Dropdown (Filtered by Category) -->
            <div class="lg:col-span-5">
              <label class="block font-bold mb-1 text-brand-dark dark:text-white">
                2. اختيار الصنف من المخزن <span class="text-red-500">*</span>
              </label>
              <select
                v-model="item.productId"
                @change="onProductSelect(item)"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs font-semibold text-brand-dark dark:text-white focus:border-brand-accent cursor-pointer"
              >
                <option value="" disabled>-- اختر الصنف المطلوب --</option>
                <option v-for="p in getCategoryProducts(item.selectedCategoryId)" :key="p.id" :value="p.id" class="bg-white dark:bg-slate-800">
                  {{ p.name }} (كود: {{ p.sku }} | الرصيد: {{ p.currentQuantity }} {{ p.unit }})
                </option>
              </select>
            </div>

            <!-- 3. Fast Text / Barcode Search within Category -->
            <div class="lg:col-span-4 relative">
              <label class="block font-bold mb-1 text-brand-dark dark:text-white">
                أو ابحث بالاسم أو الباركود
              </label>
              <input
                v-model="item.searchText"
                @focus="item.showDropdown = true"
                type="text"
                :placeholder="item.selectedCategoryId ? 'ابحث داخل التصنيف المختار...' : 'اكتب اسم الصنف أو الباركود...'"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 text-xs text-brand-dark dark:text-white focus:border-brand-accent"
              />
              <div
                v-if="item.showDropdown && getFilteredProducts(item).length > 0"
                class="absolute z-30 right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl shadow-xl max-h-56 overflow-y-auto"
              >
                <div
                  v-for="p in getFilteredProducts(item)"
                  :key="p.id"
                  @click="selectExistingProduct(item, p)"
                  class="p-2.5 hover:bg-brand-accent/15 cursor-pointer border-b border-brand-gray/10 flex items-center justify-between"
                >
                  <div>
                    <div class="font-bold text-brand-dark dark:text-white">{{ p.name }}</div>
                    <div class="text-[10px] text-brand-gray font-mono">
                      {{ p.categoryName || getProductCategoryName({ productId: p.id }) }} • كود: {{ p.sku }} • الرصيد: {{ p.currentQuantity }} {{ p.unit }}
                    </div>
                  </div>
                  <span class="font-mono font-bold text-brand-accent">{{ formatCurrency(p.costPrice) }} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantity, Packaging, Cost & Plain Arabic Live Sentence -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs items-end">
            <div>
              <label class="block text-brand-gray mb-1">وحدة الشراء</label>
              <select v-model="item.purchaseUnitMode" @change="onPurchaseUnitModeChange(item)" class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-2.5 py-2">
                <option value="piece">{{ getProductBaseUnit(item) }} (مفرد)</option>
                <option value="pack">كرتونة / عبوة</option>
              </select>
            </div>

            <div v-if="item.purchaseUnitMode === 'pack'">
              <label class="block text-brand-gray mb-1">عدد الـ({{ getProductBaseUnit(item) }}) بالعبوة</label>
              <input
                v-model.number="item.packageMultiplier"
                type="number"
                min="2"
                step="1"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-2.5 py-2 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label class="block text-brand-gray mb-1">الكمية المشتراة</label>
              <input
                v-model.number="item.quantity"
                type="number"
                min="0.01"
                step="any"
                required
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-2.5 py-2 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label class="block text-brand-gray mb-1">سعر {{ item.purchaseUnitMode === 'pack' ? 'العبوة' : getProductBaseUnit(item) }} (ج.م)</label>
              <input
                v-model.number="item.unitCost"
                type="number"
                min="0"
                step="any"
                required
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-2.5 py-2 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label class="block text-brand-gray mb-1">إجمالي البند</label>
              <div class="px-3 py-2 rounded-xl bg-brand-soft/60 dark:bg-white/10 font-mono font-bold text-center text-brand-dark dark:text-white">
                {{ formatCurrency((item.quantity || 0) * (item.unitCost || 0)) }} ج.م
              </div>
            </div>

            <div>
              <label class="block text-brand-gray mb-1">موقع الرف</label>
              <select v-model="item.shelfLocation" class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-2.5 py-2">
                <option value="الرف الرئيسي">الرف الرئيسي</option>
                <option v-for="bin in shelfOptions" :key="bin" :value="bin">{{ bin }}</option>
              </select>
            </div>
          </div>

          <!-- Plain Arabic Live Sentence -->
          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-800 dark:text-blue-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              {{ getLiveConversionSentence(item) }}
            </span>
            <span v-if="item.lastPurchaseCost > 0" class="text-[11px] font-normal">
              آخر تكلفة شراء مسجلة: <strong class="font-mono">{{ formatCurrency(item.lastPurchaseCost) }} ج.م</strong>
              <span v-if="isCostDiffWarning(item)" class="ms-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">
                ⚠️ تنبيه: التكلفة تختلف بأكثر من 30% عن آخر شراء!
              </span>
            </span>
          </div>

          <!-- Selling Price, Margin & Expiry -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs items-end pt-1">
            <div>
              <label class="block text-brand-gray mb-1">سعر البيع للجمهور (ج.م) — الحالي: {{ formatCurrency(item.currentSellingPrice) }}</label>
              <input
                v-model.number="item.sellingPrice"
                type="number"
                min="0"
                step="any"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600"
              />
            </div>

            <div>
              <label class="block text-brand-gray mb-1">نسبة الربح المتوقعة</label>
              <div
                class="px-3 py-2 rounded-xl font-mono font-bold text-center border"
                :class="getMarginBadgeClass(item)"
              >
                {{ getMargin(item) }}%
                <span v-if="getMargin(item) <= 0" class="text-[10px] ms-1">(خسارة!)</span>
                <span v-else-if="getMargin(item) < 5" class="text-[10px] ms-1">(منخفض جداً)</span>
                <span v-else-if="getMargin(item) > 80" class="text-[10px] ms-1">(مرتفع جداً!)</span>
              </div>
            </div>

            <div class="flex items-center pb-2">
              <label class="flex items-center gap-2 cursor-pointer font-semibold">
                <input type="checkbox" v-model="item.updateSellingPrice" class="rounded text-brand-accent" />
                <span>تحديث سعر البيع في النظام بهذا السعر</span>
              </label>
            </div>

            <!-- Expiry Date (required if HasExpiryDate, else optional) -->
            <div>
              <label class="block text-brand-gray mb-1">
                تاريخ الصلاحية
                <span v-if="doesItemHaveExpiry(item)" class="text-red-500 font-bold">* (إلزامي)</span>
                <span v-else class="text-[10px]">(اختياري)</span>
              </label>
              <input
                v-model="item.expiryDate"
                :required="doesItemHaveExpiry(item)"
                type="date"
                class="w-full bg-brand-light dark:bg-white/5 border border-brand-gray/25 rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>

          <!-- Serial Numbers Section (Shown ONLY when product needs serials) -->
          <div v-if="doesItemNeedSerials(item)" class="p-4 rounded-2xl border-2 space-y-3" :class="getSerialProgressClass(item)">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <QrCode class="w-4 h-4 text-brand-accent" />
                <span class="font-bold text-xs">الأرقام التسلسلية للوحدات (Serial Numbers)</span>
                <span
                  class="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold"
                  :class="item.serialNumbers.length === getBaseQuantity(item) ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'"
                >
                  {{ item.serialNumbers.length }} / {{ getBaseQuantity(item) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  @click="generateInternalSerials(item)"
                  class="px-3 py-1 rounded-lg bg-brand-accent/20 hover:bg-brand-accent text-brand-dark text-[11px] font-bold cursor-pointer"
                >
                  توليد سيريالات داخلية تلقائياً ({{ Math.max(0, getBaseQuantity(item) - item.serialNumbers.length) }})
                </button>
                <label v-if="canCompleteSerialsLater" class="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
                  <input type="checkbox" v-model="item.completeSerialsLater" class="rounded text-brand-accent" />
                  <span>استكمال السيريالات لاحقاً (صلاحية مشرف/أمين مخزن)</span>
                </label>
              </div>
            </div>

            <!-- Scan 1-by-1 OR Paste List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <input
                  v-model="item.serialScanInput"
                  @keydown.enter.prevent="addScannedSerial(item)"
                  type="text"
                  placeholder="امسح أو اكتب السيريال واضغط Enter..."
                  class="w-full bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-3 py-2 font-mono"
                />
              </div>
              <div class="flex gap-2">
                <input
                  v-model="item.serialPasteInput"
                  type="text"
                  placeholder="أو الصق قائمة سيريالات مفصولة بفاصلة أو مسافة..."
                  class="flex-1 bg-white dark:bg-slate-900 border border-brand-gray/25 rounded-xl px-3 py-2 font-mono"
                />
                <button
                  type="button"
                  @click="pasteSerialList(item)"
                  class="px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10 font-bold cursor-pointer"
                >
                  إدراج
                </button>
              </div>
            </div>

            <!-- Serial Chips -->
            <div v-if="item.serialNumbers.length > 0" class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
              <span
                v-for="(sn, sIdx) in item.serialNumbers"
                :key="sIdx"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-brand-gray/20 font-mono text-[11px] flex items-center gap-1.5"
              >
                <span>{{ sn }}</span>
                <button type="button" @click="item.serialNumbers.splice(sIdx, 1)" class="text-red-500 hover:text-red-700 cursor-pointer">&times;</button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- STICKY BOTTOM ACTION BAR -->
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-brand-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-brand-gray/20 shadow-2xl px-6 py-3.5">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div class="flex flex-wrap items-center gap-5">
            <div>
              <span class="text-brand-gray block text-[10px]">صافي الفاتورة</span>
              <span class="font-mono font-extrabold text-base text-brand-dark dark:text-white">{{ formatCurrency(totalInvoiceCost) }} ج.م</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-brand-gray">المدفوع الآن:</span>
              <input
                v-model.number="createForm.paidAmount"
                type="number"
                min="0"
                :max="totalInvoiceCost"
                step="0.01"
                :disabled="createForm.paymentType === 1 || createForm.paymentType === 2"
                class="w-28 bg-brand-light dark:bg-white/10 border border-brand-gray/25 rounded-lg px-2 py-1 font-mono font-bold text-emerald-600 text-center"
              />
            </div>
            <div>
              <span class="text-brand-gray block text-[10px]">المتبقي آجل للمورد</span>
              <span class="font-mono font-bold text-sm text-amber-600">{{ formatCurrency(remainingAmount) }} ج.م</span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              @click="viewMode = 'list'"
              class="px-4 py-2.5 rounded-xl border border-brand-gray/25 font-semibold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              @click="submitCreatePurchase(true)"
              :disabled="submitting"
              class="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold cursor-pointer"
            >
              حفظ كمسودة (بدون مخزون)
            </button>
            <button
              type="button"
              @click="submitCreatePurchase(false)"
              :disabled="submitting"
              class="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-extrabold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
              <span>اعتماد الفاتورة وترحيل للمخزون</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Purchase Details Modal -->
    <OhdaModal
      v-model:visible="showDetailsModal"
      :title="`تفاصيل فاتورة شراء #${selectedPurchase?.invoiceNumber || ''}`"
      :description="`المورد: ${selectedPurchase?.supplierName} - التاريخ: ${formatDate(selectedPurchase?.purchaseDate)}`"
      :icon="FileText"
      maxWidth="max-w-3xl"
    >
      <div v-if="selectedPurchase" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-light/40 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block text-[10px]">إجمالي الفاتورة</span>
            <span class="font-mono font-bold text-sm">{{ formatCurrency(selectedPurchase.totalAmount) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">المدفوع</span>
            <span class="font-mono font-bold text-sm text-emerald-600">{{ formatCurrency(selectedPurchase.paidAmount) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">المتبقي آجل</span>
            <span class="font-mono font-bold text-sm text-amber-600">{{ formatCurrency(selectedPurchase.remainingBalance) }} ج.م</span>
          </div>
          <div>
            <span class="text-brand-gray block text-[10px]">الحالة</span>
            <span class="font-bold">{{ selectedPurchase.isDraft ? 'مسودة' : getPaymentTypeText(selectedPurchase.paymentType) }}</span>
          </div>
        </div>

        <div class="border border-brand-gray/15 rounded-xl overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
              <tr>
                <th class="py-2.5 px-3">الصنف</th>
                <th class="py-2.5 px-3 text-center">الدفعة</th>
                <th class="py-2.5 px-3 text-center">الكمية</th>
                <th class="py-2.5 px-3 text-center">سعر الوحدة</th>
                <th class="py-2.5 px-3 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-for="item in selectedPurchase.items" :key="item.id">
                <td class="py-2 px-3 font-semibold">{{ item.productName }}</td>
                <td class="py-2 px-3 text-center font-mono text-[11px]">{{ item.batchCode || '—' }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ item.quantity }} {{ item.purchaseUnit || item.unit }}</td>
                <td class="py-2 px-3 text-center font-mono">{{ formatCurrency(item.unitCost) }} ج.م</td>
                <td class="py-2 px-3 text-center font-mono font-bold text-brand-accent">{{ formatCurrency(item.totalCost) }} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="selectedPurchase.invoiceImageUrl" class="space-y-1.5 pt-2">
          <span class="text-brand-gray font-bold text-xs block">صورة الفاتورة المرفقة:</span>
          <a :href="getImageUrl(selectedPurchase.invoiceImageUrl)" target="_blank" rel="noopener noreferrer" class="inline-block border border-brand-gray/20 rounded-xl overflow-hidden max-w-xs shadow-sm">
            <img :src="getImageUrl(selectedPurchase.invoiceImageUrl)" class="max-h-48 object-contain" />
          </a>
        </div>
      </div>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-5 py-2 bg-brand-light dark:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer">
          إغلاق
        </button>
        <button
          v-if="selectedPurchase?.id"
          type="button"
          @click="downloadServerPdf(`/api/ReportsPdf/purchase/${selectedPurchase.id}`, `Purchase_${selectedPurchase.invoiceNumber}.pdf`)"
          class="px-4 py-2 bg-rose-600/15 text-rose-700 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
        >
          تنزيل PDF
        </button>
        <button
          v-if="selectedPurchase?.id"
          type="button"
          @click="printServerPdf(`/api/ReportsPdf/purchase/${selectedPurchase.id}`, `Purchase_${selectedPurchase.invoiceNumber}.pdf`)"
          class="px-5 py-2 bg-brand-accent text-brand-dark rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-brand-accent/90"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة الفاتورة</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Post-Save Success Modal -->
    <OhdaModal
      v-model:visible="showPostSuccessModal"
      title="تم ترحيل فاتورة الشراء بنجاح ✓"
      description="تمت إضافة الدفعات والمخزون وتحديث الخزينة"
      :icon="CheckCircle2"
      maxWidth="max-w-md"
    >
      <div class="space-y-4 text-xs">
        <p class="font-bold text-sm text-brand-dark dark:text-white">
          رقم الفاتورة: <span class="font-mono text-brand-accent">{{ lastPostedResult?.invoiceNumber }}</span>
        </p>
        <div class="grid grid-cols-1 gap-2">
          <router-link to="/ohda/barcode-print" class="p-3 rounded-xl border border-brand-gray/20 hover:border-brand-accent flex items-center justify-between font-bold">
            <span>طباعة ملصقات الباركود والسيريال</span>
            <Printer class="w-4 h-4 text-brand-accent" />
          </router-link>
          <button type="button" @click="showPostSuccessModal = false; openCreatePage()" class="p-3 rounded-xl bg-brand-accent text-brand-dark font-bold flex items-center justify-between cursor-pointer">
            <span>إنشاء فاتورة شراء جديدة</span>
            <Plus class="w-4 h-4" />
          </button>
          <button type="button" @click="showPostSuccessModal = false; viewMode = 'list'" class="p-3 rounded-xl border border-brand-gray/20 font-semibold cursor-pointer">
            العودة لقائمة المشتريات
          </button>
        </div>
      </div>
    </OhdaModal>

    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="opening_purchases"
      entity-label="أرصدة أول المدة (مسودة شراء)"
      @imported="purchaseStore.fetchPurchases()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaPurchaseStore } from "../stores/useOhdaPurchaseStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import { normalizeArabic } from "../utils/arabicNormalizer";
import { apiGet } from "@/utilities/fetchApi";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import MultiPaymentMethodSelector from "../components/MultiPaymentMethodSelector.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import { downloadServerPdf, printServerPdf } from "../utils/pdfHelper";
import { exportToExcelCsv } from "../utils/excelHelper";
import {
  ShoppingBag,
  Plus,
  Search,
  Package,
  Trash2,
  Upload,
  Eye,
  FileText,
  RefreshCw,
  Download,
  ArrowRight,
  Barcode,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Printer
} from "lucide-vue-next";

const toast = useToast();
const purchaseStore = useOhdaPurchaseStore();
const inventoryStore = useOhdaInventoryStore();
const financeStore = useOhdaFinanceStore();
const authStore = useOhdaAuthStore();
const confirmStore = useOhdaConfirmStore();

const viewMode = ref("list"); // "list" | "create"
const searchQuery = ref("");
const showDetailsModal = ref(false);
const showPostSuccessModal = ref(false);
const showImportModal = ref(false);
const selectedPurchase = ref(null);
const lastPostedResult = ref(null);
const submitting = ref(false);
const uploadingFile = ref(false);
const duplicateWarning = ref("");
const headerBarcodeInput = ref("");
const shelfOptions = ref([]);

const canCompleteSerialsLater = computed(() => {
  const role = authStore.user?.role;
  return ["SuperAdmin", "Admin", "Manager", "Storekeeper", 0, 1, 4, 6].includes(role);
});

const tableColumns = [
  { field: "invoiceNumber", header: "رقم الفاتورة", width: "160px", sortable: true },
  { field: "purchaseDate", header: "تاريخ الشراء", width: "120px", sortable: true },
  { field: "supplierName", header: "المورد", sortable: true },
  { field: "totalAmount", header: "إجمالي الفاتورة", width: "120px", align: "center", sortable: true },
  { field: "paidAmount", header: "المدفوع", width: "110px", align: "center" },
  { field: "remainingBalance", header: "المتبقي", width: "120px", align: "center" },
  { field: "paymentType", header: "الحالة / السداد", width: "130px", align: "center" },
  { field: "actions", header: "الإجراءات", width: "120px", align: "center" }
];

const todayDateStr = () => new Date().toISOString().split("T")[0];

function createEmptyLine() {
  return {
    isNewProduct: false,
    selectedCategoryId: "",
    productId: "",
    searchText: "",
    showDropdown: false,
    newProductName: "",
    newProductCategoryId: inventoryStore.categories[0]?.id || null,
    newProductBaseUnit: "قطعة",
    newProductBarcode: "",
    newProductTrackSerials: false,
    newProductHasExpiry: false,
    purchaseUnitMode: "piece",
    purchaseUnitName: "قطعة",
    packageMultiplier: 1,
    quantity: 1,
    unitCost: 0,
    lastPurchaseCost: 0,
    currentSellingPrice: 0,
    sellingPrice: 0,
    updateSellingPrice: false,
    expiryDate: "",
    shelfLocation: "الرف الرئيسي",
    serialNumbers: [],
    serialScanInput: "",
    serialPasteInput: "",
    completeSerialsLater: false
  };
}

const isPurchaseSplitValid = ref(true);

const createForm = ref({
  supplierId: "",
  supplierInvoiceNumber: "",
  invoiceNumber: "",
  purchaseDate: todayDateStr(),
  receivedDate: todayDateStr(),
  dueDate: "",
  discountAmount: 0,
  paymentType: 1,
  paidAmount: 0,
  splits: [],
  financialAccountId: "",
  invoiceImageUrl: "",
  notes: "",
  items: [createEmptyLine()]
});

onMounted(async () => {
  await Promise.all([
    purchaseStore.fetchPurchases(),
    inventoryStore.fetchSuppliers(),
    inventoryStore.fetchCategories(),
    inventoryStore.fetchProducts(),
    financeStore.fetchAccounts(),
    loadShelves()
  ]);
});

async function loadShelves() {
  try {
    const res = await apiGet("/api/WarehouseBin");
    if (res?.data?.isDone && Array.isArray(res.data.objects)) {
      shelfOptions.value = res.data.objects.map(b => b.name || b.code).filter(Boolean);
    }
  } catch {}
}

function onSearch() {
  purchaseStore.fetchPurchases({ search: searchQuery.value });
}

const selectedSupplier = computed(() =>
  (inventoryStore.suppliers || []).find(s => s.id === parseInt(createForm.value.supplierId))
);

async function checkDuplicateSupplierInvoice() {
  duplicateWarning.value = "";
  if (!createForm.value.supplierId || !createForm.value.supplierInvoiceNumber?.trim()) return;
  const res = await purchaseStore.checkDuplicateInvoice(createForm.value.supplierId, createForm.value.supplierInvoiceNumber.trim());
  if (res.isDuplicate) {
    duplicateWarning.value = `تحذير: رقم الفاتورة هذا مسجل مسبقاً لنفس المورد (${res.existingInvoiceNumber})`;
  }
}

function openCreatePage() {
  duplicateWarning.value = "";
  createForm.value = {
    supplierId: localStorage.getItem("ohda_last_supplier") || "",
    supplierInvoiceNumber: "",
    invoiceNumber: "",
    purchaseDate: todayDateStr(),
    receivedDate: todayDateStr(),
    dueDate: "",
    discountAmount: 0,
    paymentType: parseInt(localStorage.getItem("ohda_last_payment_type") || "1"),
    paidAmount: 0,
    financialAccountId: localStorage.getItem("ohda_last_account") || "",
    invoiceImageUrl: "",
    notes: "",
    items: [createEmptyLine()]
  };
  viewMode.value = "create";
}

function addItemRow() {
  createForm.value.items.push(createEmptyLine());
}

function removeItemRow(idx) {
  if (createForm.value.items.length > 1) {
    createForm.value.items.splice(idx, 1);
  }
}

function toggleInlineNewProduct(item) {
  item.isNewProduct = !item.isNewProduct;
  if (item.isNewProduct) {
    item.productId = "";
    item.searchText = "";
    item.newProductCategoryId = inventoryStore.categories[0]?.id || null;
  }
}

function getCategoryProducts(categoryId) {
  if (!categoryId) return inventoryStore.products || [];
  return (inventoryStore.products || []).filter(p => p.categoryId === categoryId);
}

function onCategoryChange(item) {
  if (item.selectedCategoryId && item.productId) {
    const prod = (inventoryStore.products || []).find(p => p.id === item.productId);
    if (prod && prod.categoryId !== item.selectedCategoryId) {
      item.productId = "";
      item.searchText = "";
    }
  }
}

function getFilteredProducts(itemOrText) {
  let list = inventoryStore.products || [];
  let query = "";
  if (typeof itemOrText === "object" && itemOrText !== null) {
    if (itemOrText.selectedCategoryId) {
      list = list.filter(p => p.categoryId === itemOrText.selectedCategoryId);
    }
    query = itemOrText.searchText || "";
  } else {
    query = itemOrText || "";
  }

  const norm = normalizeArabic(query);
  if (!norm) return list.slice(0, 15);
  return list
    .filter(p =>
      normalizeArabic(p.name).includes(norm) ||
      normalizeArabic(p.sku).includes(norm) ||
      normalizeArabic(p.barcode).includes(norm)
    )
    .slice(0, 15);
}

function selectExistingProduct(item, prod) {
  item.productId = prod.id;
  item.searchText = prod.name;
  if (prod.categoryId) {
    item.selectedCategoryId = prod.categoryId;
  }
  item.showDropdown = false;
  onProductSelect(item);
}

function onProductSelect(item) {
  const prod = (inventoryStore.products || []).find(p => p.id === item.productId);
  if (prod) {
    if (prod.categoryId) {
      item.selectedCategoryId = prod.categoryId;
    }
    item.searchText = prod.name;
    item.purchaseUnitMode = "piece";
    item.purchaseUnitName = prod.unit || "قطعة";
    item.packageMultiplier = 1;
    item.lastPurchaseCost = Number(prod.costPrice ?? prod.purchasePrice) || 0;
    item.unitCost = item.lastPurchaseCost;
    item.currentSellingPrice = Number(prod.sellingPrice ?? prod.unitPrice) || 0;
    item.sellingPrice = item.currentSellingPrice;
    item.shelfLocation = prod.defaultShelfLocation || "الرف الرئيسي";
  }
}

function handleHeaderBarcodeScan() {
  const code = (headerBarcodeInput.value || "").trim();
  if (!code) return;
  headerBarcodeInput.value = "";
  const prod = (inventoryStore.products || []).find(p =>
    (p.barcode && p.barcode.trim() === code) || (p.sku && p.sku.trim() === code)
  );
  if (!prod) {
    toast.add({ severity: "warn", summary: "باركود غير موجود", detail: `لم يتم العثور على صنف بالباركود '${code}'. يمكنك تعريفه كصنف جديد.`, life: 3000 });
    return;
  }
  const existingRow = createForm.value.items.find(i => !i.isNewProduct && i.productId === prod.id);
  if (existingRow) {
    existingRow.quantity = (Number(existingRow.quantity) || 0) + 1;
  } else if (createForm.value.items.length === 1 && !createForm.value.items[0].productId && !createForm.value.items[0].isNewProduct) {
    selectExistingProduct(createForm.value.items[0], prod);
  } else {
    const newRow = createEmptyLine();
    selectExistingProduct(newRow, prod);
    createForm.value.items.push(newRow);
  }
  onPaymentTypeChange();
}

function getProductEntity(item) {
  if (item.isNewProduct) return null;
  return (inventoryStore.products || []).find(p => p.id === item.productId);
}

function getProductCategoryName(item) {
  const p = getProductEntity(item);
  return p?.categoryName || "—";
}

function getProductBaseUnit(item) {
  if (item.isNewProduct) return item.newProductBaseUnit || "قطعة";
  return getProductEntity(item)?.unit || "قطعة";
}

function doesItemNeedSerials(item) {
  if (item.isNewProduct) return !!item.newProductTrackSerials;
  return !!getProductEntity(item)?.trackSerialNumbers;
}

function doesItemHaveExpiry(item) {
  if (item.isNewProduct) return !!item.newProductHasExpiry;
  return !!getProductEntity(item)?.hasExpiryDate;
}

function onPurchaseUnitModeChange(item) {
  if (item.purchaseUnitMode === "piece") {
    item.packageMultiplier = 1;
    item.purchaseUnitName = getProductBaseUnit(item);
  } else {
    item.packageMultiplier = item.packageMultiplier > 1 ? item.packageMultiplier : 12;
    item.purchaseUnitName = "عبوة/كرتونة";
  }
}

function getBaseQuantity(item) {
  const mult = item.purchaseUnitMode === "pack" ? (Number(item.packageMultiplier) || 1) : 1;
  return (Number(item.quantity) || 0) * mult;
}

function getCostPerBaseUnit(item) {
  const mult = item.purchaseUnitMode === "pack" ? (Number(item.packageMultiplier) || 1) : 1;
  return mult > 0 ? (Number(item.unitCost) || 0) / mult : (Number(item.unitCost) || 0);
}

function getLiveConversionSentence(item) {
  const baseQty = getBaseQuantity(item);
  const baseCost = getCostPerBaseUnit(item);
  const unit = getProductBaseUnit(item);
  return `ستضاف ${baseQty} ${unit} إلى المخزون بتكلفة ${formatCurrency(baseCost)} ج.م لكل ${unit}`;
}

function isCostDiffWarning(item) {
  if (!item.lastPurchaseCost || item.lastPurchaseCost <= 0) return false;
  const newBaseCost = getCostPerBaseUnit(item);
  if (newBaseCost <= 0) return false;
  const diffPct = Math.abs(newBaseCost - item.lastPurchaseCost) / item.lastPurchaseCost;
  return diffPct > 0.30;
}

function getMargin(item) {
  const cost = getCostPerBaseUnit(item);
  const sell = Number(item.sellingPrice) || 0;
  if (sell <= 0) return 0;
  return Math.round(((sell - cost) / sell) * 100);
}

function getMarginBadgeClass(item) {
  const m = getMargin(item);
  if (m <= 5) return "bg-red-500/15 text-red-600 border-red-500/30";
  if (m > 80) return "bg-orange-500/15 text-orange-600 border-orange-500/30";
  return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
}

function getSerialProgressClass(item) {
  const target = getBaseQuantity(item);
  return item.serialNumbers.length === target
    ? "border-emerald-500/40 bg-emerald-500/5"
    : "border-orange-500/40 bg-orange-500/5";
}

function addScannedSerial(item) {
  const sn = (item.serialScanInput || "").trim();
  if (!sn) return;
  item.serialScanInput = "";
  if (item.serialNumbers.some(x => x.toLowerCase() === sn.toLowerCase())) {
    toast.add({ severity: "warn", summary: "مكرر", detail: `السيريال '${sn}' مضاف بالفعل لهذا البند.`, life: 2500 });
    return;
  }
  item.serialNumbers.push(sn);
}

function pasteSerialList(item) {
  const raw = item.serialPasteInput || "";
  if (!raw.trim()) return;
  const tokens = raw.split(/[\s,;،\n]+/).map(s => s.trim()).filter(Boolean);
  let added = 0;
  for (const sn of tokens) {
    if (!item.serialNumbers.some(x => x.toLowerCase() === sn.toLowerCase())) {
      item.serialNumbers.push(sn);
      added++;
    }
  }
  item.serialPasteInput = "";
  toast.add({ severity: "info", summary: "إدراج سيريالات", detail: `تمت إضافة ${added} سيريال.`, life: 2500 });
}

function generateInternalSerials(item) {
  const needed = Math.max(0, Math.round(getBaseQuantity(item)) - item.serialNumbers.length);
  const prefix = getProductEntity(item)?.sku || "SN";
  for (let i = 0; i < needed; i++) {
    const code = `${prefix}-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 899)}`;
    item.serialNumbers.push(code);
  }
}

const subTotalCost = computed(() =>
  createForm.value.items.reduce((acc, i) => acc + ((Number(i.quantity) || 0) * (Number(i.unitCost) || 0)), 0)
);

const totalInvoiceCost = computed(() =>
  Math.max(0, subTotalCost.value - (Number(createForm.value.discountAmount) || 0))
);

const remainingAmount = computed(() =>
  Math.max(0, totalInvoiceCost.value - (Number(createForm.value.paidAmount) || 0))
);

function onPaymentTypeChange() {
  if (createForm.value.paymentType === 1) {
    createForm.value.paidAmount = totalInvoiceCost.value;
  } else if (createForm.value.paymentType === 2) {
    createForm.value.paidAmount = 0;
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadingFile.value = true;
  const res = await purchaseStore.uploadInvoice(file);
  uploadingFile.value = false;
  if (res.success) {
    createForm.value.invoiceImageUrl = res.url;
    toast.add({ severity: "success", summary: "تم الرفع", detail: "تم رفع صورة الفاتورة بنجاح", life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

async function submitCreatePurchase(isDraft = false) {
  if (!createForm.value.supplierId) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى اختيار المورد أولاً.", life: 3000 });
    return;
  }

  for (let idx = 0; idx < createForm.value.items.length; idx++) {
    const i = createForm.value.items[idx];
    if ((!i.isNewProduct && !i.productId) || (i.isNewProduct && !i.newProductName?.trim()) || i.quantity <= 0) {
      toast.add({ severity: "warn", summary: "تنبيه", detail: `يرجى إكمال بيانات الصنف والكمية في البند #${idx + 1}.`, life: 3500 });
      return;
    }
    if (!isDraft && doesItemHaveExpiry(i) && !i.expiryDate) {
      toast.add({ severity: "warn", summary: "تنبيه", detail: `البند #${idx + 1} يتطلب إدخال تاريخ انتهاء الصلاحية.`, life: 3500 });
      return;
    }
    if (!isDraft && doesItemNeedSerials(i)) {
      const targetQty = Math.round(getBaseQuantity(i));
      if (i.serialNumbers.length !== targetQty && !i.completeSerialsLater) {
        toast.add({ severity: "warn", summary: "سيريالات ناقصة", detail: `البند #${idx + 1} يتطلب إدخال ${targetQty} رقم تسلسلي (أو تفعيل خيار الاستكمال لاحقاً للمشرفين).`, life: 4000 });
        return;
      }
    }
  }

  // Cost / Margin warnings confirmation (never blocks saving)
  if (!isDraft) {
    const hasWarn = createForm.value.items.some(i => isCostDiffWarning(i) || getMargin(i) <= 0);
    if (hasWarn) {
      const ok = await confirmStore.showConfirm({
        title: "تنبيه هامش الربح وتكلفة الشراء",
        message: "توجد تنبيهات حول تغير تكلفة الشراء بأكثر من 30% أو هامش ربح منخفض/سالب. هل تريد المتابعة والاعتماد؟",
        confirmText: "نعم، استمرار واعتماد",
        isDestructive: false
      });
      if (!ok) return;
    }
  }

  if (createForm.value.paymentType === 1) {
    createForm.value.paidAmount = totalInvoiceCost.value;
  }

  const payload = {
    supplierId: parseInt(createForm.value.supplierId),
    supplierInvoiceNumber: createForm.value.supplierInvoiceNumber || null,
    invoiceNumber: createForm.value.invoiceNumber || null,
    purchaseDate: new Date(createForm.value.purchaseDate).toISOString(),
    receivedDate: createForm.value.receivedDate ? new Date(createForm.value.receivedDate).toISOString() : null,
    dueDate: createForm.value.dueDate ? new Date(createForm.value.dueDate).toISOString() : null,
    discountAmount: Number(createForm.value.discountAmount) || 0,
    paymentType: createForm.value.paymentType,
    paidAmount: Number(createForm.value.paidAmount) || 0,
    splits: createForm.value.splits || [],
    financialAccountId: createForm.value.financialAccountId ? parseInt(createForm.value.financialAccountId) : null,
    invoiceImageUrl: createForm.value.invoiceImageUrl || null,
    notes: createForm.value.notes || null,
    isDraft,
    items: createForm.value.items.map(i => ({
      productId: i.isNewProduct ? null : parseInt(i.productId),
      newProductName: i.isNewProduct ? i.newProductName : null,
      newProductCategoryId: i.isNewProduct ? i.newProductCategoryId : null,
      newProductBaseUnit: i.isNewProduct ? i.newProductBaseUnit : null,
      newProductBarcode: i.isNewProduct ? i.newProductBarcode : null,
      newProductTrackSerials: i.isNewProduct ? i.newProductTrackSerials : false,
      newProductHasExpiry: i.isNewProduct ? i.newProductHasExpiry : false,
      purchaseUnitName: i.purchaseUnitMode === "pack" ? "عبوة" : getProductBaseUnit(i),
      packageMultiplier: i.purchaseUnitMode === "pack" ? Number(i.packageMultiplier) : 1,
      quantity: Number(i.quantity),
      unitCost: Number(i.unitCost),
      newSellingPrice: i.sellingPrice > 0 ? Number(i.sellingPrice) : null,
      updateSellingPrice: !!i.updateSellingPrice,
      expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : null,
      shelfLocation: i.shelfLocation || "الرف الرئيسي",
      serialNumbers: i.serialNumbers || [],
      completeSerialsLater: !!i.completeSerialsLater
    }))
  };

  submitting.value = true;
  const res = await purchaseStore.createPurchase(payload);
  submitting.value = false;

  if (res.success) {
    localStorage.setItem("ohda_last_supplier", createForm.value.supplierId.toString());
    localStorage.setItem("ohda_last_payment_type", createForm.value.paymentType.toString());
    if (createForm.value.financialAccountId) {
      localStorage.setItem("ohda_last_account", createForm.value.financialAccountId.toString());
    }

    toast.add({ severity: "success", summary: "تم بنجاح", detail: res.message, life: 4000 });
    await inventoryStore.fetchSuppliers();
    if (isDraft) {
      viewMode.value = "list";
    } else {
      lastPostedResult.value = res.data;
      showPostSuccessModal.value = true;
    }
  } else {
    toast.add({ severity: "error", summary: "فشل الحفظ", detail: res.message, life: 5000 });
  }
}

async function postExistingDraft(p) {
  const ok = await confirmStore.showConfirm({
    title: "اعتماد مسودة الشراء",
    message: `هل تريد اعتماد وترحيل المسودة #${p.invoiceNumber} للمخزون الآن؟`,
    confirmText: "نعم، ترحيل الآن",
    isDestructive: false
  });
  if (!ok) return;
  const res = await purchaseStore.postDraft(p.id);
  if (res.success) {
    toast.add({ severity: "success", summary: "تم الترحيل", detail: res.message, life: 4000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

async function deleteExistingDraft(p) {
  const ok = await confirmStore.showConfirm({
    title: "حذف مسودة الشراء",
    message: `هل أنت متأكد من رغبتك في حذف المسودة #${p.invoiceNumber} نهائياً؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (!ok) return;
  const res = await purchaseStore.deleteDraft(p.id);
  if (res.success) {
    toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = (import.meta.env.VITE_ROOT_URL || "http://localhost:5146").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function viewDetails(p) {
  selectedPurchase.value = p;
  showDetailsModal.value = true;
}

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function getPaymentTypeText(type) {
  switch (type) {
    case 1: return "مسدد فوري";
    case 2: return "آجل بالكامل";
    case 3: return "دفع جزئي";
    default: return "أخرى";
  }
}

function getPaymentTypeBadge(type) {
  switch (type) {
    case 1: return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
    case 2: return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
    case 3: return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30";
    default: return "bg-gray-500/15 text-gray-700 border border-gray-500/30";
  }
}

function exportPurchasesToExcel() {
  const exportCols = [
    { key: "invoiceNumber", label: "رقم الفاتورة" },
    { key: "purchaseDate", label: "تاريخ الشراء" },
    { key: "supplierName", label: "المورد" },
    { key: "totalAmount", label: "إجمالي الفاتورة (ج.م)" },
    { key: "paidAmount", label: "المدفوع (ج.م)" },
    { key: "remainingBalance", label: "المتبقي (ج.م)" },
    { key: "paymentType", label: "طريقة السداد" }
  ];
  const exportData = (purchaseStore.purchases || []).map(p => ({
    invoiceNumber: p.invoiceNumber || "",
    purchaseDate: formatDate(p.purchaseDate),
    supplierName: p.supplierName || "",
    totalAmount: p.totalAmount || 0,
    paidAmount: p.paidAmount || 0,
    remainingBalance: p.remainingBalance || 0,
    paymentType: p.isDraft ? "مسودة" : getPaymentTypeText(p.paymentType)
  }));
  exportToExcelCsv("فواتير_المشتريات.csv", exportCols, exportData);
}
</script>
