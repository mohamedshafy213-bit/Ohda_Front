<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Package class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.products.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.products.subTitle') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <router-link
          to="/ohda/barcode-print"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2 !text-xs !font-semibold flex items-center gap-2 transition-all shadow-sm"
          title="الانتقال إلى صفحة طباعة ملصقات الباركود والـ QR"
        >
          <Printer class="w-4 h-4 text-brand-accent" />
          <span>طباعة الباركود والملصقات</span>
        </router-link>

        <Button
          @click="exportExcel"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2 !text-xs !font-semibold flex items-center gap-2 shadow-sm"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>

        <Button
          @click="showImportModal = true"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2 !text-xs !font-semibold flex items-center gap-2 shadow-sm"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          {{ $t('ohda.common.importExcel') }}
        </Button>

        <Button
          @click="openAddModal"
          :disabled="branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
          :class="{ '!opacity-50 !cursor-not-allowed': branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin }"
          :title="branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin ? $t('ohda.quotas.productsLimitReached') : $t('ohda.products.addProduct')"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.products.addProduct') }}
        </Button>
      </div>
    </div>

    <!-- Branch Products Quota Consumption Banner -->
    <div
      v-if="branchStore.myQuota"
      class="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
      :class="branchStore.myQuota.isProductQuotaExceeded
        ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
        : (branchStore.myQuota.remainingProducts <= 20)
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          : 'bg-brand-soft dark:bg-white/5 border-brand-accent/20 text-brand-dark dark:text-white'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          :class="branchStore.myQuota.isProductQuotaExceeded ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600'"
        >
          <Package class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold flex items-center gap-2">
            <span>سعة أصناف الفرع ({{ branchStore.myQuota.branchName || 'الفرع الحالي' }}):</span>
            <span class="font-mono font-bold">{{ branchStore.myQuota.currentProductCount }} / {{ branchStore.myQuota.maxProducts }} صنف</span>
            <span class="text-[10px] font-semibold">({{ branchStore.myQuota.remainingProducts }} متبقي)</span>
          </div>
          <p class="text-[11px] opacity-80 mt-0.5">
            {{ branchStore.myQuota.isProductQuotaExceeded
              ? $t('ohda.quotas.productsLimitReached')
              : 'الحد الأقصى للأصناف المسجلة في هذا الفرع محدد ومضبوط حصرياً من قِبل مدير المنصة العام (SuperAdmin).' }}
          </p>
        </div>
      </div>

      <!-- Quota Progress Bar -->
      <div class="w-full sm:w-48 space-y-1">
        <div class="flex items-center justify-between text-[10px] font-bold">
          <span>الاستهلاك</span>
          <span>{{ Math.round((branchStore.myQuota.currentProductCount / (branchStore.myQuota.maxProducts || 1)) * 100) }}%</span>
        </div>
        <div class="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="branchStore.myQuota.isProductQuotaExceeded ? 'bg-red-500' : (branchStore.myQuota.remainingProducts <= 20 ? 'bg-amber-500' : 'bg-emerald-500')"
            :style="{ width: Math.min(100, Math.round((branchStore.myQuota.currentProductCount / (branchStore.myQuota.maxProducts || 1)) * 100)) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" placeholder="ابحث باسم المنتج، كود SKU، أو الباركود..." />
    </div>

    <!-- Products DataTable -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredProducts"
        :loading="inventoryStore.loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        emptyMessage="لا توجد منتجات مسجلة. اضغط على '+ إضافة صنف جديد' لإنشاء أول منتج."
      >
        <Column field="sku" :header="$t('ohda.products.sku')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold select-all">{{ data.sku || '-' }}</span>
          </template>
        </Column>

        <Column field="barcode" :header="$t('ohda.products.barcode')">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray select-all">{{ data.barcode || '-' }}</span>
          </template>
        </Column>

        <Column field="name" :header="$t('ohda.products.name')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark dark:text-white">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')">
          <template #body="{ data }">
            <span class="text-brand-dark dark:text-slate-300">{{ data.categoryName || '-' }}</span>
          </template>
        </Column>

        <Column field="supplierName" :header="$t('ohda.products.supplier')">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.supplierName || 'غير محدد' }}</span>
          </template>
        </Column>

        <Column header="نوع المخزون">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block" :class="data.inventoryType === 2 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'">
              {{ data.inventoryType === 2 ? 'أصل ثابت' : 'شراء وتوريد' }}
            </span>
          </template>
        </Column>

        <Column header="الأسعار والتكلفة">
          <template #body="{ data }">
            <div v-if="data.purchasePrice || data.assetValue || data.unitPrice" class="font-mono text-[11px] space-y-0.5">
              <span v-if="data.unitPrice" class="text-brand-dark dark:text-white font-bold block">{{ data.unitPrice }} ر.س (سعر)</span>
              <span v-if="data.purchasePrice" class="text-brand-gray text-[10px] block">تكلفة: {{ data.purchasePrice }} ر.س</span>
              <span v-if="data.assetValue" class="text-amber-600 text-[10px] block">قيمة أصل: {{ data.assetValue }} ر.س</span>
            </div>
            <span v-else class="text-brand-gray text-[11px] font-medium">-</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.products.qty')">
          <template #body="{ data }">
            <span class="font-bold text-sm font-mono" :class="(data.quantity || 0) <= (data.minThreshold || 5) ? 'text-amber-600' : 'text-brand-accent'">
              {{ data.quantity || data.amount || 0 }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center gap-1.5">
              <!-- Print Barcode Action Button -->
              <router-link
                :to="`/ohda/barcode-print?productId=${data.id}`"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer flex items-center justify-center border border-brand-gray/15"
                title="طباعة ملصق الباركود لهذا الصنف"
              >
                <Printer class="w-3.5 h-3.5" />
              </router-link>

              <!-- View Serials -->
              <button
                type="button"
                @click="viewProductSerials(data)"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer flex items-center justify-center border border-brand-gray/15"
                title="عرض الأرقام التسلسلية المسجلة"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>

              <editButton @click="editProduct(data)" />
              <deleteButton @click="deleteProduct(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Product Dialog -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? 'تعديل بيانات الصنف / المنتج' : 'إضافة صنف / منتج جديد في المخزون'"
      class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 max-w-2xl w-full !text-brand-dark dark:!text-white"
    >
      <form @submit.prevent="saveProduct" @keydown.enter="handleFormEnter" class="space-y-4 text-xs">
        <!-- 1. Product Basic Info -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="font-semibold text-brand-dark dark:text-white required">اسم الصنف / المنتج</label>
            <span class="text-[10px] text-brand-gray font-normal">إلزامي *</span>
          </div>
          <InputText
            id="productNameInput"
            v-model="form.name"
            required
            placeholder="مثال: لابتوب Dell Latitude 5420 أو شاشة سامسونج 27 بوصة"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-medium"
          />
        </div>

        <!-- 2. SKU and Barcode (Manual with Generate Helpers) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-brand-dark dark:text-white required">رمز الصنف (SKU)</label>
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
              id="productSkuInput"
              v-model="form.sku"
              required
              placeholder="مثال: SKU-DELL-5420"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-brand-dark dark:text-white">الباركود (Barcode) - اختياري</label>
              <button
                type="button"
                @click="generateBarcode"
                class="text-[10px] text-brand-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles class="w-3 h-3" />
                <span>توليد باركود</span>
              </button>
            </div>
            <div class="relative">
              <InputText
                id="productBarcodeInput"
                v-model="form.barcode"
                @keydown.enter.prevent="handleBarcodeScanEnter"
                placeholder="امسح بالماسح الضوئي أو اكتب الباركود..."
                class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono"
              />
              <span v-if="barcodeScanNotice" class="absolute end-2 top-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
                {{ barcodeScanNotice }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Category & Product State -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-brand-dark dark:text-white required">{{ $t('ohda.products.category') }}</label>
              <span class="text-[10px] text-brand-gray font-normal">إلزامي *</span>
            </div>
            <Select
              id="productCategorySelect"
              v-model="form.categoryId"
              :options="inventoryStore.categories"
              optionLabel="name"
              optionValue="id"
              placeholder="اختر الفئة / التصنيف *"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">حالة المنتج (اختياري)</label>
            <Select
              v-model="form.productStateId"
              :options="productStates"
              optionLabel="name"
              optionValue="id"
              showClear
              placeholder="اختر حالة المنتج (اختياري)"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            />
          </div>
        </div>

        <!-- 4. Supplier & Inventory Type -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">{{ $t('ohda.products.supplier') }} (اختياري)</label>
            <Select
              v-model="form.supplierId"
              :options="inventoryStore.suppliers"
              optionLabel="companyName"
              optionValue="id"
              showClear
              placeholder="اختر المورد (اختياري)"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">نوع المخزون</label>
            <Select
              v-model="form.inventoryType"
              :options="[
                { value: 1, label: 'شراء وتوريد (Purchase)' },
                { value: 2, label: 'أصل ثابت (Asset)' }
              ]"
              optionLabel="label"
              optionValue="value"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            />
          </div>
        </div>

        <!-- 5. Tracking Mode & Serials Input (Key Feature Requested) -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white text-xs flex items-center gap-2">
              <ScanLine class="w-4 h-4 text-brand-accent" />
              <span>طريقة تتبع وترقيم الأجهزة والأصناف</span>
            </span>
          </div>

          <!-- Radio Selection: Serialized vs General -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
              :class="trackingType === 'serials' ? 'bg-brand-accent/15 border-brand-accent text-brand-dark dark:text-white font-bold' : 'border-brand-gray/20 hover:bg-white/5 text-brand-gray'"
            >
              <input type="radio" value="serials" v-model="trackingType" @change="onTrackingTypeChange" />
              <div>
                <span>أجهزة برقم تسلسلي (Serials)</span>
                <span class="block text-[10px] font-normal opacity-75">تسجيل السيريال لكل جهاز بالاسم أو بالماسح</span>
              </div>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
              :class="trackingType === 'general' ? 'bg-brand-accent/15 border-brand-accent text-brand-dark dark:text-white font-bold' : 'border-brand-gray/20 hover:bg-white/5 text-brand-gray'"
            >
              <input type="radio" value="general" v-model="trackingType" @change="onTrackingTypeChange" />
              <div>
                <span>أصناف عامة بدون سيريال</span>
                <span class="block text-[10px] font-normal opacity-75">مستهلكات / طباعة باركود عام ولصقه</span>
              </div>
            </label>
          </div>

          <!-- Quantity Input -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">الكمية المدخلة</label>
              <InputText
                v-model.number="form.amount"
                type="number"
                min="1"
                :max="trackingType === 'serials' ? 100 : 10000"
                required
                @input="syncSerialsList"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
              />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1 required">حد الأمان للرصيد</label>
              <InputText
                v-model.number="form.minThreshold"
                type="number"
                min="0"
                required
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
              />
            </div>
          </div>

          <!-- Serials Inputs Table when "serials" is active and in Add Mode -->
          <div v-if="trackingType === 'serials' && !isEditing" class="space-y-2 pt-2 border-t border-brand-gray/10">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-brand-dark dark:text-white">
                الأرقام التسلسلية للأجهزة ({{ serialList.length }} جهاز):
              </span>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openFastScanner"
                  class="text-[10px] px-2 py-1 rounded-lg bg-brand-accent/20 text-brand-dark dark:text-brand-accent font-bold hover:bg-brand-accent/30 flex items-center gap-1 cursor-pointer transition"
                >
                  <QrCode class="w-3.5 h-3.5" />
                  <span>مسح سريع بالماسح الضوئي</span>
                </button>
                <button
                  type="button"
                  @click="autoFillSerials"
                  class="text-[10px] px-2 py-1 rounded-lg bg-brand-light text-brand-gray hover:text-brand-dark border border-brand-gray/20 font-semibold cursor-pointer transition"
                >
                  توليد تلقائي للمتبقي
                </button>
              </div>
            </div>

            <!-- Fast Scan Input Box -->
            <div v-if="showFastScanInput" class="p-2.5 bg-brand-soft dark:bg-white/10 rounded-xl border border-brand-accent/30 flex items-center gap-2">
              <QrCode class="w-4 h-4 text-brand-accent shrink-0 animate-pulse" />
              <input
                ref="fastScanInputRef"
                v-model="fastScanText"
                @keydown.enter.prevent="handleFastScanSubmit"
                placeholder="مرر الباركود / السيريال بالماسح الضوئي هنا..."
                class="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-black/50 border border-brand-gray/20 focus:outline-none focus:border-brand-accent font-mono font-bold"
              />
              <button
                type="button"
                @click="handleFastScanSubmit"
                class="px-2.5 py-1 text-[11px] bg-brand-accent text-brand-dark font-bold rounded-lg cursor-pointer shrink-0"
              >
                إدخال
              </button>
              <button
                type="button"
                @click="showFastScanInput = false"
                class="p-1 text-brand-gray hover:text-red-500 cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Scrollable list of serial slots -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-white/50 dark:bg-black/20 rounded-xl border border-brand-gray/10">
              <div
                v-for="(s, index) in serialList"
                :key="index"
                class="flex items-center gap-1.5 p-1 bg-white dark:bg-brand-dark/70 rounded-lg border border-brand-gray/15"
              >
                <span class="text-[10px] font-mono text-brand-gray font-bold w-6 text-center">#{{ index + 1 }}</span>
                <input
                  :id="'serial-slot-' + index"
                  v-model="serialList[index]"
                  type="text"
                  @keydown.enter.prevent="handleSerialSlotEnter(index)"
                  placeholder="اكتب أو امسح السيريال..."
                  class="flex-1 px-2 py-1 text-xs bg-transparent border-none focus:outline-none font-mono font-bold text-brand-dark dark:text-white"
                />
                <button
                  type="button"
                  @click="serialList[index] = `SN-${form.sku || 'ITEM'}-${index + 1}-${Math.floor(1000 + Math.random() * 9000)}`"
                  class="p-1 text-brand-gray hover:text-brand-accent cursor-pointer"
                  title="توليد سيريال عشوائي لهذه الخانة"
                >
                  <Sparkles class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Note for general products -->
          <div v-else-if="trackingType === 'general'" class="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
            <Info class="w-4 h-4 shrink-0" />
            <span>سيتم إضافة {{ form.amount }} قطعة إلى رصيد المستودع، ويمكنك طباعة ملصق الباركود العام لهذا الصنف ولصقه على المنتجات من صفحة طباعة الباركود.</span>
          </div>
        </div>

        <!-- 6. Optional Financials & Pricing Toggle (Key Feature Requested) -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-brand-dark dark:text-white text-xs block">
                المعلومات المالية والأسعار
              </span>
              <span class="text-[10px] text-brand-gray">اختياري - يمكنك التفعيل لتحديد أسعار الشراء والبيع</span>
            </div>

            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="hasPricing" class="sr-only peer" />
              <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-accent"></div>
            </label>
          </div>

          <!-- Collapsible Pricing Inputs -->
          <div v-if="hasPricing" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-gray/10">
            <div v-if="form.inventoryType === 1">
              <label class="block font-semibold text-brand-dark dark:text-white mb-1">سعر الشراء / التكلفة (ر.س)</label>
              <InputText
                v-model.number="form.purchasePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
              />
            </div>
            <div v-else>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1">قيمة الأصل الدفترية (ر.س)</label>
              <InputText
                v-model.number="form.assetValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
              />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1">سعر البيع / التقييم للوحدة (ر.س)</label>
              <InputText
                v-model.number="form.unitPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSaving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold disabled:opacity-50"
          >
            {{ isSaving ? 'جاري الحفظ...' : $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Import Excel Upload Dialog -->
    <Dialog v-model:visible="showImportModal" modal :header="$t('ohda.products.importTitle')" class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 max-w-md w-full !text-brand-dark dark:!text-white">
      <div class="space-y-4 text-xs">
        <div class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light dark:bg-white/5 transition-colors">
          <FileSpreadsheet class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="text-xs font-semibold text-brand-dark dark:text-white mb-1">
            {{ $t('ohda.products.dragExcel') }}
          </p>
          <span class="text-[11px] text-brand-gray block mb-4">يدعم ملفات .XLSX و .CSV</span>
          <input type="file" accept=".xlsx, .xls, .csv" class="hidden" id="excelInput" @change="handleFileUpload" />
          <label for="excelInput" class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer inline-block">
            اختر ملف من جهازك
          </label>
        </div>

        <div class="flex items-center justify-between pt-3 text-xs border-t border-brand-gray/10">
          <Button @click="downloadTemplate" class="!bg-transparent !text-brand-accent hover:!underline">
            {{ $t('ohda.products.downloadTemplate') }}
          </Button>
          <SecondaryButton @click="showImportModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- View Serials Dialog -->
    <Dialog v-model:visible="showSerialsModal" modal :header="`الأرقام التسلسلية: ${selectedProductForSerials?.name || ''}`" class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 max-w-2xl w-full !text-brand-dark dark:!text-white">
      <div class="space-y-4 text-xs">
        <div v-if="loadingSerials" class="text-center py-8">
          <svg class="animate-spin h-6 w-6 text-brand-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-brand-gray mt-2 block">جاري تحميل الأرقام التسلسلية...</span>
        </div>

        <div v-else-if="productSerials.length === 0" class="p-8 text-center text-brand-gray space-y-2">
          <Package class="w-12 h-12 text-brand-gray/50 mx-auto mb-2" />
          <p class="font-bold">لا توجد أرقام تسلسلية مسجلة لهذا المنتج حالياً.</p>
          <router-link
            :to="`/ohda/barcode-print?productId=${selectedProductForSerials?.id}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent text-brand-dark font-bold text-xs mt-2"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>طباعة ملصق الباركود العام لهذا الصنف</span>
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          <div
            v-for="item in productSerials"
            :key="item.id"
            class="flex items-center gap-3 p-3 bg-brand-light dark:bg-white/5 border border-brand-gray/15 rounded-xl"
          >
            <!-- Serial Details -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono font-bold text-brand-dark dark:text-white text-xs select-all truncate">{{ item.serialNumber }}</span>
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                  :class="item.status === 1 ? 'bg-brand-soft text-brand-accent border-brand-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                >
                  {{ item.status === 1 ? 'متوفر بالمخزن' : 'منصرف كعهدة' }}
                </span>
              </div>

              <div v-if="item.status === 2" class="text-[10px] text-brand-gray space-y-0.5">
                <div class="flex items-center gap-1">
                  <span class="font-semibold text-brand-gray">المستلم:</span>
                  <span class="truncate text-brand-dark dark:text-white font-medium">{{ item.holderName || 'غير محدد' }}</span>
                </div>
              </div>
              <div v-else class="text-[10px] text-brand-accent font-semibold">
                جاهز للصرف من المستودع
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-brand-gray/10">
          <router-link
            :to="`/ohda/barcode-print?productId=${selectedProductForSerials?.id}`"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent/15 text-brand-dark dark:text-brand-accent font-bold hover:bg-brand-accent/25 transition text-xs"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>طباعة ملصقات الباركود لهذا المنتج</span>
          </router-link>

          <SecondaryButton @click="showSerialsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { apiGet } from "@/utilities/fetchApi";
import {
  Package,
  Plus,
  Printer,
  Download,
  Upload,
  Eye,
  FileSpreadsheet,
  ScanLine,
  QrCode,
  Sparkles,
  Info,
  X
} from "lucide-vue-next";

const toast = useToast();
const inventoryStore = useOhdaInventoryStore();
const branchStore = useOhdaBranchStore();
const authStore = useOhdaAuthStore();

const showSerialsModal = ref(false);
const loadingSerials = ref(false);
const productSerials = ref([]);
const selectedProductForSerials = ref(null);
const productStates = ref([]);

const searchQuery = ref("");
const showModal = ref(false);
const showImportModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref(null);

// Pricing and Tracking options
const hasPricing = ref(false);
const trackingType = ref("serials"); // "serials" | "general"
const serialList = ref([]);
const showFastScanInput = ref(false);
const fastScanText = ref("");
const fastScanInputRef = ref(null);
const barcodeScanNotice = ref("");

const form = ref({
  name: "",
  sku: "",
  barcode: "",
  categoryId: null,
  supplierId: null,
  productStateId: null,
  inventoryType: 1,
  purchasePrice: null,
  assetValue: null,
  unitPrice: null,
  amount: 1,
  quantity: 1,
  minThreshold: 5,
  serialNumbers: []
});

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchProducts(),
    inventoryStore.fetchCategories(),
    inventoryStore.fetchSuppliers(),
    branchStore.fetchMyQuota()
  ]);
  try {
    const res = await apiGet("/api/ProductState");
    productStates.value = res?.data?.objects || res?.data?.singleObject || [];
  } catch (err) {
    console.warn("Failed to fetch product states", err);
  }
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return inventoryStore.products;
  const q = searchQuery.value.toLowerCase().trim();
  return inventoryStore.products.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(q)
  );
});

