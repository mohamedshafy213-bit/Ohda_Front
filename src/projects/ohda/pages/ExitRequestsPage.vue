<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <FileText class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.exitRequests.title') }} (مسار الصرف وتوثيق البوصلة)
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          إدارة ومتابعة طلبات صرف العهد والأجهزة عبر مسار الاعتماد المتعدد، وتوثيق استلامها ببوصلة الأجهزة والمخزون.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openCreateModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.exitRequests.createRequest') }}
        </Button>
      </div>
    </div>

    <!-- Top View Switcher Toolbar & Status Tabs -->
    <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-gray/10">
        <!-- View Toggle Buttons -->
        <div class="flex items-center p-1 bg-brand-light rounded-xl border border-brand-gray/15 self-start">
          <button
            type="button"
            @click="currentView = 'table'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            :class="currentView === 'table' ? 'bg-brand-white text-brand-dark shadow-sm border border-brand-gray/15' : 'text-brand-gray hover:text-brand-dark'"
          >
            <List class="w-4 h-4 text-brand-accent" />
            <span>عرض الطلبات (جدول وقوائم)</span>
          </button>
          <button
            type="button"
            @click="currentView = 'calendar'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            :class="currentView === 'calendar' ? 'bg-brand-white text-brand-dark shadow-sm border border-brand-gray/15' : 'text-brand-gray hover:text-brand-dark'"
          >
            <Calendar class="w-4 h-4 text-brand-accent" />
            <span>التقويم الشهري (Calendar)</span>
          </button>
        </div>

        <!-- Date Filter Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-1.5 bg-brand-light/80 p-1 rounded-xl border border-brand-gray/15 text-xs">
            <button
              type="button"
              @click="setDateFilterMode('all')"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
              :class="dateFilterMode === 'all' ? 'bg-brand-white text-brand-dark shadow-xs font-bold' : 'text-brand-gray hover:text-brand-dark'"
            >
              الكل
            </button>
            <button
              type="button"
              @click="setDateFilterMode('single')"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
              :class="dateFilterMode === 'single' ? 'bg-brand-white text-brand-dark shadow-xs font-bold' : 'text-brand-gray hover:text-brand-dark'"
            >
              يوم محدد
            </button>
            <button
              type="button"
              @click="setDateFilterMode('range')"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
              :class="dateFilterMode === 'range' ? 'bg-brand-white text-brand-dark shadow-xs font-bold' : 'text-brand-gray hover:text-brand-dark'"
            >
              فترة زمنية
            </button>
          </div>

          <!-- Single Date Input -->
          <div v-if="dateFilterMode === 'single'" class="flex items-center gap-2">
            <input
              type="date"
              v-model="singleDateFilter"
              class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white text-xs text-brand-dark focus:outline-hidden focus:border-brand-accent font-mono"
            />
          </div>

          <!-- Date Range Inputs -->
          <div v-if="dateFilterMode === 'range'" class="flex items-center gap-2">
            <span class="text-xs text-brand-gray">من:</span>
            <input
              type="date"
              v-model="rangeDateFrom"
              class="px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white text-xs text-brand-dark focus:outline-hidden focus:border-brand-accent font-mono"
            />
            <span class="text-xs text-brand-gray">إلى:</span>
            <input
              type="date"
              v-model="rangeDateTo"
              class="px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white text-xs text-brand-dark focus:outline-hidden focus:border-brand-accent font-mono"
            />
          </div>

          <!-- Clear Date Filter Button -->
          <button
            v-if="dateFilterMode !== 'all' || selectedCalendarDate"
            type="button"
            @click="clearDateFilters"
            class="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="إلغاء تصفية التاريخ وعرض كل الأيام"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>عرض كل الأيام</span>
          </button>
        </div>
      </div>

      <!-- Active Day Filter Notice Banner -->
      <div
        v-if="selectedCalendarDate"
        class="p-3 rounded-xl bg-brand-soft/70 border border-brand-accent/30 flex items-center justify-between text-xs text-brand-dark"
      >
        <div class="flex items-center gap-2 font-bold">
          <Calendar class="w-4 h-4 text-brand-accent" />
          <span>تصفية نشطة لليوم المحدد:</span>
          <span class="font-mono bg-brand-white px-2 py-0.5 rounded border border-brand-gray/20 text-brand-accent">
            {{ formatSelectedDateLabel(selectedCalendarDate) }}
          </span>
          <span class="text-brand-gray font-normal">({{ filteredRequests.length }} طلبات)</span>
        </div>
        <button
          type="button"
          @click="selectedCalendarDate = null"
          class="text-xs text-brand-gray hover:text-red-600 font-bold underline cursor-pointer"
        >
          إلغاء التحديد وعرض كل الأيام
        </button>
      </div>

      <!-- Status Filter Tabs with Dynamic Badges -->
      <div class="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === tab.id
            ? 'bg-brand-dark text-white shadow-sm'
            : 'bg-brand-light text-brand-gray hover:text-brand-dark border border-brand-gray/10'"
        >
          <span v-if="tab.colorHex" class="w-2 h-2 rounded-full" :style="{ backgroundColor: tab.colorHex }"></span>
          <span>{{ tab.name }}</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-brand-gray/15 text-brand-dark'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- VIEW 1: TABLE & DAY-BY-DAY LIST VIEW -->
    <div v-if="currentView === 'table'" class="space-y-6">
      <!-- Table Mode Toolbar (Grouped by Day vs Flat DataTable) -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-xs font-bold text-brand-dark">
          <span>إجمالي الطلبات المعروضة:</span>
          <span class="font-mono px-2 py-0.5 rounded-md bg-brand-accent/20 text-brand-dark font-black">
            {{ filteredRequests.length }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs text-brand-gray select-none cursor-pointer flex items-center gap-1.5">
            <input type="checkbox" v-model="groupByDay" class="rounded text-brand-accent cursor-pointer" />
            <span>تجميع الطلبات يومياً (Day-by-Day)</span>
          </label>
        </div>
      </div>

      <!-- Grouped By Day View -->
      <div v-if="groupByDay && groupedRequestsByDay.length > 0" class="space-y-6">
        <div
          v-for="group in groupedRequestsByDay"
          :key="group.dateKey"
          class="bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden"
        >
          <!-- Date Header Banner -->
          <div class="p-4 bg-gradient-to-r from-brand-light via-brand-white to-transparent border-b border-brand-gray/10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand-soft text-brand-accent flex items-center justify-center font-bold">
                <Calendar class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-brand-dark flex items-center gap-2">
                  <span>{{ group.dayName }}</span>
                  <span class="text-brand-gray font-normal text-xs font-mono">({{ group.dateFormatted }})</span>
                </h3>
                <p class="text-[11px] text-brand-gray mt-0.5">
                  {{ group.requests.length }} طلب صرف مسجل في هذا التاريخ
                </p>
              </div>
            </div>

            <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-gray/10 text-brand-dark">
              {{ group.requests.length }} طلبات
            </span>
          </div>

          <!-- Requests Table for This Day -->
          <DataTable :value="group.requests" class="w-full text-xs">
            <Column field="id" :header="$t('ohda.exitRequests.requestID')" style="width: 80px">
              <template #body="{ data }">
                <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
                  #{{ data.id }}
                </span>
              </template>
            </Column>

            <Column header="الأصناف المطلوبة">
              <template #body="{ data }">
                <div>
                  <div class="font-semibold text-brand-dark">
                    {{ data.items ? data.items.length : 0 }} صنف (أصناف)
                  </div>
                  <div class="text-[10px] text-brand-gray mt-0.5 line-clamp-1">
                    {{ data.items ? data.items.map(i => `${i.productName || 'منتج'} (x${i.quantity})`).join('، ') : '-' }}
                  </div>
                </div>
              </template>
            </Column>

            <Column field="recipientName" :header="$t('ohda.exitRequests.recipientName')">
              <template #body="{ data }">
                <div>
                  <div class="font-semibold text-brand-dark">{{ data.recipientName }}</div>
                  <div class="text-[10px] text-brand-gray">{{ data.departmentName || '-' }}</div>
                </div>
              </template>
            </Column>

            <Column field="requestedByUsername" :header="$t('ohda.exitRequests.requestedBy')">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.requestedByUsername || 'مستخدم' }}</span>
              </template>
            </Column>

            <!-- Dynamic Phase / Step Indicator -->
            <Column header="مرحلة المسار الحالية">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) }"
                  ></span>
                  <span class="font-bold text-[11px] text-brand-dark">
                    {{ getStepTitle(data) }}
                  </span>
                </div>
              </template>
            </Column>

            <!-- Status Badge -->
            <Column :header="$t('ohda.common.status')">
              <template #body="{ data }">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  :style="{
                    backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '15',
                    borderColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '40',
                    color: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed)
                  }"
                  @click="viewDetails(data)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :style="{ backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) }"
                  ></span>
                  {{ getStatusLabel(data) }}
                </span>
              </template>
            </Column>

            <!-- Actions -->
            <Column :header="$t('ohda.common.actions')" class="text-end" style="width: 220px">
              <template #body="{ data }">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Requester Confirm & Release Button (Only when Step 4 is reached and not confirmed) -->
                  <Button
                    v-if="canRequesterConfirm(data)"
                    @click="handleRequesterConfirm(data)"
                    :loading="confirmingId === data.id"
                    class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-lg !px-2.5 !py-1 !text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                    title="تأكيد واستلام العهدة وتوثيقها ببوصلة الأجهزة"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>تأكيد واستلام العهدة</span>
                  </Button>

                  <button
                    type="button"
                    @click="openTimelineModal(data)"
                    class="p-1.5 rounded-lg bg-brand-light hover:bg-brand-gray/15 text-brand-dark text-[11px] font-bold flex items-center gap-1 border border-brand-gray/15 cursor-pointer transition-colors"
                    title="معاينة سجل ومسار الموافقات"
                  >
                    <History class="w-3.5 h-3.5 text-brand-accent" />
                  </button>

                  <Button
                    @click="viewDetails(data)"
                    class="!px-2.5 !py-1 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye class="w-3 h-3 text-brand-accent" />
                    <span>التفاصيل</span>
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Flat Table View -->
      <div v-else class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
        <DataTable
          :value="filteredRequests"
          :dataKey="'id'"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          class="w-full text-xs"
          emptyMessage="لا توجد طلبات صرف مطابقة للشروط أو التصفية الحالية."
        >
          <Column field="id" :header="$t('ohda.exitRequests.requestID')" style="width: 80px">
            <template #body="{ data }">
              <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
                #{{ data.id }}
              </span>
            </template>
          </Column>

          <Column header="تاريخ الطلب" style="width: 130px">
            <template #body="{ data }">
              <div class="font-mono text-brand-dark text-xs font-semibold">{{ formatDateShort(data.insertDate) }}</div>
              <div class="text-[10px] text-brand-gray">{{ formatTime(data.insertDate) }}</div>
            </template>
          </Column>

          <Column header="الأصناف المطلوبة">
            <template #body="{ data }">
              <div>
                <div class="font-semibold text-brand-dark">
                  {{ data.items ? data.items.length : 0 }} صنف (أصناف)
                </div>
                <div class="text-[10px] text-brand-gray mt-0.5 line-clamp-1">
                  {{ data.items ? data.items.map(i => `${i.productName || 'منتج'} (x${i.quantity})`).join('، ') : '-' }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="recipientName" :header="$t('ohda.exitRequests.recipientName')">
            <template #body="{ data }">
              <div>
                <div class="font-semibold text-brand-dark">{{ data.recipientName }}</div>
                <div class="text-[10px] text-brand-gray">{{ data.departmentName || '-' }}</div>
              </div>
            </template>
          </Column>

          <Column field="requestedByUsername" :header="$t('ohda.exitRequests.requestedBy')">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.requestedByUsername || 'مستخدم' }}</span>
            </template>
          </Column>

          <!-- Current Step Phase Badge -->
          <Column header="المرحلة والمسار">
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) }"
                ></span>
                <span class="font-bold text-[11px] text-brand-dark">
                  {{ getStepTitle(data) }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Status Badge -->
          <Column :header="$t('ohda.common.status')">
            <template #body="{ data }">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                :style="{
                  backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '15',
                  borderColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '40',
                  color: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed)
                }"
                @click="viewDetails(data)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :style="{ backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) }"
                ></span>
                {{ getStatusLabel(data) }}
              </span>
              <p v-if="data.status === 4 && data.rejectionReason" class="text-[10px] text-red-500 mt-1 italic max-w-xs">
                السبب: {{ data.rejectionReason }}
              </p>
            </template>
          </Column>

          <!-- Actions Column -->
          <Column :header="$t('ohda.common.actions')" class="text-end" style="width: 220px">
            <template #body="{ data }">
              <div class="flex items-center justify-end gap-1.5">
                <!-- Requester Confirm & Release Button -->
                <Button
                  v-if="canRequesterConfirm(data)"
                  @click="handleRequesterConfirm(data)"
                  :loading="confirmingId === data.id"
                  class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-lg !px-2.5 !py-1 !text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                  title="تأكيد واستلام العهدة وتوثيقها ببوصلة الأجهزة"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>تأكيد واستلام</span>
                </Button>

                <button
                  type="button"
                  @click="openTimelineModal(data)"
                  class="p-1.5 rounded-lg bg-brand-light hover:bg-brand-gray/15 text-brand-dark text-[11px] font-bold flex items-center gap-1 border border-brand-gray/15 cursor-pointer transition-colors"
                  title="معاينة سجل ومسار الموافقات"
                >
                  <History class="w-3.5 h-3.5 text-brand-accent" />
                </button>

                <Button
                  @click="viewDetails(data)"
                  class="!px-2.5 !py-1 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye class="w-3 h-3 text-brand-accent" />
                  <span>التفاصيل</span>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- VIEW 2: INTERACTIVE MONTHLY CALENDAR VIEW -->
    <div v-else class="space-y-6">
      <div class="bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-6">
        <!-- Calendar Navigation Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-gray/10">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-brand-soft text-brand-accent flex items-center justify-center font-bold">
              <Calendar class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-brand-dark">
                تقويم طلبات الصرف: <span class="text-brand-accent">{{ currentMonthLabel }}</span>
              </h2>
              <p class="text-xs text-brand-gray mt-0.5">
                توزيع الطلبات حسب أيام الشهر مع تمييز مراحل الصرف بالألوان المعتمدة. اضغط على أي يوم للتصفية.
              </p>
            </div>
          </div>

          <!-- Prev, Today, Next buttons -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="goToPrevMonth"
              class="p-2 rounded-xl bg-brand-light hover:bg-brand-gray/15 text-brand-dark border border-brand-gray/15 cursor-pointer transition-colors"
              title="الشهر السابق"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="goToTodayMonth"
              class="px-3.5 py-1.5 rounded-xl bg-brand-light hover:bg-brand-gray/15 text-brand-dark text-xs font-bold border border-brand-gray/15 cursor-pointer transition-colors"
            >
              اليوم الحاضر
            </button>
            <button
              type="button"
              @click="goToNextMonth"
              class="p-2 rounded-xl bg-brand-light hover:bg-brand-gray/15 text-brand-dark border border-brand-gray/15 cursor-pointer transition-colors"
              title="الشهر التالي"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Calendar Grid (7 Columns) -->
        <div class="overflow-x-auto">
          <div class="min-w-[700px]">
            <!-- Day of Week Headers -->
            <div class="grid grid-cols-7 gap-2 text-center mb-2">
              <div
                v-for="dayName in weekDaysArabic"
                :key="dayName"
                class="py-2 text-xs font-bold text-brand-gray bg-brand-light/60 rounded-xl"
              >
                {{ dayName }}
              </div>
            </div>

            <!-- Days Grid Cells -->
            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="cell in calendarDays"
                :key="cell.dateKey"
                @click="onCalendarCellClick(cell)"
                class="min-h-[95px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group"
                :class="[
                  cell.isCurrentMonth ? 'bg-brand-white hover:border-brand-accent hover:shadow-sm' : 'bg-brand-light/30 opacity-40',
                  cell.isToday ? 'ring-2 ring-brand-accent/50 border-brand-accent' : 'border-brand-gray/15',
                  selectedCalendarDate === cell.dateKey ? 'bg-brand-soft/60 border-brand-accent shadow-md ring-2 ring-brand-accent' : ''
                ]"
              >
                <!-- Day Number & Today Tag -->
                <div class="flex items-center justify-between">
                  <span
                    class="font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    :class="cell.isToday ? 'bg-brand-accent text-brand-dark font-black' : 'text-brand-dark group-hover:text-brand-accent'"
                  >
                    {{ cell.dayNumber }}
                  </span>
                  <span v-if="cell.isToday" class="text-[9px] font-bold text-brand-accent">اليوم</span>
                  <span v-if="cell.requests.length > 0" class="text-[10px] font-bold text-brand-gray font-mono">
                    {{ cell.requests.length }} طلب
                  </span>
                </div>

                <!-- Colored Request Mini Badges inside the day cell -->
                <div v-if="cell.requests.length > 0" class="space-y-1 mt-1">
                  <div
                    v-for="(count, statusKey) in getCellStatusSummary(cell.requests)"
                    :key="statusKey"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center justify-between text-white truncate shadow-2xs"
                    :style="{ backgroundColor: getSummaryColor(statusKey) }"
                  >
                    <span class="truncate">{{ getSummaryLabel(statusKey) }}</span>
                    <span class="font-mono font-black ms-1">{{ count }}</span>
                  </div>
                </div>

                <div v-else class="text-[10px] text-brand-gray/30 text-center py-1">
                  -
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Color Legend below the calendar -->
        <div class="pt-4 border-t border-brand-gray/10 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-brand-dark">
            <Sparkles class="w-4 h-4 text-brand-accent" />
            <span>دليل ودلالات الألوان المعتمدة في النظام (Legend):</span>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs">
            <!-- Step 1 Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-light border border-brand-gray/15">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStepColor(1, 1, false) }"></span>
              <span class="font-bold text-brand-dark">مرحلة 1: تقديم الطلب (بانتظار المراجعة)</span>
            </div>

            <!-- Step 2 Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-light border border-brand-gray/15">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStepColor(2, 3, false) }"></span>
              <span class="font-bold text-brand-dark">مرحلة 2: تدقيق وموافقة المدير</span>
            </div>

            <!-- Step 3 Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-light border border-brand-gray/15">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStepColor(3, 2, false) }"></span>
              <span class="font-bold text-brand-dark">مرحلة 3: اعتماد نهائي (بانتظار تأكيد المستلم)</span>
            </div>

            <!-- Completed & Confirmed Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">
              <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span class="font-bold">مكتمل وموثق ببوصلة الأجهزة</span>
            </div>

            <!-- Refused Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700">
              <span class="w-3 h-3 rounded-full bg-red-600"></span>
              <span class="font-bold">طلب مرفوض</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests filtered by the clicked calendar cell -->
      <div v-if="selectedCalendarDate" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm text-brand-dark flex items-center gap-2">
            <List class="w-4 h-4 text-brand-accent" />
            <span>طلبات يوم {{ formatSelectedDateLabel(selectedCalendarDate) }}:</span>
          </h3>
          <button
            type="button"
            @click="selectedCalendarDate = null"
            class="text-xs text-brand-gray hover:text-brand-dark font-bold underline cursor-pointer"
          >
            إغلاق تصفية اليوم
          </button>
        </div>

        <DataTable :value="filteredRequests" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm text-xs">
          <Column field="id" :header="$t('ohda.exitRequests.requestID')" style="width: 80px">
            <template #body="{ data }">
              <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
                #{{ data.id }}
              </span>
            </template>
          </Column>

          <Column header="الأصناف">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.items?.length || 0 }} أصناف</span>
            </template>
          </Column>

          <Column field="recipientName" :header="$t('ohda.exitRequests.recipientName')"></Column>
          <Column field="departmentName" header="القسم"></Column>
          <Column field="requestedByUsername" :header="$t('ohda.exitRequests.requestedBy')"></Column>

          <Column header="حالة الطلب">
            <template #body="{ data }">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :style="{
                  backgroundColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '15',
                  borderColor: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed) + '40',
                  color: getStepColor(data.currentStep || data.status, data.status, data.isRequesterConfirmed)
                }"
              >
                {{ getStatusLabel(data) }}
              </span>
            </template>
          </Column>

          <Column header="الإجراءات" class="text-end">
            <template #body="{ data }">
              <div class="flex items-center justify-end gap-2">
                <Button
                  v-if="canRequesterConfirm(data)"
                  @click="handleRequesterConfirm(data)"
                  class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-lg !px-2.5 !py-1 !text-[11px]"
                >
                  تأكيد واستلام
                </Button>
                <Button @click="viewDetails(data)" class="!px-2.5 !py-1 !bg-brand-light !text-brand-dark !rounded-lg !text-[11px]">
                  التفاصيل
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- MODAL 1: CREATE EXIT REQUEST (Preserved with all features) -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.exitRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-4xl w-full !text-brand-dark" @hide="stopScanner">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs" @keydown.enter.prevent="">
        <!-- Left Column: Form & Items Table -->
        <div class="lg:col-span-8 space-y-4">
          <div class="grid grid-cols-3 gap-3 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientName') }} *</label>
              <InputText v-model="createForm.recipientName" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أحمد محمود" />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientDepartment') }} *</label>
              <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent" placeholder="حدد قسم العمل" required />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">الغرض من الصرف *</label>
              <InputText v-model="createForm.purpose" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="تسليم عهدة موظف جديد" />
            </div>
          </div>

          <!-- Direct Execution Toggle Option -->
          <div
            class="p-3.5 rounded-xl border flex items-center justify-between transition-all"
            :class="createForm.autoApprove ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20' : 'bg-brand-light border-brand-gray/15'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="createForm.autoApprove ? 'bg-amber-600 text-white shadow-sm' : 'bg-brand-gray/15 text-brand-gray'"
              >
                <Zap class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-brand-dark flex items-center gap-2">
                  <span>صرف مباشر وفوري (اعتماد تلقائي وتوثيق مباشر بالبوصلة)</span>
                  <span v-if="createForm.autoApprove" class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-700">
                    مباشر وفوري
                  </span>
                </div>
                <p class="text-[11px] text-brand-gray mt-0.5 leading-relaxed">
                  خصم الكميات من المخزون والأرفف فور إنشاء الطلب وتوثيقه كعهدة منصرفة في البوصلة دون الحاجة لدورة موافقة.
                </p>
              </div>
            </div>
            <ToggleSwitch v-model="createForm.autoApprove" />
          </div>

          <!-- Added Items List Table -->
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark">أصناف الطلب المضافة:</span>
              <span class="text-brand-accent font-bold font-mono">{{ createForm.items.length }} أصناف</span>
            </div>
            
            <DataTable :value="createForm.items" class="text-xs" emptyMessage="لا توجد أصناف مضافة حالياً. استخدم المسح أو الاختيار اليدوي لإضافة أصناف.">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark">{{ data.quantity }}</span>
                </template>
              </Column>
              <Column header="الأرقام التسلسلية المحددة">
                <template #body="{ data }">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span v-for="snId in getSerialsForProduct(data.productId)" :key="snId" class="px-1.5 py-0.5 bg-brand-soft text-brand-accent text-[9px] font-mono rounded border border-brand-accent/10 flex items-center gap-1">
                      {{ getSerialNoById(snId) }}
                      <X class="w-2.5 h-2.5 cursor-pointer text-red-500 hover:text-red-700" @click="removeSerialSelection(snId)" />
                    </span>
                    <span v-if="getSerialsForProduct(data.productId).length === 0" class="text-brand-gray italic text-[10px]">
                      توزيع تلقائي (بدون سيريالات محددة)
                    </span>
                  </div>
                </template>
              </Column>
              <Column header="إجراء">
                <template #body="{ index }">
                  <Button @click="removeRequestItem(index)" class="!p-1.5 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border-0 !rounded-lg">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Dialog Form Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
            <SecondaryButton type="button" @click="showCreateModal = false">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button @click="handleCreateExit" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
              {{ $t('ohda.exitRequests.createRequest') }}
            </Button>
          </div>
        </div>

        <!-- Right Column: Barcode Scan & Manual Selector -->
        <div class="lg:col-span-4 space-y-4 border-r lg:border-r border-brand-gray/10 lg:pr-4">
          <!-- Hardware Barcode Reader -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-2">
            <span class="font-bold text-brand-dark flex items-center gap-2">
              <QrCode class="w-4 h-4 text-brand-accent" />
              القارئ اليدوي (Barcode Reader)
            </span>
            <InputText
              v-model="hardwareScanText"
              @keydown.enter.prevent="handleHardwareScan"
              placeholder="اضغط هنا ثم امسح الباركود..."
              class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono"
            />
            <p class="text-[10px] text-brand-gray">
              قم بالتركيز على هذا الحقل ثم امسح باركود الجهاز أو رقم السيريال بالقارئ اليدوي.
            </p>
          </div>

          <!-- Continuous Scanner Card -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-dark flex items-center gap-2">
                <Camera class="w-4 h-4 text-brand-accent" />
                ماسح الباركود / QR المستمر
              </span>
              <button
                type="button"
                @click="toggleScanner"
                class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                :class="isScanning ? 'bg-red-500 text-white' : 'bg-brand-accent text-brand-dark'"
              >
                {{ isScanning ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا' }}
              </button>
            </div>

            <div v-if="scanFeedback" class="p-2 text-center text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-lg animate-pulse">
              {{ scanFeedback }}
            </div>

            <div v-show="isScanning" id="exit-qr-reader" class="rounded-xl overflow-hidden border border-brand-gray/20 bg-black aspect-square max-w-[240px] mx-auto shadow-md"></div>
          </div>

          <!-- Manual Selection Form -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <span class="font-bold text-brand-dark block">إضافة صنف يدوياً</span>
            <div>
              <label class="block text-brand-gray mb-1">اختر الصنف من الكتالوج</label>
              <Select v-model="manualItem.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-white" placeholder="حدد المنتج" />
            </div>

            <div v-if="manualItem.productId" class="space-y-2 pt-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-semibold text-brand-dark">حدد الأرقام التسلسلية:</span>
                <span class="text-brand-accent font-bold font-mono">{{ manualItem.selectedSerials.length }} محدد</span>
              </div>

              <div v-if="loadingSerials" class="text-center py-2 text-[10px] text-brand-gray">
                جاري تحميل السيريالات...
              </div>
              <div v-else-if="availableSerials.length === 0" class="p-2 text-center text-[10px] text-amber-700 bg-amber-500/10 rounded-lg">
                لا توجد أجهزة متوفرة بسيريال محدد. سيتم التوزيع تلقائياً.
              </div>
              <div v-else class="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto border border-brand-gray/20 p-2 rounded-lg bg-white">
                <label
                  v-for="s in availableSerials"
                  :key="s.id"
                  class="flex items-center gap-2 p-1 border border-brand-gray/10 rounded font-mono text-[9px] select-none cursor-pointer"
                  :class="manualItem.selectedSerials.includes(s.id) ? 'bg-brand-soft text-brand-dark' : 'text-brand-gray'"
                >
                  <input type="checkbox" :value="s.id" v-model="manualItem.selectedSerials" class="rounded text-brand-accent" />
                  <span class="font-semibold truncate">{{ s.serialNumber }}</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-brand-gray mb-1">الكمية</label>
                <InputNumber v-model="manualItem.quantity" class="w-full" :min="1" />
              </div>
              <div class="flex items-end">
                <Button @click="addManualItem" class="!w-full !bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                  إضافة للطلب
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- MODAL 2: REQUEST DETAILS & PARTIAL APPROVAL -->
    <Dialog v-model:visible="showDetailsModal" modal :header="`تفاصيل طلب الصرف #${selectedRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-3xl w-full !text-brand-dark">
      <div v-if="selectedRequest" class="space-y-6 text-xs">
        <!-- Header Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block mb-0.5">اسم المستلم</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.recipientName }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">{{ $t('ohda.exitRequests.recipientDepartment') }}</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.departmentName || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">الغرض من الصرف</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.purpose }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">أنشئ بواسطة</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.requestedByUsername || 'مستخدم' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">تاريخ الطلب</span>
            <span class="font-bold text-brand-dark font-mono">{{ formatDate(selectedRequest.insertDate) }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">توثيق البوصلة</span>
            <span class="font-bold" :class="selectedRequest.isRequesterConfirmed ? 'text-emerald-600' : 'text-amber-600'">
              {{ selectedRequest.isRequesterConfirmed ? 'تم التوثيق والاستلام' : 'بانتظار تأكيد المستلم' }}
            </span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="space-y-2">
          <span class="font-bold text-brand-dark block text-sm">أصناف وعناصر طلب الصرف:</span>
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden">
            <DataTable :value="selectedRequest.items" class="text-xs">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="productSKU" header="SKU" class="font-mono"></Column>
              <Column header="مكان التخزين (الرف)">
                <template #body="{ data }">
                  <span v-if="data.binCode" class="px-2 py-0.5 rounded-lg bg-brand-soft text-brand-accent font-mono font-bold text-[10px] border border-brand-accent/30 inline-flex items-center gap-1">
                    <Layers class="w-3 h-3" />
                    {{ data.binCode }}
                  </span>
                  <span v-else class="text-brand-gray text-[10px]">-</span>
                </template>
              </Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark text-sm">{{ data.quantity }}</span>
                </template>
              </Column>
              <Column header="حالة العنصر">
                <template #body="{ data }">
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-bold border inline-block" :class="getItemStatusClass(data.status)">
                    {{ getItemStatusLabel(data.status) }}
                  </span>
                </template>
              </Column>

              <!-- Partial Approval Action Columns -->
              <Column v-if="canReviewSelectedRequest" header="قرار الاعتماد (جزئي)">
                <template #body="{ data }">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      @click="toggleItemDecision(data.id, 5)"
                      class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                      :class="getItemDecision(data.id) === 5 ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'bg-brand-light text-brand-gray border border-brand-gray/10 hover:text-brand-dark'"
                    >
                      موافق
                    </button>
                    <button
                      type="button"
                      @click="toggleItemDecision(data.id, 4)"
                      class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                      :class="getItemDecision(data.id) === 4 ? 'bg-red-500/10 text-red-600 border border-red-500/30' : 'bg-brand-light text-brand-gray border border-brand-gray/10 hover:text-brand-dark'"
                    >
                      مرفوض
                    </button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <!-- Rejection Reason input (When reviewing) -->
        <div v-if="canReviewSelectedRequest" class="space-y-2">
          <label class="block font-semibold text-brand-dark">سبب الرفض (إلزامي في حال رفض أي صنف أو رفض كلي):</label>
          <Textarea v-model="rejectionReason" rows="2" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أدخل سبب الرفض بالتفصيل هنا..." />
        </div>

        <!-- Dialog Footer Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-brand-gray/10">
          <div class="flex items-center gap-2">
            <span class="text-xs text-brand-gray">حالة الطلب:</span>
            <span
              class="px-2.5 py-0.5 rounded font-bold border inline-block text-[10px]"
              :style="{
                backgroundColor: getStepColor(selectedRequest.currentStep || selectedRequest.status, selectedRequest.status, selectedRequest.isRequesterConfirmed) + '15',
                borderColor: getStepColor(selectedRequest.currentStep || selectedRequest.status, selectedRequest.status, selectedRequest.isRequesterConfirmed) + '40',
                color: getStepColor(selectedRequest.currentStep || selectedRequest.status, selectedRequest.status, selectedRequest.isRequesterConfirmed)
              }"
            >
              {{ getStatusLabel(selectedRequest) }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <SecondaryButton type="button" @click="showDetailsModal = false">
              إغلاق
            </SecondaryButton>

            <!-- Requester Confirmation Button in Details Modal -->
            <template v-if="canRequesterConfirm(selectedRequest)">
              <Button
                @click="handleRequesterConfirm(selectedRequest)"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 class="w-4 h-4" />
                تأكيد واستلام العهدة وتوثيقها بالبوصلة
              </Button>
            </template>

            <!-- 1-Step Direct Final Approval -->
            <template v-if="selectedRequest.status === 1 && (canApproveAsSupervisor || authStore.isAdmin)">
              <Button
                @click="directSingleStepApproval"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold flex items-center gap-1.5 shadow-sm"
                title="اعتماد نهائي وصرف مباشر للأصناف فوراً دون الحاجة لمراجعة إدارية"
              >
                <CheckCheck class="w-4 h-4" />
                اعتماد نهائي وصرف مباشر (خطوة واحدة)
              </Button>
            </template>

            <!-- Manager Stage Approvals -->
            <template v-if="selectedRequest.status === 1 && canApproveAsManager">
              <Button @click="submitApprovalDecisions(true)" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                تقديم قرارات المدير
              </Button>
              <Button @click="rejectEntireRequest" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
                رفض كلي للطلب
              </Button>
            </template>

            <!-- Supervisor Stage Approvals -->
            <template v-if="selectedRequest.status === 3 && canApproveAsSupervisor">
              <Button @click="submitApprovalDecisions(false)" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                توثيق واعتماد المشرف النهائي
              </Button>
              <Button @click="rejectEntireRequest" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
                رفض كلي للطلب
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- MODAL 3: APPROVAL TIMELINE / AUDIT TRAIL HISTORY MODAL -->
    <Dialog v-model:visible="showTimelineModal" modal :header="`سجل ومسار موافقات الطلب #${timelineRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <div v-if="timelineRequest" class="space-y-4 text-xs pt-2">
        <div class="p-3 bg-brand-light/60 rounded-xl border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray block">المستلم والمستودع:</span>
            <span class="font-bold text-xs text-brand-dark">{{ timelineRequest.recipientName }} ({{ timelineRequest.departmentName || '-' }})</span>
          </div>
          <div>
            <span class="text-[10px] text-brand-gray block text-end">تاريخ الإنشاء:</span>
            <span class="font-bold text-xs text-brand-dark font-mono">{{ formatDateShort(timelineRequest.insertDate) }}</span>
          </div>
        </div>

        <!-- Vertical Stepper Timeline -->
        <div class="space-y-4 relative py-2 pr-4 border-r-2 border-brand-gray/20 mr-2">
          <div
            v-for="(item, idx) in parsedApprovalTrail"
            :key="idx"
            class="relative flex items-start gap-3"
          >
            <!-- Step Bullet Icon -->
            <div
              class="absolute -right-[23px] w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm"
              :style="{ backgroundColor: getTrailBulletColor(item.action) }"
            >
              <Check v-if="item.action === 'Approved' || item.action === 'Confirmed'" class="w-3.5 h-3.5" />
              <X v-else-if="item.action === 'Rejected'" class="w-3.5 h-3.5" />
              <Clock v-else class="w-3.5 h-3.5" />
            </div>

            <!-- Content Card -->
            <div class="flex-1 p-3 rounded-xl bg-brand-light/40 border border-brand-gray/15 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-brand-dark">
                  {{ item.stepName || `الخطوة ${item.stepOrder}` }}
                </span>
                <span class="font-mono text-[10px] text-brand-gray">
                  {{ formatDate(item.date) }}
                </span>
              </div>

              <div class="text-[11px] text-brand-gray flex items-center gap-1.5">
                <span class="font-semibold text-brand-dark">{{ item.userName || `User #${item.userId}` }}</span>
                <span>•</span>
                <span class="font-bold" :style="{ color: getTrailBulletColor(item.action) }">
                  {{ getTrailActionLabel(item.action) }}
                </span>
              </div>

              <p v-if="item.notes" class="text-[10px] text-brand-gray mt-1 p-1.5 rounded bg-brand-white border border-brand-gray/10 italic">
                "{{ item.notes }}"
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showTimelineModal = false">
            إغلاق السجل
          </SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  FileText,
  Plus,
  Eye,
  Zap,
  CheckCheck,
  CheckCircle2,
  Trash2,
  X,
  QrCode,
  Camera,
  Layers,
  List,
  Calendar,
  RotateCcw,
  History,
  Check,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from "lucide-vue-next";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet } from "@/utilities/fetchApi";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const binStore = useOhdaWarehouseBinStore();
const requestsStore = useOhdaRequestsStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

// View and filter states
const currentView = ref("table"); // 'table' | 'calendar'
const activeTab = ref("all");
const groupByDay = ref(true);
const dateFilterMode = ref("all"); // 'all' | 'single' | 'range'
const singleDateFilter = ref("");
const rangeDateFrom = ref("");
const rangeDateTo = ref("");
const selectedCalendarDate = ref(null); // 'YYYY-MM-DD'

// Modals
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const showTimelineModal = ref(false);
const selectedRequest = ref(null);
const timelineRequest = ref(null);
const rejectionReason = ref("");
const itemDecisions = ref({});
const confirmingId = ref(null);
const isSubmitting = ref(false);

// Auxiliary lists
const availableSerials = ref([]);
const loadingSerials = ref(false);
const departments = ref([]);
const allInStockSerials = ref([]);
const exitSteps = ref([]);

// Scanner
const html5Qrcode = ref(null);
const isScanning = ref(false);
const scanFeedback = ref("");
const lastScanned = ref({ code: "", time: 0 });
const hardwareScanText = ref("");

// Calendar Navigation
const calendarCurrentDate = ref(new Date());

const weekDaysArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

let pollInterval = null;

onMounted(async () => {
  loadExitStepsFromStorage();
  await Promise.all([
    requestsStore.fetchExitRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    loadDepartments(),
    loadAllInStockSerials()
  ]);

  pollInterval = setInterval(async () => {
    if (document.visibilityState === "visible") {
      await requestsStore.fetchExitRequests({ silent: true });
    }
  }, 30000);
});

onUnmounted(async () => {
  if (pollInterval) clearInterval(pollInterval);
  await stopScanner();
});

function loadExitStepsFromStorage() {
  try {
    const saved = localStorage.getItem("ohda_workflow_steps_exit_v2");
    if (saved) {
      exitSteps.value = JSON.parse(saved);
    } else {
      exitSteps.value = [
        { id: "step_exit_1", role: 1, colorHex: "#3B82F6", name: "مقدم الطلب" },
        { id: "step_exit_2", role: 2, colorHex: "#F59E0B", name: "مراجعة وتدقيق المدير" },
        { id: "step_exit_3", role: 3, colorHex: "#10B981", name: "الاعتماد النهائي للمشرف" }
      ];
    }
  } catch (_) {}
}

async function loadDepartments() {
  try {
    const d = await apiGet('/api/Department');
    departments.value = d?.data?.objects || d?.data?.singleObject || [];
  } catch (e) {
    console.warn('Departments load failed', e);
  }
}

async function loadAllInStockSerials() {
  allInStockSerials.value = [];
  try {
    const res = await apiGet('/api/ProductItem/instock');
    const items = res?.data?.objects || (res?.data?.singleObject ? [res.data.singleObject] : []);
    if (res?.data?.isDone && items.length > 0) {
      allInStockSerials.value = items.map(item => ({
        id: item.id,
        productId: item.productId,
        serialNumber: item.serialNumber,
        qrCode: item.qrCode
      }));
    }
  } catch (err) {
    console.warn("Serials bulk load failed", err);
  }
}

// Dynamic Step Colors & Titles
function getStepColor(stepOrder, status, isRequesterConfirmed = false) {
  if (status === 4) return "#EF4444"; // Rejected
  if (isRequesterConfirmed || (status === 2 && isRequesterConfirmed)) return "#059669"; // Completed & Confirmed
  const step = exitSteps.value.find(s => s.role === stepOrder || s.id === `step_exit_${stepOrder}`);
  if (step?.colorHex) return step.colorHex;
  if (stepOrder === 1) return "#3B82F6";
  if (stepOrder === 2) return "#F59E0B";
  if (stepOrder === 3) return "#10B981";
  return "#6366F1";
}

function getStepTitle(request) {
  if (request.status === 4) return "مرفوض";
  if (request.isRequesterConfirmed) return "مكتمل وموثق بالبوصلة";
  if (request.status === 2 || request.currentStep === 4) return "بانتظار تأكيد واستلام المستلم";
  if (request.status === 3 || request.currentStep === 3) return "بانتظار الاعتماد النهائي";
  return "بانتظار مراجعة وتدقيق المدير";
}

function getStatusLabel(request) {
  if (request.status === 4) return "مرفوض";
  if (request.isRequesterConfirmed) return "تم الاستلام وتوثيق البوصلة";
  if (request.status === 2 || request.currentStep === 4) return "معتمد بالكامل (جاهز للصرف)";
  if (request.status === 3) return "موافقة المدير (مرحلة 2)";
  if (request.status === 1) return "قيد الانتظار (مرحلة 1)";
  return "غير معروف";
}

// Requester Confirmation Authority
function canRequesterConfirm(request) {
  if (!request) return false;
  if (request.isRequesterConfirmed || request.status === 4) return false;
  // Request is fully approved (status 2 or 3) and reached Step 4
  const isApproved = request.status === 2 || request.currentStep === 4;
  if (!isApproved) return false;

  const currentUserId = authStore.user?.militaryNumber || authStore.user?.id;
  const currentUsername = authStore.user?.username?.toLowerCase();
  const isRequester = (currentUserId && request.requestedByUserId === currentUserId) ||
                      (currentUsername && request.requestedByUsername?.toLowerCase() === currentUsername);
  return isRequester || authStore.isAdmin || authStore.isSuperAdmin;
}

async function handleRequesterConfirm(request) {
  if (confirmingId.value) return;
  if (!confirm(`هل أنت متأكد من تأكيد استلام عهدة الطلب #${request.id} وتوثيقها ببوصلة الأجهزة والمخزون؟`)) return;

  confirmingId.value = request.id;
  try {
    const res = await requestsStore.requesterConfirmExit(request.id);
    if (res.success) {
      if (showDetailsModal.value && selectedRequest.value?.id === request.id) {
        selectedRequest.value.isRequesterConfirmed = true;
        selectedRequest.value.status = 2;
      }
      alert(res.message || "تم تأكيد الاستلام وصرف العهدة وتوثيقها في البوصلة بنجاح!");
    } else {
      alert(res.message || "فشل تأكيد الاستلام");
    }
  } finally {
    confirmingId.value = null;
  }
}

// Status Tabs Definition
const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.exitRequests.length },
  { id: "pending", name: "المرحلة 1 (تقديم)", count: requestsStore.exitRequests.filter(r => r.status === 1).length, colorHex: "#3B82F6" },
  { id: "managerApproved", name: "المرحلة 2 (موافقة المدير)", count: requestsStore.exitRequests.filter(r => r.status === 3).length, colorHex: "#F59E0B" },
  { id: "readyConfirm", name: "بانتظار تأكيد المستلم", count: requestsStore.exitRequests.filter(r => (r.status === 2 || r.currentStep === 4) && !r.isRequesterConfirmed).length, colorHex: "#10B981" },
  { id: "confirmed", name: "موثق بالبوصلة (مكتمل)", count: requestsStore.exitRequests.filter(r => r.isRequesterConfirmed).length, colorHex: "#059669" },
  { id: "rejected", name: "مرفوض", count: requestsStore.exitRequests.filter(r => r.status === 4).length, colorHex: "#EF4444" }
]);

