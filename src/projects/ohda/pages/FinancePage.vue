<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Landmark class="w-7 h-7 text-brand-accent" />
          <span>المالية والخزينة والتقفيل اليومي</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          متابعة السيولة النقدية، أرصدة البنوك وإنستاباي، التحويلات، وتقفيل درج الكاش اليومي ومطابقة الفعلي مع الدفتري
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <Button
          @click="openTransferModal"
          class="!bg-blue-600/10 hover:!bg-blue-600/20 !text-blue-600 dark:!text-blue-400 !border !border-blue-500/30 !font-bold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeftRight class="w-4 h-4" />
          <span>تحويل بين الخزائن والحسابات</span>
        </Button>

        <Button
          @click="activeTab = 'closing'"
          class="!bg-purple-600/10 hover:!bg-purple-600/20 !text-purple-600 dark:!text-purple-400 !border !border-purple-500/30 !font-bold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Calculator class="w-4 h-4" />
          <span>تقفيل درج النقدية اليومي</span>
        </Button>

        <Button
          @click="openAddAccountModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ إضافة حساب / محفظة</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards (Liquidity Overview) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
      <!-- Total Liquidity -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-dark dark:text-brand-accent flex items-center justify-center shrink-0">
          <Wallet class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي السيولة المالية</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ formatCurrency(financeStore.totalLiquidity) }}</span>
        </div>
      </div>

      <!-- Cash Box -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Banknote class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">رصيد درج الكاش بالورشة</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(financeStore.cashBoxBalance) }}</span>
        </div>
      </div>

      <!-- Bank Balances -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Landmark class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">أرصدة البنوك</span>
          <span class="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{{ formatCurrency(financeStore.bankBalance) }}</span>
        </div>
      </div>

      <!-- InstaPay & Wallets -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Smartphone class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إنستاباي والمحافظ الرقمية</span>
          <span class="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">{{ formatCurrency(financeStore.instaPayBalance) }}</span>
        </div>
      </div>
    </div>

    <!-- Cash Drawer Shift & Working Day Component -->
    <CashDrawerWidget />

    <!-- Navigation Tabs Toolbar -->
    <div class="bg-brand-white dark:bg-white/5 p-3 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'accounts'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'accounts' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Building class="w-4 h-4" />
          <span>الخزائن والحسابات المالية</span>
        </button>

        <button
          @click="activeTab = 'transactions'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'transactions' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <History class="w-4 h-4" />
          <span>سجل الحركات المالية</span>
        </button>

        <button
          @click="activeTab = 'closing'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'closing' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Scale class="w-4 h-4" />
          <span>تقفيل ومطابقة درج الكاش اليومي</span>
        </button>
      </div>

      <!-- Quick Search / Filter if transactions view -->
      <div v-if="activeTab === 'transactions'" class="w-full sm:w-64 relative">
        <Search class="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <InputText
          v-model="txSearch"
          placeholder="بحث في الحركات المالية..."
          class="!w-full !ps-9 !pe-3 !py-1.5 !rounded-xl !text-xs !bg-transparent !border-brand-gray/20 dark:!border-white/10"
        />
      </div>
    </div>

    <!-- VIEW 1: Accounts Grid Cards -->
    <div v-if="activeTab === 'accounts'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="acc in financeStore.accounts"
          :key="acc.id"
          class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col justify-between hover:border-brand-accent/40 transition-all"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1"
                :class="getAccountTypeBadgeClasses(acc.accountType)"
              >
                <component :is="getAccountTypeIcon(acc.accountType)" class="w-3 h-3" />
                {{ acc.accountTypeName }}
              </span>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click.stop="openEditAccountModal(acc)"
                  title="تعديل الحساب"
                  class="p-1 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click.stop="promptDeleteAccount(acc)"
                  title="حذف الحساب"
                  class="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
                <span class="w-2 h-2 rounded-full ms-1" :class="acc.isActive ? 'bg-emerald-400' : 'bg-slate-400'" :title="acc.isActive ? 'نشط' : 'معطل'"></span>
              </div>
            </div>

            <h3 class="text-sm font-bold text-brand-dark dark:text-white">{{ acc.name }}</h3>
            <p v-if="acc.accountNumber" class="text-[11px] text-slate-400 font-mono mt-0.5">{{ acc.accountNumber }}</p>
            <p v-if="acc.notes" class="text-[10px] text-slate-500 mt-1">{{ acc.notes }}</p>
          </div>

          <div class="mt-6 pt-3 border-t border-brand-gray/10 dark:border-white/5 flex items-center justify-between">
            <span class="text-xs text-slate-400">الرصيد الحالي:</span>
            <span class="text-lg font-bold font-mono text-brand-dark dark:text-white">
              {{ formatCurrency(acc.currentBalance) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 2: Transactions Log -->
    <div v-else-if="activeTab === 'transactions'" class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
      <div v-if="financeStore.loading" class="p-8">
        <LoadingSkeleton />
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="p-12 text-center">
        <EmptyState
          title="لا توجد حركات مالية مسجلة"
          description="جميع مدفوعات أوامر الشغل، والمصروفات، وعمليات التحويل تظهر هنا تلقائياً"
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-start border-collapse text-xs">
          <thead>
            <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray dark:text-slate-400 font-semibold">
              <th class="p-3.5 text-start">التاريخ والوقت</th>
              <th class="p-3.5 text-start">الحساب المالي</th>
              <th class="p-3.5 text-start">نوع الحركة</th>
              <th class="p-3.5 text-start">البيان / المرجع</th>
              <th class="p-3.5 text-start">المبلغ (ج.م)</th>
              <th class="p-3.5 text-start">الرصيد بعد الحركة</th>
              <th class="p-3.5 text-start">المستخدم</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
            <tr
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <!-- Date -->
              <td class="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                {{ formatDateTime(tx.transactionDate) }}
              </td>

              <!-- Account Name -->
              <td class="p-3.5 font-bold text-brand-dark dark:text-white whitespace-nowrap">
                {{ tx.accountName }}
              </td>

              <!-- Type Badge -->
              <td class="p-3.5 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                  :class="getTransactionTypeClasses(tx.transactionType)"
                >
                  <component :is="getTransactionTypeIcon(tx.transactionType)" class="w-3 h-3" />
                  {{ tx.transactionTypeName }}
                </span>
              </td>

              <!-- Reference / Notes -->
              <td class="p-3.5">
                <div class="font-medium text-slate-800 dark:text-slate-200">{{ tx.reference }}</div>
                <div v-if="tx.notes" class="text-[10px] text-slate-400">{{ tx.notes }}</div>
              </td>

              <!-- Amount -->
              <td class="p-3.5 whitespace-nowrap font-mono font-bold text-sm" :class="getAmountColor(tx.transactionType)">
                {{ tx.transactionType === 2 ? '-' : '+' }}{{ formatCurrency(tx.amount) }}
              </td>

              <!-- Balance After -->
              <td class="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                {{ formatCurrency(tx.balanceAfter) }}
              </td>

              <!-- User -->
              <td class="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                {{ tx.userName || 'النظام' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 3: Daily Cash Closing Screen -->
    <div v-else-if="activeTab === 'closing'" class="space-y-6">
      <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
          <div>
            <h2 class="text-base font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Scale class="w-5 h-5 text-purple-600" />
              <span>تقفيل ومطابقة نقدية درج الكاش</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              عد النقدية الموجودة بالدرج ومقارنتها بالحساب الدفتري وحساب الفرق (عجز أو زيادة) تلقائياً
            </p>
          </div>

          <!-- Closing Date Picker -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-semibold">تاريخ التقفيل:</span>
            <input
              type="date"
              v-model="closingDate"
              @change="fetchClosingCalc"
              class="text-xs p-2 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
            />
          </div>
        </div>

        <!-- 3 Breakdown Boxes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Opening Balance -->
          <div class="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-brand-gray/10">
            <span class="text-xs text-slate-500 block mb-1">رصيد أول اليوم (الافتتاحي):</span>
            <span class="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
              {{ formatCurrency(financeStore.dailyCalculation?.openingBalance || 0) }}
            </span>
          </div>

          <!-- Cash In From Jobs -->
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-xs text-emerald-700 dark:text-emerald-300 block mb-1">+ مقبوضات نقدية اليوم:</span>
            <span class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +{{ formatCurrency(financeStore.dailyCalculation?.totalCashIn || 0) }}
            </span>
          </div>

          <!-- Cash Out From Expenses -->
          <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <span class="text-xs text-red-700 dark:text-red-300 block mb-1">- مصروفات نقدية اليوم:</span>
            <span class="text-lg font-bold font-mono text-red-600 dark:text-red-400">
              -{{ formatCurrency(financeStore.dailyCalculation?.totalCashOut || 0) }}
            </span>
          </div>
        </div>

        <!-- Expected vs Actual Cash Counted -->
        <div class="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <span class="text-xs text-purple-700 dark:text-purple-300 font-bold block mb-1">النقدية المتوقعة دفترياً بالدرج:</span>
            <span class="text-2xl font-bold font-mono text-purple-800 dark:text-purple-200">
              {{ formatCurrency(financeStore.dailyCalculation?.expectedCash || 0) }}
            </span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              النقدية الفعلية بعد الجرد والعد اليدوي (ج.م) *
            </label>
            <input
              type="number"
              v-model.number="actualCashCounted"
              min="0"
              step="any"
              placeholder="اكتب المبلغ الفعلي الموجود بالدرج..."
              class="w-full text-base p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <!-- Difference Result Box -->
        <div
          v-if="actualCashCounted !== null"
          class="p-4 rounded-xl border flex items-center justify-between"
          :class="calculatedDiffClass"
        >
          <div class="flex items-center gap-2">
            <component :is="calculatedDiffIcon" class="w-5 h-5" />
            <span class="text-xs font-bold">{{ calculatedDiffMessage }}</span>
          </div>
          <span class="text-lg font-bold font-mono">
            {{ formatCurrency(Math.abs(calculatedDifference)) }}
          </span>
        </div>

        <!-- Notes & Confirm Button -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            v-model="closingNotes"
            placeholder="ملاحظات على التقفيل (اختياري)..."
            class="w-full sm:flex-1 text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
          />

          <Button
            @click="submitClosing"
            :disabled="financeStore.loading || actualCashCounted === null"
            class="w-full sm:w-auto !bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !rounded-xl !px-6 !py-2.5 !text-xs cursor-pointer shrink-0"
          >
            تأكيد التقفيل والتسوية
          </Button>
        </div>
      </div>

      <!-- Past Closings History -->
      <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm p-5 space-y-4">
        <h3 class="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <History class="w-4 h-4 text-brand-accent" />
          <span>سجل تقفيلات النقدية السابقة</span>
        </h3>

        <div v-if="financeStore.closingHistory.length === 0" class="text-xs text-slate-400 py-4 text-center">
          لا يوجد تقفيلات سابقة مسجلة
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-start border-collapse text-xs">
            <thead>
              <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-slate-400 font-semibold">
                <th class="p-3 text-start">تاريخ التقفيل</th>
                <th class="p-3 text-start">الخزينة</th>
                <th class="p-3 text-start">المتوقع دفترياً</th>
                <th class="p-3 text-start">الفعلي بالدرج</th>
                <th class="p-3 text-start">الفرق (عجز / زيادة)</th>
                <th class="p-3 text-start">المسؤول</th>
                <th class="p-3 text-start">ملاحظات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
              <tr v-for="c in financeStore.closingHistory" :key="c.id">
                <td class="p-3 font-mono">{{ formatDate(c.closingDate) }}</td>
                <td class="p-3 font-semibold">{{ c.accountName }}</td>
                <td class="p-3 font-mono">{{ formatCurrency(c.expectedCash) }}</td>
                <td class="p-3 font-mono font-bold">{{ formatCurrency(c.actualCash) }}</td>
                <td class="p-3 font-mono font-bold" :class="c.difference === 0 ? 'text-emerald-500' : (c.difference > 0 ? 'text-blue-500' : 'text-red-500')">
                  {{ c.difference === 0 ? 'مطابق' : (c.difference > 0 ? `+${formatCurrency(c.difference)}` : formatCurrency(c.difference)) }}
                </td>
                <td class="p-3 text-[11px] text-slate-400">{{ c.closedByUserName }}</td>
                <td class="p-3 text-[11px] text-slate-500">{{ c.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 1. Modal: Transfer Funds using OhdaModal -->
    <OhdaModal
      :visible="showTransferModal"
      @close="showTransferModal = false"
      title="تحويل مالي بين الخزائن والحسابات"
      description="تحويل نقدية من حساب أو خزينة إلى حساب آخر مع تسجيل القيد آلياً"
      :icon="ArrowLeftRight"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitTransfer" id="transferForm" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">من الحساب (خصم) *</label>
            <select
              v-model="transferForm.fromAccountId"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            >
              <option value="" disabled selected class="bg-white dark:bg-slate-800">-- اختر الحساب المحول منه --</option>
              <option
                v-for="a in financeStore.accounts"
                :key="a.id"
                :value="a.id"
                class="bg-white dark:bg-slate-800"
              >
                {{ a.name }} (الرصيد: {{ formatCurrency(a.currentBalance) }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">إلى الحساب (إيداع) *</label>
            <select
              v-model="transferForm.toAccountId"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            >
              <option value="" disabled selected class="bg-white dark:bg-slate-800">-- اختر الحساب المحول إليه --</option>
              <option
                v-for="a in financeStore.accounts"
                :key="a.id"
                :value="a.id"
                :disabled="a.id === transferForm.fromAccountId"
                class="bg-white dark:bg-slate-800"
              >
                {{ a.name }} (الرصيد: {{ formatCurrency(a.currentBalance) }})
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">مبلغ التحويل (ج.م) *</label>
          <input
            type="number"
            v-model.number="transferForm.amount"
            min="1"
            step="0.01"
            required
            placeholder="0.00"
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات / سبب التحويل</label>
          <input
            type="text"
            v-model="transferForm.notes"
            placeholder="مثال: توريد كاش اليوم للبنك الأهلي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
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
          form="transferForm"
          :disabled="financeStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          تأكيد التحويل الآن
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Modal: Add Financial Account using OhdaModal -->
    <OhdaModal
      :visible="showAddAccountModal"
      @close="showAddAccountModal = false"
      title="إضافة حساب مالي / محفظة جديدة"
      description="إنشاء خزينة نقدية، حساب بنكي، أو محفظة إلكترونية للورشة"
      :icon="Landmark"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitAddAccount" id="addAccountForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">اسم الحساب / الخزينة *</label>
          <input
            type="text"
            v-model="accountForm.name"
            required
            placeholder="مثال: حساب بنك مصر، محفظة أورنج كاش..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">نوع الحساب *</label>
            <select
              v-model="accountForm.accountType"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            >
              <option :value="1" class="bg-white dark:bg-slate-800">خزينة نقدية (درج كاش)</option>
              <option :value="2" class="bg-white dark:bg-slate-800">حساب بنكي</option>
              <option :value="3" class="bg-white dark:bg-slate-800">محفظة إنستاباي</option>
              <option :value="4" class="bg-white dark:bg-slate-800">محفظة إلكترونية</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">الرصيد الافتتاحي (ج.م)</label>
            <input
              type="number"
              v-model.number="accountForm.initialBalance"
              min="0"
              step="any"
              placeholder="0.00"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">رقم الحساب / الآيبان / معرف المحفظة</label>
          <input
            type="text"
            v-model="accountForm.accountNumber"
            placeholder="رقم الحساب أو معرف إنستاباي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات</label>
          <input
            type="text"
            v-model="accountForm.notes"
            placeholder="وصف إضافي للحساب..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
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
          form="addAccountForm"
          :disabled="financeStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark cursor-pointer shadow-sm disabled:opacity-50"
        >
          إنشاء الحساب
        </button>
      </template>
    </OhdaModal>

    <!-- Edit Account Modal -->
    <OhdaModal
      :visible="showEditAccountModal"
      @close="showEditAccountModal = false"
      title="تعديل بيانات الحساب المالي"
      description="تحديث اسم الحساب، النوع، رقم الحساب أو الملاحظات"
      :icon="Landmark"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitEditAccount" id="editAccountForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">اسم الحساب / الخزينة *</label>
          <input
            type="text"
            v-model="editAccountForm.name"
            required
            placeholder="مثال: الخزينة الفرعية، حساب بنك مصر..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">نوع الحساب *</label>
          <select
            v-model="editAccountForm.accountType"
            required
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          >
            <option :value="1" class="bg-white dark:bg-slate-800">خزينة نقدية (درج كاش)</option>
            <option :value="2" class="bg-white dark:bg-slate-800">حساب بنكي</option>
            <option :value="3" class="bg-white dark:bg-slate-800">محفظة إنستاباي</option>
            <option :value="4" class="bg-white dark:bg-slate-800">محفظة إلكترونية</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1">رقم الحساب / الآيبان / معرف المحفظة</label>
          <input
            type="text"
            v-model="editAccountForm.accountNumber"
            placeholder="رقم الحساب أو معرف إنستاباي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="accActive"
            v-model="editAccountForm.isActive"
            class="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent cursor-pointer"
          />
          <label for="accActive" class="text-xs font-semibold text-brand-dark dark:text-white select-none cursor-pointer">
            الحساب نشط ومتاح للتعامل
          </label>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات</label>
          <input
            type="text"
            v-model="editAccountForm.notes"
            placeholder="وصف إضافي للحساب..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
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
          form="editAccountForm"
          :disabled="financeStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark cursor-pointer shadow-sm disabled:opacity-50"
        >
          حفظ التعديلات
        </button>
      </template>
    </OhdaModal>

    <!-- Delete Confirmation Modal -->
    <OhdaModal
      :visible="showDeleteAccountModal"
      @close="showDeleteAccountModal = false"
      title="تأكيد حذف الحساب المالي"
      description="يرجى الانتباه إلى أن هذا الإجراء سيقوم بإلغاء تنشيط الحساب"
      :icon="AlertTriangle"
      max-width="max-w-md"
    >
      <div v-if="accountToDelete" class="text-xs space-y-3">
        <p class="text-brand-dark dark:text-white">
          هل أنت متأكد من حذف الحساب:
          <span class="font-bold text-rose-600">"{{ accountToDelete.name }}"</span>؟
        </p>
        <p v-if="accountToDelete.currentBalance !== 0" class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px]">
          تنبيه: رصيد هذا الحساب الحالي هو <strong>{{ formatCurrency(accountToDelete.currentBalance) }}</strong>. يفضل تصفير الرصيد أو تحويله لحساب آخر قبل الحذف.
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
          @click="confirmDeleteAccount"
          :disabled="financeStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          تأكيد الحذف
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import OhdaModal from "../components/OhdaModal.vue";
import CashDrawerWidget from "../components/CashDrawerWidget.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import {
  Landmark,
  Wallet,
  Banknote,
  Smartphone,
  Plus,
  ArrowLeftRight,
  Calculator,
  Building,
  History,
  Scale,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  Pencil,
  Trash2
} from "lucide-vue-next";

const financeStore = useOhdaFinanceStore();

const activeTab = ref("accounts");
const txSearch = ref("");

const todayStr = new Date().toISOString().split("T")[0];
const closingDate = ref(todayStr);
const actualCashCounted = ref(null);
const closingNotes = ref("");

// Modals
const showTransferModal = ref(false);
const showAddAccountModal = ref(false);
const showEditAccountModal = ref(false);
const showDeleteAccountModal = ref(false);
const accountToDelete = ref(null);

const editAccountForm = ref({
  id: null,
  name: "",
  accountType: 1,
  accountNumber: "",
  notes: "",
  isActive: true
});

const transferForm = ref({
  fromAccountId: "",
  toAccountId: "",
  amount: null,
  notes: ""
});

const accountForm = ref({
  name: "",
  accountType: 1,
  accountNumber: "",
  initialBalance: 0,
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    financeStore.fetchAccounts(),
    financeStore.fetchTransactions(),
    fetchClosingCalc(),
    financeStore.fetchClosingHistory()
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

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" })} - ${d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`;
}

function getAccountTypeIcon(type) {
  switch (type) {
    case 1: return Banknote;
    case 2: return Landmark;
    case 3:
    case 4: return Smartphone;
    default: return Wallet;
  }
}

function getAccountTypeBadgeClasses(type) {
  switch (type) {
    case 1: return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case 2: return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case 3: return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    default: return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
}

function getTransactionTypeIcon(type) {
  switch (type) {
    case 1: return ArrowDownLeft; // income
    case 2: return ArrowUpRight;  // expense
    case 3: return ArrowLeftRight;// transfer
    default: return Scale;         // adjustment
  }
}

function getTransactionTypeClasses(type) {
  switch (type) {
    case 1: return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case 2: return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case 3: return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    default: return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  }
}

function getAmountColor(type) {
  if (type === 1) return "text-emerald-600 dark:text-emerald-400";
  if (type === 2) return "text-red-600 dark:text-red-400";
  return "text-blue-600 dark:text-blue-400";
}

const filteredTransactions = computed(() => {
  let list = [...financeStore.transactions];
  if (txSearch.value && txSearch.value.trim() !== "") {
    const q = txSearch.value.toLowerCase().trim();
    list = list.filter(t =>
      (t.reference && t.reference.toLowerCase().includes(q)) ||
      (t.accountName && t.accountName.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }
  return list;
});

async function fetchClosingCalc() {
  await financeStore.fetchDailyClosingCalc(null, closingDate.value);
  if (financeStore.dailyCalculation) {
    actualCashCounted.value = financeStore.dailyCalculation.expectedCash;
  }
}

const calculatedDifference = computed(() => {
  if (actualCashCounted.value === null || !financeStore.dailyCalculation) return 0;
  return Number(actualCashCounted.value) - Number(financeStore.dailyCalculation.expectedCash || 0);
});

const calculatedDiffClass = computed(() => {
  const diff = calculatedDifference.value;
  if (diff === 0) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300";
  if (diff > 0) return "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300";
  return "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300";
});

const calculatedDiffIcon = computed(() => {
  const diff = calculatedDifference.value;
  if (diff === 0) return CheckCircle;
  return AlertTriangle;
});

const calculatedDiffMessage = computed(() => {
  const diff = calculatedDifference.value;
  if (diff === 0) return "الدرج متطابق تماماً - لا يوجد أي عجز أو زيادة!";
  if (diff > 0) return "يوجد فائض / زيادة في الدرج عن الرصيد الدفتري:";
  return "يوجد عجز نقدي في الدرج عن الرصيد الدفتري:";
});

async function submitClosing() {
  if (!financeStore.dailyCalculation) return;

  const res = await financeStore.submitDailyClosing({
    closingDate: closingDate.value ? new Date(closingDate.value).toISOString() : new Date().toISOString(),
    accountId: financeStore.dailyCalculation.accountId,
    actualCash: Number(actualCashCounted.value),
    notes: closingNotes.value
  });

  if (res.success) {
    alert(res.message);
    await fetchClosingCalc();
  } else {
    alert(res.message);
  }
}

function openTransferModal() {
  transferForm.value = {
    fromAccountId: financeStore.accounts.length > 0 ? financeStore.accounts[0].id : "",
    toAccountId: financeStore.accounts.length > 1 ? financeStore.accounts[1].id : "",
    amount: null,
    notes: ""
  };
  showTransferModal.value = true;
}

async function submitTransfer() {
  const res = await financeStore.transferFunds(transferForm.value);
  if (res.success) {
    showTransferModal.value = false;
    await financeStore.fetchTransactions();
  } else {
    alert(res.message);
  }
}

function openAddAccountModal() {
  accountForm.value = {
    name: "",
    accountType: 1,
    accountNumber: "",
    initialBalance: 0,
    notes: ""
  };
  showAddAccountModal.value = true;
}

async function submitAddAccount() {
  const res = await financeStore.createAccount(accountForm.value);
  if (res.success) {
    showAddAccountModal.value = false;
  } else {
    alert(res.message);
  }
}

function openEditAccountModal(acc) {
  editAccountForm.value = {
    id: acc.id,
    name: acc.name || "",
    accountType: acc.accountType || 1,
    accountNumber: acc.accountNumber || "",
    notes: acc.notes || "",
    isActive: acc.isActive ?? true
  };
  showEditAccountModal.value = true;
}

async function submitEditAccount() {
  if (!editAccountForm.value.id) return;
  const res = await financeStore.updateAccount(editAccountForm.value.id, {
    name: editAccountForm.value.name,
    accountType: editAccountForm.value.accountType,
    accountNumber: editAccountForm.value.accountNumber,
    notes: editAccountForm.value.notes,
    isActive: editAccountForm.value.isActive
  });
  if (res.success) {
    showEditAccountModal.value = false;
  } else {
    alert(res.message);
  }
}

function promptDeleteAccount(acc) {
  accountToDelete.value = acc;
  showDeleteAccountModal.value = true;
}

async function confirmDeleteAccount() {
  if (!accountToDelete.value) return;
  const res = await financeStore.deleteAccount(accountToDelete.value.id);
  if (res.success) {
    showDeleteAccountModal.value = false;
    accountToDelete.value = null;
  } else {
    alert(res.message);
  }
}
</script>