// Sound feedback for scanner actions
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // ignore audio failure
  }
};

// Prevent scanner/Enter key from prematurely submitting form
function handleFormEnter(e) {
  if (e.target && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") {
    e.preventDefault();
  }
}

// When scanner scans into Barcode input
function handleBarcodeScanEnter() {
  if (form.value.barcode?.trim()) {
    playBeep();
    barcodeScanNotice.value = "تمت قراءة الباركود ✓";
    setTimeout(() => {
      barcodeScanNotice.value = "";
    }, 2500);
    toast.add({
      severity: "info",
      summary: "تم تسجيل الباركود",
      detail: `الباركود: ${form.value.barcode}`,
      life: 2000
    });
  }
}

// When scanner scans into Serial slot input
function handleSerialSlotEnter(index) {
  playBeep();
  if (index + 1 < serialList.value.length) {
    nextTick(() => {
      document.getElementById(`serial-slot-${index + 1}`)?.focus();
    });
  } else if (serialList.value.length < (trackingType.value === "serials" ? 100 : 10000)) {
    form.value.amount++;
    serialList.value.push("");
    nextTick(() => {
      document.getElementById(`serial-slot-${index + 1}`)?.focus();
    });
  }
}

function generateSku() {
  const prefix = form.value.name ? form.value.name.substring(0, 3).toUpperCase().replace(/\s/g, "") : "SKU";
  form.value.sku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateBarcode() {
  form.value.barcode = `629${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function syncSerialsList() {
  const count = Math.max(1, Math.min(100, form.value.amount || 1));
  const current = serialList.value;
  if (current.length < count) {
    while (current.length < count) {
      current.push("");
    }
  } else if (current.length > count) {
    serialList.value = current.slice(0, count);
  }
}

function onTrackingTypeChange() {
  if (trackingType.value === "serials") {
    syncSerialsList();
  }
}

function autoFillSerials() {
  const sku = form.value.sku || "ITEM";
  serialList.value = serialList.value.map((val, idx) => {
    if (val && val.trim()) return val;
    return `SN-${sku}-${idx + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
  });
}