// Filtered Requests based on Tab + Date Selection
const filteredRequests = computed(() => {
  let list = requestsStore.exitRequests;

  // 1. Tab Filter
  if (activeTab.value === "pending") list = list.filter(r => r.status === 1);
  else if (activeTab.value === "managerApproved") list = list.filter(r => r.status === 3);
  else if (activeTab.value === "readyConfirm") list = list.filter(r => (r.status === 2 || r.currentStep === 4) && !r.isRequesterConfirmed);
  else if (activeTab.value === "confirmed") list = list.filter(r => r.isRequesterConfirmed);
  else if (activeTab.value === "rejected") list = list.filter(r => r.status === 4);

  // 2. Calendar Specific Day Filter
  if (selectedCalendarDate.value) {
    list = list.filter(r => {
      if (!r.insertDate) return false;
      return r.insertDate.slice(0, 10) === selectedCalendarDate.value;
    });
    return list;
  }

  // 3. Date Mode Filters
  if (dateFilterMode.value === "single" && singleDateFilter.value) {
    list = list.filter(r => r.insertDate && r.insertDate.slice(0, 10) === singleDateFilter.value);
  } else if (dateFilterMode.value === "range") {
    if (rangeDateFrom.value) {
      list = list.filter(r => r.insertDate && r.insertDate.slice(0, 10) >= rangeDateFrom.value);
    }
    if (rangeDateTo.value) {
      list = list.filter(r => r.insertDate && r.insertDate.slice(0, 10) <= rangeDateTo.value);
    }
  }

  return list;
});

