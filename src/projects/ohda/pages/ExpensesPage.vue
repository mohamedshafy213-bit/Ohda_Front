<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Receipt class="w-7 h-7 text-brand-accent" />
          <span>المصروفات والمشتريات والمصروفات الثابتة</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          تسجيل المصروفات اليومية، إدارة بنود المصروفات الثابتة الشهرية (كهرباء، مياه، إيجار...) مع إرفاق صور الفواتير
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="exportExpensesToExcel"
          class="bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          title="تصدير المصروفات إلى Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <router-link
          to="/ohda/purchases"
          class="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <PackagePlus class="w-4 h-4" />
          <span>شراء وتوريد بضاعة للمخزن</span>
        </router-link>

        <button
          v-if="pageMode === 'fixed'"
          type="button"
          @click="openFixedTemplateModal(null)"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ تعريف مصروف ثابت جديد</span>
        </button>

        <button
          v-else
          type="button"
          @click="openAddExpenseModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ تسجيل مصروف جديد</span>
        </button>
      </div>
    </div>

    <!-- Main Mode Switcher (Expenses Ledger vs Fixed Expenses CRUD & Monthly Payment) -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2 print:hidden">
      <button
        type="button"
        @click="pageMode = 'ledger'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        :class="pageMode === 'ledger' ? 'bg-brand-accent text-brand-dark shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
      >
        <Receipt class="w-4 h-4" />
        <span>سجل المصروفات والمدفوعات</span>
      </button>

      <button
        type="button"
        @click="pageMode = 'fixed'; loadFixedMonthly()"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        :class="pageMode === 'fixed' ? 'bg-brand-accent text-brand-dark shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
      >
        <Building2 class="w-4 h-4" />
        <span>المصروفات الثابتة الشهرية (كهرباء / مياه / إيجار)</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 font-mono">
          {{ expenseStore.fixedTemplates.length }}
        </span>
      </button>
    </div>

    <!-- ==================== TAB 1: EXPENSES LEDGER ==================== -->
    <template v-if="pageMode === 'ledger'">
      <!-- Quick Metrics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Receipt class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي المصروفات</span>
            <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ formatCurrency(expenseStore.totalExpensesAmount) }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <PackageCheck class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">مشتريات بضاعة وقطع غيار</span>
            <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(expenseStore.supplierPurchasesTotal) }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إيجار ومرافق وفواتير ثابتة</span>
            <span class="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{{ formatCurrency(expenseStore.utilitiesTotal) }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">رواتب وأجور العمال</span>
            <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(expenseStore.salariesTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="selectedTab = tab.value"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            :class="selectedTab === tab.value
              ? 'bg-brand-accent text-brand-dark font-bold shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'"
          >
            {{ tab.label }}
            <span class="ms-1 px-1.5 py-0.2 rounded-full text-[10px]" :class="selectedTab === tab.value ? 'bg-black/10' : 'bg-black/5 dark:bg-white/10'">
              {{ getCountForTab(tab.value) }}
            </span>
          </button>
        </div>

        <div class="w-full md:w-72 relative">
          <Search class="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالبيان، المورد، أو الفاتورة..."
            class="w-full ps-9 pe-3 py-2 rounded-xl text-xs bg-transparent border border-brand-gray/20 dark:border-white/10 text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>
      </div>

      <LoadingSkeleton v-if="expenseStore.loading && !expenseStore.expenses.length" type="table" :count="6" />

      <OhdaDataTable
        v-else
        :items="filteredExpenses"
        :columns="expenseColumns"
        :loading="expenseStore.loading"
        empty-title="لا توجد مصروفات مسجلة"
        empty-message="لم يتم العثور على أي مصروفات تطابق الفلتر الحالي. يمكنك تسجيل مصروف جديد بالأعلى."
        :rows-per-page="15"
      >
        <template #empty-action>
          <button
            type="button"
            @click="openAddExpenseModal"
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:bg-brand-accent/90"
          >
            <Plus class="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </template>

        <template #expenseDate="{ data }">
          <span class="font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {{ formatDate(data.expenseDate) }}
          </span>
        </template>

        <template #expenseType="{ data }">
          <div class="flex items-center gap-1 flex-wrap">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
              :class="getTypeBadgeClasses(data.expenseType)"
            >
              <component :is="getTypeIcon(data.expenseType)" class="w-3 h-3" />
              {{ data.expenseTypeText || data.expenseTypeName }}
            </span>
            <span v-if="data.isRecurring" class="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
              ثابت شهري
            </span>
          </div>
        </template>

        <template #notes="{ data }">
          <div>
            <div class="font-bold text-brand-dark dark:text-white">{{ data.notes || '-' }}</div>
            <div v-if="data.productName" class="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <Package class="w-3 h-3" />
              <span>توريد مخزن: {{ data.productName }} ({{ data.purchasedQuantity }} × {{ data.unitCost }} ج.م)</span>
            </div>
          </div>
        </template>

        <template #supplierName="{ data }">
          <span class="text-slate-700 dark:text-slate-300 font-medium">
            {{ data.supplierName || '-' }}
          </span>
        </template>

        <template #invoiceNumber="{ data }">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-slate-600 dark:text-slate-400">
              {{ data.invoiceNumber || '-' }}
            </span>
            <a
              v-if="data.receiptAttachmentPath"
              :href="getFileUrl(data.receiptAttachmentPath)"
              target="_blank"
              class="p-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
              title="عرض صورة الفاتورة المرفقة"
            >
              <ImageIcon class="w-3.5 h-3.5" />
            </a>
          </div>
        </template>

        <template #paymentMethodName="{ data }">
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
            {{ data.paymentMethodText || data.paymentMethodName }}
          </span>
        </template>

        <template #amount="{ data }">
          <span class="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
            {{ formatCurrency(data.amount) }}
          </span>
        </template>

        <template #actions="{ data }">
          <button
            type="button"
            @click="confirmDelete(data)"
            class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المصروف"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </template>
      </OhdaDataTable>
    </template>

    <!-- ==================== TAB 2: FIXED EXPENSES (SINGLE UNIFIED VIEW) ==================== -->
    <template v-else-if="pageMode === 'fixed'">
      <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-5">
        <!-- Unified Header: Month/Year Selector, Summary Cards, Add Button -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-brand-gray/10 pb-5">
          <div>
            <h2 class="text-base font-extrabold text-brand-dark dark:text-white flex items-center gap-2">
              <CalendarCheck2 class="w-5 h-5 text-brand-accent" />
              <span>جدول المصروفات الثابتة الشهرية (كهرباء، مياه، إيجار، إنترنت...)</span>
            </h2>
            <p class="text-xs text-brand-gray mt-1">
              جدول موحد وبسيط: حدد شهر التقفيل، عدّل المبلغ الفعلي لكل بند إذا تغير، أرفق صورة الفاتورة، واضغط "تسجيل للشهر" بضغطة زر واحدة.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Month & Year Selector -->
            <div class="flex items-center gap-1.5 bg-brand-light dark:bg-slate-800 p-1 rounded-xl border border-brand-gray/20">
              <select
                v-model.number="fixedMonth"
                @change="loadFixedMonthly"
                class="text-xs px-3 py-1.5 rounded-lg bg-transparent text-brand-dark dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                <option v-for="m in 12" :key="m" :value="m">شهر {{ m }}</option>
              </select>
              <span class="text-slate-400 text-xs">/</span>
              <select
                v-model.number="fixedYear"
                @change="loadFixedMonthly"
                class="text-xs px-3 py-1.5 rounded-lg bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option :value="2025">2025</option>
                <option :value="2026">2026</option>
                <option :value="2027">2027</option>
              </select>
            </div>

            <!-- Add New Fixed Expense Button -->
            <button
              type="button"
              @click="openFixedTemplateModal(null)"
              class="px-4 py-2 rounded-xl bg-brand-accent text-brand-dark font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-brand-accent/90 transition-all"
            >
              <Plus class="w-4 h-4" />
              <span>+ إضافة نوع مصروف ثابت</span>
            </button>
          </div>
        </div>

        <!-- Month Summary Mini-Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/50 dark:bg-white/5 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-brand-gray block">إجمالي المسجل لشهر {{ fixedMonth }}/{{ fixedYear }}</span>
              <span class="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(fixedMonthlyEdits.filter(r => r.isRecorded).reduce((s, r) => s + (Number(r.actualAmount) || 0), 0)) }}
              </span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              {{ fixedMonthlyEdits.filter(r => r.isRecorded).length }}
            </div>
          </div>

          <div class="p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/50 dark:bg-white/5 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-brand-gray block">بانتظار التسجيل للشهر</span>
              <span class="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                {{ formatCurrency(fixedMonthlyEdits.filter(r => !r.isRecorded).reduce((s, r) => s + (Number(r.actualAmount) || 0), 0)) }}
              </span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
              {{ fixedMonthlyEdits.filter(r => !r.isRecorded).length }}
            </div>
          </div>

          <div class="p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/50 dark:bg-white/5 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-brand-gray block">إجمالي أنواع المصروفات الثابتة</span>
              <span class="text-base font-bold text-brand-dark dark:text-white">
                {{ fixedMonthlyEdits.length }} بنود معرفة
              </span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-brand-accent/15 text-brand-dark flex items-center justify-center font-bold text-xs">
              {{ fixedMonthlyEdits.length }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="fixedMonthlyEdits.length === 0" class="py-12 text-center text-xs text-brand-gray space-y-3 bg-brand-light/30 dark:bg-white/5 rounded-2xl border border-dashed border-brand-gray/25">
          <Building2 class="w-10 h-10 mx-auto text-brand-gray/50" />
          <p class="font-bold text-sm text-brand-dark dark:text-white">لم يتم تعريف أي مصروفات ثابتة بعد</p>
          <p class="text-xs text-brand-gray max-w-md mx-auto">
            أضف بنود المصروفات الثابتة المتكررة مثل (إيجار الورشة، فاتورة الكهرباء، فاتورة المياه، اشتراك الإنترنت). وستظهر هنا شهرياً لتسجيلها وإرفاق فواتيرها بضغطة زر.
          </p>
          <button
            type="button"
            @click="openFixedTemplateModal(null)"
            class="px-4 py-2 bg-brand-accent text-brand-dark font-extrabold rounded-xl cursor-pointer hover:bg-brand-accent/90"
          >
            + أضف أول بند مصروف ثابت الآن
          </button>
        </div>

        <!-- Single Unified Table -->
        <div v-else class="overflow-x-auto rounded-xl border border-brand-gray/15">
          <table class="w-full text-right text-xs">
            <thead class="bg-brand-light/80 dark:bg-white/5 text-brand-gray font-bold border-b border-brand-gray/10">
              <tr>
                <th class="p-3">بند المصروف الثابت والتصنيف</th>
                <th class="p-3">المبلغ المعتاد</th>
                <th class="p-3 w-40">المبلغ لشهر {{ fixedMonth }}/{{ fixedYear }}</th>
                <th class="p-3 w-36">طريقة الدفع</th>
                <th class="p-3">صورة الفاتورة المرفقة</th>
                <th class="p-3 text-center">حالة السداد</th>
                <th class="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10">
              <tr v-for="row in fixedMonthlyEdits" :key="row.templateId" class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <!-- Name & Category -->
                <td class="p-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getTypeBadgeClasses(row.expenseType)">
                      <component :is="getTypeIcon(row.expenseType)" class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="font-extrabold text-brand-dark dark:text-white text-xs">{{ row.name }}</div>
                      <div class="text-[10px] text-brand-gray flex items-center gap-1.5 mt-0.5">
                        <span class="font-semibold">{{ row.expenseTypeText }}</span>
                        <span v-if="row.payeeName" class="text-slate-400">• {{ row.payeeName }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Default Amount -->
                <td class="p-3 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ formatCurrency(row.defaultAmount) }}
                </td>

                <!-- Actual Amount for this month (Inline editable) -->
                <td class="p-3">
                  <div class="relative">
                    <input
                      v-model.number="row.actualAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="المبلغ الفعلي"
                      class="w-full ps-2.5 pe-8 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900 font-mono font-bold text-brand-dark dark:text-white text-xs focus:border-brand-accent focus:outline-none"
                    />
                    <span class="absolute end-2 top-1/2 -translate-y-1/2 text-[9px] text-brand-gray font-bold">ج.م</span>
                  </div>
                </td>

                <!-- Payment Method -->
                <td class="p-3">
                  <select
                    v-model.number="row.paymentMethod"
                    class="w-full px-2 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900 text-xs font-semibold text-brand-dark dark:text-white focus:border-brand-accent focus:outline-none cursor-pointer"
                  >
                    <option :value="1">كاش (الخزينة)</option>
                    <option :value="3">إنستاباي</option>
                    <option :value="4">تحويل بنكي</option>
                    <option :value="2">بطاقة بنكية</option>
                  </select>
                </td>

                <!-- Invoice Photo Upload & Preview -->
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <label class="px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-white/5 hover:border-brand-accent cursor-pointer flex items-center gap-1.5 text-[11px] font-bold text-brand-dark dark:text-white transition-colors">
                      <Upload class="w-3.5 h-3.5 text-brand-accent" />
                      <span>{{ row.uploading ? 'جاري الرفع...' : (row.receiptAttachmentPath ? 'تغيير الصورة' : 'إرفاق فاتورة') }}</span>
                      <input type="file" accept="image/*,.pdf" class="hidden" @change="(e) => handleMonthlyRowFileUpload(e, row)" />
                    </label>
                    <a
                      v-if="row.receiptAttachmentPath"
                      :href="getFileUrl(row.receiptAttachmentPath)"
                      target="_blank"
                      class="w-8 h-8 rounded-lg overflow-hidden border border-brand-accent/40 shadow-xs shrink-0 block"
                      title="معاينة الفاتورة المرفقة"
                    >
                      <img :src="getFileUrl(row.receiptAttachmentPath)" class="w-full h-full object-cover" />
                    </a>
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="p-3 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    :class="row.isRecorded ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="row.isRecorded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"></span>
                    {{ row.isRecorded ? 'تم التسجيل ✓' : 'بانتظار التسجيل' }}
                  </span>
                </td>

                <!-- Action Buttons: Save + Edit Template + Delete Template -->
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- Save for month button -->
                    <button
                      type="button"
                      @click="saveMonthlyFixedRow(row)"
                      :disabled="row.saving"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      :class="row.isRecorded ? 'bg-blue-600/15 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-brand-accent text-brand-dark hover:bg-brand-accent/90 shadow-xs'"
                    >
                      {{ row.saving ? 'حفظ...' : (row.isRecorded ? 'تحديث المبلغ' : 'تسجيل للشهر') }}
                    </button>

                    <!-- Edit Template Info -->
                    <button
                      type="button"
                      @click="openFixedTemplateModal(row)"
                      class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 cursor-pointer transition-colors"
                      title="تعديل بيانات المصروف الثابت"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>

                    <!-- Delete Template -->
                    <button
                      type="button"
                      @click="deleteFixedTemplate(row)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="حذف هذا البند"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 1. Modal: Add General Expense -->
    <OhdaModal
      :visible="showAddModal"
      @close="showAddModal = false"
      title="تسجيل مصروف جديد"
      description="تسجيل مصروف تشغيلي، صيانة، ضيافة، أو فاتورة مع إرفاق صورة الإيصال"
      :icon="Receipt"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitGeneralExpense" id="generalExpenseForm" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1">نوع المصروف *</label>
            <select
              v-model="generalForm.expenseType"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs"
            >
              <option :value="3" class="bg-white dark:bg-slate-800">إيجار مقر الورشة</option>
              <option :value="2" class="bg-white dark:bg-slate-800">فاتورة كهرباء</option>
              <option :value="1" class="bg-white dark:bg-slate-800">فاتورة مياه (ورشة ومغسلة)</option>
              <option :value="4" class="bg-white dark:bg-slate-800">إنترنت وهواتف</option>
              <option :value="7" class="bg-white dark:bg-slate-800">صيانة عدد ومعدات الورشة</option>
              <option :value="8" class="bg-white dark:bg-slate-800">مصروفات نثرية وضيافة</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">المبلغ (ج.م) *</label>
            <input
              type="number"
              v-model.number="generalForm.amount"
              min="0.1"
              step="any"
              required
              placeholder="0.00"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">تاريخ المصروف *</label>
            <input
              type="date"
              v-model="generalForm.expenseDate"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">طريقة الدفع *</label>
            <select
              v-model="generalForm.paymentMethod"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">كاش (الخزينة النقدية)</option>
              <option :value="2" class="bg-white dark:bg-slate-800">بطاقة بنكية / فيزا</option>
              <option :value="3" class="bg-white dark:bg-slate-800">إنستاباي (InstaPay)</option>
              <option :value="4" class="bg-white dark:bg-slate-800">تحويل بنكي</option>
              <option :value="5" class="bg-white dark:bg-slate-800">أخرى</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">الجهة / المستفيد (اختياري)</label>
            <input
              type="text"
              v-model="generalForm.supplierName"
              placeholder="مثال: شركة الكهرباء، مالك العقار..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم الإيصال / الفاتورة (اختياري)</label>
            <input
              type="text"
              v-model="generalForm.invoiceNumber"
              placeholder="مثال: REC-10293"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono text-xs"
            />
          </div>

          <!-- Upload Receipt Photo -->
          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1">إرفاق صورة الإيصال أو الفاتورة</label>
            <div class="flex items-center gap-3">
              <label class="px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-white/5 hover:border-brand-accent cursor-pointer flex items-center gap-2 text-xs font-semibold">
                <Upload class="w-4 h-4 text-brand-accent" />
                <span>{{ uploadingGeneralReceipt ? 'جاري الرفع...' : 'اختر صورة الفاتورة' }}</span>
                <input type="file" accept="image/*,.pdf" class="hidden" @change="handleGeneralFileUpload" />
              </label>
              <img
                v-if="generalForm.receiptAttachmentPath"
                :src="getFileUrl(generalForm.receiptAttachmentPath)"
                class="w-10 h-10 rounded-lg object-cover border border-brand-gray/20"
              />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1">بيان وتفاصيل المصروف</label>
            <textarea
              v-model="generalForm.notes"
              rows="2"
              placeholder="اكتب تفاصيل أو سبب الصرف هنا..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs resize-none"
            ></textarea>
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 cursor-pointer">
          إلغاء
        </button>
        <button
          type="submit"
          form="generalExpenseForm"
          :disabled="expenseStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ expenseStore.loading ? 'جاري الحفظ...' : 'حفظ المصروف' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Modal: Create/Edit Fixed Expense Template -->
    <OhdaModal
      :visible="showFixedTemplateModal"
      @close="showFixedTemplateModal = false"
      :title="editingTemplateId ? 'تعديل بند مصروف ثابت' : 'إضافة بند مصروف ثابت جديد'"
      description="تعريف مصروف متكرر شهرياً لتتم مراجعته واعتماد قيمته مع كل إقفال شهري"
      :icon="Building2"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitFixedTemplate" id="fixedTemplateForm" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1">اسم البند الثابت *</label>
            <input
              v-model="templateForm.name"
              required
              placeholder="مثال: كهرباء الفرع، إيجار الورشة، فاتورة المياه، إنترنت..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">التصنيف *</label>
            <select
              v-model.number="templateForm.expenseType"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            >
              <option :value="3" class="bg-white dark:bg-slate-800">إيجار</option>
              <option :value="2" class="bg-white dark:bg-slate-800">كهرباء</option>
              <option :value="1" class="bg-white dark:bg-slate-800">مياه</option>
              <option :value="4" class="bg-white dark:bg-slate-800">إنترنت واتصالات</option>
              <option :value="7" class="bg-white dark:bg-slate-800">صيانة دورية</option>
              <option :value="8" class="bg-white dark:bg-slate-800">أخرى</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">القيمة التقديرية المعتادة (ج.م)</label>
            <input
              v-model.number="templateForm.defaultAmount"
              type="number"
              min="0"
              step="0.01"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">الجهة / المستفيد</label>
            <input
              v-model="templateForm.payeeName"
              placeholder="مثال: شركة الكهرباء، المالك..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">طريقة الدفع المعتادة</label>
            <select
              v-model.number="templateForm.defaultPaymentMethod"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">كاش (خزينة)</option>
              <option :value="3" class="bg-white dark:bg-slate-800">إنستاباي</option>
              <option :value="4" class="bg-white dark:bg-slate-800">تحويل بنكي</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="templateForm.isActive" class="rounded text-brand-accent" />
              <span class="font-semibold">تفعيل البند للظهور في قائمة المراجعة الشهرية</span>
            </label>
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 cursor-pointer">
          إلغاء
        </button>
        <button
          type="submit"
          form="fixedTemplateForm"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark cursor-pointer shadow-sm"
        >
          {{ editingTemplateId ? 'حفظ التعديلات' : 'إضافة البند' }}
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Modal: Delete Confirmation -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="تأكيد حذف المصروف"
      description="يرجى الانتباه قبل حذف القيد المالي للمصروف"
      :icon="Trash2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من رغبتك في حذف المصروف بقيمة
          <span class="font-bold text-red-600 dark:text-red-400 font-mono">{{ formatCurrency(expenseToDelete?.amount) }}</span>؟
        </p>
      </div>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 cursor-pointer">
          إلغاء
        </button>
        <button type="button" @click="executeDelete" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm">
          حذف نهائي
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaExpenseStore } from "../stores/useOhdaExpenseStore";
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import { exportToExcelCsv } from "../utils/excelHelper";
import {
  Receipt,
  Plus,
  PackagePlus,
  PackageCheck,
  Package,
  Building2,
  Users,
  Search,
  Trash2,
  Droplet,
  Zap,
  Home,
  Wifi,
  Wrench,
  HelpCircle,
  Download,
  Upload,
  Image as ImageIcon,
  CalendarCheck2,
  Pencil
} from "lucide-vue-next";

const toast = useToast();
const expenseStore = useOhdaExpenseStore();
const confirmStore = useOhdaConfirmStore();

const pageMode = ref("ledger"); // "ledger" | "fixed"
const searchQuery = ref("");
const selectedTab = ref("all");

const now = new Date();
const fixedMonth = ref(now.getMonth() + 1);
const fixedYear = ref(now.getFullYear());
const fixedMonthlyEdits = ref([]);

const filterTabs = [
  { value: "all", label: "الكل" },
  { value: "purchases", label: "مشتريات بضاعة ومخزن" },
  { value: "utilities", label: "إيجار ومرافق وفواتير ثابتة" },
  { value: "salaries", label: "رواتب وأجور" },
  { value: "other", label: "نثريات وصيانة" }
];

const expenseColumns = [
  { field: "expenseDate", header: "التاريخ", sortable: true, width: "12%" },
  { field: "expenseType", header: "نوع المصروف", sortable: true, width: "16%" },
  { field: "notes", header: "البيان / التفاصيل", width: "24%" },
  { field: "supplierName", header: "المورد / المستفيد", width: "14%" },
  { field: "invoiceNumber", header: "رقم الإيصال والمرفق", width: "12%" },
  { field: "paymentMethodName", header: "طريقة الدفع", width: "11%" },
  { field: "amount", header: "المبلغ (ج.م)", sortable: true, width: "11%" },
  { field: "actions", header: "إجراءات", align: "center", width: "6%" }
];

const showAddModal = ref(false);
const showFixedTemplateModal = ref(false);
const showDeleteModal = ref(false);
const expenseToDelete = ref(null);
const editingTemplateId = ref(null);
const uploadingGeneralReceipt = ref(false);

const todayStr = new Date().toISOString().split("T")[0];

const generalForm = ref({
  expenseType: 3,
  amount: null,
  expenseDate: todayStr,
  paymentMethod: 1,
  supplierName: "",
  invoiceNumber: "",
  receiptAttachmentPath: "",
  notes: "",
  isRecurring: false
});

const templateForm = ref({
  name: "",
  expenseType: 2,
  defaultAmount: 0,
  defaultPaymentMethod: 1,
  payeeName: "",
  notes: "",
  isActive: true
});

onMounted(async () => {
  await Promise.all([
    expenseStore.fetchExpenses(),
    expenseStore.fetchFixedTemplates(),
    loadFixedMonthly()
  ]);
});

async function loadFixedMonthly() {
  const rows = await expenseStore.fetchFixedMonthlyStatus(fixedMonth.value, fixedYear.value);
  fixedMonthlyEdits.value = rows.map(r => ({
    ...r,
    uploading: false,
    saving: false
  }));
}

function getFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (import.meta.env.VITE_ROOT_URL || "http://localhost:5146").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatCurrency(amount) {
  if (amount == null) return "0 ج.م";
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function getTypeIcon(type) {
  switch (type) {
    case 1: return Droplet;
    case 2: return Zap;
    case 3: return Home;
    case 4: return Wifi;
    case 5: return PackageCheck;
    case 6: return Users;
    case 7: return Wrench;
    default: return HelpCircle;
  }
}

function getTypeBadgeClasses(type) {
  switch (type) {
    case 1: return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case 2: return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case 3: return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case 4: return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    case 5: return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case 6: return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case 7: return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
}

function getCountForTab(tabValue) {
  if (tabValue === "all") return expenseStore.expenses.length;
  if (tabValue === "purchases") return expenseStore.expenses.filter(e => e.expenseType === 5).length;
  if (tabValue === "utilities") return expenseStore.expenses.filter(e => [1, 2, 3, 4].includes(e.expenseType)).length;
  if (tabValue === "salaries") return expenseStore.expenses.filter(e => e.expenseType === 6).length;
  if (tabValue === "other") return expenseStore.expenses.filter(e => [7, 8].includes(e.expenseType)).length;
  return 0;
}

const filteredExpenses = computed(() => {
  let list = [...expenseStore.expenses];

  if (selectedTab.value === "purchases") {
    list = list.filter(e => e.expenseType === 5);
  } else if (selectedTab.value === "utilities") {
    list = list.filter(e => [1, 2, 3, 4].includes(e.expenseType));
  } else if (selectedTab.value === "salaries") {
    list = list.filter(e => e.expenseType === 6);
  } else if (selectedTab.value === "other") {
    list = list.filter(e => [7, 8].includes(e.expenseType));
  }

  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(e =>
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.supplierName && e.supplierName.toLowerCase().includes(q)) ||
      (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q)) ||
      (e.productName && e.productName.toLowerCase().includes(q)) ||
      (e.expenseTypeText && e.expenseTypeText.toLowerCase().includes(q))
    );
  }

  return list;
});

function openAddExpenseModal() {
  generalForm.value = {
    expenseType: 8,
    amount: null,
    expenseDate: todayStr,
    paymentMethod: 1,
    supplierName: "",
    invoiceNumber: "",
    receiptAttachmentPath: "",
    notes: "",
    isRecurring: false
  };
  showAddModal.value = true;
}

async function handleGeneralFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadingGeneralReceipt.value = true;
  const res = await expenseStore.uploadReceipt(file);
  uploadingGeneralReceipt.value = false;
  if (res.success) {
    generalForm.value.receiptAttachmentPath = res.url;
    toast.add({ severity: "success", summary: "تم الرفع", detail: "تم إرفاق صورة الفاتورة بنجاح", life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

async function handleMonthlyRowFileUpload(e, row) {
  const file = e.target.files[0];
  if (!file) return;
  row.uploading = true;
  const res = await expenseStore.uploadReceipt(file);
  row.uploading = false;
  if (res.success) {
    row.receiptAttachmentPath = res.url;
    toast.add({ severity: "success", summary: "تم الرفع", detail: "تم رفع صورة الفاتورة، اضغط حفظ لتثبيتها", life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

async function saveMonthlyFixedRow(row) {
  if (!row.actualAmount || row.actualAmount <= 0) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى إدخال قيمة صحيحة أكبر من صفر", life: 3000 });
    return;
  }
  row.saving = true;
  const res = await expenseStore.recordMonthlyFixedExpense({
    templateId: row.templateId,
    month: fixedMonth.value,
    year: fixedYear.value,
    amount: Number(row.actualAmount),
    paymentMethod: row.paymentMethod,
    receiptAttachmentPath: row.receiptAttachmentPath,
    notes: row.notes
  });
  row.saving = false;
  if (res.success) {
    toast.add({ severity: "success", summary: "تم الحفظ", detail: res.message, life: 3000 });
    await loadFixedMonthly();
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

function openFixedTemplateModal(tpl) {
  if (tpl) {
    editingTemplateId.value = tpl.id || tpl.templateId;
    templateForm.value = {
      name: tpl.name,
      expenseType: tpl.expenseType,
      defaultAmount: tpl.defaultAmount,
      defaultPaymentMethod: tpl.defaultPaymentMethod || tpl.paymentMethod || 1,
      payeeName: tpl.payeeName || "",
      notes: tpl.notes || "",
      isActive: tpl.isActive ?? true
    };
  } else {
    editingTemplateId.value = null;
    templateForm.value = {
      name: "",
      expenseType: 2,
      defaultAmount: 0,
      defaultPaymentMethod: 1,
      payeeName: "",
      notes: "",
      isActive: true
    };
  }
  showFixedTemplateModal.value = true;
}

async function submitFixedTemplate() {
  const res = editingTemplateId.value
    ? await expenseStore.updateFixedTemplate(editingTemplateId.value, templateForm.value)
    : await expenseStore.createFixedTemplate(templateForm.value);

  if (res.success) {
    showFixedTemplateModal.value = false;
    toast.add({ severity: "success", summary: "تم الحفظ", detail: res.message, life: 3000 });
    await Promise.all([expenseStore.fetchFixedTemplates(), loadFixedMonthly()]);
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

async function deleteFixedTemplate(tpl) {
  const targetId = tpl.id || tpl.templateId;
  const ok = await confirmStore.showConfirm({
    title: "حذف المصروف الثابت",
    message: `هل أنت متأكد من رغبتك في حذف المصروف الثابت "${tpl.name}" نهائياً؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (!ok) return;
  const res = await expenseStore.deleteFixedTemplate(targetId);
  if (res.success) {
    toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
    await Promise.all([expenseStore.fetchFixedTemplates(), loadFixedMonthly()]);
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

async function submitGeneralExpense() {
  const res = await expenseStore.addExpense({
    expenseType: generalForm.value.expenseType,
    amount: Number(generalForm.value.amount),
    expenseDate: generalForm.value.expenseDate ? new Date(generalForm.value.expenseDate).toISOString() : new Date().toISOString(),
    paymentMethod: generalForm.value.paymentMethod,
    supplierName: generalForm.value.supplierName,
    invoiceNumber: generalForm.value.invoiceNumber,
    receiptAttachmentPath: generalForm.value.receiptAttachmentPath,
    notes: generalForm.value.notes,
    isRecurring: false
  });

  if (res.success) {
    showAddModal.value = false;
    toast.add({ severity: "success", summary: "تم الحفظ", detail: res.message, life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

function confirmDelete(expense) {
  expenseToDelete.value = expense;
  showDeleteModal.value = true;
}

async function executeDelete() {
  if (!expenseToDelete.value) return;
  const res = await expenseStore.deleteExpense(expenseToDelete.value.id);
  showDeleteModal.value = false;
  expenseToDelete.value = null;
  if (res.success) {
    toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
  }
}

function exportExpensesToExcel() {
  const exportCols = [
    { key: "expenseDate", label: "تاريخ الصرف" },
    { key: "category", label: "التصنيف" },
    { key: "amount", label: "المبلغ (ج.م)" },
    { key: "paymentMethod", label: "طريقة الصرف" },
    { key: "payee", label: "المستلم / الجهة" },
    { key: "notes", label: "ملاحظات" }
  ];

  const exportData = (expenseStore.expenses || []).map(e => ({
    expenseDate: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("ar-EG") : "—",
    category: e.expenseTypeText || "عام",
    amount: e.amount || 0,
    paymentMethod: e.paymentMethodText || "كاش",
    payee: e.supplierName || "—",
    notes: e.notes || ""
  }));

  exportToExcelCsv("مصروفات_الورشة.csv", exportCols, exportData);
}
</script>
