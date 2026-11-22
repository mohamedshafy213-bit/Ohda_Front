<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <FileText class="w-7 h-7 text-brand-accent" />
          <span>أوامر الشغل وفواتير الصيانة</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          تسجيل دخول السيارات، أوامر الشغل، الخدمات المنجزة، قطع الغيار، وسداد الفواتير (كاش / فيزا / إنستاباي)
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="exportJobsToExcel"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="تصدير أوامر الشغل إلى ملف Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <button
          type="button"
          @click="openCreateModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إنشاء أمر شغل جديد</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FileText class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي الأوامر</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ jobStore.totalJobsCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">قيد العمل بالورشة</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ jobStore.openJobsCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">جاهزة للتسليم / الدفع</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ jobStore.doneJobsCount }}</span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <AlertCircle class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">مستحقات غير مسددة</span>
          <span class="text-lg font-bold text-red-600 dark:text-red-400 font-mono">
            {{ jobStore.totalUnpaidReceivables.toLocaleString() }} ج.م
          </span>
        </div>
      </div>
    </div>

    <!-- Status Tabs & Search Bar -->
    <div class="space-y-3 print:hidden">
      <!-- Status Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="statusFilter = null"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="statusFilter === null ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          الكل ({{ jobStore.jobs.length }})
        </button>

        <button
          type="button"
          @click="statusFilter = 1"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="statusFilter === 1 ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          قيد العمل ({{ jobStore.openJobsCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 2"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="statusFilter === 2 ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          مكتمل ({{ jobStore.doneJobsCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 3"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="statusFilter === 3 ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          مدفوع ومغلق ({{ jobStore.paidJobsCount }})
        </button>

        <button
          type="button"
          @click="statusFilter = 4"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
          :class="statusFilter === 4 ? 'bg-red-600 text-white border-red-600 font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
        >
          ملغي
        </button>
      </div>

      <!-- Search Field -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <searchField v-model="searchQuery" placeholder="ابحث برقم الأمر، اسم العميل، الهاتف، أو رقم اللوحة..." class="flex-1" />
        <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
          عرض {{ filteredJobs.length }} من {{ jobStore.jobs.length }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="jobStore.loading && !jobStore.jobs.length" type="table" :count="6" />

    <!-- Jobs DataTable using OhdaDataTable -->
    <OhdaDataTable
      v-else
      :items="filteredJobs"
      :columns="jobColumns"
      :loading="jobStore.loading"
      empty-title="لا توجد أوامر شغل مسجلة حالياً"
      empty-message="يمكنك إنشاء أمر شغل واستلام سيارة جديدة بالنقر على الزر أدناه."
      :rows-per-page="15"
      class="print:hidden"
    >
      <template #empty-action>
        <button
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
        >
          <Plus class="w-4 h-4" />
          <span>إنشاء أمر شغل جديد</span>
        </button>
      </template>

      <!-- Job Number & Date -->
      <template #jobNumber="{ data }">
        <div>
          <span class="font-mono font-bold text-brand-accent text-xs block select-all">{{ data.jobNumber }}</span>
          <span class="text-[10px] text-brand-gray dark:text-slate-400 font-mono">{{ formatDateTime(data.insertDate) }}</span>
        </div>
      </template>

      <!-- Customer -->
      <template #customerName="{ data }">
        <div>
          <span class="font-bold text-brand-dark dark:text-white block">{{ data.customerName }}</span>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 font-mono">{{ data.customerPhone || '-' }}</span>
        </div>
      </template>

      <!-- Car Details -->
      <template #carPlate="{ data }">
        <div>
          <div class="inline-flex items-center gap-1.5">
            <Car class="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span class="font-bold text-brand-dark dark:text-white font-mono">{{ data.carPlate }}</span>
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{{ data.carModel || 'موديل غير محدد' }}</span>
            <span v-if="data.odometer" class="text-[10px] font-mono mr-1">({{ data.odometer.toLocaleString() }} كم)</span>
          </div>
        </div>
      </template>

      <!-- Items Count -->
      <template #items="{ data }">
        <span class="text-[11px] text-slate-600 dark:text-slate-300">
          {{ (data.services?.length || 0) }} خدمة + {{ (data.products?.length || 0) }} قطع
        </span>
      </template>

      <!-- Total Amount -->
      <template #totalAmount="{ data }">
        <span class="font-mono font-bold text-brand-dark dark:text-white text-xs">
          {{ (Number(data.totalAmount) || 0).toLocaleString() }} ج.م
        </span>
      </template>

      <!-- Payment -->
      <template #payment="{ data }">
        <div class="space-y-0.5 text-[11px] font-mono">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">
            مدفوع: {{ (Number(data.paidAmount) || 0).toLocaleString() }} ج.م
          </div>
          <div v-if="data.remainingBalance > 0" class="text-red-500 font-bold">
            متبقي: {{ (Number(data.remainingBalance) || 0).toLocaleString() }} ج.م
          </div>
          <div v-else class="text-slate-400 text-[10px]">
            (مسدد بالكامل)
          </div>
        </div>
      </template>

      <!-- Status -->
      <template #status="{ data }">
        <span
          class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block"
          :class="getStatusBadgeClass(data.status)"
        >
          {{ data.statusText }}
        </span>
      </template>

      <!-- Actions -->
      <template #actions="{ data }">
        <div class="flex items-center justify-center gap-1.5">
          <!-- Printable Invoice Button -->
          <button
            type="button"
            @click="openInvoiceModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-accent/20 text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="عرض وطباعة الفاتورة"
          >
            <Printer class="w-3.5 h-3.5" />
          </button>

          <!-- Quick Payment Button (+) -->
          <button
            v-if="data.remainingBalance > 0 && data.status !== 4"
            type="button"
            @click="openPaymentModal(data)"
            class="px-2 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition cursor-pointer flex items-center gap-1 border border-emerald-500/25"
            title="تسجيل دفعة سداد"
          >
            <Coins class="w-3 h-3" />
            <span>سداد</span>
          </button>

          <!-- Fast Status Toggle (Done) -->
          <button
            v-if="data.status === 1"
            type="button"
            @click="markJobDone(data)"
            class="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition cursor-pointer border border-blue-500/20"
            title="تأكيد اكتمال الصيانة (جاهزة للتسليم)"
          >
            <Check class="w-3.5 h-3.5" />
          </button>

          <!-- Edit Job -->
          <button
            v-if="data.status === 1 || data.status === 2"
            type="button"
            @click="openEditModal(data)"
            class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-gray hover:text-brand-accent transition cursor-pointer border border-brand-gray/15"
            title="تعديل أمر الشغل"
          >
            <Edit class="w-3.5 h-3.5" />
          </button>

          <!-- Delete Job -->
          <button
            v-if="data.status !== 3"
            type="button"
            @click="promptDelete(data)"
            class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition cursor-pointer border border-red-500/20"
            title="حذف / إلغاء أمر الشغل"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </OhdaDataTable>

    <!-- 1. Create / Edit Job Card Modal using OhdaModal -->
    <OhdaModal
      :visible="showJobModal"
      @close="showJobModal = false"
      :title="isEditing ? `تعديل أمر الشغل: ${editingJobNumber}` : 'إنشاء أمر شغل واستلام سيارة جديدة'"
      description="إدخال بيانات العميل والسيارة واختيار الخدمات وقطع الغيار المطلوبة وسداد الفاتورة"
      :icon="FileText"
      max-width="max-w-4xl"
    >
      <form @submit.prevent="saveJobCard" id="jobForm" class="space-y-4 text-xs">
        <!-- 1. Customer & Car Details (2-Column Grid) -->
        <div class="p-4 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
            <User class="w-4 h-4 text-brand-accent" />
            <span>بيانات العميل والسيارة</span>
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">اسم العميل <span class="text-red-500">*</span></label>
              <input
                v-model="form.customerName"
                required
                type="text"
                placeholder="مثال: أحمد محمود"
                class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-medium focus:border-brand-accent transition-all"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1">رقم الهاتف</label>
              <input
                v-model="form.customerPhone"
                type="text"
                placeholder="010XXXXXXXX"
                class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono focus:border-brand-accent transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label class="block font-semibold mb-1">رقم اللوحة <span class="text-red-500">*</span></label>
              <input
                v-model="form.carPlate"
                required
                type="text"
                placeholder="مثال: أ ب ج 1234"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono font-bold focus:border-brand-accent transition-all"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1">نوع الهيكل</label>
              <select
                v-model="form.carType"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all cursor-pointer"
              >
                <option value="سيدان">سيدان</option>
                <option value="دفع رباعي / SUV">دفع رباعي / SUV</option>
                <option value="هاتشباك">هاتشباك</option>
                <option value="بيك آب / نقل">بيك آب / نقل</option>
                <option value="ميني فان">ميني فان</option>
                <option value="كوبيه">كوبيه</option>
                <option value="شاحنة">شاحنة</option>
                <option value="باص">باص</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">ماركة وطراز السيارة</label>
              <input
                v-model="form.carModel"
                type="text"
                list="brandsList"
                placeholder="مثال: تويوتا كورولا 2021"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
              />
              <datalist id="brandsList">
                <option v-for="b in popularCarBrands" :key="b" :value="b" />
              </datalist>
            </div>
            <div>
              <label class="block font-semibold mb-1">عداد الكيلومترات (كم)</label>
              <input
                v-model.number="form.odometer"
                type="number"
                min="0"
                placeholder="مثال: 65000"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-mono focus:border-brand-accent transition-all"
              />
            </div>
          </div>
        </div>

        <!-- 2. Services Section -->
        <div class="p-4 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Wrench class="w-4 h-4 text-brand-accent" />
              <span>الخدمات المطلوبة والمصنعيات</span>
            </span>
            <button
              type="button"
              @click="addServiceRow"
              class="text-xs text-brand-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة خدمة</span>
            </button>
          </div>

          <div v-if="!form.services.length" class="text-center py-4 text-brand-gray text-[11px]">
            لم يتم إضافة خدمات لأمر الشغل بعد. اضغط "إضافة خدمة" لإضافة مصنعية أو فحص.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(svc, idx) in form.services"
              :key="idx"
              class="grid grid-cols-12 gap-2 items-center bg-white dark:bg-brand-dark p-2.5 rounded-xl border border-brand-gray/15"
            >
              <div class="col-span-5">
                <select
                  v-model="svc.workshopServiceId"
                  @change="onServiceCatalogSelected(idx, svc.workshopServiceId)"
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs text-brand-dark dark:text-white focus:border-brand-accent"
                >
                  <option :value="null">-- اختر من قائمة الخدمات --</option>
                  <option v-for="s in serviceStore.services" :key="s.id" :value="s.id">
                    {{ s.name }} ({{ s.price }} ج.م)
                  </option>
                </select>
              </div>

              <div class="col-span-4">
                <input
                  v-model="svc.notes"
                  type="text"
                  placeholder="ملاحظات الخدمة..."
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs text-brand-dark dark:text-white focus:border-brand-accent"
                />
              </div>

              <div class="col-span-2">
                <input
                  v-model.number="svc.price"
                  type="number"
                  step="any"
                  min="0"
                  class="w-full px-2 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs font-mono font-bold text-brand-dark dark:text-white text-center focus:border-brand-accent"
                />
              </div>

              <div class="col-span-1 text-center">
                <button
                  type="button"
                  @click="removeServiceRow(idx)"
                  class="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Spare Parts & Products Section -->
        <div class="p-4 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Package class="w-4 h-4 text-brand-accent" />
              <span>قطع الغيار والزيوت المستهلكة من المخزن</span>
            </span>
            <button
              type="button"
              @click="addProductRow"
              class="text-xs text-brand-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div v-if="!form.products.length" class="text-center py-4 text-brand-gray text-[11px]">
            لم يتم إضافة قطع غيار. اضغط "إضافة صنف" لسحب زيت أو فلتر أو قطعة من المخزن.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(prod, idx) in form.products"
              :key="idx"
              class="grid grid-cols-12 gap-2 items-center bg-white dark:bg-brand-dark p-2.5 rounded-xl border border-brand-gray/15"
            >
              <div class="col-span-5">
                <select
                  v-model="prod.productId"
                  @change="onProductCatalogSelected(idx, prod.productId)"
                  class="w-full px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs text-brand-dark dark:text-white focus:border-brand-accent"
                >
                  <option :value="null">-- اختر من المخزون --</option>
                  <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
                    {{ p.name }} (متاح: {{ p.currentQuantity ?? p.quantity }})
                  </option>
                </select>
              </div>

              <div class="col-span-2">
                <input
                  v-model.number="prod.quantity"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder="الكمية"
                  class="w-full px-2 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs font-mono font-bold text-center text-brand-dark dark:text-white focus:border-brand-accent"
                />
              </div>

              <div class="col-span-2">
                <input
                  v-model.number="prod.unitPrice"
                  type="number"
                  step="any"
                  min="0"
                  class="w-full px-2 py-1.5 rounded-lg border border-brand-gray/25 bg-transparent text-xs font-mono font-bold text-center text-brand-dark dark:text-white focus:border-brand-accent"
                />
              </div>

              <div class="col-span-2 text-center font-mono font-bold text-xs text-brand-dark dark:text-white">
                {{ ((prod.quantity || 0) * (prod.unitPrice || 0)).toLocaleString() }} ج.م
              </div>

              <div class="col-span-1 text-center">
                <button
                  type="button"
                  @click="removeProductRow(idx)"
                  class="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Invoice Financial Totals (2-Column Grid) -->
        <div class="p-4 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold mb-1">المجموع الفرعي (ج.م)</label>
              <div class="h-10 px-3 flex items-center rounded-xl bg-white dark:bg-brand-dark border border-brand-gray/20 font-mono font-bold text-brand-dark dark:text-white">
                {{ computedSubTotal.toLocaleString() }} ج.م
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">الخصم (ج.م)</label>
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1">الإجمالي النهائي المطلوب</label>
              <div class="h-10 px-3 flex items-center rounded-xl bg-brand-accent/15 border border-brand-accent/40 font-mono font-bold text-sm text-brand-accent">
                {{ computedTotalAmount.toLocaleString() }} ج.م
              </div>
            </div>
          </div>

          <!-- Initial Payment (Only for new jobs) -->
          <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-gray/10">
            <div>
              <label class="block font-semibold mb-1">المسدد نقداً / مقدماً الآن (ج.م)</label>
              <input
                v-model.number="form.initialPaidAmount"
                type="number"
                min="0"
                :max="computedTotalAmount"
                class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold text-emerald-600 focus:border-brand-accent transition-all"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1">طريقة الدفع</label>
              <select
                v-model="form.paymentMethod"
                class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
              >
                <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block font-semibold mb-1">ملاحظات أمر الشغل (اختياري)</label>
          <input
            v-model="form.notes"
            type="text"
            placeholder="شكوى العميل، ملاحظات الفني، تفاصيل الاستلام..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
          />
        </div>
      </form>

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
          form="jobForm"
          :disabled="savingJob"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw v-if="savingJob" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'حفظ التعديلات' : 'إنشاء أمر الشغل' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Printable Invoice Modal using OhdaModal -->
    <OhdaModal
      :visible="showInvoiceModal"
      @close="showInvoiceModal = false"
      :title="`فاتورة أمر الشغل: ${targetJobForInvoice?.jobNumber || ''}`"
      description="معاينة وطباعة الفاتورة الضريبية أو إيصال الكاشير الحراري"
      :icon="Printer"
      max-width="max-w-2xl"
    >
      <div v-if="targetJobForInvoice" class="space-y-4">
        <!-- Toolbar: Switch between A4 & 80mm Receipt, Print Button -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 print:hidden">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="invoicePrintMode = 'a4'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
              :class="invoicePrintMode === 'a4' ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'bg-gray-100 dark:bg-white/5 border-gray-200'"
            >
              فاتورة ضريبية A4
            </button>
            <button
              type="button"
              @click="invoicePrintMode = 'receipt'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
              :class="invoicePrintMode === 'receipt' ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'bg-gray-100 dark:bg-white/5 border-gray-200'"
            >
              إيصال كاشير 80mm
            </button>
          </div>
        </div>

        <!-- Printable Invoice Area -->
        <div id="printableInvoiceArea" class="bg-white text-black p-6 rounded-2xl border border-gray-200 text-xs shadow-xs">
          <!-- Invoice Header -->
          <div class="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h2 class="text-base font-bold text-gray-900">مركز الصيانة والعناية بالسيارات</h2>
              <p class="text-[11px] text-gray-500 mt-0.5">خدمات صيانة ميكانيكية، كهرباء، تغيير زيوت، وعناية شاملة</p>
            </div>
            <div class="text-end">
              <span class="font-mono font-bold text-sm block">{{ targetJobForInvoice.jobNumber }}</span>
              <span class="text-[10px] text-gray-400 block font-mono">{{ formatDateTime(targetJobForInvoice.insertDate) }}</span>
            </div>
          </div>

          <!-- Customer & Car Details -->
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100 text-xs">
            <div>
              <span class="text-gray-400 block text-[10px]">العميل:</span>
              <span class="font-bold text-gray-800">{{ targetJobForInvoice.customerName }}</span>
              <span class="text-gray-500 font-mono text-[11px] block">{{ targetJobForInvoice.customerPhone }}</span>
            </div>
            <div>
              <span class="text-gray-400 block text-[10px]">السيارة:</span>
              <span class="font-bold text-gray-800 font-mono">{{ targetJobForInvoice.carPlate }}</span>
              <span class="text-gray-500 text-[11px] block">{{ targetJobForInvoice.carModel }}</span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full text-right text-xs border-collapse mb-4">
            <thead>
              <tr class="border-b border-gray-200 text-gray-500 text-[10px] font-bold">
                <th class="py-2">البند / الوصف</th>
                <th class="py-2 text-center">الكمية</th>
                <th class="py-2 text-start">السعر</th>
                <th class="py-2 text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in targetJobForInvoice.services" :key="s.id">
                <td class="py-2 font-medium">{{ s.serviceName }} (مصنعية)</td>
                <td class="py-2 text-center font-mono">1</td>
                <td class="py-2 font-mono">{{ Number(s.price).toLocaleString() }} ج.م</td>
                <td class="py-2 text-end font-mono font-bold">{{ Number(s.price).toLocaleString() }} ج.م</td>
              </tr>
              <tr v-for="p in targetJobForInvoice.products" :key="p.id">
                <td class="py-2 font-medium">{{ p.productName }} (قطع غيار)</td>
                <td class="py-2 text-center font-mono">{{ p.quantity }}</td>
                <td class="py-2 font-mono">{{ Number(p.unitPrice).toLocaleString() }} ج.م</td>
                <td class="py-2 text-end font-mono font-bold">{{ ((p.quantity || 0) * (p.unitPrice || 0)).toLocaleString() }} ج.م</td>
              </tr>
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div class="border-t pt-3 space-y-1.5 text-xs font-mono">
            <div class="flex justify-between">
              <span class="text-gray-500">الإجمالي النهائي:</span>
              <span class="font-bold">{{ targetJobForInvoice.totalAmount.toLocaleString() }} ج.م</span>
            </div>
            <div class="flex justify-between text-emerald-600">
              <span>المدفوع:</span>
              <span class="font-bold">{{ targetJobForInvoice.paidAmount.toLocaleString() }} ج.م</span>
            </div>
            <div v-if="targetJobForInvoice.remainingBalance > 0" class="flex justify-between text-red-500 font-bold border-t pt-1">
              <span>المتبقي المطلوب:</span>
              <span>{{ targetJobForInvoice.remainingBalance.toLocaleString() }} ج.م</span>
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
        <button
          type="button"
          @click="triggerPrint"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة الفاتورة</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Payment Modal using OhdaModal -->
    <OhdaModal
      :visible="showPaymentModal"
      @close="showPaymentModal = false"
      title="تسجيل دفعة سداد جديدة"
      description="تسجيل سداد نقدي أو بنكي وتحديث رصيد العميل فوراً"
      :icon="Coins"
      max-width="max-w-md"
    >
      <div v-if="targetJobForPayment" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light/60 dark:bg-white/5 rounded-2xl border border-brand-gray/10 flex items-center justify-between">
          <div>
            <span class="font-bold text-brand-dark dark:text-white block">{{ targetJobForPayment.customerName }}</span>
            <span class="text-[10px] text-brand-accent font-mono">{{ targetJobForPayment.jobNumber }} ({{ targetJobForPayment.carPlate }})</span>
          </div>
          <div class="text-end">
            <span class="text-[10px] text-gray-400 block">المتبقي المطلوب:</span>
            <span class="font-mono font-bold text-sm text-red-500">{{ targetJobForPayment.remainingBalance.toLocaleString() }} ج.م</span>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1.5">المبلغ المدفوع (ج.م) <span class="text-red-500">*</span></label>
          <input
            v-model.number="paymentForm.amount"
            type="number"
            step="any"
            min="1"
            :max="targetJobForPayment.remainingBalance"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs font-mono font-bold text-emerald-600 focus:border-brand-accent transition-all"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold mb-1.5">طريقة الدفع</label>
          <select
            v-model="paymentForm.paymentMethod"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          >
            <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1.5">رقم الإيصال / الحوالة (اختياري)</label>
          <input
            v-model="paymentForm.reference"
            type="text"
            placeholder="مثال: رقم مرجع إنستاباي، إيصال ماكينة الفيزا..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1.5">ملاحظات (اختياري)</label>
          <input
            v-model="paymentForm.notes"
            type="text"
            placeholder="أي تفاصيل حول السداد..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>
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
          @click="submitPayment"
          :disabled="savingPayment"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="savingPayment" class="w-4 h-4 animate-spin" />
          <span>تأكيد السداد</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 4. Delete Confirmation Modal using OhdaModal -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="تأكيد حذف / إلغاء أمر الشغل"
      description="يرجى الانتباه قبل إلغاء أو حذف أمر شغل مسجل"
      :icon="Trash2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في إلغاء أمر الشغل <strong>"{{ deletingJob?.jobNumber }}"</strong> لسيارة {{ deletingJob?.carPlate }}؟
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
          @click="executeDeleteJob"
          :disabled="isDeleting"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
          <span>نعم، إلغاء</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaJobCardStore } from "../stores/useOhdaJobCardStore";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import { exportToExcelCsv } from "../utils/excelHelper";

