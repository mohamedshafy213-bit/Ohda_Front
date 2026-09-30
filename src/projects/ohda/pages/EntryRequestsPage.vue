<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Download class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.entryRequests.title') }} (مسار التوريد وتسكين المستودع)
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          إدارة وتدقيق طلبات إدخال وتوريد المنتجات والأجهزة، وتوثيق استلامها ببوصلة المخزون والمستودع.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openCreateModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          {{ $t('ohda.entryRequests.createRequest') }}
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
      <!-- Table Mode Toolbar -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-xs font-bold text-brand-dark">
          <span>إجمالي طلبات التوريد المعروضة:</span>
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
                  {{ group.requests.length }} طلب توريد مسجل في هذا التاريخ
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

            <Column header="الأصناف الموردة">
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

            <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.fromSource }}</span>
              </template>
            </Column>

            <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')">
              <template #body="{ data }">
                <span class="font-mono text-brand-dark">{{ data.invoiceNumber || '-' }}</span>
              </template>
            </Column>

            <Column field="receivedByUsername" :header="'استلم بواسطة'">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.receivedByUsername || 'مستخدم' }}</span>
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
                    title="تأكيد استلام وتسكين التوريد وتوثيقه ببوصلة المخزون"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>تأكيد وتسكين</span>
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
          emptyMessage="لا توجد طلبات توريد مطابقة للشروط أو التصفية الحالية."
        >
          <Column field="id" :header="$t('ohda.exitRequests.requestID')" style="width: 80px">
            <template #body="{ data }">
              <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
                #{{ data.id }}
              </span>
            </template>
          </Column>

          <Column header="تاريخ التوريد" style="width: 130px">
            <template #body="{ data }">
              <div class="font-mono text-brand-dark text-xs font-semibold">{{ formatDateShort(data.insertDate) }}</div>
              <div class="text-[10px] text-brand-gray">{{ formatTime(data.insertDate) }}</div>
            </template>
          </Column>

          <Column header="الأصناف الموردة">
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

          <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.fromSource }}</span>
            </template>
          </Column>

          <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')">
            <template #body="{ data }">
              <span class="font-mono text-brand-dark">{{ data.invoiceNumber || '-' }}</span>
            </template>
          </Column>

          <Column field="receivedByUsername" :header="'استلم بواسطة'">
            <template #body="{ data }">
              <span class="font-semibold text-brand-dark">{{ data.receivedByUsername || 'مستخدم' }}</span>
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
                  title="تأكيد استلام وتسكين التوريد وتوثيقه ببوصلة المخزون"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>تأكيد وتسكين</span>
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
                تقويم طلبات التوريد: <span class="text-brand-accent">{{ currentMonthLabel }}</span>
              </h2>
              <p class="text-xs text-brand-gray mt-0.5">
                توزيع شحنات وتوريدات المخزن حسب أيام الشهر مع تمييز مراحل الاعتماد والتسكين بالألوان.
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
              <span class="font-bold text-brand-dark">مرحلة 1: تقديم الطلب والتوريد</span>
            </div>

            <!-- Step 2 Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-light border border-brand-gray/15">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStepColor(2, 3, false) }"></span>
              <span class="font-bold text-brand-dark">مرحلة 2: الفحص والمراجعة الإدارية</span>
            </div>

            <!-- Step 3 Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-light border border-brand-gray/15">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStepColor(3, 2, false) }"></span>
              <span class="font-bold text-brand-dark">مرحلة 3: الاعتماد النهائي (بانتظار تأكيد التسكين)</span>
            </div>

            <!-- Completed & Confirmed Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">
              <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span class="font-bold">مكتمل ومسكن ببوصلة المخزون</span>
            </div>

            <!-- Refused Legend -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700">
              <span class="w-3 h-3 rounded-full bg-red-600"></span>
              <span class="font-bold">طلب توريد مرفوض</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests filtered by the clicked calendar cell -->
      <div v-if="selectedCalendarDate" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm text-brand-dark flex items-center gap-2">
            <List class="w-4 h-4 text-brand-accent" />
            <span>شحنات وتوريدات يوم {{ formatSelectedDateLabel(selectedCalendarDate) }}:</span>
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

          <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')"></Column>
          <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')"></Column>
          <Column field="receivedByUsername" header="استلم بواسطة"></Column>

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
                  تأكيد وتسكين
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

    <!-- MODAL 1: CREATE ENTRY REQUEST (Preserved with all features) -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.entryRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-4xl w-full !text-brand-dark" @hide="stopScanner">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs" @keydown.enter.prevent="">
        <!-- Left Column: Form & Items Table -->
        <div class="lg:col-span-8 space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">مصدر التوريد / اسم المسترجع *</label>
              <InputText v-model="createForm.fromSource" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="اسم المورد أو الشخص المرجع" />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark mb-1">القسم المسترجع منه (اختياري)</label>
              <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" showClear class="w-full !bg-brand-white" placeholder="حدد القسم (اختياري)" />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark mb-1">رقم الفاتورة / المستند (اختياري)</label>
              <InputText v-model="createForm.invoiceNumber" class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" placeholder="يولد تلقائياً إذا ترك فارغاً" />
            </div>

            <div class="sm:col-span-2">
              <label class="block font-semibold text-brand-dark mb-1">سند الصرف الأصلي (في حال إرجاع عهدة سابقة)</label>
              <Select
                v-model="selectedExitRequestId"
                :options="availableExitRequests"
                optionValue="id"
                showClear
                class="w-full !bg-brand-white"
                placeholder="اختر سند الصرف لتحميل الأجهزة المنصرفة (اختياري)"
              >
                <template #option="slotProps">
                  <span class="text-xs">سند صرف #{{ slotProps.option.id }} - المستلم: {{ slotProps.option.recipientName }} ({{ formatDate(slotProps.option.insertDate) }})</span>
                </template>
                <template #value="slotProps">
                  <span class="text-xs font-bold text-brand-dark" v-if="slotProps.value">سند صرف #{{ slotProps.value }}</span>
                  <span class="text-xs text-brand-gray" v-else>اختر سند الصرف لتحميل الأجهزة المنصرفة (اختياري)</span>
                </template>
              </Select>
            </div>

            <div class="sm:col-span-1">
              <label class="block font-semibold text-brand-dark mb-1">الملاحظات</label>
              <InputText v-model="createForm.notes" class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="ملاحظات حول التوريد" />
            </div>
          </div>

          <!-- Direct Execution Toggle Option -->
          <div
            class="p-3.5 rounded-xl border flex items-center justify-between transition-all"
            :class="createForm.autoApprove ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-brand-light border-brand-gray/15'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="createForm.autoApprove ? 'bg-blue-600 text-white shadow-sm' : 'bg-brand-gray/15 text-brand-gray'"
              >
                <Zap class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-brand-dark flex items-center gap-2">
                  <span>توريد مباشر وفوري (اعتماد وتسكين تلقائي بالمستودع)</span>
                  <span v-if="createForm.autoApprove" class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-700">
                    مباشر وفوري
                  </span>
                </div>
                <p class="text-[11px] text-brand-gray mt-0.5 leading-relaxed">
                  إضافة الكميات مباشرة لرصيد المخزن والأرفف فور إنشاء الطلب وتوثيقه بالبوصلة دون الحاجة لدورة موافقة.
                </p>
              </div>
            </div>
            <ToggleSwitch v-model="createForm.autoApprove" />
          </div>

          <!-- Department Custody Items -->
          <div v-if="selectedExitRequestId" class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark">أجهزة العهدة المنصرفة بالسند المحدد:</span>
              <span class="text-brand-accent font-bold font-mono">{{ departmentItems.length }} أجهزة عهدة</span>
            </div>

            <DataTable :value="departmentItems" class="text-xs" emptyMessage="لا توجد أجهزة منصرفة كعهدة لهذا السند حالياً.">
              <Column field="serialNumber" header="الرقم التسلسلي">
                <template #body="{ data }">
                  <span class="font-mono font-bold text-brand-accent text-xs">{{ data.serialNumber }}</span>
                </template>
              </Column>
              <Column field="productName" header="اسم الجهاز"></Column>
              <Column header="إجراء">
                <template #body="{ data }">
                  <button
                    type="button"
                    @click="toggleDeptSerial(data)"
                    class="px-3 py-1 rounded-xl font-bold cursor-pointer transition-all border text-[10px]"
                    :class="selectedDeptSerials.includes(data.serialNumber) ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-brand-soft text-brand-accent border-brand-accent/25'"
                  >
                    {{ selectedDeptSerials.includes(data.serialNumber) ? 'إلغاء الإرجاع' : 'إرجاع للمستودع' }}
                  </button>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Added Items List Table -->
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark">أصناف التوريد المضافة:</span>
              <span class="text-brand-accent font-bold font-mono">{{ createForm.items.length }} أصناف</span>
            </div>
            
            <DataTable :value="createForm.items" class="text-xs" emptyMessage="لا توجد أصناف مضافة حالياً. استخدم المسح الضوئي أو الاختيار اليدوي لإضافة أصناف.">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="quantity" header="الكمية الموردة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark">{{ data.quantity }}</span>
                </template>
              </Column>
              <Column header="حالة الصنف (اختياري)">
                <template #body="{ data }">
                  <div class="flex items-center gap-1.5 min-w-[170px]">
                    <Select
                      v-model="data.productStateId"
                      :options="productStates"
                      optionLabel="name"
                      optionValue="id"
                      showClear
                      placeholder="سليم / افتراضي"
                      class="w-full !text-[11px] !bg-brand-white !py-1 !border-brand-gray/25"
                      @change="(e) => onRowStateChange(data, e.value)"
                    />
                  </div>
                </template>
              </Column>
              <Column header="رف التخزين (اختياري)">
                <template #body="{ data }">
                  <Select
                    v-model="data.binId"
                    :options="warehouseBins"
                    optionLabel="code"
                    optionValue="id"
                    showClear
                    placeholder="اختر الرف"
                    class="w-full !text-[11px] !bg-brand-white !py-1 !border-brand-gray/25 min-w-[140px]"
                  >
                    <template #option="slotProps">
                      <span class="text-xs font-mono font-bold">{{ slotProps.option.code }}</span>
                      <span class="text-[10px] text-brand-gray ms-1">({{ slotProps.option.name }})</span>
                    </template>
                  </Select>
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
            <Button @click="handleCreateEntry" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
              {{ $t('ohda.entryRequests.createRequest') }}
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

            <div v-show="isScanning" id="entry-qr-reader" class="rounded-xl overflow-hidden border border-brand-gray/20 bg-black aspect-square max-w-[240px] mx-auto shadow-md"></div>
          </div>

          <!-- Manual Selection Form -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <span class="font-bold text-brand-dark block">إضافة صنف يدوياً</span>
            <div>
              <label class="block text-brand-gray mb-1">اختر الصنف من الكتالوج</label>
              <Select v-model="manualItem.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-white" placeholder="حدد المنتج" />
            </div>

            <div>
              <label class="text-brand-gray font-semibold mb-1 block">حالة المنتج (اختياري)</label>
              <Select
                v-model="manualItem.productStateId"
                :options="productStates"
                optionLabel="name"
                optionValue="id"
                showClear
                class="w-full !bg-white"
                placeholder="سليم / افتراضي (اختياري)"
              />
            </div>

            <div>
              <label class="text-brand-gray font-semibold mb-1 block">رف التخزين (اختياري)</label>
              <Select
                v-model="manualItem.binId"
                :options="warehouseBins"
                optionLabel="code"
                optionValue="id"
                showClear
                class="w-full !bg-white"
                placeholder="حدد الرف بالمستودع (اختياري)"
              >
                <template #option="slotProps">
                  <span class="text-xs font-mono font-bold">{{ slotProps.option.code }}</span>
                  <span class="text-[10px] text-brand-gray ms-1">({{ slotProps.option.name }})</span>
                </template>
              </Select>
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
    <Dialog v-model:visible="showDetailsModal" modal :header="`تفاصيل طلب التوريد #${selectedRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-3xl w-full !text-brand-dark">
      <div v-if="selectedRequest" class="space-y-6 text-xs">
        <!-- Header Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block mb-0.5">مصدر التوريد</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.fromSource }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">رقم الفاتورة</span>
            <span class="font-bold text-brand-dark font-mono">{{ selectedRequest.invoiceNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">القسم المستلم</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.departmentName || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">الملاحظات</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.notes || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">استلم بواسطة</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.receivedByUsername || 'مستخدم' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">تاريخ التوريد</span>
            <span class="font-bold text-brand-dark font-mono">{{ formatDate(selectedRequest.insertDate) }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">توثيق البوصلة</span>
            <span class="font-bold" :class="selectedRequest.isRequesterConfirmed ? 'text-emerald-600' : 'text-amber-600'">
              {{ selectedRequest.isRequesterConfirmed ? 'تم التوثيق والتسكين' : 'بانتظار تأكيد المستلم' }}
            </span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="space-y-2">
          <span class="font-bold text-brand-dark block text-sm">أصناف وعناصر طلب التوريد:</span>
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden">
            <DataTable :value="selectedRequest.items" class="text-xs">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="productSKU" header="SKU" class="font-mono"></Column>
              <Column field="productStateName" header="حالة المنتج"></Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-accent text-sm">+{{ data.quantity }}</span>
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
                تأكيد واستلام وتسكين بالمستودع والبوصلة
              </Button>
            </template>

            <!-- 1-Step Direct Final Approval -->
            <template v-if="selectedRequest.status === 1 && (canApproveAsSupervisor || authStore.isAdmin)">
              <Button
                @click="directSingleStepEntryApproval"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold flex items-center gap-1.5 shadow-sm"
                title="اعتماد نهائي وتسكين مباشر للأصناف بالمستودع فوراً دون الحاجة لمراجعة إدارية"
              >
                <CheckCheck class="w-4 h-4" />
                اعتماد نهائي وتسكين مباشر (خطوة واحدة)
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
    <Dialog v-model:visible="showTimelineModal" modal :header="`سجل ومسار موافقات التوريد #${timelineRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <div v-if="timelineRequest" class="space-y-4 text-xs pt-2">
        <div class="p-3 bg-brand-light/60 rounded-xl border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray block">مصدر التوريد:</span>
            <span class="font-bold text-xs text-brand-dark">{{ timelineRequest.fromSource }} ({{ timelineRequest.invoiceNumber || '-' }})</span>
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
  Download,
  Plus,
  Eye,
  Zap,
  CheckCheck,
  CheckCircle2,
  Trash2,
  QrCode,
  Camera,
  List,
  Calendar,
  RotateCcw,
  History,
  Check,
  X,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from "lucide-vue-next";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet } from "@/utilities/fetchApi";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
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
const departments = ref([]);
const productStates = ref([]);
const warehouseBins = ref([]);
const entrySteps = ref([]);
const departmentItems = ref([]);
const loadingDeptItems = ref(false);
const selectedDeptSerials = ref([]);
const selectedExitRequestId = ref(null);

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
  loadEntryStepsFromStorage();
  await Promise.all([
    requestsStore.fetchEntryRequests(),
    requestsStore.fetchExitRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    loadDepartments(),
    loadProductStates(),
    loadWarehouseBins()
  ]);

  pollInterval = setInterval(async () => {
    if (document.visibilityState === "visible") {
      await requestsStore.fetchEntryRequests({ silent: true });
    }
  }, 30000);
});

