<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Receipt class="w-7 h-7 text-brand-accent" />
          <span>المصروفات ومشتريات الورشة</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          تسجيل فواتير المرافق (مياه، كهرباء، إيجار)، توريد بضاعة للمخزن، الرواتب، وتتبع حركة النقدية والمصروفات
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="openRecurringConfirm"
          class="bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <CalendarClock class="w-4 h-4" />
          <span>توليد فواتير الشهر الدورية</span>
        </button>

        <button
          type="button"
          @click="openPurchaseModal"
          class="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <PackagePlus class="w-4 h-4" />
          <span>+ شراء وتوريد بضاعة للمخزن</span>
        </button>

        <button
          type="button"
          @click="openAddExpenseModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ تسجيل مصروف جديد</span>
        </button>
      </div>
    </div>

    <!-- Quick Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
      <!-- Total Expenses -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <Receipt class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي المصروفات</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ formatCurrency(expenseStore.totalExpensesAmount) }}</span>
        </div>
      </div>

      <!-- Supplier Purchases -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <PackageCheck class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">مشتريات بضاعة وقطع غيار</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(expenseStore.supplierPurchasesTotal) }}</span>
        </div>
      </div>

      <!-- Utilities & Rent -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Building2 class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إيجار ومرافق وفواتير</span>
          <span class="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{{ formatCurrency(expenseStore.utilitiesTotal) }}</span>
        </div>
      </div>

      <!-- Salaries -->
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
      <!-- Type Filter Tabs -->
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

      <!-- Search Input -->
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

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="expenseStore.loading && !expenseStore.expenses.length" type="table" :count="6" />

    <!-- Expenses DataTable using OhdaDataTable -->
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

      <!-- Date -->
      <template #expenseDate="{ data }">
        <span class="font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {{ formatDate(data.expenseDate) }}
        </span>
      </template>

      <!-- Type Badge -->
      <template #expenseType="{ data }">
        <div class="flex items-center gap-1 flex-wrap">
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
            :class="getTypeBadgeClasses(data.expenseType)"
          >
            <component :is="getTypeIcon(data.expenseType)" class="w-3 h-3" />
            {{ data.expenseTypeName }}
          </span>
          <span v-if="data.isRecurring" class="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
            شهري
          </span>
        </div>
      </template>

      <!-- Details -->
      <template #notes="{ data }">
        <div>
          <div class="font-bold text-brand-dark dark:text-white">{{ data.notes || '-' }}</div>
          <div v-if="data.productName" class="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
            <Package class="w-3 h-3" />
            <span>توريد مخزن: {{ data.productName }} ({{ data.purchasedQuantity }} × {{ data.unitCost }} ج.م)</span>
          </div>
        </div>
      </template>

      <!-- Supplier -->
      <template #supplierName="{ data }">
        <span class="text-slate-700 dark:text-slate-300 font-medium">
          {{ data.supplierName || '-' }}
        </span>
      </template>

      <!-- Invoice Number -->
      <template #invoiceNumber="{ data }">
        <span class="font-mono text-slate-600 dark:text-slate-400">
          {{ data.invoiceNumber || '-' }}
        </span>
      </template>

      <!-- Payment Method -->
      <template #paymentMethodName="{ data }">
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
          {{ data.paymentMethodName }}
        </span>
      </template>

      <!-- Amount -->
      <template #amount="{ data }">
        <span class="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
          {{ formatCurrency(data.amount) }}
        </span>
      </template>

      <!-- Actions -->
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

    <!-- 1. Modal: Add General Expense using OhdaModal -->
    <OhdaModal
      :visible="showAddModal"
      @close="showAddModal = false"
      title="تسجيل مصروف جديد"
      description="تسجيل فاتورة مرافق، صيانة، إيجار، أو نثريات وتحديد طريقة السداد"
      :icon="Receipt"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitGeneralExpense" id="generalExpenseForm" class="space-y-4 text-xs">
        <!-- 2-Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Type Selection -->
          <div>
            <label class="block font-semibold mb-1">نوع المصروف *</label>
            <select
              v-model="generalForm.expenseType"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            >
              <option :value="3" class="bg-white dark:bg-slate-800">إيجار مقر الورشة</option>
              <option :value="2" class="bg-white dark:bg-slate-800">فاتورة كهرباء</option>
              <option :value="1" class="bg-white dark:bg-slate-800">فاتورة مياه (ورشة ومغسلة)</option>
              <option :value="4" class="bg-white dark:bg-slate-800">إنترنت وهواتف</option>
              <option :value="7" class="bg-white dark:bg-slate-800">صيانة عدد ومعدات الورشة</option>
              <option :value="8" class="bg-white dark:bg-slate-800">مصروفات نثرية وضيافة</option>
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block font-semibold mb-1">المبلغ (ج.م) *</label>
            <input
              type="number"
              v-model.number="generalForm.amount"
              min="0.1"
              step="any"
              required
              placeholder="0.00"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Expense Date -->
          <div>
            <label class="block font-semibold mb-1">تاريخ المصروف *</label>
            <input
              type="date"
              v-model="generalForm.expenseDate"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Payment Method -->
          <div>
            <label class="block font-semibold mb-1">طريقة الدفع *</label>
            <select
              v-model="generalForm.paymentMethod"
              required
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">كاش (الخزينة النقدية)</option>
              <option :value="2" class="bg-white dark:bg-slate-800">بطاقة بنكية / فيزا</option>
              <option :value="3" class="bg-white dark:bg-slate-800">إنستاباي (InstaPay)</option>
              <option :value="4" class="bg-white dark:bg-slate-800">تحويل بنكي</option>
              <option :value="5" class="bg-white dark:bg-slate-800">أخرى</option>
            </select>
          </div>

          <!-- Supplier / Payee -->
          <div>
            <label class="block font-semibold mb-1">الجهة / المستفيد (اختياري)</label>
            <input
              type="text"
              v-model="generalForm.supplierName"
              placeholder="مثال: شركة الكهرباء، مالك العقار..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Invoice / Receipt Number -->
          <div>
            <label class="block font-semibold mb-1">رقم الإيصال / الفاتورة (اختياري)</label>
            <input
              type="text"
              v-model="generalForm.invoiceNumber"
              placeholder="مثال: REC-10293"
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Notes (Full Width) -->
          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1">بيان وتفاصيل المصروف</label>
            <textarea
              v-model="generalForm.notes"
              rows="2"
              placeholder="اكتب تفاصيل أو سبب الصرف هنا..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all resize-none"
            ></textarea>
          </div>

          <!-- Is Recurring Checkbox (Full Width) -->
          <div class="sm:col-span-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="generalForm.isRecurring"
                class="rounded border-brand-gray/30 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
              />
              <span class="text-xs font-semibold text-brand-dark dark:text-white">تحديد كمصروف شهري ثابت يتكرر كل شهر</span>
            </label>
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
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

    <!-- 2. Modal: Record Supplier Purchase using OhdaModal -->
    <OhdaModal
      :visible="showPurchaseModal"
      @close="showPurchaseModal = false"
      title="تسجيل فاتورة شراء وتوريد بضاعة للمخزن"
      description="تسجيل فاتورة شراء بضاعة تلقائياً كمصروف وزيادة رصيد المخزن في عملية واحدة"
      :icon="PackagePlus"
      max-width="max-w-2xl"
    >
      <form @submit.prevent="submitSupplierPurchase" id="purchaseForm" class="space-y-4 text-xs">
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
          <Info class="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            هذا الإجراء يقوم بتسجيل فاتورة شراء بضاعة تلقائياً كمصروف، وفي نفس الوقت يزيد كمية الصنف في المخزن ويسجل حركة توريد وارد.
          </span>
        </div>

        <!-- Product Picker (Full Width) -->
        <div>
          <label class="block font-semibold mb-1">الصنف المراد توريده للمخزن *</label>
          <select
            v-model="purchaseForm.productId"
            required
            @change="onProductSelected"
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          >
            <option value="" disabled selected class="bg-white dark:bg-slate-800">-- اختر الصنف من قائمة المخزن --</option>
            <option
              v-for="p in inventoryStore.products"
              :key="p.id"
              :value="p.id"
              class="bg-white dark:bg-slate-800"
            >
              {{ p.name }} (الرصيد الحالي: {{ p.currentQuantity ?? p.quantity }} {{ p.unit || 'قطعة' }}) - [{{ p.sku || 'بدون كود' }}]
            </option>
          </select>
        </div>

        <!-- 2-Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1">الكمية الموردة *</label>
            <input
              type="number"
              v-model.number="purchaseForm.quantity"
              min="0.1"
              step="any"
              required
              placeholder="1"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">سعر تكلفة الوحدة (ج.م) *</label>
            <input
              type="number"
              v-model.number="purchaseForm.unitCost"
              min="0.1"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Total Preview (Full Width) -->
          <div class="sm:col-span-2 p-3 bg-brand-light/70 dark:bg-white/5 rounded-xl flex items-center justify-between border border-brand-gray/10">
            <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold">إجمالي فاتورة الشراء:</span>
            <span class="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(calculatedPurchaseTotal) }}
            </span>
          </div>

          <div>
            <label class="block font-semibold mb-1">المورد / الشركة</label>
            <input
              type="text"
              v-model="purchaseForm.supplierName"
              placeholder="اسم المورد أو الموزع..."
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">طريقة السداد *</label>
            <select
              v-model="purchaseForm.paymentMethod"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">كاش (الخزينة النقدية)</option>
              <option :value="2" class="bg-white dark:bg-slate-800">بطاقة بنكية / فيزا</option>
              <option :value="3" class="bg-white dark:bg-slate-800">إنستاباي (InstaPay)</option>
              <option :value="4" class="bg-white dark:bg-slate-800">تحويل بنكي</option>
              <option :value="5" class="bg-white dark:bg-slate-800">أخرى</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم فاتورة المورد</label>
            <input
              type="text"
              v-model="purchaseForm.invoiceNumber"
              placeholder="مثال: INV-9843"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">تاريخ الفاتورة والتوريد</label>
            <input
              type="date"
              v-model="purchaseForm.purchaseDate"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block font-semibold mb-1">ملاحظات التوريد</label>
            <input
              type="text"
              v-model="purchaseForm.notes"
              placeholder="ملاحظات على حالة البضاعة أو الدفعة..."
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            />
          </div>
        </div>
      </form>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="purchaseForm"
          :disabled="expenseStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ expenseStore.loading ? 'جاري التسجيل...' : 'تأكيد التوريد وحفظ المصروف' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Modal: Recurring Expenses Confirmation using OhdaModal -->
    <OhdaModal
      :visible="showRecurringConfirm"
      @close="showRecurringConfirm = false"
      title="توليد فواتير الشهر الدورية تلقائياً"
      description="إنشاء قيود المصروفات الثابتة لشهر الحالي بضغطة زر واحدة"
      :icon="CalendarClock"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          سيقوم النظام تلقائياً بإنشاء القيود والمصروفات الشهرية الثابتة لشهر الحالي:
        </p>

        <ul class="space-y-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 font-semibold">
          <li class="flex items-center justify-between">
            <span>• إيجار مقر الورشة الشهري</span>
            <span class="font-mono">12,000 ج.م</span>
          </li>
          <li class="flex items-center justify-between">
            <span>• فاتورة كهرباء الورشة</span>
            <span class="font-mono">2,500 ج.م</span>
          </li>
          <li class="flex items-center justify-between">
            <span>• فاتورة مياه الورشة والمغسلة</span>
            <span class="font-mono">800 ج.م</span>
          </li>
          <li class="flex items-center justify-between">
            <span>• اشتراك الإنترنت والهاتف</span>
            <span class="font-mono">400 ج.م</span>
          </li>
        </ul>

        <p class="text-[11px] text-slate-400">
          ملاحظة: إذا كانت الفواتير قد تم توليدها مسبقاً لهذا الشهر فلن يتم تكرارها.
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
          @click="confirmGenerateRecurring"
          :disabled="expenseStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ expenseStore.loading ? 'جاري التوليد...' : 'تأكيد التوليد الآن' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 4. Modal: Delete Confirmation using OhdaModal -->
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
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="executeDelete"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
        >
          حذف نهائي
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaExpenseStore } from "../stores/useOhdaExpenseStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import {
  Receipt,
  Plus,
  PackagePlus,
  PackageCheck,
  Package,
  CalendarClock,
  Building2,
  Users,
  Search,
  Trash2,
  Info,
  Droplet,
  Zap,
  Home,
  Wifi,
  Wrench,
  HelpCircle
} from "lucide-vue-next";