import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Check,
  Car,
  User,
  Wrench,
  Package,
  Printer,
  Coins,
  RefreshCw,
  Download,
  X
} from "lucide-vue-next";

const popularCarBrands = [
  "تويوتا",
  "هيونداي",
  "نيسان",
  "كيا",
  "ميتسوبيشي",
  "شيفروليه",
  "مرسيدس",
  "بي إم دبليو",
  "شيري",
  "إم جي",
  "رينو",
  "فيات",
  "بيجو",
  "فورد",
  "جيب",
  "فولكس فاجن",
  "سوزوكي",
  "هوندا",
  "مازدا",
  "سكودا",
  "أوبل",
  "سوبارو",
  "جيلي",
  "هافال"
];

const jobStore = useOhdaJobCardStore();
const serviceStore = useOhdaServiceStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const statusFilter = ref(null);

const paymentMethodOptions = [
  { value: 1, label: "نقدي (كاش)" },
  { value: 2, label: "بطاقة بنكية (فيزا / ماستركارد)" },
  { value: 3, label: "إنستاباي / محفظة إلكترونية" },
  { value: 4, label: "تحويل بنكي" },
  { value: 5, label: "أخرى" }
];

const jobColumns = [
  { field: "jobNumber", header: "رقم الأمر", sortable: true, width: "13%" },
  { field: "customerName", header: "العميل", sortable: true, width: "16%" },
  { field: "carPlate", header: "بيانات السيارة", sortable: true, width: "16%" },
  { field: "items", header: "البنود", align: "center", width: "10%" },
  { field: "totalAmount", header: "الإجمالي", sortable: true, width: "12%" },
  { field: "payment", header: "السداد", width: "15%" },
  { field: "status", header: "الحالة", align: "center", sortable: true, width: "10%" },
  { field: "actions", header: "الإجراءات", align: "center", width: "16%" }
];