onUnmounted(async () => {
  if (pollInterval) clearInterval(pollInterval);
  await stopScanner();
});

function loadEntryStepsFromStorage() {
  try {
    const saved = localStorage.getItem("ohda_workflow_steps_entry_v2");
    if (saved) {
      entrySteps.value = JSON.parse(saved);
    } else {
      entrySteps.value = [
        { id: "step_entry_1", role: 1, colorHex: "#3B82F6", name: "مقدم الطلب والتوريد" },
        { id: "step_entry_2", role: 2, colorHex: "#F59E0B", name: "المراجعة والفحص الفني" },
        { id: "step_entry_3", role: 3, colorHex: "#10B981", name: "الاعتماد النهائي والتسكين" }
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

async function loadProductStates() {
  try {
    const s = await apiGet('/api/ProductState');
    productStates.value = s?.data?.objects || s?.data?.singleObject || [];
  } catch (e) {
    console.warn('ProductStates load failed', e);
  }
}

async function loadWarehouseBins() {
  try {
    const res = await apiGet('/api/WarehouseBin/list');
    warehouseBins.value = res?.data?.singleObject || res?.data?.objects || [];
  } catch (e) {
    console.warn('WarehouseBins load failed', e);
  }
}

// Dynamic Step Colors & Titles
function getStepColor(stepOrder, status, isRequesterConfirmed = false) {
  if (status === 4) return "#EF4444"; // Rejected
  if (isRequesterConfirmed || (status === 2 && isRequesterConfirmed)) return "#059669"; // Completed & Confirmed
  const step = entrySteps.value.find(s => s.role === stepOrder || s.id === `step_entry_${stepOrder}`);
  if (step?.colorHex) return step.colorHex;
  if (stepOrder === 1) return "#3B82F6";
  if (stepOrder === 2) return "#F59E0B";
  if (stepOrder === 3) return "#10B981";
  return "#6366F1";
}

function getStepTitle(request) {
  if (request.status === 4) return "مرفوض";
  if (request.isRequesterConfirmed) return "مكتمل ومسكن بالبوصلة";
  if (request.status === 2 || request.currentStep === 4) return "بانتظار تأكيد واستلام المستلم";
  if (request.status === 3 || request.currentStep === 3) return "بانتظار الاعتماد النهائي";
  return "بانتظار مراجعة وتدقيق المدير";
}

function getStatusLabel(request) {
  if (request.status === 4) return "مرفوض";
  if (request.isRequesterConfirmed) return "تم الاستلام وتسكين المخزون";
  if (request.status === 2 || request.currentStep === 4) return "معتمد بالكامل (جاهز للتسكين)";
  if (request.status === 3) return "موافقة المدير (مرحلة 2)";
  if (request.status === 1) return "قيد الانتظار (مرحلة 1)";
  return "غير معروف";
}

// Requester Confirmation Authority
function canRequesterConfirm(request) {
  if (!request) return false;
  if (request.isRequesterConfirmed || request.status === 4) return false;
  const isApproved = request.status === 2 || request.currentStep === 4;
  if (!isApproved) return false;

  const currentUserId = authStore.user?.militaryNumber || authStore.user?.id;
  const currentUsername = authStore.user?.username?.toLowerCase();
  const isRequester = (currentUserId && (request.receivedByUserId === currentUserId || request.requestedByUserId === currentUserId)) ||
                      (currentUsername && (request.receivedByUsername?.toLowerCase() === currentUsername || request.requestedByUsername?.toLowerCase() === currentUsername));
  return isRequester || authStore.isAdmin || authStore.isSuperAdmin;
}

async function handleRequesterConfirm(request) {
  if (confirmingId.value) return;
  if (!confirm(`هل أنت متأكد من تأكيد استلام وتسكين شحنة التوريد #${request.id} وتوثيقها ببوصلة المخزون؟`)) return;

  confirmingId.value = request.id;
  try {
    const res = await requestsStore.requesterConfirmEntry(request.id);
    if (res.success) {
      if (showDetailsModal.value && selectedRequest.value?.id === request.id) {
        selectedRequest.value.isRequesterConfirmed = true;
        selectedRequest.value.status = 2;
      }
      alert(res.message || "تم تأكيد الاستلام وتسكين المخزون وتوثيق الأجهزة في البوصلة بنجاح!");
    } else {
      alert(res.message || "فشل تأكيد الاستلام");
    }
  } finally {
    confirmingId.value = null;
  }
}

// Status Tabs Definition
const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.entryRequests.length },
  { id: "pending", name: "المرحلة 1 (تقديم)", count: requestsStore.entryRequests.filter(r => r.status === 1).length, colorHex: "#3B82F6" },
  { id: "managerApproved", name: "المرحلة 2 (موافقة المدير)", count: requestsStore.entryRequests.filter(r => r.status === 3).length, colorHex: "#F59E0B" },
  { id: "readyConfirm", name: "بانتظار تأكيد التسكين", count: requestsStore.entryRequests.filter(r => (r.status === 2 || r.currentStep === 4) && !r.isRequesterConfirmed).length, colorHex: "#10B981" },
  { id: "confirmed", name: "موثق بالبوصلة (مكتمل)", count: requestsStore.entryRequests.filter(r => r.isRequesterConfirmed).length, colorHex: "#059669" },
  { id: "rejected", name: "مرفوض", count: requestsStore.entryRequests.filter(r => r.status === 4).length, colorHex: "#EF4444" }
]);

// Filtered Requests based on Tab + Date Selection
const filteredRequests = computed(() => {
  let list = requestsStore.entryRequests;

  if (activeTab.value === "pending") list = list.filter(r => r.status === 1);
  else if (activeTab.value === "managerApproved") list = list.filter(r => r.status === 3);
  else if (activeTab.value === "readyConfirm") list = list.filter(r => (r.status === 2 || r.currentStep === 4) && !r.isRequesterConfirmed);
  else if (activeTab.value === "confirmed") list = list.filter(r => r.isRequesterConfirmed);
  else if (activeTab.value === "rejected") list = list.filter(r => r.status === 4);

  if (selectedCalendarDate.value) {
    list = list.filter(r => {
      if (!r.insertDate) return false;
      return r.insertDate.slice(0, 10) === selectedCalendarDate.value;
    });
    return list;
  }

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

  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const todayStr = new Date().toISOString().slice(0, 10);
  const days = [];

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
  return requestsStore.entryRequests.filter(r => r.insertDate && r.insertDate.slice(0, 10) === dateKey);
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
  if (key === "readyConfirm") return "جاهز للتسكين";
  if (key === "managerApproved") return "موافقة المدير";
  return "مرحلة 1";
}

// Approval Trail parsing & timeline
const parsedApprovalTrail = computed(() => {
  if (!timelineRequest.value) return [];
  const trailStr = timelineRequest.value.approvalTrail;
  if (!trailStr) {
    return [
      {
        stepOrder: 1,
        stepName: "تقديم الطلب والتوريد",
        action: "Created",
        userName: timelineRequest.value.receivedByUsername || "مقدم الطلب",
        date: timelineRequest.value.insertDate,
        notes: timelineRequest.value.notes
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
  if (action === "Confirmed") return "تم تأكيد الاستلام وتسكين المخزون بالبوصلة";
  return action;
}

// Creation & Scanner Handling
const availableExitRequests = computed(() => {
  const allExit = requestsStore.exitRequests || [];
  if (!createForm.value.departmentId) {
    return allExit;
  }
  return allExit.filter(
    r => r.departmentId === createForm.value.departmentId
  );
});

const createForm = ref({
  fromSource: "",
  invoiceNumber: "",
  notes: "",
  departmentId: null,
  items: [],
  autoApprove: false
});

const manualItem = ref({
  productId: null,
  productStateId: null,
  binId: null,
  quantity: 1
});

function onRowStateChange(item, stateId) {
  item.productStateId = stateId || null;
  const state = productStates.value.find(s => s.id === stateId);
  item.productStateName = state ? state.name : "سليم / افتراضي";
}

async function openCreateModal() {
  const isFlowDisabled = localStorage.getItem("ohda_approval_flow_enabled_entry") === "false";
  selectedDeptSerials.value = [];
  departmentItems.value = [];
  selectedExitRequestId.value = null;
  createForm.value = {
    fromSource: "",
    invoiceNumber: "",
    notes: "",
    departmentId: null,
    items: [],
    autoApprove: isFlowDisabled
  };
  manualItem.value = {
    productId: null,
    productStateId: null,
    binId: null,
    quantity: 1
  };
  showCreateModal.value = true;
  await requestsStore.fetchExitRequests();
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
      html5Qrcode.value = new Html5Qrcode("entry-qr-reader");
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

const onCodeScanned = async (decodedText) => {
  const code = (decodedText || "").trim();
  if (!code) return;
  const now = Date.now();
  if (lastScanned.value.code === code && now - lastScanned.value.time < 1200) return;
  lastScanned.value = { code, time: now };
  playBeep();

  // 1. Check if it matches an item in selected exit request
  if (departmentItems.value.length > 0) {
    const matchedDeptItem = departmentItems.value.find(i =>
      (i.serialNumber && i.serialNumber.toLowerCase() === code.toLowerCase()) ||
      (i.productBarcode && i.productBarcode.toLowerCase() === code.toLowerCase()) ||
      (i.productSKU && i.productSKU.toLowerCase() === code.toLowerCase())
    );
    if (matchedDeptItem) {
      if (!selectedDeptSerials.value.includes(matchedDeptItem.serialNumber)) {
        selectedDeptSerials.value.push(matchedDeptItem.serialNumber);
        addSerialToFormItems(matchedDeptItem);
      }
      scanFeedback.value = `تمت إضافة جهاز العهدة: ${matchedDeptItem.productName} (S/N: ${matchedDeptItem.serialNumber})`;
      return;
    }
  }

  // 2. Check against catalog products
  const product = inventoryStore.products.find(p => p.barcode === code || p.sku === code);
  if (product) {
    const existing = createForm.value.items.find(
      i => i.productId === product.id && i.productStateId === null
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      createForm.value.items.push({
        productId: product.id,
        productName: product.name,
        productStateId: null,
        productStateName: "سليم / افتراضي",
        quantity: 1,
        notes: "مضاف عبر مسح الباركود"
      });
    }
    scanFeedback.value = `تمت إضافة: ${product.name} (+1)`;
    return;
  }

  // 3. Check if it's a serialized device in the database
  try {
    const res = await apiGet(`/api/ProductItem/serial/${encodeURIComponent(code)}`);
    const item = res?.data?.singleObject;
    if (item && item.productId) {
      const existing = createForm.value.items.find(
        i => i.productId === item.productId && i.productStateId === (item.productStateId || null)
      );
      if (existing) {
        if (!existing.selectedSerials) existing.selectedSerials = [];
        if (!existing.selectedSerials.includes(item.serialNumber)) {
          existing.selectedSerials.push(item.serialNumber);
          existing.quantity += 1;
        }
      } else {
        createForm.value.items.push({
          productId: item.productId,
          productName: item.productName || item.product?.name || "جهاز محدد",
          productStateId: item.productStateId || null,
          productStateName: item.productStateName || "سليم / افتراضي",
          binId: item.binId || null,
          quantity: 1,
          selectedSerials: [item.serialNumber],
          notes: `إرجاع جهاز S/N: ${item.serialNumber}`
        });
      }
      scanFeedback.value = `تم العثور على الجهاز: ${item.productName || item.serialNumber}`;
      return;
    }
  } catch (_) {}

  scanFeedback.value = `الرمز "${code}" غير مطابق لكتالوج المنتجات أو الأجهزة!`;
};

async function handleHardwareScan() {
  const code = (hardwareScanText.value || "").trim();
  if (!code) return;
  hardwareScanText.value = "";
  await onCodeScanned(code);
}

function addManualItem() {
  if (!manualItem.value.productId) {
    alert("يرجى اختيار الصنف أولاً!");
    return;
  }
  const product = inventoryStore.products.find(p => p.id === manualItem.value.productId);
  if (!product) return;

  const requested = manualItem.value.quantity;
  const stateId = manualItem.value.productStateId || null;
  const binId = manualItem.value.binId || null;
  const state = productStates.value.find(s => s.id === stateId);
  const stateName = state ? state.name : "سليم / افتراضي";

  const existing = createForm.value.items.find(
    i => i.productId === product.id && i.productStateId === stateId && i.binId === binId
  );

  if (existing) {
    existing.quantity += requested;
  } else {
    createForm.value.items.push({
      productId: product.id,
      productName: product.name,
      productStateId: stateId,
      productStateName: stateName,
      binId: binId,
      quantity: requested,
      notes: "إدخال يدوي"
    });
  }

  manualItem.value = {
    productId: null,
    productStateId: null,
    binId: null,
    quantity: 1
  };
}

function removeRequestItem(index) {
  createForm.value.items.splice(index, 1);
}

async function handleCreateEntry() {
  if (isSubmitting.value) return;
  if (createForm.value.items.length === 0) {
    alert("يرجى إضافة صنف واحد على الأقل للمتابعة.");
    return;
  }
  if (!createForm.value.fromSource) {
    createForm.value.fromSource = "توريد مستودع مباشر";
  }
  if (!createForm.value.invoiceNumber) {
    createForm.value.invoiceNumber = "INV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
  }

  const payload = JSON.parse(JSON.stringify(createForm.value));
  payload.items.forEach((item, idx) => {
    const origItem = createForm.value.items[idx];
    if (origItem.selectedSerials && origItem.selectedSerials.length > 0) {
      item.notes = `[${origItem.selectedSerials.join(", ")}] ${item.notes || ""}`;
    }
  });

  isSubmitting.value = true;
  try {
    const result = await requestsStore.createEntryRequest(payload, authStore.user);
    if (result.success) {
      showCreateModal.value = false;
      await stopScanner();
      await requestsStore.fetchEntryRequests();
      selectedDeptSerials.value = [];
      departmentItems.value = [];
      if (createForm.value.autoApprove) {
        alert("تم إنشاء طلب التوريد وتسكينه بالمخزن وتوثيقه بالبوصلة بنجاح ومباشرة!");
      }
    } else {
      alert(result.message || "فشل إنشاء طلب التوريد");
    }
  } finally {
    isSubmitting.value = false;
  }
}

watch(() => createForm.value.departmentId, (newDeptId) => {
  if (selectedExitRequestId.value) {
    const currentReq = requestsStore.exitRequests.find(r => r.id === selectedExitRequestId.value);
    if (currentReq && currentReq.departmentId && currentReq.departmentId !== newDeptId) {
      selectedExitRequestId.value = null;
      departmentItems.value = [];
      selectedDeptSerials.value = [];
    }
  }
});

watch(selectedExitRequestId, (newId) => {
  if (newId) {
    const exitReq = requestsStore.exitRequests.find(r => r.id === newId);
    if (exitReq) {
      if (exitReq.departmentId && !createForm.value.departmentId) {
        createForm.value.departmentId = exitReq.departmentId;
      }
      if (exitReq.recipientName && !createForm.value.fromSource) {
        createForm.value.fromSource = exitReq.recipientName;
      }
    }
    createForm.value.invoiceNumber = "RET-REQ-" + newId;
  } else {
    createForm.value.invoiceNumber = "";
  }
  fetchExitRequestItems();
});

async function fetchExitRequestItems() {
  if (!selectedExitRequestId.value) {
    departmentItems.value = [];
    selectedDeptSerials.value = [];
    return;
  }
  loadingDeptItems.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/exit-request/${selectedExitRequestId.value}`);
    let items = [];
    if (res?.data?.isDone && res.data.objects?.length > 0) {
      items = res.data.objects;
    } else {
      // Fallback: check if exit request has items in the requestsStore or exit request details
      const exitReq = requestsStore.exitRequests.find(r => r.id === selectedExitRequestId.value);
      if (exitReq?.items?.length > 0) {
        items = exitReq.items.map(i => ({
          productId: i.productId,
          productName: i.productName || i.product?.name || "منتج",
          productBarcode: i.productBarcode || i.product?.barcode,
          productSKU: i.productSKU || i.product?.sku,
          serialNumber: i.serialNumber || `SN-${i.id}`,
          productStateId: i.productStateId,
          productStateName: i.productStateName || "سليم / افتراضي"
        }));
      }
    }
    departmentItems.value = items;
  } catch (e) {
    console.error(e);
    departmentItems.value = [];
  } finally {
    loadingDeptItems.value = false;
  }
}

function toggleDeptSerial(item) {
  const index = selectedDeptSerials.value.indexOf(item.serialNumber);
  if (index > -1) {
    selectedDeptSerials.value.splice(index, 1);
    removeSerialFromFormItems(item);
  } else {
    selectedDeptSerials.value.push(item.serialNumber);
    addSerialToFormItems(item);
  }
}

function addSerialToFormItems(item) {
  const existing = createForm.value.items.find(i => i.productId === item.productId);
  if (existing) {
    if (!existing.selectedSerials) existing.selectedSerials = [];
    if (!existing.selectedSerials.includes(item.serialNumber)) {
      existing.selectedSerials.push(item.serialNumber);
      existing.quantity += 1;
    }
  } else {
    createForm.value.items.push({
      productId: item.productId,
      productName: item.productName || item.product?.name || "منتج",
      productStateId: item.productStateId || null,
      productStateName: item.productStateName || "سليم / افتراضي",
      quantity: 1,
      selectedSerials: [item.serialNumber],
      notes: ""
    });
  }
}

function removeSerialFromFormItems(item) {
  const existing = createForm.value.items.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity -= 1;
    if (existing.selectedSerials) {
      existing.selectedSerials = existing.selectedSerials.filter(s => s !== item.serialNumber);
    }
    if (existing.quantity <= 0) {
      createForm.value.items = createForm.value.items.filter(i => i.productId !== item.productId);
    }
  }
}

// View Details & Decisions
async function viewDetails(request) {
  try {
    const res = await apiGet(`/api/ProductEntryRequest/${request.id}`);
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

async function directSingleStepEntryApproval() {
  if (isSubmitting.value) return;
  if (!confirm("هل تريد اعتماد وتسكين هذا التوريد نهائياً في خطوة واحدة؟")) return;

  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key] || 5
  }));

  isSubmitting.value = true;
  try {
    const result = await requestsStore.supervisorApproveEntry(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    if (result.success) {
      showDetailsModal.value = false;
      await Promise.all([
        requestsStore.fetchEntryRequests(),
        inventoryStore.fetchProducts(),
        inventoryStore.fetchCategories()
      ]);
    } else {
      alert(result.message || "فشل الاعتماد المباشر للتوريد.");
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
      result = await requestsStore.managerApproveEntry(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    } else {
      result = await requestsStore.supervisorApproveEntry(selectedRequest.value.id, authStore.user, { items: itemsPayload });
    }

    if (result.success) {
      showDetailsModal.value = false;
      await requestsStore.fetchEntryRequests();
      await inventoryStore.fetchProducts();
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
    const result = await requestsStore.rejectEntryRequest(selectedRequest.value.id, rejectionReason.value, authStore.user);
    if (result.success) {
      showDetailsModal.value = false;
      await requestsStore.fetchEntryRequests();
      await inventoryStore.fetchProducts();
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
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 3);
});
</script>

<style scoped>
#entry-qr-reader {
  width: 100% !important;
}
#entry-qr-reader video {
  object-fit: cover !important;
}
</style>