function openFastScanner() {
  showFastScanInput.value = true;
  nextTick(() => {
    fastScanInputRef.value?.focus();
  });
}

function handleFastScanSubmit() {
  const code = fastScanText.value.trim();
  if (!code) return;
  playBeep();

  // Find first empty slot in serialList
  const emptyIndex = serialList.value.findIndex(s => !s || !s.trim());
  if (emptyIndex !== -1) {
    serialList.value[emptyIndex] = code;
  } else {
    // If all full and less than limit, add a new slot
    form.value.amount++;
    serialList.value.push(code);
  }

  fastScanText.value = "";
  nextTick(() => {
    fastScanInputRef.value?.focus();
  });
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  hasPricing.value = false;
  trackingType.value = "serials";
  showFastScanInput.value = false;
  fastScanText.value = "";
  barcodeScanNotice.value = "";

  form.value = {
    name: "",
    sku: "",
    barcode: "",
    categoryId: inventoryStore.categories.length > 0 ? inventoryStore.categories[0].id : null,
    supplierId: null,
    productStateId: null,
    inventoryType: 1,
    purchasePrice: null,
    assetValue: null,
    unitPrice: null,
    amount: 1,
    quantity: 1,
    minThreshold: 5,
    serialNumbers: []
  };

  serialList.value = [""];
  showModal.value = true;
}