// Grouped Requests Day-by-Day
const groupedRequestsByDay = computed(() => {
  const groupsMap = {};
  filteredRequests.value.forEach(req => {
    const key = req.insertDate ? req.insertDate.slice(0, 10) : "غير محدد";
    if (!groupsMap[key]) {
      groupsMap[key] = [];
    }
    groupsMap[key].push(req);
  });

  const sortedKeys = Object.keys(groupsMap).sort((a, b) => b.localeCompare(a));
  return sortedKeys.map(key => {
    const d = key !== "غير محدد" ? new Date(key) : null;
    const dayName = d ? d.toLocaleDateString("ar-SA", { weekday: "long" }) : "تاريخ غير محدد";
    const dateFormatted = d ? d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : key;
    return {
      dateKey: key,
      dayName,
      dateFormatted,
      requests: groupsMap[key]
    };
  });
});

// Calendar Calculations
const currentMonthLabel = computed(() => {
  return calendarCurrentDate.value.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
});

function goToPrevMonth() {
  const d = new Date(calendarCurrentDate.value);
  d.setMonth(d.getMonth() - 1);
  calendarCurrentDate.value = d;
}

function goToNextMonth() {
  const d = new Date(calendarCurrentDate.value);
  d.setMonth(d.getMonth() + 1);
  calendarCurrentDate.value = d;
}

