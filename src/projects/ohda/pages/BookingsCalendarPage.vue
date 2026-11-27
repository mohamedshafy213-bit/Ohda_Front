<template>
  <div class="space-y-5">
    <!-- 1. Header Toolbar (Live Clock, Quick Actions, Navigation Links) -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-brand-gray/15 shadow-xs">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-brand-accent/20 text-brand-dark dark:text-brand-accent flex items-center justify-center">
            <CalendarDays class="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-brand-dark dark:text-white flex items-center gap-2">
              <span>التقويم التفاعلي | منظومة مواعيد وحجوزات الورشة</span>
            </h1>
            <p class="text-xs text-brand-gray mt-0.5">
              متابعة وجدولة مواعيد الصيانة الدورية وتوزيع مناطق الصيانة والفنيين على مدار الأسبوع والشهر
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons & Live Clock -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Live Clock Pill -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-light/60 dark:bg-white/5 border border-brand-gray/15 text-xs text-brand-dark dark:text-white font-medium select-none">
          <Clock class="w-3.5 h-3.5 text-brand-accent animate-pulse" />
          <span class="font-bold">{{ liveDate }}</span>
          <span class="text-brand-gray/40">|</span>
          <span class="font-mono font-bold text-brand-accent">{{ liveClock }}</span>
        </div>

        <!-- Quick Attendance Button -->
        <button
          type="button"
          @click="openQuickAttendance"
          class="px-3.5 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <span class="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
          <UserCheck class="w-4 h-4" />
          <span>تسجيل حضور</span>
        </button>

        <!-- Export to Excel -->
        <button
          type="button"
          @click="exportBookingsToExcel"
          class="px-3.5 py-2 rounded-xl bg-brand-light dark:bg-white/5 hover:bg-brand-soft text-brand-dark dark:text-white border border-brand-gray/20 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="تصدير جدول الحجوزات والمواعيد إلى Excel"
        >
          <Download class="w-4 h-4 text-brand-accent" />
          <span>تصدير Excel</span>
        </button>

        <!-- New Booking Button -->
        <button
          type="button"
          @click="openNewBookingModal"
          class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>+ حجز موعد جديد</span>
        </button>

        <!-- Instant Walk-In Car Entrance Button (Single Workshop Entrance) -->
        <button
          type="button"
          @click="openWalkInModal"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          title="تسجيل دخول فوري لسيارة بدون موعد مسبق وبدء أمر الشغل"
        >
          <Car class="w-4 h-4" />
          <span>+ دخول سيارة مباشرة (Walk-In)</span>
        </button>

        <!-- Secondary Navigation Link -->
        <router-link
          to="/ohda/bays-settings"
          class="px-3 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          title="إعدادات مناطق الصيانة ومواعيد العمل"
        >
          <Settings class="w-3.5 h-3.5 text-brand-gray" />
          <span>إعدادات مناطق الصيانة</span>
        </router-link>
      </div>
    </div>

    <!-- 2. KPI Status Indicators (Matching clinics.shaghal design) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      <div class="p-4 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-brand-gray block">مواعيد مسجلة بالفترة المعروضة</span>
          <span class="text-2xl font-black font-mono text-brand-dark dark:text-white mt-1 block">
            {{ currentViewBookingsCount }}
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
          <CalendarDays class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-brand-gray block">حالة الإنجاز</span>
          <span class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {{ completedCount }} مكتمل <span class="text-xs text-brand-gray font-normal">/</span> {{ remainingCount }} متبقي
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-brand-gray block">مؤكدة وجاهزة للاستقبال</span>
          <span class="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1 block">
            {{ confirmedCount }}
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
          <Car class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-brand-gray block">نسبة إشغال مناطق صيانة الورشة</span>
          <span class="text-2xl font-black font-mono text-brand-accent mt-1 block">
            {{ todayCapacityPct }}%
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
          <Warehouse class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- 3. Main Two-Column Calendar Layout (Sidebar on Left, Grid on Right) -->
    <div class="flex flex-col lg:flex-row items-start gap-4">
      <!-- A. Left Sidebar Panel (Upcoming Appointments & Color Legend) -->
      <div class="w-full lg:w-80 shrink-0 space-y-4">
        <!-- Sidebar Tabs: Appointments List -->
        <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 overflow-hidden shadow-xs">
          <!-- Sidebar Tabs Header -->
          <div class="flex items-center border-b border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 text-xs font-bold">
            <button
              type="button"
              @click="sidebarTab = 'list'"
              class="flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              :class="sidebarTab === 'list' ? 'bg-brand-white dark:bg-brand-dark text-brand-accent border-b-2 border-brand-accent' : 'text-brand-gray hover:text-brand-dark'"
            >
              <CalendarCheck class="w-3.5 h-3.5" />
              <span>المواعيد ({{ currentViewBookingsCount }})</span>
            </button>
            <button
              type="button"
              @click="sidebarTab = 'upcoming'"
              class="flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              :class="sidebarTab === 'upcoming' ? 'bg-brand-white dark:bg-brand-dark text-brand-accent border-b-2 border-brand-accent' : 'text-brand-gray hover:text-brand-dark'"
            >
              <Clock class="w-3.5 h-3.5" />
              <span>المواعيد القادمة</span>
            </button>
          </div>

          <!-- Search filter in sidebar -->
          <div class="p-3 border-b border-brand-gray/10">
            <div class="relative">
              <Search class="w-3.5 h-3.5 text-brand-gray absolute right-3 top-2.5" />
              <input
                v-model="sidebarSearch"
                type="text"
                placeholder="بحث باسم العميل أو اللوحة..."
                class="w-full pr-8 pl-3 py-1.5 rounded-xl border border-brand-gray/20 bg-brand-light/30 dark:bg-brand-dark text-xs text-brand-dark dark:text-white"
              />
            </div>
          </div>

          <!-- Appointments Scrollable List -->
          <div class="p-3 max-h-[380px] overflow-y-auto space-y-2 text-xs">
            <div v-if="filteredSidebarBookings.length === 0" class="text-center py-12 text-brand-gray">
              <CalendarDays class="w-10 h-10 text-brand-gray/30 mx-auto mb-2" />
              <div class="font-bold text-xs text-brand-dark dark:text-white">لا توجد مواعيد مجدولة بالفترة</div>
              <p class="text-[11px] text-brand-gray mt-1">انقر على أي يوم بالتقويم لإضافة موعد جديد</p>
            </div>

            <div
              v-for="bk in filteredSidebarBookings"
              :key="bk.id"
              @click="openBookingDetails(bk)"
              class="p-3 rounded-xl border border-brand-gray/15 bg-brand-light/30 dark:bg-white/5 hover:border-brand-accent/60 transition-all cursor-pointer space-y-1.5"
            >
              <div class="flex items-center justify-between gap-1">
                <div class="flex items-center gap-1.5 font-bold text-brand-dark dark:text-white">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="getStatusDotColor(bk.status)"></span>
                  <span class="truncate">{{ bk.clientName }}</span>
                </div>
                <span class="font-mono text-[10px] text-brand-gray font-bold">{{ bk.startTime }}</span>
              </div>

              <div class="flex items-center justify-between text-[11px] text-brand-gray">
                <span>{{ bk.bayName || 'منطقة صيانة' }}</span>
                <span class="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-brand-dark dark:text-white font-bold">
                  {{ bk.plateNumber || 'بدون لوحة' }}
                </span>
              </div>

              <div v-if="bk.services && bk.services.length > 0" class="text-[10px] text-brand-accent truncate">
                {{ bk.services.map(s => s.serviceName).join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Legend Box: دليل الحالات والألوان (Matching screenshot) -->
        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/15 shadow-xs space-y-3">
          <div class="font-bold text-xs text-brand-dark dark:text-white flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-brand-accent" />
            <span>دليل الحالات والألوان</span>
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-xs text-brand-dark dark:text-slate-300">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
              <span>مؤكد</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-purple-600 shrink-0"></span>
              <span>حضر بالورشة</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
              <span>في الانتظار</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></span>
              <span>قيد العمل بمنطقة الصيانة</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-teal-600 shrink-0"></span>
              <span>مكتمل ومستلم</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
              <span>ملغي</span>
            </div>
          </div>
        </div>
      </div>

      <!-- B. Right Main Area: The Calendar Grid (Month / Week / Day) -->
      <div class="flex-1 w-full bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 overflow-hidden shadow-xs space-y-0">
        <!-- Calendar Controls & Navigation Bar -->
        <div class="p-3.5 sm:p-4 border-b border-brand-gray/15 bg-brand-light/30 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <!-- Left: Nav Controls -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="navigate(1)"
              class="p-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white cursor-pointer transition-colors bg-white dark:bg-brand-dark"
              title="الفترة التالية"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <button
              type="button"
              @click="goToToday"
              class="px-3.5 py-1.5 rounded-xl border border-brand-gray/20 hover:border-brand-accent font-bold text-brand-dark dark:text-white cursor-pointer transition-colors bg-white dark:bg-brand-dark"
            >
              اليوم
            </button>

            <button
              type="button"
              @click="navigate(-1)"
              class="p-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white cursor-pointer transition-colors bg-white dark:bg-brand-dark"
              title="الفترة السابقة"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <!-- Bay & Status quick filter -->
            <div class="flex items-center gap-1.5 mr-2">
              <Filter class="w-3.5 h-3.5 text-brand-gray" />
              <select
                v-model="selectedBayFilter"
                @change="loadCalendar"
                class="px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs font-medium"
              >
                <option :value="null">كل مناطق الصيانة</option>
                <option v-for="b in bookingStore.bays" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
          </div>

          <!-- Center: Dynamic Title (Month / Week / Day) -->
          <div class="text-center font-black text-base text-brand-dark dark:text-white font-mono">
            {{ currentViewTitle }}
          </div>

          <!-- Right: View Mode Switcher Buttons (شهر | أسبوع | يوم) -->
          <div class="flex items-center gap-1 bg-brand-light dark:bg-white/5 p-1 rounded-xl border border-brand-gray/15">
            <button
              type="button"
              @click="setViewMode('month')"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="calendarView === 'month' ? 'bg-brand-accent text-brand-dark shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
            >
              شهر
            </button>
            <button
              type="button"
              @click="setViewMode('week')"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="calendarView === 'week' ? 'bg-brand-accent text-brand-dark shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
            >
              أسبوع
            </button>
            <button
              type="button"
              @click="setViewMode('day')"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="calendarView === 'day' ? 'bg-brand-accent text-brand-dark shadow-xs' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
            >
              يوم
            </button>
          </div>
        </div>

        <!-- VIEW 1: Full Month Grid View (Exact replica of screenshot) -->
        <div v-if="calendarView === 'month'" class="p-3 sm:p-4">
          <!-- Days of Week Header (الأحد إلى السبت RTL) -->
          <div class="grid grid-cols-7 border-b border-brand-gray/15 pb-2 text-center text-xs font-bold text-brand-dark dark:text-white mb-2">
            <div v-for="d in daysOfWeekArabic" :key="d" class="py-1">
              {{ d }}
            </div>
          </div>

          <!-- Month Grid Cells (7 columns) -->
          <div class="grid grid-cols-7 border-t border-r border-brand-gray/15">
            <div
              v-for="(cell, cIdx) in monthGridCells"
              :key="cIdx"
              @click="openNewBookingForDay(cell.dateStr)"
              class="min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 border-b border-l border-brand-gray/15 transition-all relative group cursor-pointer flex flex-col justify-between"
              :class="[
                cell.isCurrentMonth ? 'bg-white dark:bg-white/2 hover:bg-brand-accent/5' : 'bg-brand-light/30 dark:bg-white/1 text-brand-gray/40',
                cell.isToday ? 'ring-2 ring-brand-accent/80 ring-inset bg-brand-accent/5' : ''
              ]"
            >
              <!-- Day Number & Indicator Header -->
              <div class="flex items-center justify-between mb-1">
                <span
                  class="text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  :class="cell.isToday ? 'bg-brand-accent text-brand-dark' : (cell.isCurrentMonth ? 'text-brand-dark dark:text-white' : 'text-brand-gray/40')"
                >
                  {{ cell.dayNumber }}
                </span>

                <span v-if="cell.bookings.length > 0" class="text-[10px] font-mono font-bold text-brand-gray">
                  {{ cell.bookings.length }} موعد
                </span>
              </div>

              <!-- Day Bookings Chips (Up to 3 chips) -->
              <div class="space-y-1 overflow-hidden flex-1">
                <div
                  v-for="bk in cell.bookings.slice(0, 3)"
                  :key="bk.id"
                  @click.stop="openBookingDetails(bk)"
                  class="p-1 px-1.5 rounded-lg bg-brand-light/70 dark:bg-white/10 hover:bg-brand-accent/20 border border-brand-gray/15 text-[10px] transition-colors truncate flex items-center justify-between gap-1 shadow-2xs"
                  :title="`${bk.clientName} - ${bk.startTime}`"
                >
                  <div class="flex items-center gap-1 truncate font-bold text-brand-dark dark:text-white">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getStatusDotColor(bk.status)"></span>
                    <span class="truncate">{{ bk.clientName }}</span>
                  </div>
                  <span class="font-mono text-[9px] text-brand-gray shrink-0">{{ bk.startTime }}</span>
                </div>

                <div v-if="cell.bookings.length > 3" class="text-[9px] text-center font-bold text-brand-accent py-0.5">
                  + {{ cell.bookings.length - 3 }} مواعيد أخرى
                </div>
              </div>

              <!-- Hover add hint -->
              <div class="opacity-0 group-hover:opacity-100 text-[9px] text-brand-gray text-center transition-opacity pt-0.5">
                + إضافة موعد
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW 2: Whole Week View (7 Columns with all week details) -->
        <div v-else-if="calendarView === 'week'" class="p-3 sm:p-4 overflow-x-auto">
          <div class="min-w-[760px]">
            <!-- Week Header (7 Day Columns) -->
            <div class="grid grid-cols-7 gap-2 mb-3">
              <div
                v-for="day in weekDays"
                :key="day.dateStr"
                class="p-2.5 rounded-xl border text-center transition-all"
                :class="day.isToday ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-xs' : 'bg-brand-light/40 dark:bg-white/5 border-brand-gray/15 text-brand-dark dark:text-white'"
              >
                <div class="text-[11px] font-bold">{{ day.dayName }}</div>
                <div class="text-base font-black font-mono mt-0.5">{{ day.dayNumber }}</div>
                <div class="text-[10px] opacity-75 font-mono">{{ day.monthName }}</div>
              </div>
            </div>

            <!-- Week Body Columns -->
            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="day in weekDays"
                :key="day.dateStr"
                class="min-h-[420px] p-2 rounded-2xl border border-brand-gray/15 bg-white dark:bg-white/2 flex flex-col justify-between"
              >
                <!-- Bookings Cards Stack -->
                <div class="space-y-2">
                  <div v-if="day.bookings.length === 0" class="text-center py-10 text-[11px] text-brand-gray/50">
                    لا توجد حجوزات
                  </div>

                  <div
                    v-for="bk in day.bookings"
                    :key="bk.id"
                    @click="openBookingDetails(bk)"
                    class="p-2.5 rounded-xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 hover:border-brand-accent transition-all cursor-pointer space-y-1.5 shadow-2xs group"
                  >
                    <!-- Header: Client & Status Dot -->
                    <div class="flex items-start justify-between gap-1">
                      <div class="font-bold text-xs text-brand-dark dark:text-white truncate">
                        {{ bk.clientName }}
                      </div>
                      <span class="w-2 h-2 rounded-full shrink-0 mt-1" :class="getStatusDotColor(bk.status)"></span>
                    </div>

                    <!-- Time & Bay -->
                    <div class="flex items-center justify-between text-[10px] font-mono text-brand-gray">
                      <span class="font-bold text-brand-dark dark:text-slate-200">{{ bk.startTime }} - {{ bk.endTime }}</span>
                      <span class="truncate">{{ bk.bayName || 'منطقة صيانة' }}</span>
                    </div>

                    <!-- Plate & Model -->
                    <div class="flex items-center gap-1 text-[10px] text-brand-gray truncate">
                      <span class="bg-black/5 dark:bg-white/10 px-1 rounded font-mono font-bold">{{ bk.plateNumber || 'بدون لوحة' }}</span>
                      <span v-if="bk.vehicleModel" class="truncate">{{ bk.vehicleModel }}</span>
                    </div>

                    <!-- Service Chip -->
                    <div v-if="bk.services && bk.services.length > 0" class="text-[9px] text-brand-accent font-semibold truncate">
                      {{ bk.services[0].serviceName }}
                    </div>
                  </div>
                </div>

                <!-- Column Footer: + Add Booking -->
                <button
                  type="button"
                  @click="openNewBookingForDay(day.dateStr)"
                  class="mt-2 w-full py-1.5 rounded-xl border border-dashed border-brand-gray/25 hover:border-brand-accent text-[10px] font-bold text-brand-gray hover:text-brand-dark dark:hover:text-white transition-all cursor-pointer text-center"
                >
                  + حجز لهذا اليوم
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW 3: Day Matrix View (Bays on columns, time slots on rows) -->
        <div v-else-if="calendarView === 'day'" class="overflow-x-auto p-3 sm:p-4">
          <div class="min-w-[700px]">
            <!-- Table Header: Bays Columns -->
            <div class="grid border-b border-brand-gray/15 bg-brand-light/50 dark:bg-white/5 text-xs font-bold text-brand-dark dark:text-white"
                 :style="{ gridTemplateColumns: `80px repeat(${filteredBays.length}, minmax(180px, 1fr))` }">
              <div class="p-3 text-center border-l border-brand-gray/10 text-brand-gray">الوقت</div>
              <div
                v-for="bay in filteredBays"
                :key="bay.id"
                class="p-3 text-center border-l border-brand-gray/10 last:border-l-0 flex items-center justify-center gap-1.5"
              >
                <Warehouse class="w-4 h-4 text-brand-accent" />
                <span>{{ bay.name }}</span>
              </div>
            </div>

            <!-- Time Rows: 09:00 to 20:00 -->
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="grid border-b border-brand-gray/10 last:border-b-0 text-xs min-h-[64px]"
              :style="{ gridTemplateColumns: `80px repeat(${filteredBays.length}, minmax(180px, 1fr))` }"
            >
              <!-- Hour Label -->
              <div class="p-2 border-l border-brand-gray/10 flex items-center justify-center font-mono text-[11px] font-bold text-brand-gray bg-brand-light/20 dark:bg-white/2">
                {{ hour }}
              </div>

              <!-- Bay Slots -->
              <div
                v-for="bay in filteredBays"
                :key="bay.id"
                class="p-1.5 border-l border-brand-gray/10 last:border-l-0 relative group hover:bg-brand-accent/5 transition-colors cursor-pointer"
                @click="onSlotClick(bay, hour)"
              >
                <!-- Render Bookings in this slot -->
                <div
                  v-for="bk in getBookingsForSlot(bay.id, hour)"
                  :key="bk.id"
                  @click.stop="openBookingDetails(bk)"
                  :class="[
                    'p-2 rounded-xl border text-[11px] mb-1 transition-all shadow-xs cursor-pointer',
                    getStatusBadgeClass(bk.status)
                  ]"
                >
                  <div class="flex items-center justify-between gap-1 font-bold">
                    <span class="truncate">{{ bk.clientName }}</span>
                    <span class="font-mono text-[10px] opacity-80">{{ bk.startTime }} - {{ bk.endTime }}</span>
                  </div>

                  <div class="flex items-center gap-1.5 mt-1 text-[10px] opacity-90 truncate">
                    <span class="font-mono font-bold bg-black/10 dark:bg-white/10 px-1 rounded">{{ bk.plateNumber || 'بدون لوحة' }}</span>
                    <span v-if="bk.vehicleModel" class="truncate">{{ bk.vehicleModel }}</span>
                  </div>

                  <div v-if="bk.services && bk.services.length > 0" class="mt-1 text-[10px] opacity-80 truncate">
                    {{ bk.services.map(s => s.serviceName).join(', ') }}
                  </div>
                </div>

                <!-- Quick Add Hint on Hover -->
                <div class="hidden group-hover:flex items-center justify-center absolute inset-0 bg-brand-accent/10 pointer-events-none rounded text-[10px] font-bold text-brand-dark">
                  + حجز عند {{ hour }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Modal: Create New Booking -->
    <OhdaModal
      :visible="showNewBookingModal"
      @close="showNewBookingModal = false"
      title="تسجيل حجز موعد جديد بالورشة"
      description="أدخل بيانات العميل والمركبة واختر منطقة الصيانة والخدمات المطلوبة مع التحقق الفوري من التوفر"
      :icon="CalendarDays"
      :close-on-backdrop="false"
      max-width="max-w-xl"
    >
      <form @submit.prevent="submitCreateBooking" id="bookingForm" class="space-y-4 text-xs">
        <!-- Conflict Alert Banner -->
        <div
          v-if="availabilityCheck && !availabilityCheck.isAvailable"
          class="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300 space-y-2"
        >
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div class="font-bold text-xs">{{ availabilityCheck.conflictReason || 'يوجد تعارض في الموعد المختار!' }}</div>
          </div>

          <div class="flex items-center gap-2 pt-1 border-t border-rose-500/20">
            <input
              type="checkbox"
              v-model="bookingForm.allowOverride"
              id="allowOverride"
              class="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
            />
            <label for="allowOverride" class="font-bold text-[11px] cursor-pointer">
              تجاوز التعارض وحفظ الحجز على مسؤولية الإدارة (Manager Override)
            </label>
          </div>
        </div>

        <!-- Section 1: Customer & Car -->
        <div class="p-3.5 bg-brand-light/40 dark:bg-white/5 rounded-2xl border border-brand-gray/15 space-y-3.5">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5 text-xs">
              <User class="w-4 h-4 text-brand-accent" />
              <span>بيانات العميل والمركبة</span>
            </h4>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openAddClientModal"
                class="px-2.5 py-1 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-dark dark:text-brand-accent font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-brand-accent/30 shadow-2xs active:scale-95"
                title="إضافة عميل جديد ومركبته لقاعدة البيانات مباشرة"
              >
                <UserPlus class="w-3.5 h-3.5" />
                <span>+ عميل جديد</span>
              </button>

              <button
                type="button"
                @click="toggleWalkInMode"
                class="text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
                :class="isWalkInClient ? 'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold' : 'border-brand-gray/20 text-brand-gray hover:text-brand-dark'"
                title="التبديل بين عميل مسجل بالورشة أو حجز سريع لزائر"
              >
                {{ isWalkInClient ? 'عميل مسجل بالورشة' : 'حجز سريع (زائر)' }}
              </button>
            </div>
          </div>

          <!-- A. REGISTERED CLIENT MODE (Default) -->
          <div v-if="!isWalkInClient" class="space-y-3">
            <!-- Client Dropdown Selection -->
            <div class="relative">
              <label class="block font-semibold mb-1 text-xs">
                اختيار العميل من قاعدة البيانات <span class="text-red-500">*</span>
              </label>

              <!-- Invisible backdrop to close dropdown when clicked outside -->
              <div
                v-if="isClientDropdownOpen"
                @click="isClientDropdownOpen = false"
                class="fixed inset-0 z-20"
              ></div>

              <!-- Searchable Trigger Display -->
              <div
                @click="isClientDropdownOpen = !isClientDropdownOpen"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium cursor-pointer flex items-center justify-between shadow-2xs hover:border-brand-accent/60 transition-all text-xs relative z-20"
              >
                <div v-if="bookingForm.clientId" class="flex items-center gap-2 truncate">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span class="font-bold truncate">{{ bookingForm.newClientName }}</span>
                  <span class="text-brand-gray text-[11px] font-mono">({{ bookingForm.newClientPhone }})</span>
                </div>
                <div v-else class="text-brand-gray/70">
                  ابحث واختر العميل بالاسم أو رقم الهاتف أو اللوحة...
                </div>
                <ChevronDown class="w-4 h-4 text-brand-gray shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isClientDropdownOpen }" />
              </div>

              <!-- Searchable Dropdown Popup -->
              <div
                v-if="isClientDropdownOpen"
                class="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-brand-dark rounded-2xl border border-brand-gray/20 shadow-xl overflow-hidden max-h-60 flex flex-col"
              >
                <!-- Search Box -->
                <div class="p-2 border-b border-brand-gray/10 bg-brand-light/30 dark:bg-white/5">
                  <div class="relative">
                    <Search class="w-3.5 h-3.5 text-brand-gray absolute right-3 top-2.5" />
                    <input
                      v-model="clientSearchQuery"
                      type="text"
                      placeholder="اكتب اسم العميل، الهاتف، أو اللوحة..."
                      class="w-full pr-8 pl-3 py-1.5 rounded-xl border border-brand-gray/20 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white"
                      @click.stop
                    />
                  </div>
                </div>

                <!-- Clients Scroll List -->
                <div class="overflow-y-auto divide-y divide-brand-gray/10 flex-1">
                  <div
                    v-if="filteredClientsList.length === 0"
                    class="p-4 text-center text-xs text-brand-gray"
                  >
                    <div>لا يوجد عميل مطابق للبحث</div>
                    <button
                      type="button"
                      @click="openAddClientModalWithQuery"
                      class="mt-2 text-brand-accent font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <UserPlus class="w-3.5 h-3.5" />
                      <span>+ إضافة "{{ clientSearchQuery }}" كعميل جديد</span>
                    </button>
                  </div>

                  <div
                    v-for="c in filteredClientsList"
                    :key="c.id"
                    @click="onSelectExistingClient(c)"
                    class="p-2.5 px-3 hover:bg-brand-accent/10 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    :class="bookingForm.clientId === c.id ? 'bg-brand-accent/15 font-bold' : ''"
                  >
                    <div class="space-y-0.5 truncate">
                      <div class="flex items-center gap-1.5 font-bold text-brand-dark dark:text-white">
                        <span>{{ c.name }}</span>
                        <span v-if="c.type === 2" class="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-normal">شركة</span>
                      </div>
                      <div class="text-[11px] font-mono text-brand-gray flex items-center gap-2">
                        <span>{{ c.phone }}</span>
                        <span v-if="c.carPlate" class="text-brand-dark/70 dark:text-slate-300 font-bold">| {{ c.carPlate }}</span>
                      </div>
                    </div>

                    <div class="text-left shrink-0">
                      <span v-if="c.vehiclesCount > 1" class="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-mono font-bold">
                        {{ c.vehiclesCount }} سيارات
                      </span>
                      <span v-else-if="c.carModel" class="text-[10px] text-brand-gray">
                        {{ c.carModel }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicle Selection for Chosen Client -->
            <div v-if="bookingForm.clientId" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-gray/10">
              <!-- Vehicle Dropdown (in case client has multiple cars) -->
              <div>
                <label class="block font-semibold mb-1 text-xs flex items-center justify-between">
                  <span>مركبة العميل المحددة للورشة <span class="text-red-500">*</span></span>
                  <span v-if="clientVehicles.length > 1" class="text-[10px] text-brand-accent font-bold font-mono">
                    ({{ clientVehicles.length }} سيارات مسجلة)
                  </span>
                </label>

                <select
                  v-model="selectedVehicleOption"
                  @change="onVehicleOptionChanged"
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium text-xs font-mono"
                >
                  <option
                    v-for="v in clientVehicles"
                    :key="v.id || v.plateNumber"
                    :value="v.id || v.plateNumber"
                  >
                    {{ v.plateNumber }} - {{ v.brandName || v.brand || '' }} {{ v.model || '' }} {{ v.year ? '(' + v.year + ')' : '' }}
                  </option>
                  <option value="__NEW_VEHICLE__">+ سيارة أخرى / غير مسجلة بالملف...</option>
                </select>
              </div>

              <!-- Vehicle Plate & Model info -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label class="block font-semibold mb-1 text-[11px]">رقم اللوحة</label>
                  <input
                    v-model="bookingForm.newVehiclePlate"
                    type="text"
                    placeholder="س ص ع 123"
                    class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold text-xs"
                    :disabled="selectedVehicleOption !== '__NEW_VEHICLE__' && !!bookingForm.vehicleId"
                  />
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-[11px]">نوع / ماركة السيارة</label>
                  <select
                    v-model="bookingForm.selectedCarType"
                    @change="onBookingCarTypeChange"
                    class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs cursor-pointer"
                    :disabled="selectedVehicleOption !== '__NEW_VEHICLE__' && !!bookingForm.vehicleId"
                  >
                    <option value="">-- اختر نوع السيارة --</option>
                    <option v-for="t in availableCarTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-[11px]">طراز وموديل السيارة</label>
                  <input
                    v-model="bookingForm.newVehicleModel"
                    type="text"
                    placeholder="اكتب نوع وموديل السيارة..."
                    class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs"
                    :disabled="selectedVehicleOption !== '__NEW_VEHICLE__' && !!bookingForm.vehicleId"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- B. WALK-IN / VISITOR CLIENT MODE -->
          <div v-else class="space-y-3">
            <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center justify-between">
              <span>وضع الحجز السريع للعملاء الزائرين غير المسجلين</span>
              <button type="button" @click="isWalkInClient = false" class="font-bold underline cursor-pointer">العودة لقاعدة العملاء</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1">اسم العميل <span class="text-red-500">*</span></label>
                <input
                  v-model="bookingForm.newClientName"
                  type="text"
                  required
                  placeholder="اسم العميل..."
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
                />
              </div>

              <div>
                <label class="block font-semibold mb-1">رقم الهاتف <span class="text-red-500">*</span></label>
                <input
                  v-model="bookingForm.newClientPhone"
                  @keypress="allowOnlyNumbers"
                  @input="bookingForm.newClientPhone = filterPhone(bookingForm.newClientPhone)"
                  maxlength="15"
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
                />
                <p v-if="bookingForm.newClientPhone && !isValidPhone(bookingForm.newClientPhone)" class="text-[10px] text-amber-500 mt-1">
                  رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold mb-1">رقم اللوحة</label>
                <input
                  v-model="bookingForm.newVehiclePlate"
                  type="text"
                  placeholder="س ص ع 1 2 3"
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label class="block font-semibold mb-1">نوع / ماركة السيارة</label>
                <select
                  v-model="bookingForm.selectedCarType"
                  @change="onBookingCarTypeChange"
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium cursor-pointer"
                >
                  <option value="">-- اختر نوع السيارة --</option>
                  <option v-for="t in availableCarTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold mb-1">طراز وموديل السيارة</label>
                <input
                  v-model="bookingForm.newVehicleModel"
                  type="text"
                  placeholder="اكتب نوع وموديل السيارة..."
                  class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Bay, Date, Time & Tech -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">منطقة الصيانة <span class="text-red-500">*</span></label>
            <select
              v-model="bookingForm.bayId"
              @change="checkAvailabilityRealtime"
              required
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
            >
              <option v-for="b in bookingStore.bays" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">الفني المسؤول (اختياري)</label>
            <select
              v-model="bookingForm.technicianEmployeeId"
              @change="checkAvailabilityRealtime"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
            >
              <option :value="null">-- بدون فني محدد --</option>
              <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.jobTitle }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <div>
            <label class="block font-semibold mb-1">تاريخ الحجز <span class="text-red-500">*</span></label>
            <input
              v-model="bookingForm.bookingDate"
              @change="checkAvailabilityRealtime"
              type="date"
              required
              class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">وقت البدء <span class="text-red-500">*</span></label>
            <input
              v-model="bookingForm.startTime"
              @change="checkAvailabilityRealtime"
              type="time"
              required
              class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">المدة التقديرية (دقيقة)</label>
            <input
              v-model.number="bookingForm.durationMinutes"
              @change="checkAvailabilityRealtime"
              type="number"
              min="15"
              step="15"
              required
              class="w-full px-2.5 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <!-- Section 3: Services Selection (Multi-Select Dropdown) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block font-semibold text-xs">
              الخدمات المطلوب حجزها بالورشة (اختر خدمة أو أكثر)
            </label>
            <span v-if="selectedServiceIds.length > 0" class="text-[11px] font-bold text-brand-accent">
              تم اختيار {{ selectedServiceIds.length }} خدمات
            </span>
          </div>

          <!-- Multi-Select Trigger & Dropdown Menu -->
          <div class="relative">
            <!-- Invisible backdrop to close dropdown when clicked outside -->
            <div
              v-if="isServicesDropdownOpen"
              @click="isServicesDropdownOpen = false"
              class="fixed inset-0 z-20"
            ></div>

            <div
              @click="isServicesDropdownOpen = !isServicesDropdownOpen"
              class="min-h-[42px] w-full p-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs cursor-pointer flex items-center justify-between gap-2 shadow-2xs hover:border-brand-accent/60 transition-all relative z-20"
            >
              <!-- Selected Chips or Placeholder -->
              <div class="flex flex-wrap items-center gap-1.5 flex-1 overflow-hidden">
                <span v-if="selectedServicesList.length === 0" class="text-brand-gray/70 py-1 px-1">
                  اضغط لاختيار الخدمات المطلوبة من القائمة...
                </span>

                <span
                  v-for="svc in selectedServicesList"
                  :key="svc.id"
                  @click.stop="toggleService(svc)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-accent/15 border border-brand-accent/30 text-brand-dark dark:text-brand-accent font-bold text-[11px] group transition-all"
                >
                  <span>{{ svc.name }}</span>
                  <span class="text-brand-gray text-[10px] font-mono">({{ svc.sellingPrice }} ج.م)</span>
                  <X class="w-3 h-3 hover:text-red-500 shrink-0" />
                </span>
              </div>

              <!-- Dropdown Arrow -->
              <ChevronDown class="w-4 h-4 text-brand-gray shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isServicesDropdownOpen }" />
            </div>

            <!-- Multi-Select Dropdown Popup -->
            <div
              v-if="isServicesDropdownOpen"
              class="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-brand-dark rounded-2xl border border-brand-gray/20 shadow-xl overflow-hidden max-h-64 flex flex-col"
            >
              <!-- Search inside services -->
              <div class="p-2 border-b border-brand-gray/10 bg-brand-light/30 dark:bg-white/5 flex items-center justify-between gap-2">
                <div class="relative flex-1">
                  <Search class="w-3.5 h-3.5 text-brand-gray absolute right-3 top-2.5" />
                  <input
                    v-model="serviceSearchQuery"
                    type="text"
                    placeholder="بحث في قائمة الخدمات..."
                    class="w-full pr-8 pl-3 py-1.5 rounded-xl border border-brand-gray/20 bg-white dark:bg-brand-dark text-xs text-brand-dark dark:text-white"
                    @click.stop
                  />
                </div>

                <button
                  type="button"
                  @click.stop="clearAllSelectedServices"
                  class="text-[10px] text-brand-gray hover:text-rose-500 font-bold px-2 py-1 rounded cursor-pointer shrink-0"
                >
                  مسح الكل
                </button>
              </div>

              <!-- Services List with Checkboxes -->
              <div class="overflow-y-auto divide-y divide-brand-gray/10 flex-1 p-1">
                <div
                  v-for="svc in filteredAvailableServices"
                  :key="svc.id"
                  @click.stop="toggleService(svc)"
                  class="flex items-center justify-between p-2 px-3 rounded-xl hover:bg-brand-accent/10 cursor-pointer transition-colors text-xs"
                  :class="selectedServiceIds.includes(svc.id) ? 'bg-brand-accent/15 font-bold' : ''"
                >
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                      :class="selectedServiceIds.includes(svc.id) ? 'border-brand-accent bg-brand-accent text-brand-dark' : 'border-brand-gray/40'"
                    >
                      <Check v-if="selectedServiceIds.includes(svc.id)" class="w-3 h-3 stroke-3" />
                    </div>
                    <span class="text-brand-dark dark:text-white">{{ svc.name }}</span>
                  </div>

                  <div class="flex items-center gap-3 text-[11px] font-mono">
                    <span class="text-brand-dark dark:text-slate-200 font-bold">{{ svc.sellingPrice }} ج.م</span>
                    <span class="text-brand-gray text-[10px]">{{ svc.estimatedDurationMinutes || 30 }} دقيقة</span>
                  </div>
                </div>

                <div v-if="filteredAvailableServices.length === 0" class="p-4 text-center text-xs text-brand-gray">
                  لا توجد خدمات مطابقة للبحث
                </div>
              </div>
            </div>
          </div>

          <!-- Services Summary Bar (Duration & Cost) -->
          <div
            v-if="selectedServiceIds.length > 0"
            class="p-2.5 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-between text-xs font-bold"
          >
            <div class="flex items-center gap-2 text-brand-dark dark:text-white">
              <Sparkles class="w-3.5 h-3.5 text-brand-accent" />
              <span>إجمالي الخدمات: {{ selectedServiceIds.length }}</span>
              <span class="text-brand-gray/40">|</span>
              <span class="text-brand-accent font-mono">{{ totalServicesCost }} ج.م</span>
            </div>

            <div class="text-[11px] text-brand-gray font-mono">
              المدة التقديرية المحسوبة: <span class="font-bold text-brand-dark dark:text-white">{{ totalServicesDuration }} دقيقة</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات الحجز</label>
          <textarea
            v-model="bookingForm.notes"
            rows="2"
            placeholder="مثال: العميل يشتكي من صوت صفارة مع الفرامل..."
            class="w-full px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showNewBookingModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="bookingForm"
          :disabled="submitting || (availabilityCheck && !availabilityCheck.isAvailable && !bookingForm.allowOverride)"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <CalendarDays class="w-4 h-4" />
          <span>{{ submitting ? 'جاري الحفظ...' : 'تأكيد الحجز' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 5. Details Drawer Modal -->
    <OhdaModal
      :visible="showDetailsModal"
      @close="showDetailsModal = false"
      title="تفاصيل الحجز وإجراءات الموعد"
      :description="selectedBooking?.bookingNumber ? `حجز رقم: ${selectedBooking.bookingNumber}` : ''"
      :icon="CalendarDays"
      :close-on-backdrop="false"
      max-width="max-w-lg"
    >
      <div v-if="selectedBooking" class="space-y-4 text-xs">
        <!-- Customer & Car Strip -->
        <div class="p-3.5 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15 flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-brand-dark dark:text-white">{{ selectedBooking.clientName }}</div>
            <div class="font-mono text-xs text-brand-gray mt-0.5">{{ selectedBooking.clientPhone }}</div>
            <div class="flex items-center gap-2 mt-2">
              <button
                type="button"
                @click="openWhatsAppReminder(selectedBooking)"
                class="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/30 shadow-2xs active:scale-95"
                title="إرسال رسالة تذكير بالموعد للعميل عبر واتساب"
              >
                <MessageCircle class="w-3.5 h-3.5" />
                <span>تذكير واتساب</span>
              </button>
              <span
                v-if="selectedBooking.reminderSentAt"
                class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"
                title="تم إرسال تذكير مسبق لهذا الموعد"
              >
                <Check class="w-3 h-3 stroke-[3]" />
                <span>تم التذكير</span>
              </span>
            </div>
          </div>

          <div class="text-left">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 font-mono font-bold text-xs text-brand-dark dark:text-white">
              {{ selectedBooking.plateNumber || 'بدون لوحة' }}
            </span>
            <div class="text-[11px] text-brand-gray mt-0.5">{{ selectedBooking.vehicleModel || 'موديل غير محدد' }}</div>
          </div>
        </div>

        <!-- Appointment Info -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div class="p-2.5 rounded-xl border border-brand-gray/15 bg-white dark:bg-brand-dark">
            <div class="text-[10px] text-brand-gray">منطقة الصيانة</div>
            <div class="font-bold text-brand-dark dark:text-white mt-0.5">{{ selectedBooking.bayName }}</div>
          </div>

          <div class="p-2.5 rounded-xl border border-brand-gray/15 bg-white dark:bg-brand-dark">
            <div class="text-[10px] text-brand-gray">التوقيت</div>
            <div class="font-bold font-mono text-brand-dark dark:text-white mt-0.5">
              {{ selectedBooking.startTime }} - {{ selectedBooking.endTime }}
            </div>
          </div>

          <div class="p-2.5 rounded-xl border border-brand-gray/15 bg-white dark:bg-brand-dark">
            <div class="text-[10px] text-brand-gray">الحالة</div>
            <div class="font-bold mt-0.5">
              <span :class="getStatusBadgeClass(selectedBooking.status)" class="px-2 py-0.5 rounded-full text-[10px]">
                {{ selectedBooking.statusName }}
              </span>
            </div>
          </div>
        </div>

        <!-- Services List -->
        <div v-if="selectedBooking.services && selectedBooking.services.length > 0" class="space-y-1.5">
          <h4 class="font-bold text-brand-dark dark:text-white">الخدمات المحجوزة</h4>
          <div class="divide-y divide-brand-gray/10 rounded-xl border border-brand-gray/15 bg-white dark:bg-brand-dark overflow-hidden">
            <div
              v-for="s in selectedBooking.services"
              :key="s.id"
              class="p-2.5 flex items-center justify-between"
            >
              <span class="font-medium text-brand-dark dark:text-white">{{ s.serviceName }}</span>
              <span class="font-mono font-bold">{{ s.price }} ج.م</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons Bar -->
        <div class="pt-3 border-t border-brand-gray/15 space-y-2">
          <h4 class="font-bold text-brand-dark dark:text-white">إجراءات الموعد السريعة</h4>

          <div v-if="selectedBooking.convertedJobCardId" class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between mb-2">
            <span>مرتبط بأمر الشغل:</span>
            <router-link to="/ohda/jobs" class="font-mono underline">
              {{ selectedBooking.convertedJobCardNumber || ('JOB #' + selectedBooking.convertedJobCardId) }}
            </router-link>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-if="selectedBooking.status === 2 || selectedBooking.status === 1"
              @click="changeStatus(selectedBooking.id, 3)"
              class="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Car class="w-3.5 h-3.5" />
              <span>تسجيل وصول (حضر)</span>
            </button>

            <button
              v-if="!selectedBooking.convertedJobCardId && selectedBooking.status !== 6"
              @click="convertBookingToJob(selectedBooking.id)"
              class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Wrench class="w-3.5 h-3.5" />
              <span>بدء العمل (تحويل لأمر شغل)</span>
            </button>

            <button
              v-if="selectedBooking.status === 4 || selectedBooking.status === 3"
              @click="changeStatus(selectedBooking.id, 5)"
              class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>اكتمال الصيانة</span>
            </button>

            <button
              v-if="selectedBooking.status === 1 || selectedBooking.status === 2"
              @click="changeStatus(selectedBooking.id, 7)"
              class="px-3 py-2 rounded-xl border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserX class="w-3.5 h-3.5" />
              <span>لم يحضر (No Show)</span>
            </button>

            <button
              v-if="selectedBooking.status !== 5 && selectedBooking.status !== 6"
              @click="changeStatus(selectedBooking.id, 6)"
              class="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle class="w-3.5 h-3.5" />
              <span>إلغاء الحجز</span>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showDetailsModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer"
        >
          إلغاء
        </button>
      </template>
    </OhdaModal>

    <!-- 6. Modal: Add New Client (Opens over the Booking Modal) -->
    <OhdaModal
      :visible="showAddClientModal"
      @close="showAddClientModal = false"
      title="إضافة ملف عميل جديد ومركبته"
      subtitle="سيتم حفظ العميل ومركبته واختيارهما تلقائياً لهذا الحجز"
      :icon="UserPlus"
      z-index="z-[60]"
      max-width="max-w-lg"
      :close-on-backdrop="false"
    >
      <form @submit.prevent="submitNewClientForm" id="newClientForm" class="space-y-3.5 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">اسم العميل <span class="text-red-500">*</span></label>
            <input
              v-model="newClientFormData.name"
              type="text"
              required
              placeholder="الاسم الكامل للعميل..."
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم الهاتف <span class="text-red-500">*</span></label>
            <input
              v-model="newClientFormData.phone"
              @keypress="allowOnlyNumbers"
              @input="newClientFormData.phone = filterPhone(newClientFormData.phone)"
              maxlength="15"
              type="tel"
              required
              placeholder="010XXXXXXXX"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
            />
            <p v-if="newClientFormData.phone && !isValidPhone(newClientFormData.phone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">رقم هاتف ثانٍ (اختياري)</label>
            <input
              v-model="newClientFormData.secondPhone"
              @keypress="allowOnlyNumbers"
              @input="newClientFormData.secondPhone = filterPhone(newClientFormData.secondPhone)"
              maxlength="15"
              type="tel"
              placeholder="01XXXXXXXXX"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono"
            />
            <p v-if="newClientFormData.secondPhone && !isValidPhone(newClientFormData.secondPhone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>

          <div>
            <label class="block font-semibold mb-1">نوع العميل</label>
            <select
              v-model="newClientFormData.type"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
            >
              <option :value="1">عميل فردي</option>
              <option :value="2">شركة / أسطول</option>
            </select>
          </div>
        </div>

        <!-- Initial Vehicle for the New Client -->
        <div class="p-3 bg-brand-light/40 dark:bg-white/5 rounded-xl border border-brand-gray/15 space-y-2.5">
          <div class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5 text-xs">
            <Car class="w-3.5 h-3.5 text-brand-accent" />
            <span>بيانات المركبة الأولى للعميل (اختياري)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold mb-1 text-[11px]">رقم اللوحة</label>
              <input
                v-model="newClientFormData.carPlate"
                type="text"
                placeholder="س ص ع 123"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-[11px]">نوع / ماركة السيارة</label>
              <select
                v-model="newClientFormData.selectedCarType"
                @change="onNewClientCarTypeChange"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs cursor-pointer"
              >
                <option value="">-- اختر نوع السيارة --</option>
                <option v-for="t in availableCarTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold mb-1 text-[11px]">طراز وموديل السيارة</label>
              <input
                v-model="newClientFormData.carModel"
                type="text"
                placeholder="اكتب نوع وموديل السيارة..."
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">ملاحظات العميل</label>
          <textarea
            v-model="newClientFormData.notes"
            rows="2"
            placeholder="أي ملاحظات عامة حول العميل..."
            class="w-full px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showAddClientModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="newClientForm"
          :disabled="savingNewClient"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <UserPlus class="w-4 h-4" />
          <span>{{ savingNewClient ? 'جاري الحفظ...' : 'حفظ واختيار العميل' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- 7. Modal: Instant Walk-In Entrance (All car arrivals happen inside Reservations Page) -->
    <OhdaModal
      :visible="showWalkInModal"
      @close="showWalkInModal = false"
      title="تسجيل دخول سيارة مباشرة للورشة (Walk-In)"
      description="بوابة الدخول الوحيدة للسيارات — يُسجَّل حجز فوري بالورشة وبدء أمر الشغل بنقرة واحدة"
      :icon="Car"
      max-width="max-w-lg"
      :close-on-backdrop="false"
    >
      <form @submit.prevent="submitWalkIn" id="walkInForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">اسم العميل <span class="text-red-500">*</span></label>
          <input
            type="text"
            v-model="walkInForm.customerName"
            required
            placeholder="الاسم ثلاثي..."
            class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">رقم الهاتف <span class="text-red-500">*</span></label>
            <input
              type="tel"
              v-model="walkInForm.customerPhone"
              @keypress="allowOnlyNumbers"
              @input="walkInForm.customerPhone = filterPhone(walkInForm.customerPhone)"
              maxlength="15"
              required
              placeholder="01XXXXXXXXX"
              class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم اللوحة <span class="text-red-500">*</span></label>
            <input
              type="text"
              v-model="walkInForm.carPlate"
              required
              placeholder="مثال: س ق ر 1 2 3"
              class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">نوع / ماركة السيارة</label>
            <select
              v-model="walkInForm.selectedCarType"
              @change="onWalkInCarTypeChange"
              class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white cursor-pointer"
            >
              <option value="">-- اختر نوع السيارة --</option>
              <option v-for="t in availableCarTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">موديل وطراز السيارة</label>
            <input
              type="text"
              v-model="walkInForm.carModel"
              placeholder="اكتب نوع وموديل السيارة (مثال: سيراتو 2020)..."
              class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">شكوى العميل / سبب الدخول</label>
          <textarea
            v-model="walkInForm.notes"
            rows="2"
            placeholder="سبب الدخول، الأعطال المطلوبة، أو فحص دوري..."
            class="w-full p-2.5 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer">إلغاء</button>
        <button
          type="submit"
          form="walkInForm"
          :disabled="submittingWalkIn"
          class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {{ submittingWalkIn ? 'جاري الدخول...' : 'تأكيد دخول السيارة وفتح أمر الشغل' }}
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useOhdaBookingStore } from "../stores/useOhdaBookingStore";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaLookupStore } from "../stores/useOhdaLookupStore";
import apiClient from "@/utilities/apiClient";
import OhdaModal from "../components/OhdaModal.vue";
import { exportToExcelCsv } from "../utils/excelHelper";
import { filterPhone, isValidPhone, allowOnlyNumbers } from "@/utilities/validations";
import {
  CalendarDays,
  Warehouse,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  AlertTriangle,
  Car,
  Wrench,
  CheckCircle2,
  UserX,
  XCircle,
  LayoutDashboard,
  Settings,
  Clock,
  Sparkles,
  UserCheck,
  CalendarCheck,
  Search,
  UserPlus,
  ChevronDown,
  Check,
  Download,
  MessageCircle,
  X
} from "lucide-vue-next";

const router = useRouter();
const toast = useToast();
const bookingStore = useOhdaBookingStore();
const serviceStore = useOhdaServiceStore();
const clientStore = useOhdaClientStore();
const lookupStore = useOhdaLookupStore();

// Timezone-safe local YYYY-MM-DD formatter (avoids 1-day UTC shift)
function toLocalYMD(d) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Common car brands & body types for rapid selection
const commonCarBrands = [
  "تويوتا",
  "هيونداي",
  "نيسان",
  "كيا",
  "ميتسوبيشي",
  "مرسيدس",
  "بي إم دبليو",
  "شيفروليه",
  "إم جي",
  "شيري",
  "جيلي",
  "سوزوكي",
  "فيات",
  "رينو",
  "بيجو",
  "أوبل",
  "سكودا",
  "فولكس فاجن",
  "فورد",
  "هوندا",
  "جيب",
  "بي واي دي",
  "سيدان (Sedan)",
  "دفع رباعي (SUV)",
  "بيك آب / نصف نقل",
  "فان / باص",
  "أخرى / يدوي"
];

const availableCarTypes = computed(() => {
  const fromLookup = (lookupStore.getValuesByCode?.("vehicle_brand") || []).map((b) => b.labelAr || b.value).filter(Boolean);
  return Array.from(new Set([...fromLookup, ...commonCarBrands]));
});

function onBookingCarTypeChange(e) {
  const val = e.target.value;
  if (!val || val === "أخرى / يدوي") return;
  const current = bookingForm.value.newVehicleModel?.trim() || "";
  if (!current) {
    bookingForm.value.newVehicleModel = val + " ";
  } else {
    const matched = availableCarTypes.value.find((b) => current.startsWith(b));
    if (matched) {
      bookingForm.value.newVehicleModel = val + " " + current.slice(matched.length).trim();
    } else {
      bookingForm.value.newVehicleModel = val + " " + current;
    }
  }
}

function onNewClientCarTypeChange(e) {
  const val = e.target.value;
  if (!val || val === "أخرى / يدوي") return;
  const current = newClientFormData.value.carModel?.trim() || "";
  if (!current) {
    newClientFormData.value.carModel = val + " ";
  } else {
    const matched = availableCarTypes.value.find((b) => current.startsWith(b));
    if (matched) {
      newClientFormData.value.carModel = val + " " + current.slice(matched.length).trim();
    } else {
      newClientFormData.value.carModel = val + " " + current;
    }
  }
}

function onWalkInCarTypeChange(e) {
  const val = e.target.value;
  if (!val || val === "أخرى / يدوي") return;
  const current = walkInForm.value.carModel?.trim() || "";
  if (!current) {
    walkInForm.value.carModel = val + " ";
  } else {
    const matched = availableCarTypes.value.find((b) => current.startsWith(b));
    if (matched) {
      walkInForm.value.carModel = val + " " + current.slice(matched.length).trim();
    } else {
      walkInForm.value.carModel = val + " " + current;
    }
  }
}

// Calendar View State: 'week' (Default) | 'month' | 'day'
const calendarView = ref("week");
const currentAnchorDate = ref(new Date());
const selectedDate = ref(toLocalYMD(new Date()));

// Sidebar State
const sidebarTab = ref("list");
const sidebarSearch = ref("");

// Filters
const selectedBayFilter = ref(null);
const selectedStatusFilter = ref(null);

// Instant Walk-In Modal State
const showWalkInModal = ref(false);
const submittingWalkIn = ref(false);
const walkInForm = ref({ customerName: "", customerPhone: "", carPlate: "", selectedCarType: "", carModel: "", notes: "" });

function openWalkInModal() {
  walkInForm.value = { customerName: "", customerPhone: "", carPlate: "", selectedCarType: "", carModel: "", notes: "" };
  showWalkInModal.value = true;
}

async function submitWalkIn() {
  if (!walkInForm.value.customerName?.trim() || !walkInForm.value.carPlate?.trim()) return;
  submittingWalkIn.value = true;
  try {
    const res = await bookingStore.createInstantWalkIn(walkInForm.value);
    if (res.success) {
      showWalkInModal.value = false;
      toast.add({ severity: "success", summary: "تم دخول السيارة", detail: res.message || "تم تسجيل الدخول المباشر وفتح أمر الشغل", life: 4000 });
      await loadCalendar();
    } else {
      toast.add({ severity: "error", summary: "خطأ", detail: res.message || "تعذر تسجيل الدخول المباشر", life: 4000 });
    }
  } finally {
    submittingWalkIn.value = false;
  }
}

// Modals State
const showNewBookingModal = ref(false);
const showDetailsModal = ref(false);
const selectedBooking = ref(null);
const submitting = ref(false);

const employeesList = ref([]);
const availableServices = ref([]);
const selectedServiceIds = ref([]);
const availabilityCheck = ref(null);

// Client & Vehicle Selection State
const isWalkInClient = ref(false);
const clientSearchQuery = ref("");
const isClientDropdownOpen = ref(false);
const clientVehicles = ref([]);
const selectedVehicleOption = ref("");

// Services Multi-Select Dropdown State
const serviceSearchQuery = ref("");
const isServicesDropdownOpen = ref(false);

// Add New Client Sub-Modal State
const showAddClientModal = ref(false);
const savingNewClient = ref(false);
const newClientFormData = ref({
  name: "",
  phone: "",
  secondPhone: "",
  type: 1,
  carPlate: "",
  selectedCarType: "",
  carModel: "",
  notes: ""
});

// Live Clock State
const liveDate = ref("");
const liveClock = ref("");
let clockTimer = null;

const daysOfWeekArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const bookingForm = ref({
  clientId: null,
  newClientName: "",
  newClientPhone: "",
  vehicleId: null,
  newVehiclePlate: "",
  selectedCarType: "",
  newVehicleModel: "",
  bayId: null,
  technicianEmployeeId: null,
  bookingDate: toLocalYMD(new Date()),
  startTime: "09:00",
  durationMinutes: 60,
  allowOverride: false,
  notes: "",
  services: []
});

// Computed: Filtered Clients List
const filteredClientsList = computed(() => {
  const list = clientStore.clients || [];
  if (!clientSearchQuery.value || !clientSearchQuery.value.trim()) {
    return list.slice(0, 50);
  }
  const q = clientSearchQuery.value.trim().toLowerCase();
  return list.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q)) ||
    (c.carPlate && c.carPlate.toLowerCase().includes(q)) ||
    (c.carModel && c.carModel.toLowerCase().includes(q))
  ).slice(0, 50);
});

