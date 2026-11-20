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
              <th class="p-3.5 text-start">رقم الهاتف</th>
              <th class="p-3.5 text-start">الراتب الأساسي</th>
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

              <!-- Phone -->
              <td class="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {{ emp.phone || '-' }}
              </td>

              <!-- Base Salary -->
              <td class="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {{ formatCurrency(emp.baseSalary) }}
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

              <!-- Status Selection Pills -->
              <td class="p-3.5 text-center whitespace-nowrap">
                <div class="inline-flex rounded-xl p-1 bg-black/5 dark:bg-white/5 gap-1">
                  <button
                    type="button"
                    @click="record.status = 1"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    :class="record.status === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-white'"
                  >
                    حاضر
                  </button>
                  <button
                    type="button"
                    @click="record.status = 3"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    :class="record.status === 3 ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-white'"
                  >
                    متأخر
                  </button>
                  <button
                    type="button"
                    @click="record.status = 2"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    :class="record.status === 2 ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-white'"
                  >
                    غائب
                  </button>
                  <button
                    type="button"
                    @click="record.status = 4"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    :class="record.status === 4 ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-white'"
                  >
                    إجازة
                  </button>
                </div>
              </td>

              <!-- Check-In Time -->
              <td class="p-3.5 whitespace-nowrap">
                <input
                  type="time"
                  v-model="record.checkInTime"
                  :disabled="record.status === 2 || record.status === 4"
                  class="p-1 rounded-lg border border-brand-gray/20 dark:border-white/10 bg-transparent text-xs font-mono"
                />
              </td>

              <!-- Check-Out Time -->
              <td class="p-3.5 whitespace-nowrap">
                <input
                  type="time"
                  v-model="record.checkOutTime"
                  :disabled="record.status === 2 || record.status === 4"
                  class="p-1 rounded-lg border border-brand-gray/20 dark:border-white/10 bg-transparent text-xs font-mono"
                />
              </td>

              <!-- Notes -->
              <td class="p-3.5">
                <input
                  type="text"
                  v-model="record.notes"
                  placeholder="سبب التأخير / ملاحظة..."
                  class="w-full p-1 rounded-lg border border-brand-gray/20 dark:border-white/10 bg-transparent text-xs"
                />
              </td>
            </tr>
          </tbody>
        </table>
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
              <td class="p-3.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {{ formatCurrency(p.baseSalary) }}
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

        <!-- Job Title & Phone -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">المسمى الوظيفي *</label>
            <input
              type="text"
              v-model="employeeForm.jobTitle"
              required
              placeholder="مثال: فني ميكانيكا، كهربائي..."
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم الهاتف</label>
            <input
              type="tel"
              v-model="employeeForm.phone"
              placeholder="01XXXXXXXXX"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <!-- Base Salary & Commission Rate -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">الراتب الأساسي الشهري (ج.م) *</label>
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
              placeholder="الرقم القومي (14 رقم)"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
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
            <span class="font-mono text-sm">{{ formatCurrency(selectedPayroll?.netSalary) }}</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            سيتم تعليم الراتب كمدفوع، وتسجيل قيد مصروف تلقائي بحساب الرواتب والأجور.
          </p>
        </div>

        <div>
          <label class="block font-semibold mb-1">طريقة الصرف *</label>
          <select
            v-model="payForm.paymentMethod"
            required
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          >
            <option :value="1" class="bg-white dark:bg-slate-800">نقدي من الخزينة (كاش)</option>
            <option :value="3" class="bg-white dark:bg-slate-800">إنستاباي / محفظة إلكترونية</option>
            <option :value="4" class="bg-white dark:bg-slate-800">تحويل بنكي</option>
            <option :value="2" class="bg-white dark:bg-slate-800">بطاقة بنكية / فيزا</option>
          </select>
        </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaHRStore } from "../stores/useOhdaHRStore";
import OhdaModal from "../components/OhdaModal.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import {
  Users,
  UserPlus,
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
  SlidersHorizontal
} from "lucide-vue-next";

const hrStore = useOhdaHRStore();

const activeView = ref("employees");
const employeeSearch = ref("");

const todayStr = new Date().toISOString().split("T")[0];
const attendanceDate = ref(todayStr);

const now = new Date();
const payrollMonth = ref(now.getMonth() + 1);
const payrollYear = ref(now.getFullYear());

// Modals State
const showEmployeeModal = ref(false);
const editingEmployeeId = ref(null);
const showEditPayrollModal = ref(false);
const selectedPayroll = ref(null);
const showPayModal = ref(false);
const showDeleteModal = ref(false);
const employeeToDelete = ref(null);

const employeeForm = ref({
  name: "",
  jobTitle: "فني صيانة",
  phone: "",
  baseSalary: 5000,
  commissionRate: 0,
  nationalId: "",
  hireDate: todayStr,
  isActive: true,
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
  paymentMethod: 1,
  paymentDate: todayStr,
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    hrStore.fetchEmployees(),
    loadAttendance(),
    loadPayroll()
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

async function saveAttendance() {
  const payload = {
    date: attendanceDate.value ? new Date(attendanceDate.value).toISOString() : new Date().toISOString(),
    records: localAttendance.value.map(r => ({
      employeeId: r.employeeId,
      status: r.status,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      notes: r.notes
    }))
  };

  const res = await hrStore.saveAttendanceBatch(payload);
  if (res.success) {
    alert("تم حفظ كشف الحضور والانصراف بنجاح");
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
    jobTitle: "فني صيانة",
    phone: "",
    baseSalary: 5000,
    commissionRate: 0,
    nationalId: "",
    hireDate: todayStr,
    isActive: true,
    notes: ""
  };
  showEmployeeModal.value = true;
}

function openEditEmployeeModal(emp) {
  editingEmployeeId.value = emp.id;
  employeeForm.value = {
    name: emp.name,
    jobTitle: emp.jobTitle,
    phone: emp.phone || "",
    baseSalary: emp.baseSalary,
    commissionRate: emp.commissionRate,
    nationalId: emp.nationalId || "",
    hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : todayStr,
    isActive: emp.isActive,
    notes: emp.notes || ""
  };
  showEmployeeModal.value = true;
}

async function submitEmployee() {
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
  payForm.value = {
    payrollId: p.id,
    paymentMethod: 1,
    paymentDate: todayStr,
    notes: ""
  };
  showPayModal.value = true;
}

async function submitPaySalary() {
  const res = await hrStore.paySalary(payForm.value);
  if (res.success) {
    showPayModal.value = false;
    await loadPayroll();
  } else {
    alert(res.message);
  }
}
</script>