function goToTodayMonth() {
  calendarCurrentDate.value = new Date();
  selectedCalendarDate.value = new Date().toISOString().slice(0, 10);
}

const calendarDays = computed(() => {
  const date = calendarCurrentDate.value;
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const totalDays = lastDayOfMonth.getDate();

  const todayStr = new Date().toISOString().slice(0, 10);
  const days = [];

  // Previous month overflow days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const pDate = new Date(year, month - 1, dayNum);
    const dateKey = pDate.toISOString().slice(0, 10);
    days.push({
      dateKey,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateKey === todayStr,
      requests: getRequestsForDate(dateKey)
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const cDate = new Date(year, month, i);
    const dateKey = cDate.toISOString().slice(0, 10);
    days.push({
      dateKey,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateKey === todayStr,
      requests: getRequestsForDate(dateKey)
    });
  }

  // Next month overflow days (fill grid up to multiple of 7)
  const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
  for (let i = 1; i <= remaining; i++) {
    const nDate = new Date(year, month + 1, i);
    const dateKey = nDate.toISOString().slice(0, 10);
    days.push({
      dateKey,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateKey === todayStr,
      requests: getRequestsForDate(dateKey)
    });
  }

  return days;
});

function getRequestsForDate(dateKey) {
  return requestsStore.exitRequests.filter(r => r.insertDate && r.insertDate.slice(0, 10) === dateKey);
}

function onCalendarCellClick(cell) {
  if (cell.requests.length === 0) {
    selectedCalendarDate.value = cell.dateKey;
    return;
  }
  selectedCalendarDate.value = cell.dateKey;
}

function setDateFilterMode(mode) {
  dateFilterMode.value = mode;
  selectedCalendarDate.value = null;
  if (mode === "single" && !singleDateFilter.value) {
    singleDateFilter.value = new Date().toISOString().slice(0, 10);
  }
}

function clearDateFilters() {
  dateFilterMode.value = "all";
  singleDateFilter.value = "";
  rangeDateFrom.value = "";
  rangeDateTo.value = "";
  selectedCalendarDate.value = null;
}

function getCellStatusSummary(requests) {
  const summary = {};
  requests.forEach(r => {
    let key = "pending";
    if (r.status === 4) key = "rejected";
    else if (r.isRequesterConfirmed) key = "confirmed";
    else if (r.status === 2 || r.currentStep === 4) key = "readyConfirm";
    else if (r.status === 3) key = "managerApproved";

    summary[key] = (summary[key] || 0) + 1;
  });
  return summary;
}

function getSummaryColor(key) {
  if (key === "rejected") return "#EF4444";
  if (key === "confirmed") return "#059669";
  if (key === "readyConfirm") return "#10B981";
  if (key === "managerApproved") return "#F59E0B";
  return "#3B82F6";
}

function getSummaryLabel(key) {
  if (key === "rejected") return "مرفوض";
  if (key === "confirmed") return "موثق";
  if (key === "readyConfirm") return "جاهز للاستلام";
  if (key === "managerApproved") return "موافقة المدير";
  return "مرحلة 1";
}

// Approval Trail parsing & timeline
const parsedApprovalTrail = computed(() => {
  if (!timelineRequest.value) return [];
  const trailStr = timelineRequest.value.approvalTrail;
  if (!trailStr) {
    // Fallback synthesized trail
    return [
      {
        stepOrder: 1,
        stepName: "تقديم الطلب",
        action: "Created",
        userName: timelineRequest.value.requestedByUsername || "مقدم الطلب",
        date: timelineRequest.value.insertDate,
        notes: timelineRequest.value.purpose
      }
    ];
  }
  try {
    return JSON.parse(trailStr);
  } catch (_) {
    return [];
  }
});

function openTimelineModal(request) {
  timelineRequest.value = request;
  showTimelineModal.value = true;
}

function getTrailBulletColor(action) {
  if (action === "Approved" || action === "Confirmed") return "#10B981";
  if (action === "Rejected") return "#EF4444";
  return "#3B82F6";
}

function getTrailActionLabel(action) {
  if (action === "Created") return "إنشاء وتقديم الطلب";
  if (action === "Approved") return "تم الاعتماد والموافقة";
  if (action === "Rejected") return "تم رفض الطلب";
  if (action === "Confirmed") return "تم تأكيد الاستلام وتوثيق البوصلة";
  return action;
}

// Creation & Scanner Handling
const createForm = ref({
  recipientName: "",
  purpose: "",
  departmentId: null,
  items: [],
  selectedProductItemIds: [],
  autoApprove: false
});

const manualItem = ref({
  productId: null,
  quantity: 1,
  selectedSerials: []
});

watch(() => manualItem.value.productId, async (newVal) => {
  manualItem.value.selectedSerials = [];
  manualItem.value.quantity = 1;
  availableSerials.value = [];
  if (!newVal) return;

  loadingSerials.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/product/${newVal}/instock`);
    if (res?.data?.isDone) {
      availableSerials.value = res.data.objects || (res.data.singleObject ? [res.data.singleObject] : []) || [];
    }
  } catch (err) {
    console.error("Error loading serials", err);
  } finally {
    loadingSerials.value = false;
  }
});

watch(() => manualItem.value.selectedSerials, (newSerials) => {
  if (newSerials.length > 0) {
    manualItem.value.quantity = newSerials.length;
  }
}, { deep: true });

function getSerialsForProduct(productId) {
  return createForm.value.selectedProductItemIds.filter(snId => {
    const sn = allInStockSerials.value.find(s => s.id === snId);
    return sn && sn.productId === productId;
  });
}

function getSerialNoById(id) {
  const sn = allInStockSerials.value.find(s => s.id === id);
  return sn ? sn.serialNumber : `#${id}`;
}

function removeSerialSelection(id) {
  createForm.value.selectedProductItemIds = createForm.value.selectedProductItemIds.filter(snId => snId !== id);
  const serialObj = allInStockSerials.value.find(s => s.id === id);
  if (serialObj) {
    const item = createForm.value.items.find(i => i.productId === serialObj.productId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - 1);
      if (item.quantity === 0) {
        createForm.value.items = createForm.value.items.filter(i => i.productId !== serialObj.productId);
      }
    }
  }
}

function openCreateModal() {
  const isFlowDisabled = localStorage.getItem("ohda_approval_flow_enabled_exit") === "false";
  createForm.value = {
    recipientName: "",
    purpose: "",
    departmentId: null,
    items: [],
    selectedProductItemIds: [],
    autoApprove: isFlowDisabled
  };
  manualItem.value = {
    productId: null,
    quantity: 1,
    selectedSerials: []
  };
  showCreateModal.value = true;
}

const toggleScanner = async () => {
  if (isScanning.value) {
    await stopScanner();
  } else {
    await startScanner();
  }
};

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
};