// Add/Edit State
const showJobModal = ref(false);
const isEditing = ref(false);
const editingJobId = ref(null);
const editingJobNumber = ref("");
const savingJob = ref(false);

const form = ref({
  customerName: "",
  customerPhone: "",
  carPlate: "",
  carType: "سيدان",
  carModel: "",
  odometer: null,
  discount: 0,
  tax: 0,
  initialPaidAmount: 0,
  paymentMethod: 1,
  notes: "",
  services: [],
  products: []
});

// Invoice Modal State
const showInvoiceModal = ref(false);
const targetJobForInvoice = ref(null);
const invoicePrintMode = ref("a4"); // "a4" or "receipt"

// Payment Modal State
const showPaymentModal = ref(false);
const targetJobForPayment = ref(null);
const savingPayment = ref(false);
const paymentForm = ref({
  amount: 0,
  paymentMethod: 1,
  reference: "",
  notes: ""
});

// Delete Modal State
const showDeleteModal = ref(false);
const deletingJob = ref(null);
const isDeleting = ref(false);

onMounted(async () => {
  await Promise.all([
    jobStore.fetchJobs(),
    serviceStore.fetchServices(),
    inventoryStore.fetchProducts()
  ]);
});

const filteredJobs = computed(() => {
  let list = jobStore.jobs || [];

  if (statusFilter.value !== null) {
    list = list.filter(j => j.status === statusFilter.value);
  }

  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(j =>
      (j.jobNumber && j.jobNumber.toLowerCase().includes(q)) ||
      (j.customerName && j.customerName.toLowerCase().includes(q)) ||
      (j.customerPhone && j.customerPhone.toLowerCase().includes(q)) ||
      (j.carPlate && j.carPlate.toLowerCase().includes(q)) ||
      (j.carModel && j.carModel.toLowerCase().includes(q))
    );
  }

  return list;
});

