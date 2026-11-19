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
        <Button
          @click="openCreateModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إنشاء أمر شغل جديد</span>
        </Button>
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

    <!-- Jobs DataTable -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm print:hidden">
      <DataTable
        :value="filteredJobs"
        paginator
        :rows="15"
        :rowsPerPageOptions="[10, 15, 30]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <template #empty>
          <EmptyState
            title="لا توجد أوامر شغل مسجلة حالياً"
            icon="FileText"
            actionLabel="إنشاء أمر شغل جديد"
            @action="openCreateModal"
          />
        </template>

        <!-- Job Number & Date -->
        <Column field="jobNumber" header="رقم الأمر" sortable headerClass="text-start" style="width: 140px">
          <template #body="{ data }">
            <div>
              <span class="font-mono font-bold text-brand-accent text-xs block select-all">{{ data.jobNumber }}</span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400 font-mono">{{ formatDateTime(data.insertDate) }}</span>
            </div>
          </template>
        </Column>

        <!-- Customer Info -->
        <Column field="customerName" header="العميل" sortable headerClass="text-start">
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block">{{ data.customerName }}</span>
              <span class="text-[11px] text-brand-gray dark:text-slate-400 font-mono">{{ data.customerPhone || '-' }}</span>
            </div>
          </template>
        </Column>

        <!-- Car Info -->
        <Column field="carPlate" header="بيانات السيارة" sortable headerClass="text-start">
          <template #body="{ data }">
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
        </Column>

        <!-- Services & Products summary count -->
        <Column header="البنود" headerClass="text-center" bodyClass="text-center" style="width: 100px">
          <template #body="{ data }">
            <span class="text-[11px] text-slate-600 dark:text-slate-300">
              {{ (data.services?.length || 0) }} خدمة + {{ (data.products?.length || 0) }} قطع
            </span>
          </template>
        </Column>

        <!-- Total Amount -->
        <Column field="totalAmount" header="الإجمالي" sortable headerClass="text-start" style="width: 110px">
          <template #body="{ data }">
            <span class="font-mono font-bold text-brand-dark dark:text-white text-xs">
              {{ (Number(data.totalAmount) || 0).toLocaleString() }} ج.م
            </span>
          </template>
        </Column>

        <!-- Paid & Remaining -->
        <Column header="السداد" headerClass="text-start" style="width: 140px">
          <template #body="{ data }">
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
        </Column>

        <!-- Status Badge -->
        <Column field="status" header="الحالة" sortable headerClass="text-center" bodyClass="text-center" style="width: 120px">
          <template #body="{ data }">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block"
              :class="getStatusBadgeClass(data.status)"
            >
              {{ data.statusText }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="الإجراءات" headerClass="text-center" bodyClass="text-center" style="width: 160px; min-width: 160px">
          <template #body="{ data }">
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
        </Column>
      </DataTable>
    </div>

    <!-- 1. Create / Edit Job Card Dialog -->
    <Dialog
      v-model:visible="showJobModal"
      modal
      :header="isEditing ? `تعديل أمر الشغل: ${editingJobNumber}` : 'إنشاء أمر شغل واستلام سيارة جديدة'"
      class="max-w-3xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="saveJobCard" class="space-y-4 text-xs pt-2 max-h-[80vh] overflow-y-auto px-1">
        <!-- 1. Customer & Car Details -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
            <User class="w-4 h-4 text-brand-accent" />
            <span>بيانات العميل والسيارة</span>
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">اسم العميل <span class="text-red-500">*</span></label>
              <InputText
                v-model="form.customerName"
                required
                placeholder="مثال: أحمد محمود"
                class="w-full !rounded-xl"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1">رقم الهاتف</label>
              <InputText
                v-model="form.customerPhone"
                placeholder="010XXXXXXXX"
                class="w-full !rounded-xl font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold mb-1">رقم اللوحة <span class="text-red-500">*</span></label>
              <InputText
                v-model="form.carPlate"
                required
                placeholder="مثال: أ ب ج 1234"
                class="w-full !rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1">نوع وموديل السيارة</label>
              <InputText
                v-model="form.carModel"
                placeholder="مثال: تويوتا كورولا 2021"
                class="w-full !rounded-xl"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1">قراءة العداد (كم)</label>
              <InputNumber
                v-model="form.odometer"
                :min="0"
                placeholder="العداد الحالي"
                class="w-full !rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        <!-- 2. Services Section -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Wrench class="w-4 h-4 text-brand-accent" />
              <span>الخدمات المطلوبة (المصنعية)</span>
            </span>

            <button
              type="button"
              @click="addServiceRow"
              class="px-2.5 py-1 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة خدمة</span>
            </button>
          </div>

          <div v-if="form.services.length" class="space-y-2">
            <div
              v-for="(sRow, idx) in form.services"
              :key="idx"
              class="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-black/30 border border-brand-gray/15"
            >
              <!-- Choose Service from Catalog or Type -->
              <div class="flex-1">
                <Select
                  v-model="sRow.workshopServiceId"
                  :options="serviceStore.services"
                  optionLabel="name"
                  optionValue="id"
                  @change="(e) => onServiceCatalogSelected(idx, e.value)"
                  placeholder="اختر الخدمة من القائمة..."
                  class="w-full !text-xs !rounded-lg"
                />
              </div>

              <!-- Price Input -->
              <div class="w-32">
                <InputNumber
                  v-model="sRow.price"
                  :min="0"
                  :minFractionDigits="0"
                  placeholder="السعر ج.م"
                  class="w-full !text-xs !font-mono !font-bold !rounded-lg"
                />
              </div>

              <!-- Remove -->
              <button
                type="button"
                @click="removeServiceRow(idx)"
                class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-2 text-slate-400 text-[11px]">
            لم تضف أي خدمات بعد. انقر على "+ إضافة خدمة"
          </div>
        </div>

        <!-- 3. Spare Parts & Products Section -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
              <Package class="w-4 h-4 text-brand-accent" />
              <span>قطع الغيار والزيوت والمواد المستخدمة</span>
            </span>

            <button
              type="button"
              @click="addProductRow"
              class="px-2.5 py-1 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة قطعة / زيت</span>
            </button>
          </div>

          <div v-if="form.products.length" class="space-y-2">
            <div
              v-for="(pRow, idx) in form.products"
              :key="idx"
              class="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-black/30 border border-brand-gray/15"
            >
              <!-- Choose Product from Inventory -->
              <div class="flex-1">
                <Select
                  v-model="pRow.productId"
                  :options="inventoryStore.products"
                  optionLabel="name"
                  optionValue="id"
                  @change="(e) => onProductCatalogSelected(idx, e.value)"
                  placeholder="اختر الصنف من المخزن..."
                  class="w-full !text-xs !rounded-lg"
                />
              </div>

              <!-- Quantity Input -->
              <div class="w-24">
                <InputNumber
                  v-model="pRow.quantity"
                  :min="0.1"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  placeholder="الكمية"
                  class="w-full !text-xs !font-mono !rounded-lg"
                />
              </div>

              <!-- Unit Price Input -->
              <div class="w-28">
                <InputNumber
                  v-model="pRow.unitPrice"
                  :min="0"
                  placeholder="سعر الوحدة"
                  class="w-full !text-xs !font-mono !font-bold !rounded-lg"
                />
              </div>

              <!-- Total Item Line -->
              <div class="w-24 text-end font-mono font-bold text-brand-accent text-xs">
                {{ ((pRow.quantity || 0) * (pRow.unitPrice || 0)).toLocaleString() }} ج.م
              </div>

              <!-- Remove -->
              <button
                type="button"
                @click="removeProductRow(idx)"
                class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-2 text-slate-400 text-[11px]">
            لم تضف أي قطع غيار. انقر على "+ إضافة قطعة / زيت"
          </div>
        </div>

        <!-- 4. Totals, Discount & Initial Payment -->
        <div class="p-4 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold mb-1">المجموع الفرعي</label>
              <div class="h-10 flex items-center px-3 rounded-xl bg-white dark:bg-black/30 border border-brand-gray/20 font-mono font-bold text-brand-dark dark:text-white">
                {{ computedSubTotal.toLocaleString() }} ج.م
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">الخصم (ج.م)</label>
              <InputNumber
                v-model="form.discount"
                :min="0"
                placeholder="0"
                class="w-full !rounded-xl font-mono font-bold text-red-500"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1">الصافي المطلوب</label>
              <div class="h-10 flex items-center px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {{ computedTotalAmount.toLocaleString() }} ج.م
              </div>
            </div>
          </div>

          <!-- Initial payment fields when creating -->
          <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-gray/10">
            <div>
              <label class="block font-semibold mb-1">دفعة أولى مدفوعة الآن (اختياري)</label>
              <InputNumber
                v-model="form.initialPaidAmount"
                :min="0"
                :max="computedTotalAmount"
                placeholder="0.00"
                class="w-full !rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1">طريقة السداد</label>
              <Select
                v-model="form.paymentMethod"
                :options="paymentMethodOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full !rounded-xl"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block font-semibold mb-1">ملاحظات أمر الشغل (اختياري)</label>
          <InputText
            v-model="form.notes"
            placeholder="شكوى العميل، ملاحظات الفني، تفاصيل الاستلام..."
            class="w-full !rounded-xl"
          />
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showJobModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            :disabled="savingJob"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="savingJob" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'حفظ التعديلات' : 'إنشاء أمر الشغل' }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- 2. Printable Invoice Modal (A4 & 80mm Thermal Receipt) -->
    <Dialog
      v-model:visible="showInvoiceModal"
      modal
      :header="`فاتورة أمر الشغل: ${targetJobForInvoice?.jobNumber || ''}`"
      class="max-w-2xl w-full !bg-white dark:!bg-brand-dark rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetJobForInvoice" class="space-y-4 pt-2">
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

          <button
            type="button"
            @click="triggerPrint"
            class="px-4 py-1.5 rounded-xl bg-brand-dark hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
          >
            <Printer class="w-4 h-4 text-brand-accent" />
            <span>طباعة الآن</span>
          </button>
        </div>

        <!-- Invoice Printable Content Area -->
        <div
          id="printableInvoiceArea"
          class="p-6 bg-white text-black font-sans text-xs border border-gray-200 rounded-xl shadow-xs"
          :class="{ 'max-w-xs mx-auto text-[11px]': invoicePrintMode === 'receipt' }"
        >
          <!-- Header -->
          <div class="text-center border-b pb-4 mb-4">
            <h2 class="text-xl font-bold text-black tracking-wide">مركز وورشة صيانة السيارات والعناية</h2>
            <p class="text-gray-500 text-[11px] mt-0.5">خدمات ميكانيكا، كهرباء، تغيير زيوت، وغسيل متكامل</p>
            <p class="text-gray-500 text-[10px] font-mono mt-0.5">هاتف: 01000000000 | السجل التجاري: 12345</p>

            <div class="mt-3 inline-block px-3 py-1 bg-gray-100 rounded-lg font-mono font-bold text-sm">
              {{ targetJobForInvoice.jobNumber }}
            </div>
          </div>

          <!-- Customer & Car Info -->
          <div class="grid grid-cols-2 gap-2 pb-3 mb-3 border-b text-[11px]">
            <div>
              <span class="text-gray-500 block">العميل:</span>
              <strong class="text-black">{{ targetJobForInvoice.customerName }}</strong>
              <span class="block font-mono text-gray-600">{{ targetJobForInvoice.customerPhone }}</span>
            </div>
            <div class="text-end">
              <span class="text-gray-500 block">السيارة:</span>
              <strong class="text-black font-mono">{{ targetJobForInvoice.carPlate }}</strong>
              <span class="block text-gray-600">{{ targetJobForInvoice.carModel }}</span>
              <span v-if="targetJobForInvoice.odometer" class="text-[10px] text-gray-500 font-mono">
                عداد: {{ targetJobForInvoice.odometer.toLocaleString() }} كم
              </span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full text-start mb-4 border-collapse">
            <thead>
              <tr class="border-b bg-gray-50 text-[10px] text-gray-600">
                <th class="py-1.5 px-2 text-start">البند / الخدمة</th>
                <th class="py-1.5 px-2 text-center" style="width: 50px">الكمية</th>
                <th class="py-1.5 px-2 text-end" style="width: 80px">السعر</th>
                <th class="py-1.5 px-2 text-end" style="width: 90px">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y text-[11px]">
              <!-- Services -->
              <tr v-for="s in targetJobForInvoice.services" :key="`s-${s.id}`">
                <td class="py-2 px-2">
                  <span class="font-bold block">{{ s.serviceName }}</span>
                  <span class="text-[9px] text-gray-500">{{ s.category }} (مصنعية)</span>
                </td>
                <td class="py-2 px-2 text-center font-mono">1</td>
                <td class="py-2 px-2 text-end font-mono">{{ s.price.toLocaleString() }}</td>
                <td class="py-2 px-2 text-end font-mono font-bold">{{ s.price.toLocaleString() }} ج.م</td>
              </tr>

              <!-- Products -->
              <tr v-for="p in targetJobForInvoice.products" :key="`p-${p.id}`">
                <td class="py-2 px-2">
                  <span class="font-bold block">{{ p.productName }}</span>
                  <span class="text-[9px] text-gray-500">{{ p.productSKU }} (قطع غيار)</span>
                </td>
                <td class="py-2 px-2 text-center font-mono">{{ p.quantity }} {{ p.unit }}</td>
                <td class="py-2 px-2 text-end font-mono">{{ p.unitPrice.toLocaleString() }}</td>
                <td class="py-2 px-2 text-end font-mono font-bold">{{ p.totalPrice.toLocaleString() }} ج.م</td>
              </tr>
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div class="border-t pt-2 space-y-1 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span class="font-mono">{{ targetJobForInvoice.subTotal.toLocaleString() }} ج.م</span>
            </div>
            <div v-if="targetJobForInvoice.discount > 0" class="flex justify-between text-red-600">
              <span>الخصم الممنوح:</span>
              <span class="font-mono">- {{ targetJobForInvoice.discount.toLocaleString() }} ج.م</span>
            </div>
            <div class="flex justify-between text-base font-bold border-t pt-1 text-black">
              <span>صافي الفاتورة:</span>
              <span class="font-mono">{{ targetJobForInvoice.totalAmount.toLocaleString() }} ج.م</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-bold">
              <span>المبلغ المدفوع:</span>
              <span class="font-mono">{{ targetJobForInvoice.paidAmount.toLocaleString() }} ج.م</span>
            </div>
            <div v-if="targetJobForInvoice.remainingBalance > 0" class="flex justify-between text-red-600 font-bold border-t border-dashed pt-1">
              <span>المتبقي المطلوب:</span>
              <span class="font-mono">{{ targetJobForInvoice.remainingBalance.toLocaleString() }} ج.م</span>
            </div>
          </div>

          <!-- Footer Signature -->
          <div class="border-t mt-4 pt-3 flex justify-between items-center text-[10px] text-gray-500">
            <span>تاريخ الإصدار: {{ formatDateTime(targetJobForInvoice.insertDate) }}</span>
            <span>المسؤول: {{ targetJobForInvoice.userName || 'الاستقبال' }}</span>
          </div>

          <div class="text-center mt-3 pt-2 border-t text-[10px] text-gray-500">
            شكراً لثقتكم بنا، ونتمنى لكم قيادة آمنة!
          </div>
        </div>
      </div>
    </Dialog>

    <!-- 3. Payment Modal -->
    <Dialog
      v-model:visible="showPaymentModal"
      modal
      header="تسجيل دفعة سداد جديدة"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetJobForPayment" class="space-y-4 text-xs pt-2">
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-2xl border border-brand-gray/10 flex items-center justify-between">
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
          <InputNumber
            v-model="paymentForm.amount"
            :min="1"
            :max="targetJobForPayment.remainingBalance"
            class="w-full !rounded-xl font-mono font-bold text-emerald-600"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold mb-1.5">طريقة الدفع</label>
          <Select
            v-model="paymentForm.paymentMethod"
            :options="paymentMethodOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !rounded-xl"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1.5">رقم الإيصال / الحوالة (اختياري)</label>
          <InputText
            v-model="paymentForm.reference"
            placeholder="مثال: رقم مرجع إنستاباي، إيصال ماكينة الفيزا..."
            class="w-full !rounded-xl"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1.5">ملاحظات (اختياري)</label>
          <InputText
            v-model="paymentForm.notes"
            placeholder="أي تفاصيل حول السداد..."
            class="w-full !rounded-xl"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-gray/10">
          <Button
            type="button"
            @click="showPaymentModal = false"
            class="!bg-brand-light dark:!bg-white/5 !text-brand-dark dark:!text-white !border !border-brand-gray/20 !rounded-xl !px-4 !py-2.5 !text-xs cursor-pointer"
          >
            إلغاء
          </Button>

          <Button
            type="button"
            @click="submitPayment"
            :disabled="savingPayment"
            class="!bg-emerald-600 hover:!bg-emerald-500 !text-white !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="savingPayment" class="w-4 h-4 animate-spin" />
            <span>تأكيد السداد</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- 4. Delete Confirmation Modal -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      header="تأكيد حذف / إلغاء أمر الشغل"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-4 text-xs pt-2">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في إلغاء أمر الشغل <strong>"{{ deletingJob?.jobNumber }}"</strong> لسيارة {{ deletingJob?.carPlate }}؟
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
            @click="executeDeleteJob"
            :disabled="isDeleting"
            class="!bg-red-600 hover:!bg-red-500 !text-white !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
            <span>نعم، إلغاء</span>
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaJobCardStore } from "../stores/useOhdaJobCardStore";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
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
  X
} from "lucide-vue-next";

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
      // Refresh products stock in case initial payment triggered closing
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