const expenseStore = useOhdaExpenseStore();
const inventoryStore = useOhdaInventoryStore();

const searchQuery = ref("");
const selectedTab = ref("all");

const filterTabs = [
  { value: "all", label: "الكل" },
  { value: "purchases", label: "مشتريات بضاعة ومخزن" },
  { value: "utilities", label: "إيجار ومرافق وفواتير" },
  { value: "salaries", label: "رواتب وأجور" },
  { value: "other", label: "نثريات وصيانة" }
];

const expenseColumns = [
  { field: "expenseDate", header: "التاريخ", sortable: true, width: "12%" },
  { field: "expenseType", header: "نوع المصروف", sortable: true, width: "16%" },
  { field: "notes", header: "البيان / التفاصيل", width: "24%" },
  { field: "supplierName", header: "المورد / المستفيد", width: "15%" },
  { field: "invoiceNumber", header: "رقم الإيصال", width: "11%" },
  { field: "paymentMethodName", header: "طريقة الدفع", width: "11%" },
  { field: "amount", header: "المبلغ (ج.م)", sortable: true, width: "12%" },
  { field: "actions", header: "إجراءات", align: "center", width: "7%" }
];

const showAddModal = ref(false);
const showPurchaseModal = ref(false);
const showRecurringConfirm = ref(false);
const showDeleteModal = ref(false);
const expenseToDelete = ref(null);