const computedSubTotal = computed(() => {
  const sTotal = form.value.services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const pTotal = form.value.products.reduce((acc, p) => acc + ((Number(p.quantity) || 0) * (Number(p.unitPrice) || 0)), 0);
  return sTotal + pTotal;
});

const computedTotalAmount = computed(() => {
  return Math.max(0, computedSubTotal.value - (Number(form.value.discount) || 0) + (Number(form.value.tax) || 0));
});

function getStatusBadgeClass(status) {
  switch (status) {
    case 1:
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25";
    case 2:
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25";
    case 3:
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25";
    case 4:
      return "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25";
    default:
      return "bg-slate-500/15 text-slate-700 border border-slate-500/25";
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

// Modal open
function openCreateModal() {
  isEditing.value = false;
  editingJobId.value = null;
  form.value = {
    customerName: "",
    customerPhone: "",
    carPlate: "",
    carType: "سيدان",
    carModel: "",
    odometer: null,
    discount: 0,
    tax: 0,
    initialPaidAmount: 0,
    paymentMethod: 1,
    notes: "",
    services: [],
    products: []
  };
  addServiceRow();
  showJobModal.value = true;
}

function openEditModal(job) {
  isEditing.value = true;
  editingJobId.value = job.id;
  editingJobNumber.value = job.jobNumber;
  form.value = {
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    carPlate: job.carPlate,
    carType: job.carType || "سيدان",
    carModel: job.carModel,
    odometer: job.odometer,
    discount: job.discount || 0,
    tax: job.tax || 0,
    initialPaidAmount: 0,
    paymentMethod: 1,
    notes: job.notes || "",
    services: (job.services || []).map(s => ({
      workshopServiceId: s.workshopServiceId,
      serviceName: s.serviceName,
      category: s.category,
      price: s.price,
      notes: s.notes
    })),
    products: (job.products || []).map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      notes: p.notes
    }))
  };
  showJobModal.value = true;
}