// Computed: Filtered Available Services
const filteredAvailableServices = computed(() => {
  const list = availableServices.value || [];
  if (!serviceSearchQuery.value || !serviceSearchQuery.value.trim()) {
    return list;
  }
  const q = serviceSearchQuery.value.trim().toLowerCase();
  return list.filter(s =>
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.sellingPrice && String(s.sellingPrice).includes(q))
  );
});

// Computed: Selected Services Objects
const selectedServicesList = computed(() => {
  return (selectedServiceIds.value || []).map(id => {
    return availableServices.value.find(s => s.id === id) || { id, name: "خدمة #" + id, sellingPrice: 0, estimatedDurationMinutes: 30 };
  });
});

// Computed: Total Services Cost & Duration
const totalServicesCost = computed(() => {
  return selectedServicesList.value.reduce((acc, s) => acc + (Number(s.sellingPrice) || 0), 0);
});

const totalServicesDuration = computed(() => {
  return selectedServicesList.value.reduce((acc, s) => acc + (Number(s.estimatedDurationMinutes) || 30), 0);
});

// Computed: Filtered Bays
const filteredBays = computed(() => {
  if (selectedBayFilter.value) {
    return bookingStore.bays.filter(b => b.id === selectedBayFilter.value);
  }
  return bookingStore.bays.filter(b => b.isActive);
});