const todayStr = new Date().toISOString().split("T")[0];

const generalForm = ref({
  expenseType: 3,
  amount: null,
  expenseDate: todayStr,
  paymentMethod: 1,
  supplierName: "",
  invoiceNumber: "",
  notes: "",
  isRecurring: false
});

const purchaseForm = ref({
  productId: "",
  quantity: 1,
  unitCost: 0,
  supplierName: "",
  paymentMethod: 1,
  invoiceNumber: "",
  purchaseDate: todayStr,
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    expenseStore.fetchExpenses(),
    inventoryStore.fetchProducts()
  ]);
});

function formatCurrency(amount) {
  if (amount == null) return "0 ج.م";
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
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
      (e.expenseTypeName && e.expenseTypeName.toLowerCase().includes(q))
    );
  }

  return list;
});

const calculatedPurchaseTotal = computed(() => {
  const qty = Number(purchaseForm.value.quantity) || 0;
  const cost = Number(purchaseForm.value.unitCost) || 0;
  return qty * cost;
});

function onProductSelected() {
  const prod = inventoryStore.products.find(p => p.id === purchaseForm.value.productId);
  if (prod) {
    purchaseForm.value.unitCost = prod.costPrice || prod.purchasePrice || 0;
  }
}

function openAddExpenseModal() {
  generalForm.value = {
    expenseType: 3,
    amount: null,
    expenseDate: todayStr,
    paymentMethod: 1,
    supplierName: "",
    invoiceNumber: "",
    notes: "",
    isRecurring: false
  };
  showAddModal.value = true;
}