const startScanner = async () => {
  isScanning.value = true;
  scanFeedback.value = "جاري تشغيل الكاميرا...";
  setTimeout(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5Qrcode.value = new Html5Qrcode("exit-qr-reader");
      await html5Qrcode.value.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => { onCodeScanned(decodedText); },
        () => {}
      );
      scanFeedback.value = "الماسح جاهز! وجه العدسة نحو الباركود";
    } catch (err) {
      console.error("Camera start failed", err);
      scanFeedback.value = "خطأ: فشل تشغيل الكاميرا";
      isScanning.value = false;
    }
  }, 150);
};

const stopScanner = async () => {
  if (html5Qrcode.value) {
    try {
      if (html5Qrcode.value.isScanning) {
        await html5Qrcode.value.stop();
      }
    } catch (_) {}
    html5Qrcode.value = null;
  }
  isScanning.value = false;
  scanFeedback.value = "";
};

async function handleHardwareScan() {
  const code = hardwareScanText.value.trim();
  if (!code) return;

  let matchedSerial = allInStockSerials.value.find(s => s.serialNumber.toLowerCase() === code.toLowerCase());
  if (matchedSerial) {
    if (!createForm.value.selectedProductItemIds.includes(matchedSerial.id)) {
      createForm.value.selectedProductItemIds.push(matchedSerial.id);
      const existing = createForm.value.items.find(i => i.productId === matchedSerial.productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        const prod = inventoryStore.products.find(p => p.id === matchedSerial.productId);
        createForm.value.items.push({
          productId: matchedSerial.productId,
          productName: prod ? prod.name : "منتج",
          quantity: 1,
          notes: "تم الإضافة بالماسح"
        });
      }
      playBeep();
    }
  } else {
    const product = inventoryStore.products.find(
      p => p.barcode?.toLowerCase() === code.toLowerCase() || p.sku?.toLowerCase() === code.toLowerCase()
    );
    if (product) {
      manualItem.value.productId = product.id;
      playBeep();
    } else {
      alert(`الرمز "${code}" غير مطابق لمنتج أو رقم تسلسلي متاح!`);
    }
  }
  hardwareScanText.value = "";
}