function editProduct(product) {
  isEditing.value = true;
  editingId.value = product.id;
  hasPricing.value = !!(product.purchasePrice || product.assetValue || product.unitPrice);
  trackingType.value = "general";
  showFastScanInput.value = false;
  barcodeScanNotice.value = "";

  form.value = {
    ...product,
    amount: product.amount || product.quantity || 0,
    purchasePrice: product.purchasePrice || null,
    assetValue: product.assetValue || null,
    unitPrice: product.unitPrice || null
  };
  showModal.value = true;
}

async function saveProduct() {
  // 1. Validation: Product Name (Required)
  if (!form.value.name?.trim()) {
    toast.add({
      severity: "warn",
      summary: "حقل إلزامي مطلوب",
      detail: "يرجى كتابة اسم الصنف / المنتج أولاً.",
      life: 4000
    });
    document.getElementById("productNameInput")?.focus();
    return;
  }

  // 2. Validation: SKU (Required)
  if (!form.value.sku?.trim()) {
    toast.add({
      severity: "warn",
      summary: "حقل إلزامي مطلوب",
      detail: "يرجى إدخال رمز الصنف (SKU) أو الضغط على زر 'توليد تلقائي'.",
      life: 4000
    });
    document.getElementById("productSkuInput")?.focus();
    return;
  }

  // 3. Validation: Category (Required)
  if (!form.value.categoryId) {
    toast.add({
      severity: "warn",
      summary: "حقل إلزامي مطلوب",
      detail: "يرجى اختيار فئة / تصنيف للصنف من قائمة الفئات.",
      life: 4000
    });
    document.getElementById("productCategorySelect")?.focus();
    return;
  }

  // 4. Validation: Quantity / Amount
  if (!form.value.amount || form.value.amount <= 0) {
    toast.add({
      severity: "warn",
      summary: "قيمة غير صالحة",
      detail: "يرجى إدخال كمية صحيحة أكبر من صفر.",
      life: 4000
    });
    return;
  }

  // 5. Validation: Serials when tracking mode is "serials"
  if (trackingType.value === "serials" && !isEditing.value) {
    const filledSerials = serialList.value.map(s => s?.trim()).filter(Boolean);
    const expectedCount = form.value.amount || 1;

    // Check if any slot is missing
    if (filledSerials.length < expectedCount) {
      const confirmAuto = confirm(
        `لقد حددت كمية (${expectedCount}) أجهزة، ولكن تم إدخال (${filledSerials.length}) أرقام تسلسلية فقط.\n\nهل تريد توليد أرقام تسلسلية تلقائياً للمتبقي (${expectedCount - filledSerials.length}) وإكمال الحفظ؟`
      );
      if (confirmAuto) {
        autoFillSerials();
      } else {
        toast.add({
          severity: "info",
          summary: "إدخال السيريال مطلوب",
          detail: "يرجى مسح أو إدخال السيريال لكل جهاز أو استخدام زر 'توليد تلقائي للمتبقي'.",
          life: 4000
        });
        return;
      }
    }

    // Check for duplicate serials
    const uniqueSerials = new Set(serialList.value.map(s => s.trim().toLowerCase()));
    if (uniqueSerials.size !== serialList.value.length) {
      toast.add({
        severity: "error",
        summary: "أرقام تسلسلية مكررة",
        detail: "يوجد أرقام تسلسلية مكررة في القائمة. يجب أن يكون لكل جهاز رقم تسلسلي فريد.",
        life: 5000
      });
      return;
    }
  }

  isSaving.value = true;
  try {
    // If barcode not provided, generate a clean one based on SKU or random
    if (!form.value.barcode?.trim()) {
      form.value.barcode = form.value.sku ? `BC-${form.value.sku}` : `629${Math.floor(100000000 + Math.random() * 900000000)}`;
    }

    // Set prices to null if hasPricing is disabled
    if (!hasPricing.value) {
      form.value.purchasePrice = null;
      form.value.assetValue = null;
      form.value.unitPrice = null;
    }

    form.value.quantity = form.value.amount;

    // Attach custom serial numbers if serials tracking enabled
    if (trackingType.value === "serials" && !isEditing.value) {
      form.value.serialNumbers = serialList.value.map(s => s?.trim()).filter(Boolean);
      form.value.hasCustomSerials = form.value.serialNumbers.length > 0;
    } else {
      form.value.serialNumbers = [];
      form.value.hasCustomSerials = false;
    }

    let res;
    if (isEditing.value) {
      res = await inventoryStore.updateProduct(editingId.value, form.value);
    } else {
      res = await inventoryStore.addProduct(form.value);
    }

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تمت العملية بنجاح",
        detail: res.message || "تم حفظ بيانات الصنف بنجاح",
        life: 3000
      });
      showModal.value = false;
      branchStore.fetchMyQuota();
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ في الحفظ",
        detail: res.message || "تعذر حفظ بيانات الصنف",
        life: 5000
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ غير متوقع",
      detail: err.message || "حدث خطأ غير متوقع",
      life: 5000
    });
  } finally {
    isSaving.value = false;
  }
}