// Computed: Metrics
const currentViewBookingsCount = computed(() => (bookingStore.bookings || []).length);
const completedCount = computed(() => (bookingStore.bookings || []).filter(b => b.status === 5).length);
const remainingCount = computed(() => (bookingStore.bookings || []).filter(b => b.status !== 5 && b.status !== 6).length);
const confirmedCount = computed(() => (bookingStore.bookings || []).filter(b => b.status === 2).length);

const todayCapacityPct = computed(() => {
  if (bookingStore.capacityIndicator.length > 0) {
    return bookingStore.capacityIndicator[0].capacityPercentage || 0;
  }
  return 0;
});

// Computed: Dynamic Center Title
const currentViewTitle = computed(() => {
  const d = currentAnchorDate.value;
  if (calendarView.value === "month") {
    return d.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
  }
  if (calendarView.value === "week") {
    const days = weekDays.value;
    if (days.length === 7) {
      return `${days[0].dayNumber} ${days[0].monthName} - ${days[6].dayNumber} ${days[6].monthName} ${days[6].year}`;
    }
  }
  return d.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
});

// Computed: Week View Days (Sunday to Saturday)
const weekDays = computed(() => {
  const anchor = new Date(currentAnchorDate.value);
  const dayOfWeek = anchor.getDay(); // 0 = Sunday
  const sunday = new Date(anchor);
  sunday.setDate(anchor.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const days = [];
  const todayStr = toLocalYMD(new Date());

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = toLocalYMD(d);
    const isToday = dateStr === todayStr;
    const isWeekend = i === 5; // Friday

    const dayBookings = getBookingsForDate(dateStr);

    days.push({
      dateObj: d,
      dateStr,
      dayName: daysOfWeekArabic[i],
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("ar-EG", { month: "short" }),
      year: d.getFullYear(),
      isToday,
      isWeekend,
      bookings: dayBookings
    });
  }
  return days;
});