function openPurchaseModal() {
  purchaseForm.value = {
    productId: "",
    quantity: 1,
    unitCost: 0,
    supplierName: "",
    paymentMethod: 1,
    invoiceNumber: "",
    purchaseDate: todayStr,
    notes: ""
  };
  showPurchaseModal.value = true;
}

function openRecurringConfirm() {
  showRecurringConfirm.value = true;
}

async function submitGeneralExpense() {
  const res = await expenseStore.addExpense({
    expenseType: generalForm.value.expenseType,
    amount: Number(generalForm.value.amount),
    expenseDate: generalForm.value.expenseDate ? new Date(generalForm.value.expenseDate).toISOString() : new Date().toISOString(),
    paymentMethod: generalForm.value.paymentMethod,
    supplierName: generalForm.value.supplierName,
    invoiceNumber: generalForm.value.invoiceNumber,
    notes: generalForm.value.notes,
    isRecurring: generalForm.value.isRecurring
  });

  if (res.success) {
    showAddModal.value = false;
  } else {
    alert(res.message);
  }
}

async function submitSupplierPurchase() {
  if (!purchaseForm.value.productId) {
    alert("يرجى اختيار الصنف المراد توريده للمخزن");
    return;
  }

  const res = await expenseStore.recordSupplierPurchase({
    productId: purchaseForm.value.productId,
    quantity: Number(purchaseForm.value.quantity),
    unitCost: Number(purchaseForm.value.unitCost),
    supplierName: purchaseForm.value.supplierName,
    paymentMethod: purchaseForm.value.paymentMethod,
    invoiceNumber: purchaseForm.value.invoiceNumber,
    purchaseDate: purchaseForm.value.purchaseDate ? new Date(purchaseForm.value.purchaseDate).toISOString() : new Date().toISOString(),
    notes: purchaseForm.value.notes
  });

  if (res.success) {
    showPurchaseModal.value = false;
    await inventoryStore.fetchProducts();
  } else {
    alert(res.message);
  }
}

async function confirmGenerateRecurring() {
  const res = await expenseStore.generateRecurringExpenses();
  showRecurringConfirm.value = false;
  if (!res.success) {
    alert(res.message);
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
  if (!res.success) {
    alert(res.message);
  }
}
</script>