async function deleteProduct(id) {
  if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج؟")) {
    const res = await inventoryStore.deleteProduct(id);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم الحذف",
        detail: res.message || "تم حذف المنتج بنجاح",
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        summary: "فشل الحذف",
        detail: res.message || "فشل حذف المنتج",
        life: 5000
      });
    }
  }
}

async function viewProductSerials(product) {
  selectedProductForSerials.value = product;
  productSerials.value = [];
  showSerialsModal.value = true;
  loadingSerials.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/product/${product.id}`);
    if (res?.data?.isDone) {
      productSerials.value = res.data.objects || (res.data.singleObject ? [res.data.singleObject] : []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingSerials.value = false;
  }
}

function exportExcel() {
  inventoryStore.exportToExcel("products");
}

async function downloadTemplate() {
  const res = await inventoryStore.downloadExcelTemplate();
  if (!res.success) {
    toast.add({
      severity: "error",
      summary: "خطأ في التحميل",
      detail: res.message || "تعذر تحميل النموذج",
      life: 4000
    });
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const res = await inventoryStore.importExcelProducts(file);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم الاستيراد",
        detail: res.message || "تم استيراد المنتجات بنجاح!",
        life: 3000
      });
      showImportModal.value = false;
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ في الاستيراد",
        detail: res.message || "حدث خطأ أثناء استيراد المنتجات",
        life: 5000
      });
    }
  }
}
</script>