// Excel Export
function exportJobsToExcel() {
  const exportCols = [
    { key: "jobNumber", label: "رقم أمر الشغل" },
    { key: "insertDate", label: "تاريخ الإنشاء" },
    { key: "customerName", label: "اسم العميل" },
    { key: "customerPhone", label: "رقم الهاتف" },
    { key: "carPlate", label: "رقم اللوحة" },
    { key: "carModel", label: "الموديل والسيارة" },
    { key: "odometer", label: "العداد (كم)" },
    { key: "totalAmount", label: "الإجمالي (ج.م)" },
    { key: "paidAmount", label: "المدفوع (ج.م)" },
    { key: "remainingBalance", label: "المتبقي (ج.م)" },
    { key: "statusText", label: "الحالة" }
  ];

  const exportData = (jobStore.jobs || []).map(j => ({
    jobNumber: j.jobNumber || "",
    insertDate: formatDateTime(j.insertDate),
    customerName: j.customerName || "",
    customerPhone: j.customerPhone || "",
    carPlate: j.carPlate || "",
    carModel: j.carModel || "",
    odometer: j.odometer || 0,
    totalAmount: j.totalAmount || 0,
    paidAmount: j.paidAmount || 0,
    remainingBalance: j.remainingBalance || 0,
    statusText: j.statusText || ""
  }));

  exportToExcelCsv("أوامر_شغل_الورشة.csv", exportCols, exportData);
  toastStore.addSuccessToast(`تم تصدير ${exportData.length} أمر شغل إلى Excel بنجاح`);
}