const onCodeScanned = (decodedText) => {
  const now = Date.now();
  if (lastScanned.value.code === decodedText && now - lastScanned.value.time < 1200) return;
  lastScanned.value = { code: decodedText, time: now };
  playBeep();

  const product = inventoryStore.products.find(p => p.barcode === decodedText || p.sku === decodedText);
  if (product) {
    const existing = createForm.value.items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      createForm.value.items.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        notes: "مضاف بالمسح الضوئي"
      });
    }
    scanFeedback.value = `تمت إضافة: ${product.name} (+1)`;
    return;
  }

  const serialMatch = allInStockSerials.value.find(s => s.serialNumber === decodedText || s.qrCode === decodedText);
  if (serialMatch) {
    if (createForm.value.selectedProductItemIds.includes(serialMatch.id)) {
      scanFeedback.value = `تنبيه: الرقم التسلسلي ${decodedText} محدد بالفعل!`;
      return;
    }
    const prod = inventoryStore.products.find(p => p.id === serialMatch.productId);
    if (prod) {
      createForm.value.selectedProductItemIds.push(serialMatch.id);
      const existing = createForm.value.items.find(i => i.productId === prod.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        createForm.value.items.push({
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          notes: `سريال: ${decodedText}`
        });
      }
      scanFeedback.value = `سريال محدد: ${decodedText} (${prod.name})`;
    }
    return;
  }

  scanFeedback.value = `الرمز "${decodedText}" غير مطابق لمنتج أو سريال!`;
};

