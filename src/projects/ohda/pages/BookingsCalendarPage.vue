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
              متابعة وجدولة مواعيد الصيانة الدورية وتوزيع الرافعات والفنيين على مدار الأسبوع والشهر
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

        <!-- New Booking Button -->
        <button
          type="button"
          @click="openNewBookingModal"
          class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>+ حجز موعد جديد</span>
        </button>

        <!-- Secondary Navigation Links -->
        <router-link
          to="/ohda/todays-board"
          class="px-3 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          title="لوحة اليوم السريعة للورشة"
        >
          <LayoutDashboard class="w-3.5 h-3.5 text-brand-gray" />
          <span>لوحة اليوم</span>
        </router-link>

        <router-link
          to="/ohda/bays-settings"
          class="px-3 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          title="إعدادات الرافعات ومواعيد العمل"
        >
          <Settings class="w-3.5 h-3.5 text-brand-gray" />
          <span>إعدادات الرافعات</span>
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
          <span class="text-[11px] text-brand-gray block">نسبة إشغال رافعات الورشة</span>
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
                <span>{{ bk.bayName || 'رافعة عامة' }}</span>
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
              <span>قيد العمل بالرافعة</span>
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
                <option :value="null">كل الرافعات</option>
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
                      <span class="truncate">{{ bk.bayName || 'رافعة' }}</span>
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
      description="أدخل بيانات العميل والمركبة واختر الرافعة والخدمات المطلوبة مع التحقق الفوري من التوفر"
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
        <div class="p-3 bg-brand-light/40 dark:bg-white/5 rounded-xl border border-brand-gray/15 space-y-3">
          <h4 class="font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-brand-accent" />
            <span>بيانات العميل والمركبة</span>
          </h4>

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
                type="tel"
                required
                placeholder="010XXXXXXXX"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white font-mono font-bold"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label class="block font-semibold mb-1">طراز وموديل السيارة</label>
              <input
                v-model="bookingForm.newVehicleModel"
                type="text"
                placeholder="مثال: تويوتا كورولا 2021"
                class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-brand-dark text-brand-dark dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: Bay, Date, Time & Tech -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">الرافعة / منطقة العمل <span class="text-red-500">*</span></label>
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

        <!-- Section 3: Services Selection -->
        <div class="space-y-2">
          <label class="block font-semibold">الخدمات المطلوب حجزها</label>
          <div class="max-h-36 overflow-y-auto p-2.5 rounded-xl border border-brand-gray/20 bg-brand-light/30 dark:bg-white/5 space-y-1.5">
            <div
              v-for="svc in availableServices"
              :key="svc.id"
              class="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              <label class="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  :value="svc.id"
                  v-model="selectedServiceIds"
                  @change="onServicesSelectionChanged"
                  class="w-3.5 h-3.5 rounded text-brand-accent focus:ring-0 cursor-pointer"
                />
                <span class="font-medium text-brand-dark dark:text-white">{{ svc.name }}</span>
              </label>

              <div class="text-[11px] font-mono text-brand-gray">
                {{ svc.sellingPrice }} ج.م ({{ svc.estimatedDurationMinutes || 30 }} دقيقة)
              </div>
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
            <div class="text-[10px] text-brand-gray">الرافعة / الحارة</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useOhdaBookingStore } from "../stores/useOhdaBookingStore";
import { useOhdaServiceStore } from "../stores/useOhdaServiceStore";
import apiClient from "@/utilities/apiClient";
import OhdaModal from "../components/OhdaModal.vue";
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
  Search
} from "lucide-vue-next";

const router = useRouter();
const toast = useToast();
const bookingStore = useOhdaBookingStore();
const serviceStore = useOhdaServiceStore();

// Calendar View State: 'week' (Default) | 'month' | 'day'
const calendarView = ref("week");
const currentAnchorDate = ref(new Date());
const selectedDate = ref(new Date().toISOString().split("T")[0]);

// Sidebar State
const sidebarTab = ref("list");
const sidebarSearch = ref("");

// Filters
const selectedBayFilter = ref(null);
const selectedStatusFilter = ref(null);

// Modals State
const showNewBookingModal = ref(false);
const showDetailsModal = ref(false);
const selectedBooking = ref(null);
const submitting = ref(false);

const employeesList = ref([]);
const availableServices = ref([]);
const selectedServiceIds = ref([]);
const availabilityCheck = ref(null);

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
  newVehicleModel: "",
  bayId: null,
  technicianEmployeeId: null,
  bookingDate: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  durationMinutes: 60,
  allowOverride: false,
  notes: "",
  services: []
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
  const todayStr = new Date().toISOString().split("T")[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
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
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Previous Month Padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split("T")[0];
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
    const dateStr = curDate.toISOString().split("T")[0];
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
    const dateStr = nextDate.toISOString().split("T")[0];
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
    await bookingStore.fetchBays(true);
    await serviceStore.fetchServices();
    availableServices.value = serviceStore.services || [];
    await loadEmployees();
    await loadCalendar();
    await bookingStore.fetchCapacityIndicator();
  } catch (e) {
    console.error("Calendar init error:", e);
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

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
    params.fromDate = sunday.toISOString().split("T")[0];
    params.toDate = saturday.toISOString().split("T")[0];
  } else if (calendarView.value === "month") {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    firstDay.setDate(firstDay.getDate() - 7);
    lastDay.setDate(lastDay.getDate() + 7);
    params.fromDate = firstDay.toISOString().split("T")[0];
    params.toDate = lastDay.toISOString().split("T")[0];
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
  selectedDate.value = d.toISOString().split("T")[0];
  loadCalendar();
}

function goToToday() {
  currentAnchorDate.value = new Date();
  selectedDate.value = new Date().toISOString().split("T")[0];
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
  bookingForm.value = {
    clientId: null,
    newClientName: "",
    newClientPhone: "",
    vehicleId: null,
    newVehiclePlate: "",
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
  bookingForm.value = {
    clientId: null,
    newClientName: "",
    newClientPhone: "",
    vehicleId: null,
    newVehiclePlate: "",
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

function onServicesSelectionChanged() {
  bookingForm.value.services = selectedServiceIds.value.map(id => {
    const svc = availableServices.value.find(s => s.id === id);
    return {
      workshopServiceId: id,
      price: svc ? svc.sellingPrice : 0
    };
  });
  if (selectedServiceIds.value.length > 0) {
    const totalMinutes = selectedServiceIds.value.reduce((acc, id) => {
      const svc = availableServices.value.find(s => s.id === id);
      return acc + (svc?.estimatedDurationMinutes || 30);
    }, 0);
    bookingForm.value.durationMinutes = totalMinutes;
    checkAvailabilityRealtime();
  }
}

async function submitCreateBooking() {
  submitting.value = true;
  try {
    const res = await bookingStore.createBooking(bookingForm.value);
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
</script>