// Computed: Month Grid Cells (35 to 42 cells)
const monthGridCells = computed(() => {
  const anchor = new Date(currentAnchorDate.value);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  const todayStr = toLocalYMD(new Date());

  // 1. Previous Month Padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = toLocalYMD(prevDate);
    cells.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      bookings: getBookingsForDate(dateStr)
    });
  }

  // 2. Current Month Days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const curDate = new Date(year, month, dayNum);
    const dateStr = toLocalYMD(curDate);
    cells.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      bookings: getBookingsForDate(dateStr)
    });
  }

  // 3. Next Month Padding to complete multiple of 7
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const dateStr = toLocalYMD(nextDate);
    cells.push({
      dayNumber: i,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      bookings: getBookingsForDate(dateStr)
    });
  }

  return cells;
});

// Helper: Filter Bookings For Date
function getBookingsForDate(dateStr) {
  return (bookingStore.bookings || []).filter(b => {
    if (!b.bookingDate) return false;
    const bDate = b.bookingDate.split("T")[0];
    if (bDate !== dateStr) return false;
    if (selectedBayFilter.value && b.bayId !== selectedBayFilter.value) return false;
    if (selectedStatusFilter.value && b.status !== selectedStatusFilter.value) return false;
    return true;
  }).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
}

// Computed: Filtered Sidebar Bookings
const filteredSidebarBookings = computed(() => {
  let list = bookingStore.bookings || [];
  if (sidebarSearch.value && sidebarSearch.value.trim()) {
    const q = sidebarSearch.value.trim().toLowerCase();
    list = list.filter(b =>
      (b.clientName && b.clientName.toLowerCase().includes(q)) ||
      (b.clientPhone && b.clientPhone.includes(q)) ||
      (b.plateNumber && b.plateNumber.toLowerCase().includes(q)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q))
    );
  }
  return list;
});

