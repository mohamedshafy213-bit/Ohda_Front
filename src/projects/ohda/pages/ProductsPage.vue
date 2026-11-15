<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Package class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.products.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.products.subTitle') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <router-link
          to="/ohda/barcode-print"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 transition-all shadow-xs"
          :title="$t('ohda.barcodePrint.title')"
        >
          <Printer class="w-4 h-4 text-brand-accent" />
          <span>{{ $t('ohda.nav.barcodePrint') }}</span>
        </router-link>

        <Button
          @click="downloadTemplate"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          title="تحميل شيت Excel فارغ لإدخال الأصناف واستيرادها مباشرة"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>تحميل نموذج Excel فارغ</span>
        </Button>

        <Button
          @click="exportExcel"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          {{ $t('ohda.common.exportExcel') }}
        </Button>

        <Button
          @click="showImportModal = true"
          class="!bg-brand-light dark:!bg-white/5 hover:!bg-brand-soft !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 shadow-xs"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          {{ $t('ohda.common.importExcel') }}
        </Button>

        <Button
          @click="openAddModal"
          :disabled="branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
          :class="{ '!opacity-50 !cursor-not-allowed': branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin }"
          :title="branchStore.myQuota?.isProductQuotaExceeded && !authStore.isSuperAdmin ? $t('ohda.quotas.productsLimitReached') : $t('ohda.products.addProduct')"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.products.addProduct') }}
        </Button>
      </div>
    </div>

    <!-- Branch Products Quota Consumption Banner -->
    <!-- <div
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
            <span>{{ $t('ohda.branches.quotas') }} ({{ branchStore.myQuota.branchName || '' }}):</span>
            <span class="font-mono font-bold">{{ branchStore.myQuota.currentProductCount }} / {{ branchStore.myQuota.maxProducts }} {{ $t('ohda.common.item') }}</span>
            <span class="text-[10px] font-semibold">({{ branchStore.myQuota.remainingProducts }} متبقي)</span>
          </div>
          <p class="text-[11px] opacity-80 mt-0.5">
            {{ branchStore.myQuota.isProductQuotaExceeded
              ? $t('ohda.quotas.productsLimitReached')
              : $t('ohda.quotas.productsLimitBanner', { current: branchStore.myQuota.currentProductCount, max: branchStore.myQuota.maxProducts, remaining: branchStore.myQuota.remainingProducts }) }}
          </p>
        </div>
      </div>

      Quota Progress Bar
      <div class="w-full sm:w-48 space-y-1">
        <div class="flex items-center justify-between text-[10px] font-bold">
          <span>{{ $t('ohda.branches.quotaProductProgress') }}</span>
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
    </div> -->

    <!-- Search Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm ">
      <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading" type="table" :count="8" />

    <!-- Products DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredProducts"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            :title="$t('ohda.products.emptyState')"
            icon="Package"
            :actionLabel="$t('ohda.products.addProduct')"
            @action="openAddModal"
          />
        </template>

        <Column field="name" :header="$t('ohda.products.name')" sortable headerClass="text-start">
          <template #body="{ data }">
            <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="categoryName" :header="$t('ohda.products.category')" sortable headerClass="text-start">
          <template #body="{ data }">
            <span class="text-brand-dark dark:text-slate-300 text-xs">{{ data.categoryName || '-' }}</span>
          </template>
        </Column>

        <Column field="sku" :header="$t('ohda.products.sku')" sortable headerClass="text-start">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold select-all text-xs">{{ data.sku || '-' }}</span>
          </template>
        </Column>

        <Column field="barcode" :header="$t('ohda.products.barcode')" sortable headerClass="text-start">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray dark:text-slate-400 select-all text-xs">{{ data.barcode || '-' }}</span>
          </template>
        </Column>

        <Column field="quantity" :header="$t('ohda.products.qty')" sortable headerClass="text-center" bodyClass="text-center" style="width: 100px">
          <template #body="{ data }">
            <span class="font-bold text-sm font-mono" :class="(data.quantity || 0) <= (data.minThreshold || 5) ? 'text-amber-600' : 'text-brand-accent'">
              {{ data.quantity || data.amount || 0 }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.products.inventoryType')" headerClass="text-center" bodyClass="text-center" style="width: 110px">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block" :class="data.inventoryType === 2 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'">
              {{ data.inventoryType === 2 ? $t('ohda.products.fixedAsset') : $t('ohda.products.consumable') }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.dashboard.price')" headerClass="text-start">
          <template #body="{ data }">
            <div v-if="data.purchasePrice || data.assetValue || data.unitPrice" class="font-mono text-[11px] space-y-0.5">
              <span v-if="data.unitPrice" class="text-brand-dark dark:text-white font-bold block">{{ data.unitPrice }} {{ $t('ohda.common.sar') }}</span>
              <span v-if="data.purchasePrice" class="text-brand-gray dark:text-slate-400 text-[10px] block">{{ $t('ohda.products.purchasePrice') }}: {{ data.purchasePrice }} {{ $t('ohda.common.sar') }}</span>
              <span v-if="data.assetValue" class="text-amber-600 dark:text-amber-400 text-[10px] block">{{ $t('ohda.products.assetValue') }}: {{ data.assetValue }} {{ $t('ohda.common.sar') }}</span>
            </div>
            <span v-else class="text-brand-gray dark:text-slate-400 text-[11px] font-medium">-</span>
          </template>
        </Column>

        <Column field="supplierName" :header="$t('ohda.products.supplier')" sortable headerClass="text-start">
          <template #body="{ data }">
            <span class="text-brand-gray dark:text-slate-400 text-xs">{{ data.supplierName || '-' }}</span>
          </template>
        </Column>

        <!-- Actions -->
        <Column :header="$t('ohda.common.actions')" headerClass="text-center" bodyClass="text-center" style="width: 175px; min-width: 175px">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-1">
              <!-- Quick Add Serials Button (+) -->
              <button
                type="button"
                @click="openAddSerialsModal(data)"
                class="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 transition cursor-pointer flex items-center justify-center border border-emerald-500/20"
                title="إضافة أرقام مسلسلة / أجهزة جديدة لهذا الصنف (+)"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>

              <!-- Print Barcode Action Button -->
              <router-link
                :to="`/ohda/barcode-print?productId=${data.id}`"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer flex items-center justify-center border border-brand-gray/15"
                :title="$t('ohda.barcodePrint.title')"
              >
                <Printer class="w-3.5 h-3.5" />
              </router-link>

              <!-- View / Manage Serials -->
              <button
                type="button"
                @click="viewProductSerials(data)"
                class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer flex items-center justify-center border border-brand-gray/15"
                :title="$t('ohda.products.viewSerials')"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>

              <editButton @click="editProduct(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Product Dialog -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.products.editProduct') : $t('ohda.products.addProduct')"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
        <!-- 1. Product Basic Info -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.products.name') }}
          </label>
          <InputText
            id="productNameInput"
            v-model="form.name"
            required
            :placeholder="$t('ohda.products.name')"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-medium rounded-xl"
            autofocus
          />
        </div>

        <!-- 2. SKU and Barcode (Manual with Generate Helpers) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-semibold text-brand-dark dark:text-white required">{{ $t('ohda.products.sku') }}</label>
              <button
                type="button"
                @click="generateSku"
                class="text-[10px] text-brand-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles class="w-3 h-3" />
                <span>{{ $t('ohda.products.autoGenerate') }}</span>
              </button>
            </div>
            <InputText
              id="productSkuInput"
              v-model="form.sku"
              required
              placeholder="SKU-1001"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono font-bold rounded-xl uppercase"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-semibold text-brand-dark dark:text-white">{{ $t('ohda.products.barcode') }} {{ $t('ohda.common.optional') }}</label>
              <button
                type="button"
                @click="generateBarcode"
                class="text-[10px] text-brand-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles class="w-3 h-3" />
                <span>{{ $t('ohda.products.autoGenerate') }}</span>
              </button>
            </div>
            <div class="relative">
              <InputText
                id="productBarcodeInput"
                v-model="form.barcode"
                placeholder="629000000000"
                class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white font-mono rounded-xl"
              />
            </div>
          </div>
        </div>

        <!-- 3. Category & Product State -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">{{ $t('ohda.products.category') }}</label>
            <Select
              id="productCategorySelect"
              v-model="form.categoryId"
              :options="inventoryStore.categories"
              optionLabel="name"
              optionValue="id"
              :placeholder="$t('ohda.products.category')"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.productState') }} {{ $t('ohda.common.optional') }}</label>
            <Select
              v-model="form.productStateId"
              :options="productStates"
              optionLabel="name"
              optionValue="id"
              showClear
              :placeholder="$t('ohda.products.productState')"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
        </div>

        <!-- 4. Supplier & Inventory Type -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.supplier') }} {{ $t('ohda.common.optional') }}</label>
            <Select
              v-model="form.supplierId"
              :options="inventoryStore.suppliers"
              optionLabel="companyName"
              optionValue="id"
              showClear
              :placeholder="$t('ohda.products.supplier')"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.inventoryType') }}</label>
            <Select
              v-model="form.inventoryType"
              :options="[
                { value: 1, label: $t('ohda.products.consumable') },
                { value: 2, label: $t('ohda.products.fixedAsset') }
              ]"
              optionLabel="label"
              optionValue="value"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            />
          </div>
        </div>

        <!-- 5. Tracking Mode & Serials Input -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white text-xs flex items-center gap-2">
              <ScanLine class="w-4 h-4 text-brand-accent" />
              <span>{{ $t('ohda.products.trackingType') }}</span>
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
                <span>{{ $t('ohda.products.serialsTracking') }}</span>
              </div>
            </label>

            <!-- <label
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
              :class="trackingType === 'general' ? 'bg-brand-accent/15 border-brand-accent text-brand-dark dark:text-white font-bold' : 'border-brand-gray/20 hover:bg-white/5 text-brand-gray'"
            >
              <input type="radio" value="general" v-model="trackingType" @change="onTrackingTypeChange" />
              <div>
                <span>{{ $t('ohda.products.generalTracking') }}</span>
              </div>
            </label> -->
          </div>

          <!-- 5. Quantity & Serials Setup -->
          <div class="space-y-3 pt-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
                  {{ trackingType === 'serials' ? $t('ohda.products.devicesCount') : $t('ohda.products.stockQuantity') }}
                </label>
                <InputNumber
                  v-model="form.amount"
                  :min="1"
                  :max="trackingType === 'serials' ? 100 : 10000"
                  required
                  @update:model-value="syncSerialsList"
                  class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">{{ $t('ohda.products.minThreshold') }}</label>
                <InputNumber
                  v-model="form.minThreshold"
                  :min="1"
                  required
                  class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <!-- Traditional Serials Trigger Button -->
            <div
              v-if="trackingType === 'serials' && !isEditing"
              class="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-brand-accent/10 dark:bg-brand-accent/5 rounded-2xl border border-brand-accent/25"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-brand-dark dark:text-white">
                  الأرقام التسلسلية:
                </span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white dark:bg-black/40 text-brand-accent font-bold border border-brand-accent/20">
                  {{ form.amount || 1 }} أجهزة مطلوبة
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  :class="serialList.length === (form.amount || 1) ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'"
                >
                  {{ serialList.length === (form.amount || 1) ? 'الحقول مطابقة' : 'الحقول تحتاج تحديث' }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openAndSyncSerials"
                  class="px-3 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition transform active:scale-95"
                  title="تجهيز وفتح حقول الأرقام التسلسلية وفق الكمية المحددة"
                >
                  <Plus class="w-4 h-4" />
                  <span>اضافة السيريلات ({{ form.amount || 1 }})</span>
                </button>
                <!-- <button
                  type="button"
                  @click="autoFillSerials"
                  class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-white/10 text-brand-gray hover:text-brand-dark dark:hover:text-white border border-brand-gray/20 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>توليد تلقائي للكل</span>
                </button> -->
              </div>
            </div>
            <!-- Edit Mode Serials Management Banner -->
            <div
              v-if="isEditing"
              class="p-4 bg-brand-accent/10 dark:bg-brand-accent/5 rounded-2xl border border-brand-accent/25 space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                  <ScanLine class="w-4 h-4 text-brand-accent" />
                  <span>الأرقام المسلسلة المسجلة لهذا الصنف ({{ form.amount || form.quantity || 0 }} جهاز)</span>
                </span>
                <span class="text-[10px] font-semibold text-brand-gray">إدارة وتعديل السيريالات</span>
              </div>
              <p class="text-[11px] text-brand-gray dark:text-slate-300">
                يمكنك مراجعة الأرقام المسلسلة المسجلة، تصحيح أي سيريال تم إدخاله بالخطأ، حذف أي جهاز، أو إضافة أجهزة وسيريالات جديدة لهذا الصنف.
              </p>
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  @click="viewProductSerials(form)"
                  class="px-3.5 py-2 rounded-xl bg-brand-light dark:bg-white/10 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <Eye class="w-4 h-4 text-brand-accent" />
                  <span>عرض وتعديل وحذف السيريالات</span>
                </button>
                <button
                  type="button"
                  @click="openAddSerialsModal(form)"
                  class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                >
                  <Plus class="w-4 h-4" />
                  <span>+ إضافة أجهزة / سيريالات جديدة</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Serials Inputs Table when "serials" is active and in Add Mode -->
          <div v-if="trackingType === 'serials' && !isEditing" class="space-y-2 pt-2 border-t border-brand-gray/10 dark:border-white/10">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                <span>{{ $t('ohda.products.serialNumbers') }}</span>
                <span class="font-mono text-brand-accent">({{ serialList.length }} من {{ form.amount || 1 }}):</span>
              </span>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openFastScanner"
                  class="text-[10px] px-2 py-1 rounded-lg bg-brand-accent/20 text-brand-dark dark:text-brand-accent font-bold hover:bg-brand-accent/30 flex items-center gap-1 cursor-pointer transition"
                >
                  <QrCode class="w-3.5 h-3.5" />
                  <span>{{ $t('ohda.products.fastScanner') }}</span>
                </button>
                <!-- <button
                  type="button"
                  @click="autoFillSerials"
                  class="text-[10px] px-2 py-1 rounded-lg bg-brand-light dark:bg-white/10 text-brand-gray hover:text-brand-dark dark:hover:text-white border border-brand-gray/20 font-semibold cursor-pointer transition"
                >
                  {{ $t('ohda.products.autoFillRemaining') }}
                </button> -->
                <button
                  type="button"
                  @click="clearAllSerials"
                  class="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold cursor-pointer transition"
                >
                  تفريغ الكل
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
                placeholder="Scan or enter serial number..."
                class="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-black/50 border border-brand-gray/20 focus:outline-none focus:border-brand-accent font-mono font-bold"
              />
              <button
                type="button"
                @click="handleFastScanSubmit"
                class="px-2.5 py-1 text-[11px] bg-brand-accent text-brand-dark font-bold rounded-lg cursor-pointer shrink-0"
              >
                {{ $t('ohda.common.submit') }}
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
                  placeholder="SN..."
                  class="flex-1 px-2 py-1 text-xs bg-transparent border-none focus:outline-none font-mono font-bold text-brand-dark dark:text-white"
                />
                <button
                  type="button"
                  @click="serialList[index] = `SN-${form.sku || 'ITEM'}-${index + 1}-${Math.floor(1000 + Math.random() * 9000)}`"
                  class="p-1 text-brand-gray hover:text-brand-accent cursor-pointer"
                  :title="$t('ohda.products.autoGenerate')"
                >
                  <Sparkles class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Optional Financials & Pricing Toggle -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <!-- <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-brand-dark dark:text-white text-xs block">
                {{ $t('ohda.products.pricingInfo') }}
              </span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400">{{ $t('ohda.products.enablePricing') }}</span>
            </div>

            <ToggleSwitch v-model="hasPricing" />
          </div> -->

          <!-- Collapsible Pricing Inputs -->
          <div v-if="hasPricing" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-gray/10 dark:border-white/10">
            <div v-if="form.inventoryType === 1">
              <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.purchasePrice') }} ({{ $t('ohda.common.sar') }})</label>
              <InputNumber
                v-model="form.purchasePrice"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 rounded-xl font-mono font-bold"
              />
            </div>
            <div v-else>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.assetValue') }} ({{ $t('ohda.common.sar') }})</label>
              <InputNumber
                v-model="form.assetValue"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">{{ $t('ohda.products.unitPrice') }} ({{ $t('ohda.common.sar') }})</label>
              <InputNumber
                v-model="form.unitPrice"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                placeholder="0.00"
                class="w-full !bg-white dark:!bg-brand-dark/80 !border-brand-gray/25 rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isSaving" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSaving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isSaving ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Import Excel Upload Dialog -->
    <Dialog
      v-model:visible="showImportModal"
      modal
      :header="$t('ohda.products.importTitle')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs">
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
          <span class="font-bold block mb-1">تعليمات نموذج الاستيراد:</span>
          الحقول التي بجانبها علامة (*) إلزامية في الشيت (اسم الصنف، رمز الصنف SKU، الباركود، التصنيف). باقي الحقول اختيارية.
        </div>

        <div class="border-2 border-dashed border-brand-gray/30 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-light dark:bg-white/5 transition-colors">
          <FileSpreadsheet class="w-12 h-12 text-brand-accent mx-auto mb-3" />
          <p class="text-xs font-semibold text-brand-dark dark:text-white mb-1">
            {{ $t('ohda.products.dragExcel') }}
          </p>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block mb-4">.xlsx, .csv</span>
          <input type="file" accept=".xlsx, .xls, .csv" class="hidden" id="excelInput" @change="handleFileUpload" />
          <label for="excelInput" class="px-4 py-2 bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-semibold cursor-pointer inline-block">
            {{ $t('ohda.inventory.browseFiles') }}
          </label>
        </div>

        <div class="flex items-center justify-between pt-3 text-xs border-t border-brand-gray/10 dark:border-white/10">
          <Button @click="downloadTemplate" class="!bg-transparent !text-brand-accent hover:!underline flex items-center gap-1.5 cursor-pointer">
            <Download class="w-3.5 h-3.5" />
            <span>تحميل نموذج Excel فارغ (*)</span>
          </Button>
          <SecondaryButton @click="showImportModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- View / Manage Serials Dialog -->
    <Dialog
      v-model:visible="showSerialsModal"
      modal
      :header="`سجل الأجهزة والأرقام المسلسلة: ${selectedProductForSerials?.name || ''}`"
      class="max-w-3xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs font-sans">
        <!-- Serials Toolbar: Search + Quick Stats + Add More Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15">
          <div class="flex items-center gap-2 flex-1 max-w-sm">
            <searchField
              v-model="searchSerialQuery"
              placeholder="ابحث برقم السيريال أو اسم المستلم..."
              class="w-full text-xs"
            />
          </div>

          <div class="flex items-center gap-2">
            <!-- Count Badges -->
            <div class="flex items-center gap-1.5 font-mono text-[11px] font-bold">
              <span class="px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                متاح: {{ serialsInStockCount }}
              </span>
              <span class="px-2 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                عهدة: {{ serialsExitedCount }}
              </span>
            </div>

            <!-- Add More Serials (+) -->
            <button
              type="button"
              @click="openAddSerialsModal(selectedProductForSerials)"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition transform active:scale-95"
              title="إضافة أجهزة وأرقام مسلسلة جديدة لهذا الصنف"
            >
              <Plus class="w-4 h-4" />
              <span>إضافة أجهزة جديدة (+)</span>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingSerials" class="text-center py-8">
          <div class="animate-spin h-6 w-6 border-2 border-brand-accent border-t-transparent rounded-full mx-auto"></div>
          <span class="text-brand-gray dark:text-slate-400 mt-2 block">{{ $t('ohda.common.loading') }}</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredProductSerials.length === 0" class="p-8 text-center text-brand-gray dark:text-slate-400 space-y-3">
          <Package class="w-12 h-12 text-brand-gray/50 mx-auto mb-2" />
          <p class="font-bold">
            {{ searchSerialQuery ? 'لا توجد أرقام مسلسلة مطابقة للبحث' : 'لا توجد أجهزة مسلسلة مسجلة لهذا الصنف حتى الآن' }}
          </p>
          <button
            type="button"
            @click="openAddSerialsModal(selectedProductForSerials)"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-brand-dark font-bold text-xs cursor-pointer shadow-sm hover:scale-102 transition"
          >
            <Plus class="w-4 h-4" />
            <span>إضافة أجهزة وأرقام مسلسلة لهذا الصنف الآن</span>
          </button>
        </div>

        <!-- Serials Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          <div
            v-for="(item, sIdx) in filteredProductSerials"
            :key="item.id"
            class="flex items-center justify-between gap-3 p-3 bg-brand-light dark:bg-white/5 border border-brand-gray/15 hover:border-brand-accent/40 rounded-2xl transition group"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-mono text-brand-gray font-bold">#{{ sIdx + 1 }}</span>
                <span class="font-mono font-bold text-brand-dark dark:text-white text-xs select-all truncate">
                  {{ item.serialNumber }}
                </span>
                <button
                  type="button"
                  @click="copySerialToClipboard(item.serialNumber)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-brand-gray hover:text-brand-accent transition cursor-pointer"
                  title="نسخ السيريال"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </div>

              <div class="flex items-center gap-2 flex-wrap text-[10px]">
                <span
                  class="px-2 py-0.5 rounded-full font-bold border"
                  :class="item.status === 1 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'"
                >
                  {{ item.status === 1 ? 'متوفر بالمخزن' : 'منصرف كعهدة' }}
                </span>
                <span v-if="item.status === 2" class="text-brand-gray truncate">
                  {{ item.recipientName ? `المستلم: ${item.recipientName}` : '' }} {{ item.place ? `(${item.place})` : '' }}
                </span>
              </div>
            </div>

            <!-- Item Actions: Edit Serial & Delete Item -->
            <div class="flex items-center gap-1 shrink-0">
              <!-- Edit Serial Button -->
              <button
                type="button"
                @click="openEditSerialModal(item)"
                class="p-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-brand-soft text-brand-gray hover:text-brand-dark dark:hover:text-white border border-brand-gray/15 transition cursor-pointer"
                title="تعديل الرقم المسلسل (تصحيح رقم مدخل بالخطأ)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>

              <!-- Delete Item Button -->
              <button
                type="button"
                @click="promptDeleteSerial(item)"
                class="p-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-rose-500/20 text-brand-gray hover:text-rose-600 border border-brand-gray/15 transition cursor-pointer"
                title="حذف هذا الجهاز / السيريال وخصمه من رصيد المخزن"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center pt-3 border-t border-brand-gray/10 dark:border-white/10">
          <router-link
            :to="`/ohda/barcode-print?productId=${selectedProductForSerials?.id}`"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent/15 text-brand-dark dark:text-brand-accent font-bold hover:bg-brand-accent/25 transition text-xs"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>{{ $t('ohda.nav.barcodePrint') }}</span>
          </router-link>

          <SecondaryButton @click="showSerialsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Add Serials / Devices to Same Product Dialog (+) -->
    <Dialog
      v-model:visible="showAddSerialsModal"
      modal
      :header="`إضافة أجهزة وأرقام مسلسلة: ${targetProductForAddSerials?.name || ''}`"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="submitAddSerials" class="space-y-4 text-xs font-sans">
        <!-- Product Context Banner -->
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 flex items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="font-bold text-xs text-brand-dark dark:text-white block">
              {{ targetProductForAddSerials?.name }}
            </span>
            <div class="flex items-center gap-2 text-[10px] text-brand-gray font-mono">
              <span v-if="targetProductForAddSerials?.sku">SKU: {{ targetProductForAddSerials.sku }}</span>
              <span v-if="targetProductForAddSerials?.barcode">• باركود: {{ targetProductForAddSerials.barcode }}</span>
            </div>
          </div>
          <div class="text-end">
            <span class="text-[10px] text-brand-gray block">الرصيد الحالي بالمخزن</span>
            <span class="font-mono font-bold text-sm text-brand-accent">
              {{ targetProductForAddSerials?.quantity || targetProductForAddSerials?.amount || 0 }} جهاز
            </span>
          </div>
        </div>

        <!-- Mode Selector: Auto-generate / Manual Inputs vs Bulk Paste -->
        <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
          <button
            type="button"
            @click="addSerialsMode = 'inputs'"
            class="px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            :class="addSerialsMode === 'inputs' ? 'bg-brand-accent text-brand-dark' : 'bg-brand-light dark:bg-white/5 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <Boxes class="w-3.5 h-3.5" />
            <span>إدخال بالعدد وتوليد سيريالات</span>
          </button>
          <button
            type="button"
            @click="addSerialsMode = 'bulk'"
            class="px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            :class="addSerialsMode === 'bulk' ? 'bg-brand-accent text-brand-dark' : 'bg-brand-light dark:bg-white/5 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <FileText class="w-3.5 h-3.5" />
            <span>لصق مجمع (سيريالات متعددة)</span>
          </button>
        </div>

        <!-- Mode A: Count + Slot Inputs -->
        <div v-if="addSerialsMode === 'inputs'" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <label class="font-bold text-xs">عدد الأجهزة المراد إضافتها:</label>
              <InputNumber
                v-model="addSerialsCount"
                :min="1"
                :max="500"
                @update:model-value="syncAddSerialsList"
                class="w-24 font-mono font-bold"
              />
            </div>

            <button
              type="button"
              @click="autoFillNewSerials"
              class="px-3 py-1 rounded-xl bg-brand-light dark:bg-white/10 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Sparkles class="w-3.5 h-3.5 text-brand-accent" />
              <span>توليد أرقام مسلسلة تلقائياً</span>
            </button>
          </div>

          <!-- Slots List -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-white/50 dark:bg-black/20 rounded-2xl border border-brand-gray/10">
            <div
              v-for="(s, index) in addSerialsList"
              :key="index"
              class="flex items-center gap-1.5 p-1 bg-white dark:bg-brand-dark/70 rounded-xl border border-brand-gray/15"
            >
              <span class="text-[10px] font-mono text-brand-gray font-bold w-6 text-center">#{{ index + 1 }}</span>
              <input
                v-model="addSerialsList[index]"
                type="text"
                placeholder="SN..."
                class="flex-1 px-2 py-1 text-xs bg-transparent border-none focus:outline-none font-mono font-bold text-brand-dark dark:text-white"
              />
              <button
                type="button"
                @click="addSerialsList[index] = `SN-${targetProductForAddSerials?.sku || 'ITEM'}-${index + 1}-${Math.floor(1000 + Math.random() * 9000)}`"
                class="p-1 text-brand-gray hover:text-brand-accent cursor-pointer"
                title="توليد تلقائي لهذا الحقل"
              >
                <Sparkles class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mode B: Bulk Paste Textarea -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-xs">الصق الأرقام المسلسلة هنا (كل سيريال في سطر أو مفصولة بفواصل):</label>
            <span class="px-2 py-0.5 rounded-lg bg-brand-accent/15 text-brand-accent font-mono font-bold text-[11px]">
              تم رصد {{ parsedBulkSerialsCount }} رقم تسلسلي
            </span>
          </div>
          <textarea
            v-model="addSerialsBulkText"
            rows="6"
            placeholder="مثال:
SN-DELL-1001
SN-DELL-1002
SN-DELL-1003
أو مفصولة بفواصل: SN-01, SN-02, SN-03"
            class="w-full p-3 rounded-2xl border border-brand-gray/25 bg-white dark:bg-brand-dark/50 font-mono text-xs focus:border-brand-accent focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- Dialog Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-brand-gray/10 dark:border-white/10">
          <span class="text-[11px] text-brand-gray">
            سيتم إضافة الأجهزة إلى المخزن وزيادة رصيد الصنف تلقائياً.
          </span>

          <div class="flex items-center gap-2">
            <SecondaryButton type="button" @click="showAddSerialsModal = false" :disabled="savingNewSerials">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button
              type="submit"
              :loading="savingNewSerials"
              class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !px-4 !py-2 !text-xs !rounded-xl cursor-pointer"
            >
              حفظ وإضافة الأجهزة للمخزن (+)
            </Button>
          </div>
        </div>
      </form>
    </Dialog>

    <!-- Edit Single Serial Dialog (Fix Typo in Serial Number) -->
    <Dialog
      v-model:visible="showEditSerialModal"
      modal
      header="تعديل الرقم المسلسل (تصحيح رقم مدخل بالخطأ)"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="submitEditSerial" class="space-y-4 text-xs font-sans">
        <div class="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px]">
          تعديل الرقم المسلسل لهذا الجهاز سيحدث تلقائياً السجلات وسجل البوصلة المرتبط به.
        </div>

        <div>
          <label class="block font-semibold mb-1 text-brand-gray">الرقم المسلسل الحالي:</label>
          <span class="font-mono font-bold text-xs p-2 rounded-xl bg-brand-light dark:bg-white/5 border border-brand-gray/20 block select-all">
            {{ editingSerialItem?.serialNumber }}
          </span>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-brand-dark dark:text-white">الرقم المسلسل الجديد / المصحح <span class="text-rose-500">*</span></label>
          <InputText
            v-model="newSerialNumberText"
            placeholder="أدخل الرقم المسلسل الصحيح..."
            class="w-full font-mono font-bold text-xs !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
            required
            autofocus
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" @click="showEditSerialModal = false" :disabled="savingEditSerial">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :loading="savingEditSerial"
            class="!bg-brand-accent !text-brand-dark !font-bold !px-4 !py-2 !text-xs !rounded-xl cursor-pointer"
          >
            حفظ التعديل
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Delete Single Serial Dialog -->
    <Dialog
      v-model:visible="showDeleteSerialModal"
      modal
      header="تأكيد حذف الجهاز من الصنف"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs font-sans">
        <div class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 space-y-1.5">
          <div class="flex items-center gap-2 font-bold text-xs text-rose-700 dark:text-rose-400">
            <Trash2 class="w-4 h-4" />
            <span>حذف رقم مسلسل</span>
          </div>
          <p class="text-[11px] leading-relaxed">
            هل أنت متأكد من حذف الجهاز ذو الرقم المسلسل:
            <strong class="font-mono block text-xs mt-1 select-all">{{ deletingSerialItem?.serialNumber }}</strong>
          </p>
          <p class="text-[10px] opacity-80 pt-1 border-t border-rose-200 dark:border-rose-800/40">
            إذا كان الجهاز متوفراً بالمخزن، سيتم خصم 1 من رصيد هذا الصنف تلقائياً.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <SecondaryButton @click="showDeleteSerialModal = false" :disabled="isDeletingSerial">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            @click="executeDeleteSerial"
            :loading="isDeletingSerial"
            class="!bg-rose-600 hover:!bg-rose-700 !text-white !font-bold !px-4 !py-2 !text-xs !rounded-xl cursor-pointer"
          >
            تأكيد الحذف
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="'الصنف'"
      :itemName="selectedProductForDelete?.name || ''"
      :canDelete="true"
      :warningMessage="(selectedProductForDelete?.quantity ?? selectedProductForDelete?.amount ?? 0) > 0 ? `سيتم حذف الصنف ورصيده في المخزون (${selectedProductForDelete?.quantity ?? selectedProductForDelete?.amount ?? 0}) وكافة الأرقام التسلسلية غير المصروفة التابعة له.` : ''"
      :confirm="handleDeleteProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import { apiGet } from "@/utilities/fetchApi";
import axios from "@/utilities/apiClient";
import DeleteDialog from "@/components/DeleteDialog.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import {
  Package,
  Printer,
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  ScanLine,
  Sparkles,
  QrCode,
  X,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  Boxes,
  FileText
} from "lucide-vue-next";

const { t } = useI18n();
const inventoryStore = useOhdaInventoryStore();
const branchStore = useOhdaBranchStore();
const authStore = useOhdaAuthStore();
const toastStore = useToastStore();

const showSerialsModal = ref(false);
const loadingSerials = ref(false);
const productSerials = ref([]);
const selectedProductForSerials = ref(null);
const productStates = ref([]);
const searchSerialQuery = ref("");

// Quick stats for serials modal
const serialsInStockCount = computed(() => {
  return productSerials.value.filter(s => s.status === 1 || s.status === "InStock").length;
});
const serialsExitedCount = computed(() => {
  return productSerials.value.filter(s => s.status === 2 || s.status === "Exited").length;
});

const filteredProductSerials = computed(() => {
  let list = productSerials.value || [];
  if (!searchSerialQuery.value?.trim()) return list;
  const q = searchSerialQuery.value.toLowerCase().trim();
  return list.filter(
    s => (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
         (s.recipientName && s.recipientName.toLowerCase().includes(q)) ||
         (s.place && s.place.toLowerCase().includes(q))
  );
});

// Add Serials to same product state (+)
const showAddSerialsModal = ref(false);
const targetProductForAddSerials = ref(null);
const addSerialsMode = ref("inputs"); // 'inputs' | 'bulk'
const addSerialsCount = ref(1);
const addSerialsList = ref([""]);
const addSerialsBulkText = ref("");
const savingNewSerials = ref(false);

const parsedBulkSerialsCount = computed(() => {
  if (!addSerialsBulkText.value?.trim()) return 0;
  return addSerialsBulkText.value
    .split(/[\r\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .length;
});

// Edit single serial state (fix typos)
const showEditSerialModal = ref(false);
const editingSerialItem = ref(null);
const newSerialNumberText = ref("");
const savingEditSerial = ref(false);

// Delete single serial state
const showDeleteSerialModal = ref(false);
const deletingSerialItem = ref(null);
const isDeletingSerial = ref(false);

const searchQuery = ref("");
const showModal = ref(false);
const showImportModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref(null);

const showDeleteDialog = ref(false);
const selectedProductForDelete = ref(null);

const hasPricing = ref(false);
const trackingType = ref("serials");
const serialList = ref([]);
const showFastScanInput = ref(false);
const fastScanText = ref("");
const fastScanInputRef = ref(null);

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
    const data = res?.data?.objects || res?.data?.singleObject || [];
    productStates.value = Array.isArray(data) ? data : [data];
  } catch (e) {}
});

const filteredProducts = computed(() => {
  let list = inventoryStore.products || [];
  if (!searchQuery.value?.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    p => p.name?.toLowerCase().includes(q) ||
         p.sku?.toLowerCase().includes(q) ||
         p.barcode?.toLowerCase().includes(q) ||
         p.categoryName?.toLowerCase().includes(q)
  );
});

function handleSerialSlotEnter(index) {
  if (index + 1 < serialList.value.length) {
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

watch(
  () => form.value.amount,
  (newVal) => {
    if (trackingType.value === "serials" && !isEditing.value) {
      syncSerialsList();
    }
  }
);

function syncSerialsList() {
  const count = Math.max(1, Math.min(100, parseInt(form.value.amount) || 1));
  const current = [...serialList.value];
  if (current.length < count) {
    while (current.length < count) {
      current.push("");
    }
    serialList.value = current;
  } else if (current.length > count) {
    serialList.value = current.slice(0, count);
  }
}

function openAndSyncSerials() {
  trackingType.value = "serials";
  const count = Math.max(1, Math.min(100, parseInt(form.value.amount) || 1));
  form.value.amount = count;
  const current = [...serialList.value];
  if (current.length < count) {
    while (current.length < count) current.push("");
    serialList.value = current;
  } else {
    serialList.value = current.slice(0, count);
  }
  toastStore.addInfoToast(`تم فتح وتجهيز (${count}) حقول لإدخال الأرقام التسلسلية`);
  nextTick(() => {
    document.getElementById("serial-slot-0")?.focus();
  });
}

function clearAllSerials() {
  const count = Math.max(1, Math.min(100, parseInt(form.value.amount) || 1));
  serialList.value = Array(count).fill("");
}

function onTrackingTypeChange() {
  if (trackingType.value === "serials") {
    syncSerialsList();
  }
}

function autoFillSerials() {
  syncSerialsList();
  const sku = form.value.sku || "ITEM";
  serialList.value = serialList.value.map((val, idx) => {
    if (val && val.trim()) return val.trim();
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

  const emptyIndex = serialList.value.findIndex(s => !s || !s.trim());
  if (emptyIndex !== -1) {
    serialList.value[emptyIndex] = code;
  } else {
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
  if (!form.value.name?.trim() || !form.value.sku?.trim() || !form.value.categoryId) {
    toastStore.addWarningToast(t("validation.required"));
    return;
  }

  if (trackingType.value === "serials" && !isEditing.value) {
    syncSerialsList();
    const filledSerials = serialList.value.map(s => s?.trim()).filter(Boolean);
    const expectedCount = Math.max(1, Math.min(100, parseInt(form.value.amount) || 1));
    if (filledSerials.length < expectedCount) {
      autoFillSerials();
    }
  }

  isSaving.value = true;
  try {
    if (!form.value.barcode?.trim()) {
      form.value.barcode = form.value.sku ? `BC-${form.value.sku}` : `629${Math.floor(100000000 + Math.random() * 900000000)}`;
    }

    if (!hasPricing.value) {
      form.value.purchasePrice = null;
      form.value.assetValue = null;
      form.value.unitPrice = null;
    }

    form.value.quantity = form.value.amount;

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

    if (res && res.success) {
      toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
      showModal.value = false;
      branchStore.fetchMyQuota();
    } else {
      toastStore.addErrorToast(res?.message || t("ohda.common.operationFailed"));
    }
  } catch (err) {
    console.error("Save product error:", err);
  } finally {
    isSaving.value = false;
  }
}

function promptDelete(product) {
  selectedProductForDelete.value = product;
  showDeleteDialog.value = true;
}

async function handleDeleteProduct() {
  if (!selectedProductForDelete.value) return;
  const targetId = selectedProductForDelete.value.id;
  try {
    const res = await inventoryStore.deleteProduct(targetId);
    if (res && res.success === false) {
      toastStore.addErrorToast(res.message || "تعذر حذف المنتج لوجود ارتباطات");
      return res;
    }
    inventoryStore.products = inventoryStore.products.filter(p => p.id !== targetId && p.id !== Number(targetId));
    toastStore.addSuccessToast(res?.message || t("ohda.common.operationSuccess"));
    showDeleteDialog.value = false;
  } catch (err) {
    console.error("Delete product error:", err);
    if (err?.response?.status === 404 || err?.response?.data?.returnMessage?.includes("غير موجود") || err?.message?.includes("غير موجود")) {
      inventoryStore.products = inventoryStore.products.filter(p => p.id !== targetId && p.id !== Number(targetId));
      showDeleteDialog.value = false;
      toastStore.addSuccessToast("تم تحديث القائمة وإزالة الصنف");
    } else {
      toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "تعذر حذف المنتج");
      throw err;
    }
  } finally {
    selectedProductForDelete.value = null;
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
    toastStore.addErrorToast(res.message || t("ohda.common.operationFailed"));
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const res = await inventoryStore.importExcelProducts(file);
    if (res.success) {
      toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
      showImportModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || t("ohda.common.operationFailed"));
    }
  }
}

async function copySerialToClipboard(sn) {
  if (!sn) return;
  try {
    await navigator.clipboard.writeText(sn);
    toastStore.addSuccessToast(`تم نسخ الرقم التسلسلي: ${sn}`);
  } catch (_) {
    toastStore.addInfoToast(`الرقم التسلسلي: ${sn}`);
  }
}

function openAddSerialsModal(product) {
  if (!product) return;
  targetProductForAddSerials.value = product;
  addSerialsCount.value = 1;
  addSerialsList.value = [""];
  addSerialsBulkText.value = "";
  addSerialsMode.value = "inputs";
  showAddSerialsModal.value = true;
}

function syncAddSerialsList() {
  const count = Math.max(1, Math.min(500, parseInt(addSerialsCount.value) || 1));
  const current = [...addSerialsList.value];
  if (current.length < count) {
    while (current.length < count) current.push("");
    addSerialsList.value = current;
  } else if (current.length > count) {
    addSerialsList.value = current.slice(0, count);
  }
}

function autoFillNewSerials() {
  syncAddSerialsList();
  const sku = targetProductForAddSerials.value?.sku || "ITEM";
  const startIdx = (productSerials.value?.length || 0) + 1;
  addSerialsList.value = addSerialsList.value.map((val, idx) => {
    if (val && val.trim()) return val.trim();
    return `SN-${sku}-${startIdx + idx}-${Math.floor(1000 + Math.random() * 9000)}`;
  });
}

async function submitAddSerials() {
  if (!targetProductForAddSerials.value) return;

  let serials = [];
  if (addSerialsMode.value === "inputs") {
    syncAddSerialsList();
    const sku = targetProductForAddSerials.value?.sku || "ITEM";
    const startIdx = (productSerials.value?.length || 0) + 1;
    serials = addSerialsList.value.map((s, idx) => {
      if (s && s.trim()) return s.trim();
      return `SN-${sku}-${startIdx + idx}-${Math.floor(1000 + Math.random() * 9000)}`;
    }).filter(Boolean);
  } else {
    serials = addSerialsBulkText.value
      .split(/[\r\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  if (!serials.length) {
    toastStore.addErrorToast("يرجى إدخال رقم تسلسلي واحد على الأقل.");
    return;
  }

  savingNewSerials.value = true;
  try {
    const res = await axios.post("/api/ProductItem/add-serials", {
      productId: targetProductForAddSerials.value.id,
      serialNumbers: serials
    });

    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      toastStore.addSuccessToast(data.returnMessage || "تمت إضافة الأجهزة بنجاح");
      showAddSerialsModal.value = false;
      await inventoryStore.fetchProducts();

      // If serials modal is open for this product, refresh its list
      if (selectedProductForSerials.value && selectedProductForSerials.value.id === targetProductForAddSerials.value.id) {
        await viewProductSerials(selectedProductForSerials.value);
      }
      // If edit modal is open for this product, update its amount
      if (isEditing.value && editingId.value === targetProductForAddSerials.value.id) {
        form.value.amount = (form.value.amount || 0) + serials.length;
        form.value.quantity = form.value.amount;
      }
    } else {
      toastStore.addErrorToast(data?.returnMessage || "تعذر إضافة الأجهزة");
    }
  } catch (err) {
    const msg = err?.response?.data?.returnMessage || err?.response?.data?.ReturnMessage || "حدث خطأ أثناء إضافة السيريالات";
    toastStore.addErrorToast(msg);
  } finally {
    savingNewSerials.value = false;
  }
}

function openEditSerialModal(item) {
  editingSerialItem.value = item;
  newSerialNumberText.value = item.serialNumber || "";
  showEditSerialModal.value = true;
}

async function submitEditSerial() {
  if (!editingSerialItem.value || !newSerialNumberText.value?.trim()) {
    toastStore.addErrorToast("الرقم المسلسل الجديد مطلوب");
    return;
  }

  savingEditSerial.value = true;
  try {
    const res = await axios.put(`/api/ProductItem/${editingSerialItem.value.id}/serial`, {
      serialNumber: newSerialNumberText.value.trim()
    });

    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      toastStore.addSuccessToast(data.returnMessage || "تم تعديل الرقم المسلسل بنجاح");
      editingSerialItem.value.serialNumber = newSerialNumberText.value.trim();
      showEditSerialModal.value = false;
    } else {
      toastStore.addErrorToast(data?.returnMessage || "تعذر تعديل الرقم المسلسل");
    }
  } catch (err) {
    const msg = err?.response?.data?.returnMessage || err?.response?.data?.ReturnMessage || "حدث خطأ أثناء تعديل السيريال";
    toastStore.addErrorToast(msg);
  } finally {
    savingEditSerial.value = false;
  }
}

function promptDeleteSerial(item) {
  deletingSerialItem.value = item;
  showDeleteSerialModal.value = true;
}

async function executeDeleteSerial() {
  if (!deletingSerialItem.value) return;

  isDeletingSerial.value = true;
  try {
    const res = await axios.delete(`/api/ProductItem/${deletingSerialItem.value.id}`);
    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      toastStore.addSuccessToast(data.returnMessage || "تم حذف الجهاز بنجاح");
      // Remove from serials list
      productSerials.value = productSerials.value.filter(s => s.id !== deletingSerialItem.value.id);
      showDeleteSerialModal.value = false;
      await inventoryStore.fetchProducts();

      // If edit modal is open, decrement amount
      if (isEditing.value && form.value.amount > 0) {
        form.value.amount = Math.max(0, form.value.amount - 1);
        form.value.quantity = form.value.amount;
      }
    } else {
      toastStore.addErrorToast(data?.returnMessage || "تعذر حذف الجهاز");
    }
  } catch (err) {
    const msg = err?.response?.data?.returnMessage || err?.response?.data?.ReturnMessage || "حدث خطأ أثناء حذف الجهاز";
    toastStore.addErrorToast(msg);
  } finally {
    isDeletingSerial.value = false;
    deletingSerialItem.value = null;
  }
}
</script>