function addManualItem() {
  if (!manualItem.value.productId) {
    alert("يرجى اختيار الصنف أولاً!");
    return;
  }
  const product = inventoryStore.products.find(p => p.id === manualItem.value.productId);
  if (!product) return;

  const requested = manualItem.value.quantity;
  const existing = createForm.value.items.find(i => i.productId === product.id);
  if (existing) {
    existing.quantity += requested;
  } else {
    createForm.value.items.push({
      productId: product.id,
      productName: product.name,
      quantity: requested,
      notes: "إدخال يدوي"
    });
  }

  if (manualItem.value.selectedSerials.length > 0) {
    manualItem.value.selectedSerials.forEach(snId => {
      if (!createForm.value.selectedProductItemIds.includes(snId)) {
        createForm.value.selectedProductItemIds.push(snId);
      }
    });
  }

  manualItem.value = {
    productId: null,
    quantity: 1,
    selectedSerials: []
  };
}

function removeRequestItem(index) {
  const item = createForm.value.items[index];
  if (item) {
    const serialIdsToRemove = getSerialsForProduct(item.productId);
    createForm.value.selectedProductItemIds = createForm.value.selectedProductItemIds.filter(
      id => !serialIdsToRemove.includes(id)
    );
  }
  createForm.value.items.splice(index, 1);
}