// Row Handlers
function addServiceRow() {
  const firstSvc = serviceStore.services[0];
  form.value.services.push({
    workshopServiceId: firstSvc?.id || null,
    serviceName: firstSvc?.name || "",
    category: firstSvc?.category || "ميكانيكا",
    price: Number(firstSvc?.price) || 0,
    notes: ""
  });
}

function onServiceCatalogSelected(idx, serviceId) {
  const found = serviceStore.services.find(s => s.id === serviceId);
  if (found && form.value.services[idx]) {
    form.value.services[idx].serviceName = found.name;
    form.value.services[idx].category = found.category;
    form.value.services[idx].price = Number(found.price) || 0;
  }
}

function removeServiceRow(idx) {
  form.value.services.splice(idx, 1);
}

function addProductRow() {
  const firstProd = inventoryStore.products[0];
  form.value.products.push({
    productId: firstProd?.id || null,
    productName: firstProd?.name || "",
    quantity: 1,
    unitPrice: Number(firstProd?.sellingPrice ?? firstProd?.unitPrice) || 0,
    notes: ""
  });
}

function onProductCatalogSelected(idx, productId) {
  const found = inventoryStore.products.find(p => p.id === productId);
  if (found && form.value.products[idx]) {
    form.value.products[idx].productName = found.name;
    form.value.products[idx].unitPrice = Number(found.sellingPrice ?? found.unitPrice) || 0;
  }
}

