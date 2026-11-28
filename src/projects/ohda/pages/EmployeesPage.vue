<template>
  <div class="space-y-6">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Users class="w-7 h-7 text-brand-accent" />
          <span>شؤون العاملين والرواتب (HR)</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          إدارة الفنيين والعمال، تسجيل الحضور والانصراف اليومي، ومسير الرواتب الشهرية مع الصرف الآلي في المصروفات
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="showImportModal = true"
          class="px-3.5 py-2.5 rounded-xl border border-brand-gray/25 hover:border-brand-accent text-brand-dark dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload class="w-4 h-4 text-blue-500" />
          <span>استيراد Excel</span>
        </button>

        <Button
          @click="openAddEmployeeModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>+ إضافة موظف / فني جديد</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
      <!-- Total Employees -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي فريق العمل</span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ hrStore.totalEmployeesCount }}</span>
        </div>
      </div>

      <!-- Active Employees -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <UserCheck class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">على رأس العمل</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ hrStore.activeEmployeesCount }}</span>
        </div>
      </div>

      <!-- Total Monthly Payroll -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Banknote class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي مسير الشهر</span>
          <span class="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">{{ formatCurrency(hrStore.totalMonthlyPayrollAmount) }}</span>
        </div>
      </div>

      <!-- Unpaid Salaries -->
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">رواتب متبقية للصرف</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(hrStore.unpaidPayrollAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Mode Switcher -->
    <div class="bg-brand-white dark:bg-white/5 p-3 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div class="flex items-center gap-2">
        <button
          @click="activeView = 'employees'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeView === 'employees' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Users class="w-4 h-4" />
          <span>قائمة الموظفين والفنيين</span>
        </button>

        <button
          @click="activeView = 'attendance'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeView === 'attendance' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <CalendarCheck class="w-4 h-4" />
          <span>كشف الحضور والانصراف</span>
        </button>

        <button
          @click="activeView = 'payroll'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeView === 'payroll' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        >
          <Wallet class="w-4 h-4" />
          <span>مسير الرواتب الشهرية</span>
        </button>
      </div>

      <!-- Extra Toolbar for specific view -->
      <div v-if="activeView === 'employees'" class="w-full sm:w-64 relative">
        <Search class="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <InputText
          v-model="employeeSearch"
          placeholder="بحث بالاسم، المهنة، الهاتف..."
          class="!w-full !ps-9 !pe-3 !py-1.5 !rounded-xl !text-xs !bg-transparent !border-brand-gray/20 dark:!border-white/10"
        />
      </div>

      <div v-else-if="activeView === 'attendance'" class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-semibold">تاريخ اليوم:</span>
        <input
          type="date"
          v-model="attendanceDate"
          @change="loadAttendance"
          class="text-xs p-1.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
        />
        <Button
          @click="saveAttendance"
          :disabled="hrStore.loading"
          class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-3.5 !py-1.5 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Check class="w-3.5 h-3.5" />
          <span>حفظ الكشف</span>
        </Button>
      </div>

      <div v-else-if="activeView === 'payroll'" class="flex items-center gap-2">
        <select
          v-model.number="payrollMonth"
          @change="loadPayroll"
          class="text-xs p-1.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
        >
          <option v-for="m in 12" :key="m" :value="m" class="bg-white dark:bg-slate-800">شهر {{ m }}</option>
        </select>

        <select
          v-model.number="payrollYear"
          @change="loadPayroll"
          class="text-xs p-1.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono"
        >
          <option :value="2025" class="bg-white dark:bg-slate-800">2025</option>
          <option :value="2026" class="bg-white dark:bg-slate-800">2026</option>
          <option :value="2027" class="bg-white dark:bg-slate-800">2027</option>
        </select>

        <Button
          @click="generatePayrollForMonth"
          :disabled="hrStore.loading"
          class="!bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !rounded-xl !px-3.5 !py-1.5 !text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>توليد مسير الشهر</span>
        </Button>
      </div>
    </div>

    <!-- VIEW 1: Employees List Table -->
    <div v-if="activeView === 'employees'" class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
      <div v-if="hrStore.loading && !hrStore.employees.length" class="p-8">
        <LoadingSkeleton />
      </div>

      <div v-else-if="filteredEmployees.length === 0" class="p-12 text-center">
        <EmptyState
          title="لا يوجد موظفين مسجلين"
          description="أضف الفنيين والعمال في ورشتك لمتابعة الحضور وإصدار الرواتب"
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-start border-collapse text-xs">
          <thead>
            <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray dark:text-slate-400 font-semibold">
              <th class="p-3.5 text-start">الاسم</th>
              <th class="p-3.5 text-start">المسمى الوظيفي</th>
              <th class="p-3.5 text-start">حساب المستخدم</th>
              <th class="p-3.5 text-start">رقم الهاتف</th>
              <th class="p-3.5 text-start">نظام الأجر / الراتب</th>
              <th class="p-3.5 text-start">العمولة %</th>
              <th class="p-3.5 text-start">تاريخ التعيين</th>
              <th class="p-3.5 text-start">الحالة</th>
              <th class="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
            <tr
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <!-- Name -->
              <td class="p-3.5 font-bold text-brand-dark dark:text-white whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-brand-accent/20 text-brand-dark dark:text-brand-accent flex items-center justify-center font-bold text-xs">
                    {{ emp.name.charAt(0) }}
                  </div>
                  <span>{{ emp.name }}</span>
                </div>
              </td>

              <!-- Job Title -->
              <td class="p-3.5 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {{ emp.jobTitle }}
                </span>
              </td>

              <!-- Linked User Account -->
              <td class="p-3.5 whitespace-nowrap">
                <span
                  v-if="emp.userId || emp.userName"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1"
                >
                  <UserCheck class="w-3 h-3" />
                  @{{ emp.userName || emp.userPersonName || 'مرتبط' }}
                </span>
                <span v-else class="text-[10px] text-slate-400">بدون حساب</span>
              </td>

              <!-- Phone -->
              <td class="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {{ emp.phone || '-' }}
              </td>

              <!-- Base Salary & Type -->
              <td class="p-3.5 font-mono whitespace-nowrap">
                <div class="font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(emp.baseSalary) }}
                </div>
                <span
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold"
                  :class="emp.salaryType === 2 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'"
                >
                  {{ emp.salaryType === 2 ? 'أجر باليومية' : 'راتب شهري' }}
                </span>
              </td>

              <!-- Commission Rate -->
              <td class="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {{ emp.commissionRate ? `${emp.commissionRate}%` : '-' }}
              </td>

              <!-- Hire Date -->
              <td class="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {{ formatDate(emp.hireDate) }}
              </td>

              <!-- Status -->
              <td class="p-3.5 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="emp.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'"
                >
                  {{ emp.isActive ? 'على رأس العمل' : 'متوقف / غير نشط' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3.5 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="openQuickPayModal(emp)"
                    class="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                    title="صرف الراتب السريع"
                  >
                    <Banknote class="w-4 h-4" />
                  </button>
                  <button
                    @click="openJobCardsModal(emp)"
                    class="p-1.5 text-purple-600 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                    title="ملف أوامر الشغل المنجزة"
                  >
                    <FileText class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditEmployeeModal(emp)"
                    class="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                    title="تعديل الموظف"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeleteEmployee(emp)"
                    class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 2: Daily Attendance Table -->
    <div v-else-if="activeView === 'attendance'" class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
      <div v-if="hrStore.loading" class="p-8">
        <LoadingSkeleton />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-start border-collapse text-xs">
          <thead>
            <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray dark:text-slate-400 font-semibold">
              <th class="p-3.5 text-start">الموظف / الفني</th>
              <th class="p-3.5 text-start">الوظيفة</th>
              <th class="p-3.5 text-center">حالة الحضور</th>
              <th class="p-3.5 text-start">وقت الحضور</th>
              <th class="p-3.5 text-start">وقت الانصراف</th>
              <th class="p-3.5 text-start">ملاحظات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
            <tr
              v-for="record in localAttendance"
              :key="record.employeeId"
              class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <!-- Name -->
              <td class="p-3.5 font-bold text-brand-dark dark:text-white whitespace-nowrap">
                {{ record.employeeName }}
              </td>

              <!-- Job Title -->
              <td class="p-3.5 whitespace-nowrap text-slate-500">
                {{ record.jobTitle }}
              </td>

              <!-- Status Dropdown List -->
              <td class="p-3.5 whitespace-nowrap min-w-[170px]">
                <select
                  v-model.number="record.status"
                  @change="onStatusChange(record)"
                  class="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer bg-brand-white dark:bg-brand-dark"
                  :class="{
                    'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10': record.status === 1,
                    'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10': record.status === 3,
                    'border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10': record.status === 2,
                    'border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10': record.status === 4
                  }"
                >
                  <option :value="1">🟢 حاضر بالورشة</option>
                  <option :value="3">🟡 متأخر عن الموعد</option>
                  <option :value="2">🔴 غائب (لم يحضر)</option>
                  <option :value="4">🔵 استئذان / إجازة رسمية</option>
                </select>
              </td>

              <!-- Check-In Time -->
              <td class="p-3.5 whitespace-nowrap">
                <input
                  type="time"
                  v-model="record.checkInTime"
                  :disabled="record.status === 2 || record.status === 4"
                  class="p-1 rounded-lg border border-brand-gray/20 dark:border-white/10 bg-transparent text-xs font-mono disabled:opacity-40"
                />
              </td>

              <!-- Check-Out Time -->
              <td class="p-3.5 whitespace-nowrap">
                <input
                  type="time"
                  v-model="record.checkOutTime"
                  :disabled="record.status === 2 || record.status === 4"
                  class="p-1 rounded-lg border border-brand-gray/20 dark:border-white/10 bg-transparent text-xs font-mono disabled:opacity-40"
                />
              </td>

              <!-- Notes & Reasons -->
              <td class="p-3.5 min-w-[240px]">
                <div class="relative">
                  <input
                    type="text"
                    v-model="record.notes"
                    :placeholder="
                      record.status === 2
                        ? '⚠️ سبب الغياب (اكتب السبب هنا)...'
                        : record.status === 4
                        ? 'ℹ️ سبب الاستئذان أو الإجازة...'
                        : record.status === 3
                        ? 'سبب التأخير...'
                        : 'ملاحظة يومية (اختياري)...'
                    "
                    class="w-full p-2 rounded-xl border text-xs transition-colors"
                    :class="
                      (record.status === 2 || record.status === 4) && !record.notes
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-brand-dark dark:text-white placeholder:text-amber-600/80 dark:placeholder:text-amber-400/80'
                        : 'border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white'
                    "
                  />
                  <span
                    v-if="(record.status === 2 || record.status === 4) && !record.notes"
                    class="absolute left-2 top-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold pointer-events-none"
                  >
                    مطلوب السبب
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Attendance Table Footer Actions & Live Summary -->
      <div class="p-3.5 bg-black/5 dark:bg-white/5 border-t border-brand-gray/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 text-xs">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
            <span>حاضر:</span>
            <span class="font-mono">{{ localAttendance.filter(r => r.status === 1).length }}</span>
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
            <span>متأخر:</span>
            <span class="font-mono">{{ localAttendance.filter(r => r.status === 3).length }}</span>
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 font-bold">
            <span>غائب:</span>
            <span class="font-mono">{{ localAttendance.filter(r => r.status === 2).length }}</span>
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
            <span>إجازة / إذن:</span>
            <span class="font-mono">{{ localAttendance.filter(r => r.status === 4).length }}</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <transition name="fade">
            <div v-if="attendanceSuccessMsg" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ attendanceSuccessMsg }}</span>
            </div>
          </transition>

          <Button
            @click="saveAttendance"
            :disabled="hrStore.loading"
            class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-5 !py-2 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Check class="w-4 h-4" />
            <span>{{ hrStore.loading ? 'جاري الحفظ...' : 'حفظ كشف الحضور والانصراف' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- VIEW 3: Monthly Payroll Table -->
    <div v-else-if="activeView === 'payroll'" class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
      <div v-if="hrStore.loading && !hrStore.payrolls.length" class="p-8">
        <LoadingSkeleton />
      </div>

      <div v-else-if="hrStore.payrolls.length === 0" class="p-12 text-center">
        <EmptyState
          title="لم يتم إصدار مسير الرواتب لهذا الشهر"
          description="اضغط على زر 'توليد مسير الشهر' أعلاه لإنشاء كشف الرواتب تلقائياً لجميع الفنيين والعمال"
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-start border-collapse text-xs">
          <thead>
            <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray dark:text-slate-400 font-semibold">
              <th class="p-3.5 text-start">الموظف / الفني</th>
              <th class="p-3.5 text-start">الراتب الأساسي</th>
              <th class="p-3.5 text-start">حوافز ومكافآت</th>
              <th class="p-3.5 text-start">عمولات خدمات</th>
              <th class="p-3.5 text-start">خصومات وسلف</th>
              <th class="p-3.5 text-start">صافي الراتب</th>
              <th class="p-3.5 text-start">حالة السداد</th>
              <th class="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
            <tr
              v-for="p in hrStore.payrolls"
              :key="p.id"
              class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <!-- Name & Title -->
              <td class="p-3.5 whitespace-nowrap">
                <div class="font-bold text-brand-dark dark:text-white">{{ p.employeeName }}</div>
                <div class="text-[10px] text-slate-400">{{ p.jobTitle }}</div>
              </td>

              <!-- Base Salary -->
              <td class="p-3.5 font-mono whitespace-nowrap">
                <div class="font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(p.baseSalary) }}
                </div>
                <div v-if="p.salaryType === 2" class="text-[10px] text-amber-600 dark:text-amber-400 font-sans">
                  ({{ p.daysWorked }} يوم عمل × {{ formatCurrency(p.dailyRate) }})
                </div>
                <span
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold"
                  :class="p.salaryType === 2 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'"
                >
                  {{ p.salaryType === 2 ? 'يومية' : 'شهري' }}
                </span>
              </td>

              <!-- Bonus -->
              <td class="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                +{{ formatCurrency(p.bonusAmount) }}
              </td>

              <!-- Commission -->
              <td class="p-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">
                +{{ formatCurrency(p.commissionAmount) }}
              </td>

              <!-- Deductions / Advances -->
              <td class="p-3.5 font-mono text-red-500 font-semibold whitespace-nowrap">
                -{{ formatCurrency((p.deductionsAmount || 0) + (p.advancesAmount || 0)) }}
              </td>

              <!-- Net Salary -->
              <td class="p-3.5 font-mono font-bold text-sm text-brand-dark dark:text-white whitespace-nowrap">
                {{ formatCurrency(p.netSalary) }}
              </td>

              <!-- Payment Status Badge -->
              <td class="p-3.5 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                  :class="p.isPaid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'"
                >
                  <component :is="p.isPaid ? CheckCircle2 : Clock" class="w-3 h-3" />
                  {{ p.isPaid ? `تم الصرف (${p.paymentMethodName})` : 'قيد الانتظار' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3.5 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openJobCardsModal({ id: p.employeeId, name: p.employeeName, jobTitle: p.jobTitle, baseSalary: p.baseSalary })"
                    class="p-1.5 text-purple-600 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                    title="ملف أوامر الشغل المنجزة"
                  >
                    <FileText class="w-4 h-4" />
                  </button>

                  <button
                    v-if="!p.isPaid"
                    @click="openEditPayrollModal(p)"
                    class="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                    title="تعديل الحوافز والخصومات"
                  >
                    <SlidersHorizontal class="w-4 h-4" />
                  </button>

                  <Button
                    v-if="!p.isPaid"
                    @click="openPayModal(p)"
                    class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-3 !py-1 !text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Banknote class="w-3.5 h-3.5" />
                    <span>صرف الراتب</span>
                  </Button>

                  <span v-else class="text-[10px] text-slate-400">
                    {{ formatDate(p.paymentDate) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 1. Modal: Add/Edit Employee using OhdaModal -->
    <OhdaModal
      :visible="showEmployeeModal"
      @close="showEmployeeModal = false"
      :title="editingEmployeeId ? 'تعديل بيانات الموظف' : 'إضافة موظف / فني جديد'"
      description="إدخال بيانات الموظف، المسمى الوظيفي، والراتب الأساسي ونسبة العمولة"
      :icon="UserPlus"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitEmployee" id="employeeForm" class="space-y-4 text-xs">
        <!-- Name -->
        <div>
          <label class="block font-semibold mb-1">اسم الموظف / الفني *</label>
          <input
            type="text"
            v-model="employeeForm.name"
            required
            placeholder="الاسم ثلاثي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <!-- User Account Link (Optional) -->
        <div class="bg-purple-500/5 p-3 rounded-xl border border-purple-500/15">
          <label class="block font-semibold mb-1 text-purple-700 dark:text-purple-300">
            ربط بحساب مستخدم في النظام (اختياري)
          </label>
          <select
            v-model="employeeForm.userId"
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-brand-white dark:bg-slate-800 text-brand-dark dark:text-white focus:border-purple-500 transition-all cursor-pointer"
          >
            <option :value="null">-- بدون حساب مستخدم (لا يوجد حساب له في النظام) --</option>
            <option
              v-for="u in userStore.users"
              :key="u.id"
              :value="u.id"
            >
              {{ u.personName || u.username }} (@{{ u.username }})
            </option>
          </select>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            يمكنك ربط هذا الموظف/الفني بحساب مستخدم مسجل مسبقاً، أو تركه بدون حساب إن لم يكن يحتاج تسجيل الدخول.
          </p>
        </div>

        <!-- Job Title & Phone -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">المسمى الوظيفي *</label>
            <select
              v-model="selectedJobTitlePreset"
              @change="onJobTitleSelectChange"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-brand-white dark:bg-slate-800 text-brand-dark dark:text-white focus:border-brand-accent transition-all cursor-pointer"
            >
              <option v-for="title in availableJobTitles" :key="title" :value="title">
                {{ title }}
              </option>
            </select>
            <input
              v-if="selectedJobTitlePreset === 'أخرى...'"
              type="text"
              v-model="customJobTitle"
              @input="employeeForm.jobTitle = customJobTitle"
              placeholder="اكتب المسمى الوظيفي..."
              class="w-full text-xs p-2.5 mt-2 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
              required
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم الهاتف</label>
            <input
              type="tel"
              v-model="employeeForm.phone"
              @keypress="allowOnlyNumbers"
              @input="employeeForm.phone = filterPhone(employeeForm.phone)"
              placeholder="01XXXXXXXXX"
              maxlength="15"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
            <p v-if="employeeForm.phone && !isValidPhone(employeeForm.phone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>
        </div>

        <!-- Salary Type Selector -->
        <div>
          <label class="block font-semibold mb-1">نظام احتساب الراتب / الأجر *</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="employeeForm.salaryType = 1"
              class="p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              :class="employeeForm.salaryType === 1 ? 'border-brand-accent bg-brand-accent/15 text-brand-dark dark:text-white shadow-xs' : 'border-brand-gray/20 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
            >
              <span>راتب شهري ثابت</span>
            </button>
            <button
              type="button"
              @click="employeeForm.salaryType = 2"
              class="p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              :class="employeeForm.salaryType === 2 ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs' : 'border-brand-gray/20 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
            >
              <span>يومية (حساب باليوم)</span>
            </button>
          </div>
        </div>

        <!-- Base Salary / Daily Rate & Commission Rate -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">
              <span v-if="employeeForm.salaryType === 2">قيمة اليومية / الأجر اليومي (ج.م) *</span>
              <span v-else>الراتب الأساسي الشهري (ج.م) *</span>
            </label>
            <input
              type="number"
              v-model.number="employeeForm.baseSalary"
              min="0"
              step="50"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">نسبة العمولة (%)</label>
            <input
              type="number"
              v-model.number="employeeForm.commissionRate"
              min="0"
              max="100"
              step="0.5"
              placeholder="0%"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <!-- National ID & Hire Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">الرقم القومي</label>
            <input
              type="text"
              v-model="employeeForm.nationalId"
              @keypress="allowOnlyNumbers"
              @input="employeeForm.nationalId = filterNationalId(employeeForm.nationalId)"
              maxlength="14"
              placeholder="الرقم القومي (14 رقم)"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
            <div class="flex items-center justify-between mt-1 text-[10px]">
              <span :class="employeeForm.nationalId && employeeForm.nationalId.length === 14 ? 'text-emerald-500 font-bold' : 'text-slate-400'">
                {{ employeeForm.nationalId ? employeeForm.nationalId.length : 0 }} / 14 رقماً
              </span>
              <span v-if="employeeForm.nationalId && employeeForm.nationalId.length !== 14" class="text-amber-500">
                يجب أن يكون 14 رقماً بالضبط
              </span>
            </div>
          </div>

          <div>
            <label class="block font-semibold mb-1">تاريخ التعيين</label>
            <input
              type="date"
              v-model="employeeForm.hireDate"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <!-- Status & Notes -->
        <div class="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="empActive"
            v-model="employeeForm.isActive"
            class="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent cursor-pointer"
          />
          <label for="empActive" class="text-xs font-semibold text-brand-dark dark:text-white select-none cursor-pointer">
            الموظف على رأس العمل (نشط)
          </label>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات</label>
          <input
            type="text"
            v-model="employeeForm.notes"
            placeholder="ملاحظات حول المهارات أو الخبرة..."
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
          form="employeeForm"
          :disabled="hrStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ hrStore.loading ? 'جاري الحفظ...' : (editingEmployeeId ? 'حفظ التعديلات' : 'إضافة الموظف') }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 2. Modal: Edit Payroll Item using OhdaModal -->
    <OhdaModal
      :visible="showEditPayrollModal"
      @close="showEditPayrollModal = false"
      title="تعديل بنود الراتب ومستحقات الموظف"
      description="تعديل المكافآت، العمولات، الخصومات والسلف لهذا الشهر"
      :icon="Banknote"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitPayrollItem" id="payrollItemForm" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light/60 dark:bg-white/5 rounded-xl flex items-center justify-between border border-brand-gray/10">
          <div>
            <div class="font-bold text-xs text-brand-dark dark:text-white">{{ selectedPayroll?.employeeName }}</div>
            <div class="text-[11px] text-slate-400">{{ selectedPayroll?.jobTitle }}</div>
          </div>
          <div class="text-end">
            <span class="text-[10px] text-slate-500 block">الراتب الأساسي:</span>
            <span class="text-xs font-mono font-bold">{{ formatCurrency(selectedPayroll?.baseSalary) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">المكافآت والحوافز (+)</label>
            <input
              type="number"
              v-model.number="payrollForm.bonusAmount"
              min="0"
              step="50"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-emerald-600 font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">عمولات الصيانة (+)</label>
            <input
              type="number"
              v-model.number="payrollForm.commissionAmount"
              min="0"
              step="50"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-blue-600 font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">الخصومات والجزاءات (-)</label>
            <input
              type="number"
              v-model.number="payrollForm.deductionsAmount"
              min="0"
              step="50"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-red-500 font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">سلفيات مستقطعة (-)</label>
            <input
              type="number"
              v-model.number="payrollForm.advancesAmount"
              min="0"
              step="50"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-red-500 font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <!-- Computed Net -->
        <div class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
          <span class="text-xs font-bold text-purple-800 dark:text-purple-300">صافي الراتب المستحق:</span>
          <span class="text-base font-bold font-mono text-purple-700 dark:text-purple-400">
            {{ formatCurrency(calculatedPayrollNet) }}
          </span>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات على الراتب</label>
          <input
            type="text"
            v-model="payrollForm.notes"
            placeholder="سبب المكافأة أو الخصم..."
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
          form="payrollItemForm"
          :disabled="hrStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          حفظ التعديلات
        </button>
      </template>
    </OhdaModal>

    <!-- 3. Modal: Pay Salary using OhdaModal -->
    <OhdaModal
      :visible="showPayModal"
      @close="showPayModal = false"
      title="صرف الراتب وتسجيل المصروف"
      description="تأكيد صرف الراتب واختيار طريقة الصرف وتسجيل المصروف آلياً"
      :icon="Wallet"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitPaySalary" id="paySalaryForm" class="space-y-4 text-xs">
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          <div class="flex items-center justify-between font-bold">
            <span>الموظف: {{ selectedPayroll?.employeeName }}</span>
            <span class="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ formatCurrency(payForm.amount ?? selectedPayroll?.netSalary) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between opacity-90 text-[11px]">
            <span>نظام الأجر: {{ selectedPayroll?.salaryType === 2 ? 'أجر باليومية' : 'راتب شهري ثابت' }}</span>
            <span v-if="selectedPayroll?.salaryType === 2">({{ selectedPayroll?.daysWorked || 0 }} يوم حضور مسجل)</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            سيتم تعليم الراتب كمدفوع، وتسجيل قيد مصروف تلقائي بحساب الرواتب والأجور وخصم المبلغ من الخزينة.
          </p>
        </div>

        <div>
          <label class="block font-semibold mb-1">المبلغ المطلوب صرفه *</label>
          <input
            type="number"
            v-model.number="payForm.amount"
            min="1"
            step="50"
            required
            class="w-full text-sm p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-emerald-600 dark:text-emerald-400 font-mono font-bold"
          />
          <p v-if="selectedPayroll?.netSalary === 0" class="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            💡 ملاحظة: الصافي المحسوب 0 ج.م بسبب عدم تسجيل أيام حضور بكشف الحضور لهذا الشهر، يمكنك كتابة المبلغ المراد صرفه باليد مباشرة وسيتم اعتماده.
          </p>
        </div>

        <MultiPaymentMethodSelector
          v-model="payForm.splits"
          :total-amount="Number(payForm.amount) || 0"
          @update:valid="isSalarySplitValid = $event"
          label="طرق صرف الراتب (كاش / فيزا / إنستاباي)"
        />

        <div>
          <label class="block font-semibold mb-1">تاريخ الصرف *</label>
          <input
            type="date"
            v-model="payForm.paymentDate"
            required
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات الصرف</label>
          <input
            type="text"
            v-model="payForm.notes"
            placeholder="مثال: تم الصرف نقداً باليد..."
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
          form="paySalaryForm"
          :disabled="hrStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
        >
          تأكيد الصرف الآن
        </button>
      </template>
    </OhdaModal>

    <!-- 4. Modal: Delete Confirmation using OhdaModal -->
    <OhdaModal
      :visible="showDeleteModal"
      @close="showDeleteModal = false"
      title="تأكيد حذف الموظف"
      description="يرجى الانتباه قبل حذف أي موظف من السجلات"
      :icon="Trash2"
      max-width="max-w-md"
    >
      <div class="space-y-3 text-xs">
        <p class="text-slate-600 dark:text-slate-300">
          هل أنت متأكد من حذف الموظف
          <span class="font-bold text-red-600">{{ employeeToDelete?.name }}</span>؟
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
          @click="executeDeleteEmployee"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
        >
          تأكيد الحذف
        </button>
      </template>
    </OhdaModal>

    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="employees"
      entity-label="الموظفين"
      @imported="hrStore.fetchEmployees()"
    />

    <!-- 4. Modal: Quick Pay Employee Salary -->
    <OhdaModal
      :visible="showQuickPayModal"
      @close="showQuickPayModal = false"
      title="صرف راتب الموظف السريع"
      description="صرف راتب الموظف واعتماد المصروف وخصمه من الخزينة تلقائياً"
      :icon="Banknote"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitQuickPay" id="quickPayForm" class="space-y-4 text-xs">
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          <div class="flex items-center justify-between font-bold">
            <span>الموظف: {{ quickPayEmp?.name }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20">{{ quickPayEmp?.jobTitle }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between opacity-90">
            <span>نظام الأجر:</span>
            <span class="font-bold px-2 py-0.5 rounded text-[10px]" :class="quickPayEmp?.salaryType === 2 ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200' : 'bg-blue-500/20 text-blue-800 dark:text-blue-200'">
              {{ quickPayEmp?.salaryType === 2 ? 'أجر باليومية' : 'راتب شهري ثابت' }}
            </span>
          </div>
          <div class="mt-1 flex items-center justify-between opacity-90">
            <span>{{ quickPayEmp?.salaryType === 2 ? 'قيمة اليومية المسجلة:' : 'الراتب الأساسي المسجل:' }}</span>
            <span class="font-mono font-bold">{{ formatCurrency(quickPayEmp?.baseSalary) }}</span>
          </div>
          <div v-if="quickPayEmp?.salaryType === 2" class="mt-2 p-2 rounded-lg bg-emerald-600/10 text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed border border-emerald-500/20">
            💡 <strong>آلية حساب الأجر اليومي:</strong> يقوم النظام بحساب الراتب تلقائياً = (أيام الحضور الفعلي المسجلة بكشف الحضور × قيمة اليومية) + عمولات أوامر الشغل المنجزة.
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">عن شهر</label>
            <input
              type="number"
              v-model.number="quickPayForm.month"
              min="1"
              max="12"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>
          <div>
            <label class="block font-semibold mb-1">لسنة</label>
            <input
              type="number"
              v-model.number="quickPayForm.year"
              min="2020"
              max="2035"
              required
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">مبلغ الصرف الفعلي *</label>
          <input
            type="number"
            v-model.number="quickPayForm.amount"
            min="1"
            step="50"
            required
            class="w-full text-sm p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-emerald-600 dark:text-emerald-400 font-mono font-bold"
          />
        </div>

        <MultiPaymentMethodSelector
          v-model="quickPayForm.splits"
          :total-amount="Number(quickPayForm.amount) || 0"
          @update:valid="isQuickSalarySplitValid = $event"
          label="طرق صرف الراتب (كاش / فيزا / إنستاباي)"
        />

        <div>
          <label class="block font-semibold mb-1">تاريخ الصرف</label>
          <input
            type="date"
            v-model="quickPayForm.paymentDate"
            required
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات الصرف</label>
          <input
            type="text"
            v-model="quickPayForm.notes"
            placeholder="ملاحظة أو رقم إيصال..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white"
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
          form="quickPayForm"
          :disabled="quickPayLoading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <Banknote class="w-4 h-4" />
          <span>{{ quickPayLoading ? 'جاري الصرف...' : 'تأكيد الصرف وتسجيل المصروف' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 5. Modal: Employee Job Cards File & History -->
    <OhdaModal
      :visible="showJobCardsModal"
      @close="showJobCardsModal = false"
      :title="`ملف أوامر الشغل للفني: ${selectedJobCardsEmp?.name || ''}`"
      description="استعراض كافة أوامر الشغل والسيارات المنجزة ومبالغ المصنعيات والعمولات المستحقة"
      :icon="FileText"
      max-width="max-w-4xl"
    >
      <div v-if="loadingJobCards" class="p-8">
        <LoadingSkeleton />
      </div>

      <div v-else-if="jobCardsData" class="space-y-4 text-xs">
        <!-- Top Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[11px] text-blue-700 dark:text-blue-300 block font-semibold">إجمالي أوامر الشغل المنجزة</span>
              <span class="text-xl font-bold font-mono text-blue-800 dark:text-blue-200">{{ jobCardsData.totalJobsCount }} أمر شغل</span>
            </div>
          </div>
          <div class="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[11px] text-purple-700 dark:text-purple-300 block font-semibold">إجمالي دخل المصنعيات</span>
              <span class="text-xl font-bold font-mono text-purple-800 dark:text-purple-200">{{ formatCurrency(jobCardsData.totalLaborRevenue) }}</span>
            </div>
          </div>
          <div class="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[11px] text-emerald-700 dark:text-emerald-300 block font-semibold">إجمالي العمولات المستحقة للفني</span>
              <span class="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-200">{{ formatCurrency(jobCardsData.totalCommissionEarned) }}</span>
            </div>
          </div>
        </div>

        <!-- Job Cards List Table -->
        <div v-if="!jobCardsData.jobCards?.length" class="p-8 text-center text-slate-400">
          لا توجد أوامر شغل مسجلة لهذا الفني في هذا الشهر.
        </div>

        <div v-else class="overflow-x-auto border border-brand-gray/10 dark:border-white/10 rounded-xl">
          <table class="w-full text-start border-collapse text-xs">
            <thead>
              <tr class="bg-black/5 dark:bg-white/5 border-b border-brand-gray/10 text-brand-gray dark:text-slate-400 font-semibold">
                <th class="p-2.5 text-start">رقم أمر الشغل</th>
                <th class="p-2.5 text-start">التاريخ</th>
                <th class="p-2.5 text-start">السيارة واللوحة</th>
                <th class="p-2.5 text-start">العميل</th>
                <th class="p-2.5 text-start">الخدمات المنجزة</th>
                <th class="p-2.5 text-start">إجمالي المصنعية</th>
                <th class="p-2.5 text-start">عمولة الفني</th>
                <th class="p-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-gray/10 dark:divide-white/5">
              <tr v-for="job in jobCardsData.jobCards" :key="job.jobCardId" class="hover:bg-black/5 dark:hover:bg-white/5">
                <td class="p-2.5 font-bold font-mono text-brand-dark dark:text-white whitespace-nowrap">
                  {{ job.jobNumber }}
                </td>
                <td class="p-2.5 font-mono text-slate-500 whitespace-nowrap">
                  {{ formatDate(job.jobDate) }}
                </td>
                <td class="p-2.5 whitespace-nowrap">
                  <div class="font-bold text-slate-800 dark:text-slate-200">{{ job.carPlate || '—' }}</div>
                  <div class="text-[10px] text-slate-400">{{ job.carModel || '' }}</div>
                </td>
                <td class="p-2.5 whitespace-nowrap">
                  <div class="text-slate-800 dark:text-slate-200">{{ job.customerName }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ job.customerPhone || '' }}</div>
                </td>
                <td class="p-2.5">
                  <div class="space-y-0.5">
                    <div v-for="s in job.services" :key="s.serviceId" class="flex items-center gap-1.5 text-[11px]">
                      <span class="text-slate-700 dark:text-slate-300 font-medium">• {{ s.serviceName }}</span>
                      <span class="text-slate-400 font-mono">({{ formatCurrency(s.price) }})</span>
                      <span v-if="s.commissionAmount > 0" class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        [عمولة: {{ formatCurrency(s.commissionAmount) }}]
                      </span>
                    </div>
                  </div>
                </td>
                <td class="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {{ formatCurrency(job.totalLaborAmount) }}
                </td>
                <td class="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {{ formatCurrency(job.totalCommissionAmount) }}
                </td>
                <td class="p-2.5 text-center whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {{ job.statusName }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer="{ close }">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          إغلاق
        </button>
        <button
          v-if="selectedJobCardsEmp"
          type="button"
          @click="downloadEmployeePdf(selectedJobCardsEmp.id, selectedJobCardsEmp.name)"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          <Download class="w-4 h-4" />
          <span>تنزيل ملف الفني (PDF)</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaHRStore } from "../stores/useOhdaHRStore";
import { useOhdaUserPermissionStore } from "../stores/useOhdaUserPermissionStore";
import { useOhdaLookupStore } from "../stores/useOhdaLookupStore";
import { filterPhone, filterNationalId, isValidPhone, isValidNationalIdNumber, allowOnlyNumbers } from "@/utilities/validations";
import OhdaModal from "../components/OhdaModal.vue";
import MultiPaymentMethodSelector from "../components/MultiPaymentMethodSelector.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import {
  Users,
  UserPlus,
  Upload,
  UserCheck,
  CalendarCheck,
  Banknote,
  Wallet,
  Clock,
  Search,
  Check,
  CheckCircle2,
  Edit2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Download
} from "lucide-vue-next";
import { downloadServerPdf } from "../utils/pdfHelper";

const hrStore = useOhdaHRStore();
const userStore = useOhdaUserPermissionStore();
const lookupStore = useOhdaLookupStore();

const activeView = ref("employees");
const employeeSearch = ref("");

const todayStr = new Date().toISOString().split("T")[0];
const attendanceDate = ref(todayStr);

const now = new Date();
const payrollMonth = ref(now.getMonth() + 1);
const payrollYear = ref(now.getFullYear());

// Modals State
const showEmployeeModal = ref(false);
const showImportModal = ref(false);
const editingEmployeeId = ref(null);
const showEditPayrollModal = ref(false);
const selectedPayroll = ref(null);
const showPayModal = ref(false);
const showDeleteModal = ref(false);
const employeeToDelete = ref(null);

const isSalarySplitValid = ref(true);
const isQuickSalarySplitValid = ref(true);

const showQuickPayModal = ref(false);
const quickPayEmp = ref(null);
const quickPayForm = ref({
  employeeId: 0,
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  amount: 0,
  paymentMethod: 1,
  splits: [],
  paymentDate: todayStr,
  notes: ""
});
const quickPayLoading = ref(false);

const showJobCardsModal = ref(false);
const selectedJobCardsEmp = ref(null);
const jobCardsData = ref(null);
const loadingJobCards = ref(false);

const fallbackJobTitles = [
  "فني ميكانيكا",
  "فني كهرباء سيارات",
  "فني تكييف سيارات",
  "فني عفشة وميزان",
  "فني سمكرة ودهان",
  "مهندس فحص وتشخيص",
  "فني غيار زيوت وفلاتر",
  "مستشار صيانة واستقبال",
  "مدير الورشة / المشرف الفني",
  "أمين مخزن وقطع غيار",
  "محاسب / كاشير",
  "مساعد فني / عامل",
  "أخرى..."
];

const availableJobTitles = computed(() => {
  const fromLookup = lookupStore.getValuesByCode("employee_job_title");
  if (fromLookup && fromLookup.length > 0) {
    const list = fromLookup.map(v => v.labelAr || v.value);
    if (!list.includes("أخرى...")) list.push("أخرى...");
    return list;
  }
  return fallbackJobTitles;
});

const selectedJobTitlePreset = ref("فني ميكانيكا");
const customJobTitle = ref("");

function onJobTitleSelectChange() {
  if (selectedJobTitlePreset.value !== "أخرى...") {
    employeeForm.value.jobTitle = selectedJobTitlePreset.value;
  } else {
    employeeForm.value.jobTitle = customJobTitle.value || "";
  }
}

const employeeForm = ref({
  name: "",
  jobTitle: "فني ميكانيكا",
  phone: "",
  salaryType: 1,
  baseSalary: 5000,
  commissionRate: 0,
  nationalId: "",
  hireDate: todayStr,
  isActive: true,
  userId: null,
  notes: ""
});

const localAttendance = ref([]);

const payrollForm = ref({
  bonusAmount: 0,
  commissionAmount: 0,
  deductionsAmount: 0,
  advancesAmount: 0,
  notes: ""
});

const payForm = ref({
  payrollId: null,
  amount: 0,
  paymentMethod: 1,
  splits: [],
  paymentDate: todayStr,
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    hrStore.fetchEmployees(),
    loadAttendance(),
    loadPayroll(),
    userStore.fetchUsers(),
    lookupStore.fetchAllActive()
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

const filteredEmployees = computed(() => {
  let list = [...hrStore.employees];
  if (employeeSearch.value && employeeSearch.value.trim() !== "") {
    const q = employeeSearch.value.toLowerCase().trim();
    list = list.filter(e =>
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q))
    );
  }
  return list;
});

async function loadAttendance() {
  await hrStore.fetchAttendance(attendanceDate.value);
  localAttendance.value = JSON.parse(JSON.stringify(hrStore.attendanceRecords));
}

const attendanceSuccessMsg = ref("");
let attendanceTimer = null;

function onStatusChange(record) {
  if (record.status === 2 || record.status === 4) {
    record.checkInTime = "";
    record.checkOutTime = "";
  } else if (!record.checkInTime) {
    record.checkInTime = "09:00";
    record.checkOutTime = "18:00";
  }
}

async function saveAttendance() {
  const payload = {
    date: attendanceDate.value ? new Date(attendanceDate.value).toISOString() : new Date().toISOString(),
    records: localAttendance.value.map(r => ({
      employeeId: r.employeeId,
      status: r.status,
      checkInTime: r.checkInTime || "",
      checkOutTime: r.checkOutTime || "",
      notes: r.notes || ""
    }))
  };

  const res = await hrStore.saveAttendanceBatch(payload);
  if (res.success) {
    attendanceSuccessMsg.value = "تم حفظ كشف الحضور والانصراف بنجاح ✓";
    if (attendanceTimer) clearTimeout(attendanceTimer);
    attendanceTimer = setTimeout(() => {
      attendanceSuccessMsg.value = "";
    }, 4000);
  } else {
    alert(res.message);
  }
}

async function loadPayroll() {
  await hrStore.fetchPayroll(payrollMonth.value, payrollYear.value);
}

async function generatePayrollForMonth() {
  const res = await hrStore.generatePayroll(payrollMonth.value, payrollYear.value);
  if (!res.success) {
    alert(res.message);
  }
}

function openAddEmployeeModal() {
  editingEmployeeId.value = null;
  employeeForm.value = {
    name: "",
    jobTitle: "فني ميكانيكا",
    phone: "",
    salaryType: 1,
    baseSalary: 5000,
    commissionRate: 0,
    nationalId: "",
    hireDate: todayStr,
    isActive: true,
    userId: null,
    notes: ""
  };
  selectedJobTitlePreset.value = "فني ميكانيكا";
  customJobTitle.value = "";
  showEmployeeModal.value = true;
}

function openEditEmployeeModal(emp) {
  editingEmployeeId.value = emp.id;
  employeeForm.value = {
    name: emp.name,
    jobTitle: emp.jobTitle,
    phone: emp.phone || "",
    salaryType: emp.salaryType || 1,
    baseSalary: emp.baseSalary,
    commissionRate: emp.commissionRate,
    nationalId: emp.nationalId || "",
    hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : todayStr,
    isActive: emp.isActive,
    userId: emp.userId || null,
    notes: emp.notes || ""
  };
  if (availableJobTitles.value.includes(emp.jobTitle) && emp.jobTitle !== "أخرى...") {
    selectedJobTitlePreset.value = emp.jobTitle;
    customJobTitle.value = "";
  } else {
    selectedJobTitlePreset.value = "أخرى...";
    customJobTitle.value = emp.jobTitle;
  }
  showEmployeeModal.value = true;
}

async function submitEmployee() {
  if (employeeForm.value.phone && !isValidPhone(employeeForm.value.phone)) {
    alert("رقم الهاتف غير صالح. يجب أن يتكون من 7 إلى 15 رقماً.");
    return;
  }
  if (employeeForm.value.nationalId && !isValidNationalIdNumber(employeeForm.value.nationalId)) {
    alert("الرقم القومي غير صالح. يجب أن يتكون من 14 رقماً بالضبط وبدون حروف أو رموز.");
    return;
  }
  if (selectedJobTitlePreset.value === "أخرى..." && customJobTitle.value) {
    employeeForm.value.jobTitle = customJobTitle.value.trim();
  }

  if (editingEmployeeId.value) {
    const res = await hrStore.updateEmployee(editingEmployeeId.value, employeeForm.value);
    if (res.success) {
      showEmployeeModal.value = false;
    } else {
      alert(res.message);
    }
  } else {
    const res = await hrStore.createEmployee(employeeForm.value);
    if (res.success) {
      showEmployeeModal.value = false;
      await loadAttendance();
    } else {
      alert(res.message);
    }
  }
}

function confirmDeleteEmployee(emp) {
  employeeToDelete.value = emp;
  showDeleteModal.value = true;
}

async function executeDeleteEmployee() {
  if (!employeeToDelete.value) return;
  const res = await hrStore.deleteEmployee(employeeToDelete.value.id);
  showDeleteModal.value = false;
  employeeToDelete.value = null;
  if (!res.success) {
    alert(res.message);
  }
}

function openEditPayrollModal(p) {
  selectedPayroll.value = p;
  payrollForm.value = {
    bonusAmount: p.bonusAmount || 0,
    commissionAmount: p.commissionAmount || 0,
    deductionsAmount: p.deductionsAmount || 0,
    advancesAmount: p.advancesAmount || 0,
    notes: p.notes || ""
  };
  showEditPayrollModal.value = true;
}

const calculatedPayrollNet = computed(() => {
  if (!selectedPayroll.value) return 0;
  const base = Number(selectedPayroll.value.baseSalary) || 0;
  const bonus = Number(payrollForm.value.bonusAmount) || 0;
  const comm = Number(payrollForm.value.commissionAmount) || 0;
  const ded = Number(payrollForm.value.deductionsAmount) || 0;
  const adv = Number(payrollForm.value.advancesAmount) || 0;
  return base + bonus + comm - ded - adv;
});

async function submitPayrollItem() {
  if (!selectedPayroll.value) return;
  const res = await hrStore.updatePayrollItem(selectedPayroll.value.id, {
    ...selectedPayroll.value,
    ...payrollForm.value
  });

  if (res.success) {
    showEditPayrollModal.value = false;
    await loadPayroll();
  } else {
    alert(res.message);
  }
}

function openPayModal(p) {
  selectedPayroll.value = p;
  const initialAmount = (p.netSalary && p.netSalary > 0)
    ? p.netSalary
    : (p.baseSalary && p.baseSalary > 0 ? p.baseSalary : (p.dailyRate || 300));
  payForm.value = {
    payrollId: p.id,
    amount: initialAmount,
    paymentMethod: 1,
    splits: [{ method: 1, amount: initialAmount }],
    paymentDate: todayStr,
    notes: ""
  };
  showPayModal.value = true;
}

async function submitPaySalary() {
  if (!isSalarySplitValid.value) {
    alert("توزيع مبالغ طرق الدفع غير مطابق لإجمالي صافي الراتب.");
    return;
  }
  const payload = {
    ...payForm.value,
    paymentMethod: payForm.value.splits?.[0]?.method || payForm.value.paymentMethod || 1
  };
  const res = await hrStore.paySalary(payload);
  if (res.success) {
    showPayModal.value = false;
    await loadPayroll();
  } else {
    alert(res.message);
  }
}

function openQuickPayModal(emp) {
  quickPayEmp.value = emp;
  const initAmt = emp.baseSalary || 0;
  quickPayForm.value = {
    employeeId: emp.id,
    month: payrollMonth.value || (now.getMonth() + 1),
    year: payrollYear.value || now.getFullYear(),
    amount: initAmt,
    paymentMethod: 1,
    splits: [{ method: 1, amount: initAmt }],
    paymentDate: todayStr,
    notes: ""
  };
  showQuickPayModal.value = true;
}

async function submitQuickPay() {
  if (!quickPayForm.value.amount || quickPayForm.value.amount <= 0) {
    alert("يرجى إدخال مبلغ الراتب بشكل صحيح.");
    return;
  }
  if (!isQuickSalarySplitValid.value) {
    alert("توزيع مبالغ طرق الدفع غير مطابق لمبلغ الراتب المطلوب صرفه.");
    return;
  }
  quickPayLoading.value = true;
  const payload = {
    ...quickPayForm.value,
    paymentMethod: quickPayForm.value.splits?.[0]?.method || quickPayForm.value.paymentMethod || 1
  };
  const res = await hrStore.quickPayEmployee(payload);
  quickPayLoading.value = false;
  if (res.success) {
    alert(res.message);
    showQuickPayModal.value = false;
    await hrStore.fetchEmployees();
    if (activeView.value === "payroll") {
      await loadPayroll();
    }
  } else {
    alert(res.message);
  }
}

async function openJobCardsModal(emp) {
  selectedJobCardsEmp.value = emp;
  showJobCardsModal.value = true;
  loadingJobCards.value = true;
  jobCardsData.value = null;
  const res = await hrStore.fetchEmployeeJobCards(emp.id, payrollMonth.value, payrollYear.value);
  if (res.success) {
    jobCardsData.value = res.data;
  } else {
    alert(res.message || "تعذر جلب ملف أوامر الشغل");
  }
  loadingJobCards.value = false;
}

function downloadEmployeePdf(empId, empName) {
  const m = payrollMonth.value || (now.getMonth() + 1);
  const y = payrollYear.value || now.getFullYear();
  downloadServerPdf(`/api/ReportsPdf/employee-card/${empId}?month=${m}&year=${y}`, `JobCards_${empName}_${m}_${y}.pdf`);
}
</script>
