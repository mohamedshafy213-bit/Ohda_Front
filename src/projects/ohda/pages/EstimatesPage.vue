<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <FileText class="w-7 h-7 text-brand-accent" />
          <span>عروض الأسعار والمقايسات (Quotes & Estimates)</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          إنشاء مقايسات الصيانة المبدئية وقطع الغيار للعملاء، ومتابعة حالات القبول، والتحويل لأمر شغل بنقرة واحدة
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="openCreateModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ عرض سعر جديد</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FileText class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي العروض</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ estimateStore.totalCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">عروض معتمدة</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ estimateStore.approvedCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">بانتظار العميل (مرسلة/مسودة)</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ estimateStore.draftCount + estimateStore.sentCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <DollarSign class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">قيمة العروض النشطة</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ formatCurrency(estimateStore.pendingValue) }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="space-y-3">
      <!-- Status Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="selectedStatus = null"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="selectedStatus === null ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          الكل ({{ estimateStore.totalCount }})
        </button>

        <button
          v-for="st in statusOptions"
          :key="st.value"
          type="button"
          @click="selectedStatus = st.value"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="selectedStatus === st.value ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          {{ st.label }} ({{ countByStatus(st.value) }})
        </button>
      </div>

      <!-- Search Bar -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <searchField v-model="searchQuery" placeholder="ابحث برقم المقايسة، اسم العميل، الهاتف، أو رقم اللوحة..." class="flex-1" />
        <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
          عرض {{ filteredEstimates.length }} من {{ estimateStore.estimates.length }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="estimateStore.loading && !estimateStore.estimates.length" type="table" :count="6" />

    <!-- Estimates DataTable -->
    <OhdaDataTable
      v-else
      :items="filteredEstimates"
      :columns="tableColumns"
      :loading="estimateStore.loading"
      empty-title="لا توجد عروض أسعار مطابقة"
      empty-message="يمكنك البدء بإنشاء عرض سعر جديد للعميل بالنقر على الزر أدناه."
      :rows-per-page="15"
    >
      <template #empty-action>
        <button
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
        >
          <Plus class="w-4 h-4" />
          <span>+ عرض سعر جديد</span>
        </button>
      </template>

      <!-- Estimate Number & Validity -->
      <template #estimateNumber="{ data }">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-xs text-brand-dark dark:text-white">{{ data.estimateNumber }}</span>
            <span v-if="data.isExpired" class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-red-500/10 text-red-600 border border-red-500/20">
              منتهي
            </span>
          </div>
          <span class="text-[11px] text-brand-gray block mt-0.5">
            صالح حتى: <span class="font-mono">{{ formatDate(data.validUntil) }}</span>
          </span>
        </div>
      </template>

      <!-- Client & Contact -->
      <template #client="{ data }">
        <div>
          <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.clientName }}</span>
          <span class="font-mono text-[11px] text-brand-gray dir-ltr text-right inline-block">{{ data.clientPhone }}</span>
        </div>
      </template>

      <!-- Vehicle -->
      <template #vehicle="{ data }">
        <div v-if="data.vehiclePlate">
          <span class="font-mono font-bold text-xs px-2 py-0.5 bg-brand-light dark:bg-white/10 rounded-md border border-brand-gray/15 inline-block">
            {{ data.vehiclePlate }}
          </span>
          <span v-if="data.vehicleModel" class="text-[11px] text-brand-gray block mt-0.5">{{ data.vehicleModel }}</span>
        </div>
        <span v-else class="text-brand-gray/40 text-xs">—</span>
      </template>

      <!-- Total Amount -->
      <template #totalAmount="{ data }">
        <div>
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
            {{ formatCurrency(data.totalAmount) }}
          </span>
          <span v-if="data.discount > 0 || data.tax > 0" class="text-[10px] text-brand-gray font-mono block">
            خصم: {{ formatCurrency(data.discount) }}
          </span>
        </div>
      </template>

      <!-- Status -->
      <template #status="{ data }">
        <span
          class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border"
          :class="getStatusBadgeClass(data.status)"
        >
          {{ data.statusText }}
        </span>
      </template>

      <!-- Converted to Job Card -->
      <template #jobCard="{ data }">
        <div v-if="data.convertedToJobCardId">
          <router-link
            :to="`/ohda/job-cards`"
            class="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 hover:underline"
          >
            <Wrench class="w-3 h-3" />
            <span>{{ data.convertedToJobNumber || `#${data.convertedToJobCardId}` }}</span>
          </router-link>
        </div>
        <span v-else class="text-brand-gray/40 text-xs">—</span>
      </template>

      <!-- Actions -->
      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1">
          <!-- View / Print Quote -->
          <button
            type="button"
            @click="openPreviewModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="معاينة وطباعة A4"
          >
            <Printer class="w-4 h-4" />
          </button>

          <!-- Edit (if not converted) -->
          <button
            v-if="!data.convertedToJobCardId && data.status !== 3"
            type="button"
            @click="openEditModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="تعديل العرض"
          >
            <Edit class="w-4 h-4" />
          </button>

          <!-- Convert to Job Card -->
          <button
            v-if="!data.convertedToJobCardId && data.status !== 4"
            type="button"
            @click="triggerConvertToJob(data)"
            class="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition cursor-pointer border border-emerald-500/25"
            title="تحويل إلى أمر شغل"
          >
            <ArrowRightCircle class="w-4 h-4" />
          </button>

          <!-- Mark as Sent -->
          <button
            v-if="data.status === 1"
            type="button"
            @click="changeStatus(data.id, 2)"
            class="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition cursor-pointer border border-blue-500/25"
            title="تحديد كمرسل للعميل"
          >
            <Send class="w-4 h-4" />
          </button>

          <!-- Mark as Approved -->
          <button
            v-if="data.status === 2 || data.status === 1"
            type="button"
            @click="changeStatus(data.id, 3)"
            class="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition cursor-pointer border border-emerald-500/25"
            title="اعتماد العرض"
          >
            <Check class="w-4 h-4" />
          </button>

          <!-- Delete -->
          <button
            v-if="!data.convertedToJobCardId"
            type="button"
            @click="openDeleteModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-red-500/10 text-brand-gray hover:text-red-500 transition cursor-pointer border border-brand-gray/15"
            title="حذف"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </OhdaDataTable>

    <!-- Modal 1: Add / Edit Estimate Dialog (:closeOnBackdrop="false") -->
    <OhdaModal
      :visible="showModal"
      @close="showModal = false"
      :title="isEditing ? `تعديل عرض السعر (${editingNumber})` : 'إنشاء مقايسة / عرض سعر جديد'"
      :subtitle="isEditing ? 'تعديل بنود المصنعية وقطع الغيار والتكلفة التقديرية' : 'إضافة مقايسة صيانة وقطع غيار لعميل وحفظها كمسودة أو إرسالها'"
      :icon="FileText"
      max-width="max-w-4xl"
      :close-on-backdrop="false"
    >
      <form @submit.prevent="submitEstimate" id="estimateForm" class="space-y-6 text-xs">
        <!-- Client & Vehicle Selection -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-brand-light/30 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              العميل <span class="text-red-500">*</span>
            </label>
            <select
              v-model.number="form.clientId"
              @change="onClientChanged"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
            >
              <option :value="null" disabled>-- اختر العميل --</option>
              <option v-for="c in clientStore.clients" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.phone }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              المركبة / اللوحة
            </label>
            <select
              v-model.number="form.vehicleId"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
            >
              <option :value="null">-- بدون ربط بمركبة محددة --</option>
              <option v-for="v in clientVehicles" :key="v.id" :value="v.id">
                {{ v.plateNumber }} ({{ v.brand || '' }} {{ v.model || '' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              صالح حتى تاريخ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.validUntilStr"
              type="date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs font-mono"
            />
          </div>
        </div>

        <!-- 1. Services Section (المصنعيات والخدمات) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Wrench class="w-4 h-4 text-brand-accent" />
              <span>بنود المصنعية والخدمات</span>
            </h3>
            <button
              type="button"
              @click="addServiceRow"
              class="px-3 py-1.5 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-dark dark:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ إضافة خدمة</span>
            </button>
          </div>

          <div v-if="form.services.length === 0" class="p-4 rounded-xl border border-dashed border-brand-gray/20 text-center text-brand-gray text-xs">
            لم يتم إضافة بنود مصنعية بعد. انقر على "+ إضافة خدمة"
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(s, sIdx) in form.services"
              :key="sIdx"
              class="grid grid-cols-12 gap-2 p-2.5 rounded-xl border border-brand-gray/15 bg-brand-white dark:bg-white/5 items-center"
            >
              <div class="col-span-5">
                <select
                  @change="(e) => onServicePresetSelected(sIdx, e.target.value)"
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs mb-1"
                >
                  <option value="">-- اختر من قائمة الخدمات المعرفة --</option>
                  <option v-for="srv in serviceStore.services" :key="srv.id" :value="srv.id">
                    {{ srv.name }} ({{ formatCurrency(srv.price) }})
                  </option>
                </select>
                <input
                  v-model="s.serviceName"
                  type="text"
                  placeholder="اسم الخدمة / الوصف *"
                  required
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-semibold"
                />
              </div>

              <div class="col-span-3">
                <input
                  v-model="s.category"
                  type="text"
                  placeholder="الفئة (مثال: ميكانيكا)"
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs"
                />
              </div>

              <div class="col-span-3">
                <div class="relative">
                  <input
                    v-model.number="s.price"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="السعر *"
                    required
                    class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono font-bold"
                  />
                  <span class="absolute end-2 top-1.5 text-[10px] text-brand-gray pointer-events-none">ج.م</span>
                </div>
              </div>

              <div class="col-span-1 text-center">
                <button
                  type="button"
                  @click="removeServiceRow(sIdx)"
                  class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  title="حذف البند"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Products Section (قطع الغيار والمستهلكات) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Package class="w-4 h-4 text-brand-accent" />
              <span>بنود قطع الغيار والمستهلكات</span>
            </h3>
            <button
              type="button"
              @click="addProductRow"
              class="px-3 py-1.5 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-dark dark:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ إضافة قطعة غيار</span>
            </button>
          </div>

          <div v-if="form.products.length === 0" class="p-4 rounded-xl border border-dashed border-brand-gray/20 text-center text-brand-gray text-xs">
            لم يتم إضافة قطع غيار. انقر على "+ إضافة قطعة غيار"
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(p, pIdx) in form.products"
              :key="pIdx"
              class="grid grid-cols-12 gap-2 p-2.5 rounded-xl border border-brand-gray/15 bg-brand-white dark:bg-white/5 items-center"
            >
              <div class="col-span-5">
                <select
                  @change="(e) => onProductPresetSelected(pIdx, e.target.value)"
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white text-xs mb-1"
                >
                  <option value="">-- اختر من مخزن قطع الغيار --</option>
                  <option v-for="item in inventoryStore.products" :key="item.id" :value="item.id">
                    {{ item.name }} (سعر: {{ formatCurrency(item.unitPrice || 0) }})
                  </option>
                </select>
                <input
                  v-model="p.productName"
                  type="text"
                  placeholder="اسم القطعة *"
                  required
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-semibold"
                />
              </div>

              <div class="col-span-2">
                <input
                  v-model.number="p.quantity"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder="الكمية *"
                  required
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono"
                />
              </div>

              <div class="col-span-2">
                <div class="relative">
                  <input
                    v-model.number="p.unitPrice"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="سعر الوحدة *"
                    required
                    class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono font-bold"
                  />
                  <span class="absolute end-1.5 top-1.5 text-[9px] text-brand-gray pointer-events-none">ج.م</span>
                </div>
              </div>

              <div class="col-span-2 text-center font-mono font-bold text-brand-dark dark:text-white text-xs">
                {{ formatCurrency((p.quantity || 0) * (p.unitPrice || 0)) }}
              </div>

              <div class="col-span-1 text-center">
                <button
                  type="button"
                  @click="removeProductRow(pIdx)"
                  class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  title="حذف البند"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Totals & Discount & Notes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-gray/10 pt-4">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              ملاحظات أو شروط المقايسة
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="مثال: الأسعار سارية لمدة 7 أيام - لا تشمل أعمال الخراطة الخارجية..."
              class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
            ></textarea>
          </div>

          <div class="bg-brand-light/40 dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 space-y-2.5 font-mono text-xs">
            <div class="flex justify-between items-center text-brand-gray">
              <span>المجموع الفرعي (المصنعيات + القطع):</span>
              <span class="font-bold text-brand-dark dark:text-white text-sm">{{ formatCurrency(computedSubTotal) }}</span>
            </div>

            <div class="flex justify-between items-center gap-4">
              <span class="text-brand-gray">الخصم التقديري:</span>
              <div class="w-32 relative">
                <input
                  v-model.number="form.discount"
                  type="number"
                  step="any"
                  min="0"
                  class="w-full px-2 py-1 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono font-bold text-end"
                />
                <span class="absolute start-2 top-1 text-[10px] text-brand-gray pointer-events-none">ج.م</span>
              </div>
            </div>

            <div class="flex justify-between items-center gap-4">
              <span class="text-brand-gray">الضريبة / القيمة المضافة:</span>
              <div class="w-32 relative">
                <input
                  v-model.number="form.tax"
                  type="number"
                  step="any"
                  min="0"
                  class="w-full px-2 py-1 rounded-lg border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono font-bold text-end"
                />
                <span class="absolute start-2 top-1 text-[10px] text-brand-gray pointer-events-none">ج.م</span>
              </div>
            </div>

            <div class="border-t border-brand-gray/15 pt-2 flex justify-between items-center text-sm font-bold">
              <span class="text-brand-dark dark:text-white">الإجمالي التقديري المطلوب:</span>
              <span class="text-emerald-600 dark:text-emerald-400 text-base">{{ formatCurrency(computedTotalAmount) }}</span>
            </div>
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="estimateForm"
          :disabled="saving"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>{{ saving ? 'جاري الحفظ...' : (isEditing ? 'تحديث المقايسة' : 'حفظ عرض السعر') }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Modal 2: Printable A4 Estimate Preview (:closeOnBackdrop="false") -->
    <OhdaModal
      :visible="showPreviewModal"
      @close="showPreviewModal = false"
      title="معاينة وطباعة عرض السعر (A4)"
      subtitle="عرض السعر المعتمد بتصميم الورشة الرسمي والجاهز للطباعة المباشرة للعميل"
      :icon="Printer"
      max-width="max-w-3xl"
      :close-on-backdrop="false"
    >
      <div v-if="previewEstimate" class="bg-white text-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200" id="printableEstimateArea">
        <!-- Quote Header -->
        <div class="flex items-center justify-between border-b pb-6 mb-6">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-gray-900">مقايسة وعرض أسعار صيانة</h2>
            <span class="text-xs text-gray-500 font-mono block mt-1">ESTIMATE / QUOTATION</span>
          </div>
          <div class="text-left font-mono">
            <span class="text-lg font-black text-gray-900 block">{{ previewEstimate.estimateNumber }}</span>
            <span class="text-xs text-gray-500 block">التاريخ: {{ formatDate(previewEstimate.insertDate) }}</span>
            <span class="text-xs text-amber-700 font-bold block mt-0.5">صالح حتى: {{ formatDate(previewEstimate.validUntil) }}</span>
          </div>
        </div>

        <!-- Client & Vehicle Details Cards -->
        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-xs">
          <div>
            <span class="text-gray-400 block text-[10px] font-bold">بيانات العميل:</span>
            <span class="font-bold text-gray-900 text-sm block">{{ previewEstimate.clientName }}</span>
            <span class="text-gray-600 font-mono dir-ltr inline-block mt-0.5">{{ previewEstimate.clientPhone }}</span>
          </div>
          <div class="text-left">
            <span class="text-gray-400 block text-[10px] font-bold">بيانات السيارة:</span>
            <span class="font-mono font-bold text-gray-900 text-sm block">{{ previewEstimate.vehiclePlate || '—' }}</span>
            <span class="text-gray-600 text-xs block mt-0.5">{{ previewEstimate.vehicleModel || '' }}</span>
          </div>
        </div>

        <!-- Services Table -->
        <div v-if="previewEstimate.services?.length" class="mb-6">
          <h4 class="text-xs font-bold text-gray-700 mb-2 border-b pb-1">أولاً: أجور المصنعية والخدمات</h4>
          <table class="w-full text-right text-xs border-collapse">
            <thead>
              <tr class="border-b border-gray-200 text-gray-500 text-[10px] font-bold">
                <th class="py-2">الخدمة</th>
                <th class="py-2">الفئة</th>
                <th class="py-2 text-end">السعر التقديري</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in previewEstimate.services" :key="s.id">
                <td class="py-2 font-medium">{{ s.serviceName }}</td>
                <td class="py-2 text-gray-500 text-[11px]">{{ s.category }}</td>
                <td class="py-2 text-end font-mono font-bold">{{ formatCurrency(s.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Products Table -->
        <div v-if="previewEstimate.products?.length" class="mb-6">
          <h4 class="text-xs font-bold text-gray-700 mb-2 border-b pb-1">ثانياً: قطع الغيار والمستهلكات</h4>
          <table class="w-full text-right text-xs border-collapse">
            <thead>
              <tr class="border-b border-gray-200 text-gray-500 text-[10px] font-bold">
                <th class="py-2">القطعة / الصنف</th>
                <th class="py-2 text-center">الكمية</th>
                <th class="py-2 text-center">سعر الوحدة</th>
                <th class="py-2 text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in previewEstimate.products" :key="p.id">
                <td class="py-2 font-medium">{{ p.productName }}</td>
                <td class="py-2 text-center font-mono">{{ p.quantity }} {{ p.unit || 'قطعة' }}</td>
                <td class="py-2 text-center font-mono">{{ formatCurrency(p.unitPrice) }}</td>
                <td class="py-2 text-end font-mono font-bold">{{ formatCurrency(p.totalPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary & Totals -->
        <div class="border-t-2 border-gray-900 pt-4 space-y-1.5 text-xs font-mono">
          <div class="flex justify-between text-gray-600">
            <span>المجموع الفرعي:</span>
            <span>{{ formatCurrency(previewEstimate.subTotal) }}</span>
          </div>
          <div v-if="previewEstimate.discount > 0" class="flex justify-between text-emerald-600">
            <span>الخصم:</span>
            <span>-{{ formatCurrency(previewEstimate.discount) }}</span>
          </div>
          <div v-if="previewEstimate.tax > 0" class="flex justify-between text-gray-600">
            <span>الضريبة:</span>
            <span>+{{ formatCurrency(previewEstimate.tax) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-gray-900 border-t pt-2">
            <span>الإجمالي التقديري النهائي:</span>
            <span>{{ formatCurrency(previewEstimate.totalAmount) }}</span>
          </div>
        </div>

        <div v-if="previewEstimate.notes" class="mt-6 pt-4 border-t text-xs text-gray-500">
          <span class="font-bold block text-gray-700 mb-1">الشروط والملاحظات:</span>
          <p>{{ previewEstimate.notes }}</p>
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
        <button
          type="button"
          @click="triggerPrint"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة المقايسة</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Modal 3: Delete Confirmation Modal (:closeOnBackdrop="false") -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="حذف عرض السعر"
      subtitle="هل أنت متأكد من رغبتك في حذف هذا العرض؟"
      :icon="Trash2"
      max-width="max-w-md"
      :close-on-backdrop="false"
    >
      <div class="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-600 dark:text-red-400">
        سيتم حذف عرض السعر رقم <span class="font-bold font-mono">{{ deletingEstimate?.estimateNumber }}</span> نهائياً. لا يمكن التراجع عن هذا الإجراء.
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border border-brand-gray/20 cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="confirmDelete"
          :disabled="isDeleting"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف' }}</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOhdaEstimateStore } from "../stores/useOhdaEstimateStore";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  DollarSign,
  Printer,
  ArrowRightCircle,
  Send,
  Check,
  Save,
  Wrench,
  Package
} from "lucide-vue-next";

const router = useRouter();
const estimateStore = useOhdaEstimateStore();
const clientStore = useOhdaClientStore();
const serviceStore = useOhdaServiceStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const selectedStatus = ref(null);

const statusOptions = [
  { value: 1, label: "مسودة" },
  { value: 2, label: "مرسل للعميل" },
  { value: 3, label: "معتمد" },
  { value: 4, label: "مرفوض" },
  { value: 5, label: "منتهي الصلاحية" }
];

const tableColumns = [
  { field: "estimateNumber", header: "رقم المقايسة والصلاحية", sortable: true, width: "20%" },
  { field: "client", header: "العميل", sortable: true, width: "18%" },
  { field: "vehicle", header: "السيارة", width: "15%" },
  { field: "totalAmount", header: "القيمة التقديرية", sortable: true, width: "15%" },
  { field: "status", header: "الحالة", align: "center", width: "12%" },
  { field: "jobCard", header: "أمر الشغل", align: "center", width: "10%" },
  { field: "actions", header: "الإجراءات", align: "center", width: "10%" }
];

// Add/Edit State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const editingNumber = ref("");
const saving = ref(false);

const form = ref({
  clientId: null,
  vehicleId: null,
  validUntilStr: "",
  discount: 0,
  tax: 0,
  notes: "",
  services: [],
  products: []
});

// Preview State
const showPreviewModal = ref(false);
const previewEstimate = ref(null);

// Delete State
const showDeleteModal = ref(false);
const deletingEstimate = ref(null);
const isDeleting = ref(false);

onMounted(async () => {
  await Promise.all([
    estimateStore.fetchEstimates(),
    clientStore.fetchClients(),
    serviceStore.fetchServices(),
    inventoryStore.fetchProducts()
  ]);
});

const clientVehicles = computed(() => {
  if (!form.value.clientId) return [];
  const client = clientStore.clients.find(c => c.id === form.value.clientId);
  return client?.vehicles || [];
});

function onClientChanged() {
  const vList = clientVehicles.value;
  form.value.vehicleId = vList.length > 0 ? vList[0].id : null;
}

const computedSubTotal = computed(() => {
  const servSum = form.value.services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const prodSum = form.value.products.reduce((acc, p) => acc + ((Number(p.quantity) || 0) * (Number(p.unitPrice) || 0)), 0);
  return servSum + prodSum;
});

const computedTotalAmount = computed(() => {
  const sub = computedSubTotal.value;
  const disc = Number(form.value.discount) || 0;
  const tax = Number(form.value.tax) || 0;
  return Math.max(0, sub - disc + tax);
});

const filteredEstimates = computed(() => {
  let list = estimateStore.estimates || [];

  if (selectedStatus.value !== null) {
    if (selectedStatus.value === 5) {
      list = list.filter(e => e.status === 5 || e.isExpired);
    } else {
      list = list.filter(e => e.status === selectedStatus.value);
    }
  }

  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(e =>
      (e.estimateNumber && e.estimateNumber.toLowerCase().includes(q)) ||
      (e.clientName && e.clientName.toLowerCase().includes(q)) ||
      (e.clientPhone && e.clientPhone.includes(q)) ||
      (e.vehiclePlate && e.vehiclePlate.toLowerCase().includes(q))
    );
  }

  return list;
});

function countByStatus(st) {
  if (st === 5) return estimateStore.expiredCount;
  return estimateStore.estimates.filter(e => e.status === st).length;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 1:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25";
    case 2:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25";
    case 3:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
    case 4:
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25";
    case 5:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25";
    default:
      return "bg-slate-500/10 text-slate-700 border-slate-500/25";
  }
}

// Service Line Helpers
function addServiceRow() {
  form.value.services.push({
    workshopServiceId: null,
    serviceName: "",
    category: "ميكانيكا",
    price: 0
  });
}

function removeServiceRow(idx) {
  form.value.services.splice(idx, 1);
}

function onServicePresetSelected(idx, serviceId) {
  if (!serviceId) return;
  const srv = serviceStore.services.find(s => s.id === Number(serviceId));
  if (srv) {
    form.value.services[idx].workshopServiceId = srv.id;
    form.value.services[idx].serviceName = srv.name;
    form.value.services[idx].category = srv.category || "ميكانيكا";
    form.value.services[idx].price = Number(srv.price) || 0;
  }
}

// Product Line Helpers
function addProductRow() {
  form.value.products.push({
    productId: 0,
    productName: "",
    quantity: 1,
    unitPrice: 0
  });
}

function removeProductRow(idx) {
  form.value.products.splice(idx, 1);
}

function onProductPresetSelected(idx, productId) {
  if (!productId) return;
  const prod = inventoryStore.products.find(p => p.id === Number(productId));
  if (prod) {
    form.value.products[idx].productId = prod.id;
    form.value.products[idx].productName = prod.name;
    form.value.products[idx].unitPrice = Number(prod.unitPrice || prod.purchasePrice || 0);
  }
}

// Modal Handlers
function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  editingNumber.value = "";

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);

  form.value = {
    clientId: clientStore.clients.length > 0 ? clientStore.clients[0].id : null,
    vehicleId: null,
    validUntilStr: defaultDate.toISOString().split("T")[0],
    discount: 0,
    tax: 0,
    notes: "عرض السعر صالح لمدة 7 أيام من تاريخه. الأسعار تشمل التركيب.",
    services: [
      { workshopServiceId: null, serviceName: "فحص وتحديد أعطال", category: "ميكانيكا", price: 150 }
    ],
    products: []
  };

  onClientChanged();
  showModal.value = true;
}

function openEditModal(estimate) {
  isEditing.value = true;
  editingId.value = estimate.id;
  editingNumber.value = estimate.estimateNumber;

  form.value = {
    clientId: estimate.clientId,
    vehicleId: estimate.vehicleId,
    validUntilStr: estimate.validUntil ? new Date(estimate.validUntil).toISOString().split("T")[0] : "",
    discount: Number(estimate.discount) || 0,
    tax: Number(estimate.tax) || 0,
    notes: estimate.notes || "",
    services: (estimate.services || []).map(s => ({
      workshopServiceId: s.workshopServiceId,
      serviceName: s.ServiceName || s.serviceName,
      category: s.category || "ميكانيكا",
      price: Number(s.price) || 0
    })),
    products: (estimate.products || []).map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: Number(p.quantity) || 1,
      unitPrice: Number(p.unitPrice) || 0
    }))
  };

  showModal.value = true;
}

async function submitEstimate() {
  if (!form.value.clientId) {
    toastStore.showToast("يرجى اختيار العميل أولاً", "error");
    return;
  }

  if (form.value.services.length === 0 && form.value.products.length === 0) {
    toastStore.showToast("يرجى إضافة بند خدمة أو قطعة غيار واحدة على الأقل", "error");
    return;
  }

  saving.value = true;
  const payload = {
    clientId: form.value.clientId,
    vehicleId: form.value.vehicleId || null,
    validUntil: form.value.validUntilStr ? new Date(form.value.validUntilStr).toISOString() : null,
    discount: Number(form.value.discount) || 0,
    tax: Number(form.value.tax) || 0,
    notes: form.value.notes,
    services: form.value.services.map(s => ({
      workshopServiceId: s.workshopServiceId || null,
      serviceName: s.serviceName,
      category: s.category || "ميكانيكا",
      price: Number(s.price) || 0
    })),
    products: form.value.products.map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: Number(p.quantity) || 1,
      unitPrice: Number(p.unitPrice) || 0
    }))
  };

  try {
    let res;
    if (isEditing.value) {
      res = await estimateStore.updateEstimate(editingId.value, payload);
    } else {
      res = await estimateStore.createEstimate(payload);
    }

    if (res.success) {
      toastStore.showToast(res.message, "success");
      showModal.value = false;
    } else {
      toastStore.showToast(res.message || "فشلت العملية", "error");
    }
  } finally {
    saving.value = false;
  }
}

// Status change
async function changeStatus(id, newStatus) {
  const res = await estimateStore.updateStatus(id, newStatus);
  if (res.success) {
    toastStore.showToast(res.message, "success");
  } else {
    toastStore.showToast(res.message || "فشل تغيير الحالة", "error");
  }
}

// Convert to Job Card
async function triggerConvertToJob(estimate) {
  if (!confirm(`هل أنت متأكد من رغبتك في تحويل عرض السعر (${estimate.estimateNumber}) إلى أمر شغل فوري؟`)) {
    return;
  }

  const res = await estimateStore.convertToJob(estimate.id);
  if (res.success) {
    toastStore.showToast(res.message, "success");
    router.push("/ohda/job-cards");
  } else {
    toastStore.showToast(res.message || "فشل تحويل عرض السعر", "error");
  }
}

// Preview Modal
function openPreviewModal(estimate) {
  previewEstimate.value = estimate;
  showPreviewModal.value = true;
}

function triggerPrint() {
  window.print();
}

// Delete
function openDeleteModal(estimate) {
  deletingEstimate.value = estimate;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!deletingEstimate.value) return;
  isDeleting.value = true;
  try {
    const res = await estimateStore.deleteEstimate(deletingEstimate.value.id);
    if (res.success) {
      toastStore.showToast(res.message, "success");
      showDeleteModal.value = false;
    } else {
      toastStore.showToast(res.message || "فشل حذف العرض", "error");
    }
  } finally {
    isDeleting.value = false;
  }
}

// Utilities
function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return "0.00 ج.م";
  return (Number(val) || 0).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ج.م";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #printableEstimateArea,
  #printableEstimateArea * {
    visibility: visible;
  }
  #printableEstimateArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    box-shadow: none;
    border: none;
  }
}
</style>