function removeProductRow(idx) {
  form.value.products.splice(idx, 1);
}

// Submit Create/Edit
async function saveJobCard() {
  if (!form.value.customerName?.trim() || !form.value.carPlate?.trim()) {
    toastStore.addErrorToast("اسم العميل ورقم اللوحة مطلوبان");
    return;
  }

  savingJob.value = true;
  try {
    const payload = {
      customerName: form.value.customerName.trim(),
      customerPhone: form.value.customerPhone?.trim() || "",
      carPlate: form.value.carPlate.trim(),
      carModel: form.value.carModel?.trim() || "",
      odometer: form.value.odometer,
      discount: form.value.discount || 0,
      tax: form.value.tax || 0,
      notes: form.value.notes?.trim() || null,
      services: form.value.services.filter(s => s.serviceName?.trim()),
      products: form.value.products.filter(p => p.productId && p.quantity > 0)
    };

    let res;
    if (isEditing.value) {
      payload.id = editingJobId.value;
      res = await jobStore.updateJob(editingJobId.value, payload);
    } else {
      payload.initialPaidAmount = form.value.initialPaidAmount || 0;
      payload.paymentMethod = form.value.paymentMethod || 1;
      res = await jobStore.createJob(payload);
    }

    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حفظ أمر الشغل بنجاح");
      showJobModal.value = false;
      await inventoryStore.fetchProducts();
    } else {
      toastStore.addErrorToast(res.message || "فشلت العملية");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حفظ أمر الشغل");
  } finally {
    savingJob.value = false;
  }
}