// Lifecycle
onMounted(async () => {
  updateLiveClock();
  clockTimer = setInterval(updateLiveClock, 1000);

  try {
    await Promise.all([
      bookingStore.fetchBays(true),
      serviceStore.fetchServices(),
      clientStore.fetchClients(),
      lookupStore.fetchLookups?.(),
      loadEmployees()
    ]);
    availableServices.value = serviceStore.services || [];
    await loadCalendar();
    await bookingStore.fetchCapacityIndicator();
  } catch (e) {
    console.error("Calendar init error:", e);
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

// Client & Vehicle Selection Methods
function toggleWalkInMode() {
  isWalkInClient.value = !isWalkInClient.value;
  if (isWalkInClient.value) {
    bookingForm.value.clientId = null;
    bookingForm.value.vehicleId = null;
  }
}

async function onSelectExistingClient(client) {
  bookingForm.value.clientId = client.id;
  bookingForm.value.newClientName = client.name;
  bookingForm.value.newClientPhone = client.phone;
  isClientDropdownOpen.value = false;
  clientSearchQuery.value = "";

  // Fetch fresh vehicles for this client
  let vehicles = [];
  try {
    vehicles = await clientStore.fetchClientVehicles(client.id);
  } catch (e) {
    console.warn("fetchClientVehicles failed, fallback to client.vehicles", e);
  }
  if (!vehicles || vehicles.length === 0) {
    vehicles = client.vehicles || [];
  }
  if ((!vehicles || vehicles.length === 0) && client.carPlate) {
    vehicles = [{
      id: null,
      plateNumber: client.carPlate,
      model: client.carModel || "",
      brandName: ""
    }];
  }
  clientVehicles.value = vehicles;

  if (vehicles.length > 0) {
    const firstV = vehicles[0];
    selectedVehicleOption.value = firstV.id || firstV.plateNumber;
    bookingForm.value.vehicleId = firstV.id || null;
    bookingForm.value.newVehiclePlate = firstV.plateNumber;
    bookingForm.value.newVehicleModel = [firstV.brandName || firstV.brand, firstV.model].filter(Boolean).join(" ") || firstV.model || "";
  } else {
    selectedVehicleOption.value = "__NEW_VEHICLE__";
    bookingForm.value.vehicleId = null;
    bookingForm.value.newVehiclePlate = client.carPlate || "";
    bookingForm.value.newVehicleModel = client.carModel || "";
  }
}

function onVehicleOptionChanged() {
  if (selectedVehicleOption.value === "__NEW_VEHICLE__") {
    bookingForm.value.vehicleId = null;
    bookingForm.value.newVehiclePlate = "";
    bookingForm.value.newVehicleModel = "";
    return;
  }
  const found = clientVehicles.value.find(v => (v.id === selectedVehicleOption.value || v.plateNumber === selectedVehicleOption.value));
  if (found) {
    bookingForm.value.vehicleId = found.id || null;
    bookingForm.value.newVehiclePlate = found.plateNumber;
    bookingForm.value.newVehicleModel = [found.brandName || found.brand, found.model].filter(Boolean).join(" ") || found.model || "";
  }
}

// Add New Client Sub-Modal Methods
function openAddClientModal() {
  newClientFormData.value = {
    name: clientSearchQuery.value.trim() || "",
    phone: "",
    secondPhone: "",
    type: 1,
    carPlate: "",
    selectedCarType: "",
    carModel: "",
    notes: ""
  };
  showAddClientModal.value = true;
}

function openAddClientModalWithQuery() {
  newClientFormData.value = {
    name: clientSearchQuery.value.trim(),
    phone: "",
    secondPhone: "",
    type: 1,
    carPlate: "",
    selectedCarType: "",
    carModel: "",
    notes: ""
  };
  isClientDropdownOpen.value = false;
  showAddClientModal.value = true;
}

async function submitNewClientForm() {
  if (!newClientFormData.value.name?.trim() || !newClientFormData.value.phone?.trim()) {
    toast.add({
      severity: "warn",
      summary: "بيانات ناقصة",
      detail: "اسم العميل ورقم هاتفه مطلوبان",
      life: 3000
    });
    return;
  }
  savingNewClient.value = true;
  try {
    const payload = {
      name: newClientFormData.value.name.trim(),
      phone: newClientFormData.value.phone.trim(),
      secondPhone: newClientFormData.value.secondPhone?.trim() || null,
      type: newClientFormData.value.type || 1,
      notes: newClientFormData.value.notes?.trim() || null
    };
    if (newClientFormData.value.carPlate?.trim()) {
      payload.initialVehicle = {
        plateNumber: newClientFormData.value.carPlate.trim().toUpperCase(),
        model: newClientFormData.value.carModel?.trim() || null
      };
    }

    const res = await clientStore.createClient(payload);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تمت إضافة العميل",
        detail: "تم حفظ ملف العميل ومركبته بنجاح واختياره للحجز",
        life: 3000
      });
      showAddClientModal.value = false;
      await clientStore.fetchClients();

      const created = clientStore.clients.find(c => c.phone === payload.phone || (res.data?.id && c.id === res.data.id));
      if (created) {
        await onSelectExistingClient(created);
      } else if (res.data?.id) {
        await onSelectExistingClient({
          id: res.data.id,
          name: payload.name,
          phone: payload.phone,
          carPlate: payload.initialVehicle?.plateNumber || "",
          carModel: payload.initialVehicle?.model || ""
        });
      }
    } else {
      toast.add({
        severity: "error",
        summary: "تعذر الحفظ",
        detail: res.message || "حدث خطأ أثناء حفظ العميل",
        life: 4000
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.message,
      life: 4000
    });
  } finally {
    savingNewClient.value = false;
  }
}

// Services Multi-Select Methods
function toggleService(svc) {
  const idx = selectedServiceIds.value.indexOf(svc.id);
  if (idx > -1) {
    selectedServiceIds.value.splice(idx, 1);
  } else {
    selectedServiceIds.value.push(svc.id);
  }
  onServicesSelectionChanged();
}

function clearAllSelectedServices() {
  selectedServiceIds.value = [];
  onServicesSelectionChanged();
}

function onServicesSelectionChanged() {
  bookingForm.value.services = selectedServiceIds.value.map(id => {
    const svc = availableServices.value.find(s => s.id === id);
    return {
      workshopServiceId: id,
      price: svc ? svc.sellingPrice : 0
    };
  });
  if (selectedServiceIds.value.length > 0) {
    bookingForm.value.durationMinutes = totalServicesDuration.value || 60;
  } else {
    bookingForm.value.durationMinutes = 60;
  }
  checkAvailabilityRealtime();
}

function updateLiveClock() {
  const now = new Date();
  liveDate.value = now.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  liveClock.value = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

async function loadEmployees() {
  try {
    const res = await apiClient.get("/api/Employee");
    employeesList.value = res.data?.objects || res.data?.Objects || [];
  } catch (e) {
    console.warn("loadEmployees error:", e);
  }
}

async function loadCalendar() {
  const anchor = currentAnchorDate.value;
  const params = {
    bayId: selectedBayFilter.value,
    status: selectedStatusFilter.value
  };

  if (calendarView.value === "day") {
    params.date = selectedDate.value;
  } else if (calendarView.value === "week") {
    const sunday = new Date(anchor);
    sunday.setDate(anchor.getDate() - anchor.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    params.fromDate = toLocalYMD(sunday);
    params.toDate = toLocalYMD(saturday);
  } else if (calendarView.value === "month") {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    firstDay.setDate(firstDay.getDate() - 7);
    lastDay.setDate(lastDay.getDate() + 7);
    params.fromDate = toLocalYMD(firstDay);
    params.toDate = toLocalYMD(lastDay);
  }

  await bookingStore.fetchBookings(params);
}

function setViewMode(mode) {
  calendarView.value = mode;
  loadCalendar();
}

function navigate(direction) {
  const d = new Date(currentAnchorDate.value);
  if (calendarView.value === "month") {
    d.setMonth(d.getMonth() + direction);
  } else if (calendarView.value === "week") {
    d.setDate(d.getDate() + (direction * 7));
  } else {
    d.setDate(d.getDate() + direction);
  }
  currentAnchorDate.value = d;
  selectedDate.value = toLocalYMD(d);
  loadCalendar();
}

function goToToday() {
  currentAnchorDate.value = new Date();
  selectedDate.value = toLocalYMD(new Date());
  loadCalendar();
}

function getBookingsForSlot(bayId, hour) {
  return (bookingStore.bookings || []).filter(b => {
    if (b.bayId !== bayId) return false;
    if (selectedStatusFilter.value && b.status !== selectedStatusFilter.value) return false;
    const startHour = b.startTime ? (b.startTime.split(":")[0] + ":00") : "";
    return startHour === hour;
  });
}

function onSlotClick(bay, hour) {
  isWalkInClient.value = false;
  clientSearchQuery.value = "";
  serviceSearchQuery.value = "";
  isClientDropdownOpen.value = false;
  isServicesDropdownOpen.value = false;
  clientVehicles.value = [];
  selectedVehicleOption.value = "";

  bookingForm.value = {
    clientId: null,
    newClientName: "",
    newClientPhone: "",
    vehicleId: null,
    newVehiclePlate: "",
    selectedCarType: "",
    newVehicleModel: "",
    bayId: bay.id,
    technicianEmployeeId: null,
    bookingDate: selectedDate.value,
    startTime: hour,
    durationMinutes: 60,
    allowOverride: false,
    notes: "",
    services: []
  };
  selectedServiceIds.value = [];
  availabilityCheck.value = null;
  showNewBookingModal.value = true;
  checkAvailabilityRealtime();
}

function openNewBookingModal() {
  openNewBookingForDay(selectedDate.value);
}

function openNewBookingForDay(dateStr) {
  selectedDate.value = dateStr;
  isWalkInClient.value = false;
  clientSearchQuery.value = "";
  serviceSearchQuery.value = "";
  isClientDropdownOpen.value = false;
  isServicesDropdownOpen.value = false;
  clientVehicles.value = [];
  selectedVehicleOption.value = "";

  bookingForm.value = {
    clientId: null,
    newClientName: "",
    newClientPhone: "",
    vehicleId: null,
    newVehiclePlate: "",
    selectedCarType: "",
    newVehicleModel: "",
    bayId: bookingStore.bays[0]?.id || null,
    technicianEmployeeId: null,
    bookingDate: dateStr,
    startTime: "09:00",
    durationMinutes: 60,
    allowOverride: false,
    notes: "",
    services: []
  };
  selectedServiceIds.value = [];
  availabilityCheck.value = null;
  showNewBookingModal.value = true;
  checkAvailabilityRealtime();
}

function openQuickAttendance() {
  const pendingArrived = (bookingStore.bookings || []).find(b => b.status === 2 || b.status === 1);
  if (pendingArrived) {
    openBookingDetails(pendingArrived);
  } else {
    toast.add({
      severity: "info",
      summary: "تسجيل الحضور",
      detail: "لا توجد مواعيد معلقة بحاجة لتسجيل الحضور حالياً",
      life: 3000
    });
  }
}

async function checkAvailabilityRealtime() {
  if (!bookingForm.value.bayId || !bookingForm.value.bookingDate || !bookingForm.value.startTime) {
    availabilityCheck.value = null;
    return;
  }
  try {
    const res = await bookingStore.checkAvailability({
      bayId: bookingForm.value.bayId,
      bookingDate: bookingForm.value.bookingDate,
      startTime: bookingForm.value.startTime,
      durationMinutes: bookingForm.value.durationMinutes || 60,
      technicianEmployeeId: bookingForm.value.technicianEmployeeId
    });
    availabilityCheck.value = res;
  } catch (e) {
    console.warn("Availability check error:", e);
  }
}

async function submitCreateBooking() {
  // Validate client selection
  if (!isWalkInClient.value && !bookingForm.value.clientId) {
    toast.add({
      severity: "warn",
      summary: "بيانات ناقصة",
      detail: "يرجى اختيار العميل من القائمة أو إضافة عميل جديد أو التبديل لحجز زائر",
      life: 4000
    });
    return;
  }

  if (isWalkInClient.value && (!bookingForm.value.newClientName?.trim() || !bookingForm.value.newClientPhone?.trim())) {
    toast.add({
      severity: "warn",
      summary: "بيانات ناقصة",
      detail: "اسم العميل الزائر ورقم هاتفه مطلوبان",
      life: 4000
    });
    return;
  }

  submitting.value = true;
  try {
    const payload = { ...bookingForm.value };
    const res = await bookingStore.createBooking(payload);
    toast.add({
      severity: "success",
      summary: "تم الحجز بنجاح",
      detail: res.returnMessage || "تم تسجيل الحجز بنجاح",
      life: 3000
    });
    showNewBookingModal.value = false;
    await loadCalendar();
    await bookingStore.fetchCapacityIndicator();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "تعذر الحجز",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  } finally {
    submitting.value = false;
  }
}

function openBookingDetails(booking) {
  selectedBooking.value = booking;
  showDetailsModal.value = true;
}

async function openWhatsAppReminder(bk) {
  if (!bk || !bk.id) return;
  try {
    const res = await apiClient.get(`/api/WhatsApp/booking/${bk.id}/preview`);
    if (res.data?.isDone && res.data?.singleObject) {
      const waUrl = res.data.singleObject.whatsAppUrl;
      if (waUrl) {
        window.open(waUrl, "_blank");
        bk.reminderSentAt = new Date().toISOString();
        toast.add({
          severity: "success",
          summary: "واتساب",
          detail: "تم تجهيز رسالة التذكير وفتح واتساب بنجاح.",
          life: 3000
        });
        apiClient.post(`/api/WhatsApp/booking/${bk.id}/send`).catch(() => {});
        return;
      }
    }
    if (bk.whatsAppReminderUrl) {
      window.open(bk.whatsAppReminderUrl, "_blank");
      bk.reminderSentAt = new Date().toISOString();
    }
  } catch (err) {
    if (bk.whatsAppReminderUrl) {
      window.open(bk.whatsAppReminderUrl, "_blank");
      bk.reminderSentAt = new Date().toISOString();
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: "تعذر فتح رابط تذكير الواتساب.",
        life: 3000
      });
    }
  }
}

async function changeStatus(id, newStatus) {
  try {
    await bookingStore.updateBookingStatus(id, newStatus);
    toast.add({ severity: "success", summary: "تم التحديث", detail: "تم تحديث حالة الحجز بنجاح", life: 3000 });
    showDetailsModal.value = false;
    await loadCalendar();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

async function convertBookingToJob(id) {
  try {
    const res = await bookingStore.convertToJob(id);
    toast.add({
      severity: "success",
      summary: "تم التحويل بنجاح",
      detail: res.returnMessage || "تم تحويل الحجز لأمر شغل",
      life: 4000
    });
    showDetailsModal.value = false;
    await loadCalendar();
    if (res.singleObject?.jobId) {
      router.push("/ohda/jobs");
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "تعذر التحويل",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 1: return "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300";
    case 2: return "bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300";
    case 3: return "bg-purple-500/15 border-purple-500/30 text-purple-800 dark:text-purple-300";
    case 4: return "bg-cyan-500/15 border-cyan-500/30 text-cyan-800 dark:text-cyan-300";
    case 5: return "bg-teal-500/15 border-teal-500/30 text-teal-800 dark:text-teal-300";
    case 6: return "bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300";
    case 7: return "bg-gray-500/15 border-gray-500/30 text-gray-700 dark:text-gray-300";
    default: return "bg-brand-gray/10 text-brand-gray";
  }
}

function getStatusDotColor(status) {
  switch (status) {
    case 1: return "bg-amber-500";
    case 2: return "bg-blue-600";
    case 3: return "bg-purple-600";
    case 4: return "bg-cyan-500";
    case 5: return "bg-teal-600";
    case 6: return "bg-rose-500";
    default: return "bg-slate-400";
  }
}

function exportBookingsToExcel() {
  const exportCols = [
    { key: "bookingNumber", label: "رقم الحجز" },
    { key: "bookingDate", label: "تاريخ الموعد" },
    { key: "time", label: "الوقت" },
    { key: "clientName", label: "اسم العميل" },
    { key: "clientPhone", label: "رقم الهاتف" },
    { key: "carPlate", label: "رقم اللوحة" },
    { key: "carModel", label: "موديل وطراز السيارة" },
    { key: "bayName", label: "منطقة الصيانة" },
    { key: "technicianName", label: "الفني المسؤول" },
    { key: "durationMinutes", label: "المدة (دقيقة)" },
    { key: "estimatedTotal", label: "التكلفة التقديرية (ج.م)" },
    { key: "statusText", label: "حالة الحجز" }
  ];

  const exportData = (bookingStore.bookings || []).map(b => ({
    bookingNumber: b.bookingNumber || `BK-${b.id}`,
    bookingDate: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("ar-EG") : "",
    time: `${b.startTime || ""} - ${b.endTime || ""}`,
    clientName: b.clientName || "",
    clientPhone: b.clientPhone || "",
    carPlate: b.carPlate || "",
    carModel: b.carModel || "",
    bayName: b.bayName || "",
    technicianName: b.technicianName || "—",
    durationMinutes: b.durationMinutes || 0,
    estimatedTotal: b.estimatedTotal || 0,
    statusText: b.statusText || ""
  }));

  exportToExcelCsv("جدول_مواعيد_وحجوزات_الورشة.csv", exportCols, exportData);
  toast.add({ severity: "success", summary: "تصدير Excel", detail: `تم تصدير ${exportData.length} موعد وحجز بنجاح`, life: 3000 });
}
</script>