async function handleCreateExit() {
  if (isSubmitting.value) return;
  if (createForm.value.items.length === 0) {
    alert("يرجى إضافة صنف واحد على الأقل للمتابعة.");
    return;
  }
  if (!createForm.value.recipientName || !createForm.value.departmentId || !createForm.value.purpose) {
    alert("يرجى ملء جميع الحقول الإلزامية.");
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await requestsStore.createExitRequest(createForm.value, authStore.user);
    if (result.success) {
      showCreateModal.value = false;
      await stopScanner();
      await requestsStore.fetchExitRequests();
      await loadAllInStockSerials();
      if (createForm.value.autoApprove) {
        alert("تم إنشاء طلب الصرف وصرفه وتوثيق العهدة بالبوصلة بنجاح ومباشرة!");
      }
    } else {
      alert(result.message || "فشل إنشاء طلب الصرف");
    }
  } finally {
    isSubmitting.value = false;
  }
}

// View Details & Decisions
async function viewDetails(request) {
  try {
    const res = await apiGet(`/api/ProductExitRequest/${request.id}`);
    if (res?.data?.isDone && res.data.singleObject) {
      selectedRequest.value = res.data.singleObject;
    } else {
      selectedRequest.value = request;
    }
  } catch (_) {
    selectedRequest.value = request;
  }

  rejectionReason.value = "";
  itemDecisions.value = {};
  if (selectedRequest.value.items) {
    selectedRequest.value.items.forEach(i => {
      itemDecisions.value[i.id] = i.status === 4 ? 4 : 5;
    });
  }

  showDetailsModal.value = true;
}

const canReviewSelectedRequest = computed(() => {
  if (!selectedRequest.value) return false;
  if (selectedRequest.value.status === 1 && (canApproveAsManager.value || canApproveAsSupervisor.value || authStore.isAdmin)) return true;
  if (selectedRequest.value.status === 3 && canApproveAsSupervisor.value) return true;
  return false;
});

async function directSingleStepApproval() {
  if (isSubmitting.value) return;
  if (!confirm("هل تريد اعتماد هذا الطلب وصرفه نهائياً في خطوة واحدة؟")) return;

  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key] || 5
  }));

  isSubmitting.value = true;
  try {
    const result = await requestsStore.supervisorApproveExit(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    if (result.success) {
      showDetailsModal.value = false;
      await Promise.all([
        requestsStore.fetchExitRequests(),
        inventoryStore.fetchProducts(),
        loadAllInStockSerials()
      ]);
    } else {
      alert(result.message || "فشل الاعتماد المباشر للطلب.");
    }
  } finally {
    isSubmitting.value = false;
  }
}

function toggleItemDecision(itemId, status) {
  itemDecisions.value[itemId] = status;
}

function getItemDecision(itemId) {
  return itemDecisions.value[itemId] || 5;
}

async function submitApprovalDecisions(isManager) {
  if (isSubmitting.value) return;
  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key]
  }));

  const anyRejected = itemsPayload.some(i => i.status === 4);
  if (anyRejected && !rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض لوجود أصناف مرفوضة.");
    return;
  }

  isSubmitting.value = true;
  try {
    let result;
    if (isManager) {
      result = await requestsStore.managerApproveExit(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    } else {
      result = await requestsStore.supervisorApproveExit(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    }

    if (result.success) {
      showDetailsModal.value = false;
      await Promise.all([
        requestsStore.fetchExitRequests(),
        inventoryStore.fetchProducts(),
        loadAllInStockSerials()
      ]);
    } else {
      alert(result.message || "فشل تقديم قرارات الاعتماد.");
    }
  } finally {
    isSubmitting.value = false;
  }
}

async function rejectEntireRequest() {
  if (isSubmitting.value) return;
  if (!rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض أولاً.");
    return;
  }
  isSubmitting.value = true;
  try {
    const result = await requestsStore.rejectExitRequest(selectedRequest.value.id, rejectionReason.value, authStore.user);
    if (result.success) {
      showDetailsModal.value = false;
      await requestsStore.fetchExitRequests();
    } else {
      alert(result.message || "فشل رفض الطلب");
    }
  } finally {
    isSubmitting.value = false;
  }
}

function getItemStatusClass(status) {
  if (status === 1) return "bg-brand-light text-brand-gray border-brand-gray/10";
  if (status === 5) return "bg-brand-soft text-brand-accent border-brand-accent/15";
  if (status === 4) return "bg-red-500/10 text-red-600 border-red-500/15";
  return "bg-brand-light text-brand-gray";
}

function getItemStatusLabel(status) {
  if (status === 1) return "قيد الانتظار";
  if (status === 5) return "تمت الموافقة";
  if (status === 4) return "مرفوض";
  return "غير معروف";
}

function formatDate(dStr) {
  if (!dStr) return "-";
  try {
    const d = new Date(dStr);
    return d.toLocaleString("ar-SA", { hour12: true });
  } catch (_) {
    return dStr;
  }
}

function formatDateShort(dStr) {
  if (!dStr) return "-";
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  } catch (_) {
    return dStr;
  }
}

function formatTime(dStr) {
  if (!dStr) return "";
  try {
    const d = new Date(dStr);
    return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch (_) {
    return "";
  }
}

function formatSelectedDateLabel(dateKey) {
  if (!dateKey) return "";
  try {
    const d = new Date(dateKey);
    return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch (_) {
    return dateKey;
  }
}

const canApproveAsManager = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 3);
});
</script>

<style scoped>
#exit-qr-reader {
  width: 100% !important;
}
#exit-qr-reader video {
  object-fit: cover !important;
}
</style>