// Status Updates
async function markJobDone(job) {
  try {
    const res = await jobStore.updateStatus(job.id, 2); // 2 = Done
    if (res.success) {
      toastStore.addSuccessToast("تم تأكيد اكتمال الصيانة وخصم المواد المستخدمة من المخزن");
      await inventoryStore.fetchProducts();
    } else {
      toastStore.addErrorToast(res.message || "فشل تحديث الحالة");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء تحديث الحالة");
  }
}

// Payment Handlers
function openPaymentModal(job) {
  targetJobForPayment.value = job;
  paymentForm.value = {
    amount: job.remainingBalance || 0,
    paymentMethod: 1, // Cash default
    reference: "",
    notes: ""
  };
  showPaymentModal.value = true;
}

async function submitPayment() {
  if (!targetJobForPayment.value) return;
  if (paymentForm.value.amount <= 0) {
    toastStore.addErrorToast("المبلغ يجب أن يكون أكبر من صفر");
    return;
  }

  savingPayment.value = true;
  try {
    const payload = {
      jobCardId: targetJobForPayment.value.id,
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      reference: paymentForm.value.reference?.trim() || null,
      notes: paymentForm.value.notes?.trim() || null
    };

    const res = await jobStore.addPayment(payload);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم تسجيل السداد بنجاح");
      showPaymentModal.value = false;
      await inventoryStore.fetchProducts();
    } else {
      toastStore.addErrorToast(res.message || "فشل تسجيل الدفعة");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء تسجيل الدفعة");
  } finally {
    savingPayment.value = false;
  }
}

// Invoice & Print
function openInvoiceModal(job) {
  targetJobForInvoice.value = job;
  showInvoiceModal.value = true;
}

function triggerPrint() {
  window.print();
}

// Delete
function promptDelete(job) {
  deletingJob.value = job;
  showDeleteModal.value = true;
}

async function executeDeleteJob() {
  if (!deletingJob.value) return;
  isDeleting.value = true;
  try {
    const res = await jobStore.deleteJob(deletingJob.value.id);
    if (res.success) {
      toastStore.addSuccessToast(res.message || "تم حذف أمر الشغل بنجاح");
      showDeleteModal.value = false;
    } else {
      toastStore.addErrorToast(res.message || "فشل الحذف");
    }
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء حذف أمر الشغل");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printableInvoiceArea, #printableInvoiceArea * {
    visibility: visible;
  }
  #printableInvoiceArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 15px;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
