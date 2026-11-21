<template>
  <div class="space-y-6">
    <!-- Header Title & Main Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <BellRing class="w-7 h-7 text-brand-accent" />
          <span>المتابعات والتذكيرات (Follow-ups & Reminders)</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          متابعة تذكيرات الصيانة الدورية للسيارات، مهام خدمة العملاء اليومية، وتقارير أعمار الديون والتحصيل
        </p>
      </div>

      <!-- Action Button (Contextual) -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          v-if="activeTab === 'tasks'"
          type="button"
          @click="openAddTaskModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ إضافة مهمة متابعة</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
      <button
        type="button"
        @click="activeTab = 'services'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border"
        :class="activeTab === 'services' ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-sm' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
      >
        <Wrench class="w-4 h-4" />
        <span>تذكيرات الصيانة الدورية</span>
        <span v-if="reminderStore.overdueRemindersCount > 0" class="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-red-500 text-white font-bold">
          {{ reminderStore.overdueRemindersCount }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'tasks'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border"
        :class="activeTab === 'tasks' ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-sm' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
      >
        <CalendarCheck class="w-4 h-4" />
        <span>مهام المتابعة اليدوية</span>
        <span v-if="reminderStore.openTasksCount > 0" class="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-blue-500 text-white font-bold">
          {{ reminderStore.openTasksCount }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'aging'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border"
        :class="activeTab === 'aging' ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-sm' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
      >
        <TrendingDown class="w-4 h-4" />
        <span>أعمار الديون والتحصيل</span>
      </button>
    </div>

    <!-- TAB 1: Service Reminders (تذكيرات الصيانة الدورية) -->
    <div v-if="activeTab === 'services'" class="space-y-6">
      <!-- Quick KPI Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">مستحقة هذا الأسبوع</span>
            <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{{ reminderStore.dueThisWeekCount }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">تذكيرات متأخرة</span>
            <span class="text-lg font-bold text-red-600 dark:text-red-400 font-mono">{{ reminderStore.overdueRemindersCount }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">تم التواصل مع العميل</span>
            <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ reminderStore.contactedCount }}</span>
          </div>
        </div>

        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wrench class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-brand-gray dark:text-slate-400 block font-medium">إجمالي التذكيرات المجدولة</span>
            <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">{{ reminderStore.serviceReminders.length }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="dueFilter = 'due_or_overdue'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="dueFilter === 'due_or_overdue' ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            المستحقة الآن والمتأخرة
          </button>
          <button
            type="button"
            @click="dueFilter = 'this_week'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="dueFilter === 'this_week' ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            هذا الأسبوع
          </button>
          <button
            type="button"
            @click="dueFilter = 'overdue'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="dueFilter === 'overdue' ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            المتأخرة فقط
          </button>
          <button
            type="button"
            @click="dueFilter = 'all'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="dueFilter === 'all' ? 'bg-brand-accent text-brand-dark border-brand-accent font-bold shadow-xs' : 'bg-brand-white dark:bg-white/5 border-brand-gray/15 text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            الكل ({{ reminderStore.serviceReminders.length }})
          </button>
        </div>

        <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <searchField v-model="searchQuery" placeholder="ابحث باسم العميل، الهاتف، اللوحة، أو اسم الخدمة..." class="flex-1" />
          <span class="text-xs text-brand-gray dark:text-slate-400 font-mono px-2">
            عرض {{ filteredReminders.length }} من {{ reminderStore.serviceReminders.length }}
          </span>
        </div>
      </div>

      <!-- Service Reminders DataTable -->
      <LoadingSkeleton v-if="reminderStore.loading && !reminderStore.serviceReminders.length" type="table" :count="5" />
      <OhdaDataTable
        v-else
        :items="filteredReminders"
        :columns="serviceReminderColumns"
        :loading="reminderStore.loading"
        empty-title="لا توجد تذكيرات صيانة مطابقة"
        empty-message="يتم إنشاء تذكيرات الصيانة تلقائياً عند إتمام أوامر شغل تحتوي على خدمات دورية (مثل تغيير الزيوت والفلاتر)."
        :rows-per-page="15"
      >
        <!-- Client -->
        <template #client="{ data }">
          <div>
            <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.clientName }}</span>
            <a :href="`tel:${data.clientPhone}`" class="font-mono text-[11px] text-brand-gray dir-ltr text-right inline-block hover:text-brand-accent">
              {{ data.clientPhone }}
            </a>
          </div>
        </template>

        <!-- Vehicle -->
        <template #vehicle="{ data }">
          <div>
            <span class="font-mono font-bold text-xs px-2 py-0.5 bg-brand-light dark:bg-white/10 rounded-md border border-brand-gray/15 inline-block">
              {{ data.vehiclePlate }}
            </span>
            <span v-if="data.vehicleModel" class="text-[11px] text-brand-gray block mt-0.5">{{ data.vehicleModel }}</span>
          </div>
        </template>

        <!-- Routine Service -->
        <template #service="{ data }">
          <div>
            <span class="font-bold text-brand-dark dark:text-white text-xs block">{{ data.serviceName }}</span>
            <span class="text-[11px] text-brand-gray block">{{ data.serviceCategory }}</span>
          </div>
        </template>

        <!-- Due Date & Overdue Badge -->
        <template #dueDate="{ data }">
          <div>
            <span class="font-mono font-bold text-xs text-brand-dark dark:text-white block">{{ formatDate(data.dueDate) }}</span>
            <span
              v-if="data.status === 1"
              class="text-[10px] font-bold inline-block px-1.5 py-0.2 rounded mt-0.5"
              :class="data.isOverdue ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
            >
              {{ data.isOverdue ? `متأخر منذ ${Math.abs(data.daysRemainingOrOverdue)} يوم` : `متبقي ${data.daysRemainingOrOverdue} يوم` }}
            </span>
            <span v-if="data.dueMileage" class="text-[10px] text-brand-gray font-mono block">
              العداد: {{ data.dueMileage.toLocaleString() }} كم
            </span>
          </div>
        </template>

        <!-- Status -->
        <template #status="{ data }">
          <div>
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border"
              :class="getReminderStatusClass(data.status, data.isOverdue)"
            >
              {{ data.statusText }}
            </span>
            <span v-if="data.contactOutcomeLabel" class="text-[10px] text-brand-gray block mt-0.5 font-semibold">
              {{ data.contactOutcomeLabel }}
            </span>
          </div>
        </template>

        <!-- Actions -->
        <template #actions="{ data }">
          <div class="flex items-center justify-center gap-1.5">
            <!-- Record Contact Button -->
            <button
              v-if="data.status === 1"
              type="button"
              @click="openContactModal(data)"
              class="px-2.5 py-1 rounded-xl bg-brand-accent text-brand-dark font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-brand-accent/90 shadow-xs"
              title="تسجيل نتيجة التواصل"
            >
              <PhoneCall class="w-3.5 h-3.5" />
              <span>تم التواصل</span>
            </button>

            <!-- Dismiss -->
            <button
              v-if="data.status === 1"
              type="button"
              @click="dismissReminder(data.id)"
              class="p-1.5 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-red-500/10 text-brand-gray hover:text-red-500 transition cursor-pointer border border-brand-gray/15"
              title="تجاهل"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </OhdaDataTable>
    </div>

    <!-- TAB 2: Manual Follow-up Tasks (مهام المتابعة اليدوية) -->
    <div v-else-if="activeTab === 'tasks'" class="space-y-6">
      <LoadingSkeleton v-if="reminderStore.loading && !reminderStore.followUpTasks.length" type="table" :count="4" />
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- New Task Card Button -->
        <div
          @click="openAddTaskModal"
          class="border-2 border-dashed border-brand-gray/25 hover:border-brand-accent rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-brand-light/20 dark:bg-white/5 transition group min-h-[160px]"
        >
          <div class="w-12 h-12 rounded-2xl bg-brand-accent/15 text-brand-accent flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <Plus class="w-6 h-6" />
          </div>
          <span class="text-xs font-bold text-brand-dark dark:text-white">إضافة مهمة متابعة جديدة</span>
          <span class="text-[11px] text-brand-gray mt-1">تحديد موعد للتواصل أو مراجعة عميل</span>
        </div>

        <!-- Task Cards -->
        <div
          v-for="task in reminderStore.followUpTasks"
          :key="task.id"
          class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/15 shadow-sm space-y-3 flex flex-col justify-between"
          :class="task.status === 2 ? 'opacity-60 bg-emerald-500/5' : ''"
        >
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-bold text-sm text-brand-dark dark:text-white leading-snug" :class="task.status === 2 ? 'line-through text-brand-gray' : ''">
                {{ task.title }}
              </h3>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border"
                :class="task.status === 2 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : (task.isOverdue ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20')"
              >
                {{ task.statusText }}
              </span>
            </div>

            <div class="text-xs text-brand-gray space-y-1">
              <div class="flex items-center gap-1.5">
                <User class="w-3.5 h-3.5 text-brand-accent" />
                <span class="font-bold text-brand-dark dark:text-white">{{ task.clientName }}</span>
                <span class="font-mono text-[11px]">({{ task.clientPhone }})</span>
              </div>
              <div class="flex items-center gap-1.5 font-mono">
                <Calendar class="w-3.5 h-3.5 text-brand-gray" />
                <span>تاريخ الاستحقاق: {{ formatDate(task.dueDate) }}</span>
              </div>
              <p v-if="task.notes" class="text-[11px] text-slate-500 dark:text-slate-400 bg-brand-light/50 dark:bg-white/5 p-2 rounded-lg mt-1">
                {{ task.notes }}
              </p>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="flex items-center justify-between border-t border-brand-gray/10 pt-3">
            <button
              v-if="task.status === 1"
              type="button"
              @click="completeTask(task.id)"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check class="w-3.5 h-3.5" />
              <span>تحديد كمكتملة</span>
            </button>
            <span v-else class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>مكتملة</span>
            </span>

            <button
              type="button"
              @click="deleteTask(task.id)"
              class="p-1.5 rounded-lg text-brand-gray hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
              title="حذف"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Aging Receivables (أعمار الديون والتحصيل) -->
    <div v-else-if="activeTab === 'aging'" class="space-y-6">
      <div v-if="reminderStore.agingReport" class="space-y-6">
        <!-- Summary Header -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="text-xs text-brand-gray block">إجمالي المديونيات المستحقة للورشة طرف العملاء</span>
            <span class="text-3xl font-black text-red-600 dark:text-red-400 font-mono">
              {{ formatCurrency(reminderStore.agingReport.totalUnpaidReceivables) }}
            </span>
          </div>
          <div class="text-xs text-brand-gray font-mono bg-brand-light dark:bg-white/5 px-4 py-2.5 rounded-xl border border-brand-gray/15">
            عدد العملاء المدينين: <span class="font-bold text-brand-dark dark:text-white text-sm">{{ reminderStore.agingReport.totalDebtorClients }} عميل</span>
          </div>
        </div>

        <!-- 4 Aging Buckets -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Bucket 1: 0-30 days -->
          <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-emerald-500/25 p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
              <div>
                <h4 class="font-bold text-xs text-emerald-700 dark:text-emerald-400">{{ reminderStore.agingReport.Bucket0To30.rangeLabel }}</h4>
                <span class="text-[10px] text-brand-gray">فترة سداد طبيعية</span>
              </div>
              <span class="text-sm font-bold font-mono text-emerald-600">
                {{ formatCurrency(reminderStore.agingReport.Bucket0To30.totalAmount) }}
              </span>
            </div>

            <div v-if="reminderStore.agingReport.Bucket0To30.clients.length === 0" class="text-center py-6 text-brand-gray text-xs">
              لا توجد مديونيات في هذه الفترة
            </div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="c in reminderStore.agingReport.Bucket0To30.clients"
                :key="c.clientId"
                class="p-2.5 rounded-xl bg-brand-light/50 dark:bg-white/5 text-xs flex justify-between items-center"
              >
                <div>
                  <span class="font-bold block text-brand-dark dark:text-white">{{ c.clientName }}</span>
                  <span class="text-[10px] text-brand-gray font-mono">{{ c.ageDays }} يوم</span>
                </div>
                <div class="text-end">
                  <span class="font-mono font-bold text-emerald-600 block">{{ formatCurrency(c.balanceOwed) }}</span>
                  <a :href="`tel:${c.clientPhone}`" class="text-[10px] text-brand-gray font-mono hover:text-brand-accent">
                    {{ c.clientPhone }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Bucket 2: 31-60 days -->
          <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-amber-500/25 p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
              <div>
                <h4 class="font-bold text-xs text-amber-700 dark:text-amber-400">{{ reminderStore.agingReport.Bucket31To60.rangeLabel }}</h4>
                <span class="text-[10px] text-brand-gray">تأخير أولي</span>
              </div>
              <span class="text-sm font-bold font-mono text-amber-600">
                {{ formatCurrency(reminderStore.agingReport.Bucket31To60.totalAmount) }}
              </span>
            </div>

            <div v-if="reminderStore.agingReport.Bucket31To60.clients.length === 0" class="text-center py-6 text-brand-gray text-xs">
              لا توجد مديونيات في هذه الفترة
            </div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="c in reminderStore.agingReport.Bucket31To60.clients"
                :key="c.clientId"
                class="p-2.5 rounded-xl bg-brand-light/50 dark:bg-white/5 text-xs flex justify-between items-center"
              >
                <div>
                  <span class="font-bold block text-brand-dark dark:text-white">{{ c.clientName }}</span>
                  <span class="text-[10px] text-brand-gray font-mono">{{ c.ageDays }} يوم</span>
                </div>
                <div class="text-end">
                  <span class="font-mono font-bold text-amber-600 block">{{ formatCurrency(c.balanceOwed) }}</span>
                  <a :href="`tel:${c.clientPhone}`" class="text-[10px] text-brand-gray font-mono hover:text-brand-accent">
                    {{ c.clientPhone }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Bucket 3: 61-90 days -->
          <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-orange-500/25 p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
              <div>
                <h4 class="font-bold text-xs text-orange-700 dark:text-orange-400">{{ reminderStore.agingReport.Bucket61To90.rangeLabel }}</h4>
                <span class="text-[10px] text-brand-gray">تأخير حرج يحتاج اتصال</span>
              </div>
              <span class="text-sm font-bold font-mono text-orange-600">
                {{ formatCurrency(reminderStore.agingReport.Bucket61To90.totalAmount) }}
              </span>
            </div>

            <div v-if="reminderStore.agingReport.Bucket61To90.clients.length === 0" class="text-center py-6 text-brand-gray text-xs">
              لا توجد مديونيات في هذه الفترة
            </div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="c in reminderStore.agingReport.Bucket61To90.clients"
                :key="c.clientId"
                class="p-2.5 rounded-xl bg-brand-light/50 dark:bg-white/5 text-xs flex justify-between items-center"
              >
                <div>
                  <span class="font-bold block text-brand-dark dark:text-white">{{ c.clientName }}</span>
                  <span class="text-[10px] text-brand-gray font-mono">{{ c.ageDays }} يوم</span>
                </div>
                <div class="text-end">
                  <span class="font-mono font-bold text-orange-600 block">{{ formatCurrency(c.balanceOwed) }}</span>
                  <a :href="`tel:${c.clientPhone}`" class="text-[10px] text-brand-gray font-mono hover:text-brand-accent">
                    {{ c.clientPhone }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Bucket 4: 90+ days -->
          <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-rose-500/30 p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
              <div>
                <h4 class="font-bold text-xs text-rose-700 dark:text-rose-400">{{ reminderStore.agingReport.BucketOver90.rangeLabel }}</h4>
                <span class="text-[10px] text-brand-gray">ديون قديمة متعثرة</span>
              </div>
              <span class="text-sm font-bold font-mono text-rose-600">
                {{ formatCurrency(reminderStore.agingReport.BucketOver90.totalAmount) }}
              </span>
            </div>

            <div v-if="reminderStore.agingReport.BucketOver90.clients.length === 0" class="text-center py-6 text-brand-gray text-xs">
              لا توجد مديونيات في هذه الفترة
            </div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="c in reminderStore.agingReport.BucketOver90.clients"
                :key="c.clientId"
                class="p-2.5 rounded-xl bg-brand-light/50 dark:bg-white/5 text-xs flex justify-between items-center"
              >
                <div>
                  <span class="font-bold block text-brand-dark dark:text-white">{{ c.clientName }}</span>
                  <span class="text-[10px] text-brand-gray font-mono">{{ c.ageDays }} يوم</span>
                </div>
                <div class="text-end">
                  <span class="font-mono font-bold text-rose-600 block">{{ formatCurrency(c.balanceOwed) }}</span>
                  <a :href="`tel:${c.clientPhone}`" class="text-[10px] text-brand-gray font-mono hover:text-brand-accent">
                    {{ c.clientPhone }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Record Contact Outcome Modal (:closeOnBackdrop="false") -->
    <OhdaModal
      :visible="showContactModal"
      @close="showContactModal = false"
      title="تسجيل نتيجة التواصل مع العميل"
      subtitle="تسجيل تفاصيل المكالمة ونتيجة العرض المقدم للصيانة الدورية"
      :icon="PhoneCall"
      max-width="max-w-md"
      :close-on-backdrop="false"
    >
      <form @submit.prevent="submitContact" id="contactForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            العميل والسيارة
          </label>
          <div class="p-3 rounded-xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15">
            <span class="font-bold text-brand-dark dark:text-white block">{{ activeReminder?.clientName }}</span>
            <span class="text-brand-gray font-mono text-[11px] block mt-0.5">{{ activeReminder?.clientPhone }} &bull; {{ activeReminder?.vehiclePlate }}</span>
            <span class="text-brand-accent font-semibold block mt-1">الخدمة: {{ activeReminder?.serviceName }}</span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            نتيجة التواصل <span class="text-red-500">*</span>
          </label>
          <select
            v-model.number="contactForm.outcomeLookupId"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs font-semibold"
          >
            <option :value="null" disabled>-- اختر نتيجة المكالمة --</option>
            <option v-for="val in outcomeLookupValues" :key="val.id" :value="val.id">
              {{ val.labelAr }}
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات المكالمة (اختياري)
          </label>
          <textarea
            v-model="contactForm.notes"
            rows="3"
            placeholder="مثال: يفضل الحضور يوم السبت القادم بعد الظهر..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          ></textarea>
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
          form="contactForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>{{ submitting ? 'جاري الحفظ...' : 'تأكيد وحفظ النتيجة' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Modal 2: Add Follow-up Task Modal (:closeOnBackdrop="false") -->
    <OhdaModal
      :visible="showAddTaskModal"
      @close="showAddTaskModal = false"
      title="إضافة مهمة متابعة جديدة"
      subtitle="جدولة مهمة اتصال أو تذكير لعميل محدد وتعيينها لموظف"
      :icon="CalendarCheck"
      max-width="max-w-md"
      :close-on-backdrop="false"
    >
      <form @submit.prevent="submitTask" id="taskForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            العميل <span class="text-red-500">*</span>
          </label>
          <select
            v-model.number="taskForm.clientId"
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
            عنوان المهمة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="taskForm.title"
            type="text"
            required
            placeholder="مثال: الاتصال لمتابعة صوت الفرامل بعد أسبوع..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs font-semibold"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            تاريخ ووقت المتابعة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="taskForm.dueDateStr"
            type="datetime-local"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs font-mono"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات إضافية (اختياري)
          </label>
          <textarea
            v-model="taskForm.notes"
            rows="2"
            placeholder="أي تفاصيل تفيد الموظف أثناء المتابعة..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-brand-dark dark:text-white focus:border-brand-accent transition-all text-xs"
          ></textarea>
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
          form="taskForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-accent text-brand-dark flex items-center gap-2 cursor-pointer shadow-sm hover:bg-brand-accent/90 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>{{ submitting ? 'جاري الحفظ...' : 'حفظ المهمة' }}</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaReminderStore } from "../stores/useOhdaReminderStore";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaLookupStore } from "../stores/useOhdaLookupStore";
import { useToastStore } from "@/stores/toastStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import searchField from "@/components/searchField.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

import {
  BellRing,
  Wrench,
  CalendarCheck,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Plus,
  Trash2,
  Check,
  User,
  Calendar,
  Save,
  X
} from "lucide-vue-next";

const reminderStore = useOhdaReminderStore();
const clientStore = useOhdaClientStore();
const lookupStore = useOhdaLookupStore();
const toastStore = useToastStore();

const activeTab = ref("services");
const dueFilter = ref("due_or_overdue");
const searchQuery = ref("");

const serviceReminderColumns = [
  { field: "client", header: "العميل", sortable: true, width: "22%" },
  { field: "vehicle", header: "السيارة", width: "16%" },
  { field: "service", header: "الخدمة الدورية", sortable: true, width: "20%" },
  { field: "dueDate", header: "تاريخ الاستحقاق", sortable: true, width: "18%" },
  { field: "status", header: "الحالة", align: "center", width: "12%" },
  { field: "actions", header: "الإجراءات", align: "center", width: "12%" }
];

// Modals State
const showContactModal = ref(false);
const activeReminder = ref(null);
const submitting = ref(false);

const contactForm = ref({
  outcomeLookupId: null,
  notes: ""
});

const showAddTaskModal = ref(false);
const taskForm = ref({
  clientId: null,
  title: "",
  dueDateStr: "",
  notes: ""
});

onMounted(async () => {
  await Promise.all([
    reminderStore.fetchServiceReminders(),
    reminderStore.fetchFollowUpTasks(),
    reminderStore.fetchUnpaidAging(),
    clientStore.fetchClients(),
    lookupStore.fetchLookups()
  ]);
});

const outcomeLookupValues = computed(() => {
  return lookupStore.getValuesByCode("followup_outcome");
});

const filteredReminders = computed(() => {
  let list = reminderStore.serviceReminders || [];

  if (dueFilter.value === "overdue") {
    list = list.filter(r => r.isOverdue && r.status === 1);
  } else if (dueFilter.value === "this_week") {
    list = list.filter(r => !r.isOverdue && r.status === 1 && r.daysRemainingOrOverdue <= 7);
  } else if (dueFilter.value === "due_or_overdue") {
    list = list.filter(r => r.status === 1 && r.daysRemainingOrOverdue <= 7);
  }

  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(r =>
      (r.clientName && r.clientName.toLowerCase().includes(q)) ||
      (r.clientPhone && r.clientPhone.includes(q)) ||
      (r.vehiclePlate && r.vehiclePlate.toLowerCase().includes(q)) ||
      (r.serviceName && r.serviceName.toLowerCase().includes(q))
    );
  }

  return list;
});

function getReminderStatusClass(status, isOverdue) {
  if (status === 1) {
    return isOverdue
      ? "bg-red-500/10 text-red-600 border-red-500/25"
      : "bg-amber-500/10 text-amber-600 border-amber-500/25";
  }
  if (status === 2) return "bg-blue-500/10 text-blue-600 border-blue-500/25";
  if (status === 3) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/25";
  return "bg-slate-500/10 text-slate-500 border-slate-500/25";
}

// Contact Modal
function openContactModal(reminder) {
  activeReminder.value = reminder;
  const firstOutcome = outcomeLookupValues.value[0]?.id || null;
  contactForm.value = {
    outcomeLookupId: firstOutcome,
    notes: ""
  };
  showContactModal.value = true;
}

async function submitContact() {
  if (!activeReminder.value) return;
  submitting.value = true;
  try {
    const res = await reminderStore.recordContact(activeReminder.value.id, {
      contactOutcomeLookupId: contactForm.value.outcomeLookupId,
      contactNotes: contactForm.value.notes,
      status: 2
    });
    if (res.success) {
      toastStore.showToast(res.message, "success");
      showContactModal.value = false;
    } else {
      toastStore.showToast(res.message || "فشل تسجيل التواصل", "error");
    }
  } finally {
    submitting.value = false;
  }
}

async function dismissReminder(id) {
  if (!confirm("هل أنت متأكد من تجاهل هذا التذكير؟")) return;
  const res = await reminderStore.dismissReminder(id);
  if (res.success) {
    toastStore.showToast(res.message, "success");
  } else {
    toastStore.showToast(res.message || "فشل تجاهل التذكير", "error");
  }
}

// Follow-up Tasks
function openAddTaskModal() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  taskForm.value = {
    clientId: clientStore.clients[0]?.id || null,
    title: "",
    dueDateStr: d.toISOString().slice(0, 16),
    notes: ""
  };
  showAddTaskModal.value = true;
}

async function submitTask() {
  if (!taskForm.value.clientId || !taskForm.value.title?.trim()) {
    toastStore.showToast("يرجى اختيار العميل وإدخال عنوان المهمة", "error");
    return;
  }
  submitting.value = true;
  try {
    const res = await reminderStore.createFollowUpTask({
      clientId: taskForm.value.clientId,
      title: taskForm.value.title.trim(),
      dueDate: new Date(taskForm.value.dueDateStr).toISOString(),
      notes: taskForm.value.notes
    });
    if (res.success) {
      toastStore.showToast(res.message, "success");
      showAddTaskModal.value = false;
    } else {
      toastStore.showToast(res.message || "فشل إنشاء المهمة", "error");
    }
  } finally {
    submitting.value = false;
  }
}

async function completeTask(id) {
  const res = await reminderStore.completeTask(id);
  if (res.success) {
    toastStore.showToast(res.message, "success");
  } else {
    toastStore.showToast(res.message || "فشل إكمال المهمة", "error");
  }
}

async function deleteTask(id) {
  if (!confirm("هل تريد حذف هذه المهمة نهائياً؟")) return;
  const res = await reminderStore.deleteTask(id);
  if (res.success) {
    toastStore.showToast(res.message, "success");
  } else {
    toastStore.showToast(res.message || "فشل حذف المهمة", "error");
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
