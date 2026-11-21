<template>
  <div class="space-y-6">
    <!-- 1. Header & Quick Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-brand-dark dark:text-white flex items-center gap-2">
          <CalendarDays class="w-6 h-6 text-brand-accent" />
          <span>تقويم حجوزات الورشة والرافعات</span>
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          تنظيم وتوزيع مواعيد العملاء على الرافعات والفنيين مع منع التعارض والتحويل المباشر لأمر شغل
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <router-link
          to="/ohda/todays-board"
          class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>لوحة اليوم السريعة</span>
        </router-link>

        <router-link
          to="/ohda/bays-settings"
          class="px-3.5 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Settings class="w-4 h-4" />
          <span>إعدادات الرافعات والمواعيد</span>
        </router-link>

        <button
          @click="openNewBookingModal"
          class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>حجز جديد</span>
        </button>
      </div>
    </div>

    <!-- 2. KPI Metrics Ribbon -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-3.5 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 shadow-xs">
        <div class="text-[10px] text-brand-gray">إجمالي الحجوزات اليوم</div>
        <div class="text-lg font-black font-mono text-brand-dark dark:text-white mt-0.5">
          {{ todaysSummary.total || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 shadow-xs">
        <div class="text-[10px] text-blue-600 dark:text-blue-400">حجوزات مؤكدة</div>
        <div class="text-lg font-black font-mono text-blue-700 dark:text-blue-300 mt-0.5">
          {{ todaysSummary.confirmed || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-500/20 shadow-xs">
        <div class="text-[10px] text-purple-600 dark:text-purple-400">حضر للورشة</div>
        <div class="text-lg font-black font-mono text-purple-700 dark:text-purple-300 mt-0.5">
          {{ todaysSummary.arrived || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs">
        <div class="text-[10px] text-amber-600 dark:text-amber-400">قيد العمل (بالرافعة)</div>
        <div class="text-lg font-black font-mono text-amber-700 dark:text-amber-300 mt-0.5">
          {{ todaysSummary.inProgress || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
        <div class="text-[10px] text-emerald-600 dark:text-emerald-400">مكتمل</div>
        <div class="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
          {{ todaysSummary.completed || 0 }}
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-brand-dark text-white border border-brand-dark/20 shadow-xs">
        <div class="text-[10px] text-brand-accent">نسبة إشغال اليوم</div>
        <div class="text-lg font-black font-mono text-brand-accent mt-0.5">
          {{ todayCapacityPct }}%
        </div>
      </div>
    </div>

    <!-- 3. Calendar Controls & Date Picker Bar -->
    <div class="p-3.5 rounded-2xl bg-brand-white dark:bg-white/5 border border-brand-gray/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <!-- Date Navigation -->
      <div class="flex items-center gap-2">
        <button
          @click="navigateDate(-1)"
          class="p-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white cursor-pointer transition-colors"
          title="اليوم السابق"
        >
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          @click="goToToday"
          class="px-3.5 py-1.5 rounded-xl border border-brand-gray/20 hover:border-brand-accent font-bold text-brand-dark dark:text-white cursor-pointer transition-colors"
        >
          اليوم
        </button>

        <button
          @click="navigateDate(1)"
          class="p-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white cursor-pointer transition-colors"
          title="اليوم التالي"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <input
          type="date"
          v-model="selectedDate"
          @change="loadCalendar"
          class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold"
        />

        <span class="font-bold text-sm text-brand-dark dark:text-white px-2">
          {{ formatDateHeader(selectedDate) }}
        </span>
      </div>

      <!-- Filters & Bay Filter -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1.5">
          <Filter class="w-3.5 h-3.5 text-brand-gray" />
          <select
            v-model="selectedBayFilter"
            class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
          >
            <option :value="null">جميع الرافعات ومناطق العمل</option>
            <option v-for="b in bookingStore.bays" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <select
          v-model="selectedStatusFilter"
          class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white font-medium"
        >
          <option :value="null">كل الحالات</option>
          <option :value="1">قيد التأكيد (Pending)</option>
          <option :value="2">مؤكد (Confirmed)</option>
          <option :value="3">حضر للورشة (Arrived)</option>
          <option :value="4">قيد العمل (In Progress)</option>
          <option :value="5">مكتمل (Completed)</option>
          <option :value="6">ملغي (Cancelled)</option>
        </select>
      </div>
    </div>

    <!-- 4. Calendar Day Matrix View (Columns = Bays) -->
    <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15 overflow-hidden shadow-xs">
      <div v-if="filteredBays.length === 0" class="p-12 text-center text-brand-gray text-xs">
        لا توجد رافعات متاحة للعرض. يرجى تفعيل الرافعات من شاشة الإعدادات.
      </div>

      <div v-else class="overflow-x-auto">
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

          <!-- Time Rows: 09:00 to 21:00 -->
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

    <!-- 5. Modal: Create New Booking -->
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

    <!-- 6. Details Drawer Modal -->
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
          إغلاق
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
  Settings
} from "lucide-vue-next";

const router = useRouter();
const toast = useToast();
const bookingStore = useOhdaBookingStore();
const serviceStore = useOhdaServiceStore();

const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedBayFilter = ref(null);
const selectedStatusFilter = ref(null);

const showNewBookingModal = ref(false);
const showDetailsModal = ref(false);
const selectedBooking = ref(null);
const submitting = ref(false);

const employeesList = ref([]);
const availableServices = ref([]);
const selectedServiceIds = ref([]);
const availabilityCheck = ref(null);

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

const filteredBays = computed(() => {
  if (selectedBayFilter.value) {
    return bookingStore.bays.filter(b => b.id === selectedBayFilter.value);
  }
  return bookingStore.bays.filter(b => b.isActive);
});

const todaysSummary = computed(() => {
  const list = bookingStore.bookings || [];
  return {
    total: list.length,
    confirmed: list.filter(b => b.status === 2).length,
    arrived: list.filter(b => b.status === 3).length,
    inProgress: list.filter(b => b.status === 4).length,
    completed: list.filter(b => b.status === 5).length
  };
});

const todayCapacityPct = computed(() => {
  if (bookingStore.capacityIndicator.length > 0) {
    return bookingStore.capacityIndicator[0].capacityPercentage || 0;
  }
  return 0;
});

onMounted(async () => {
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

async function loadEmployees() {
  try {
    const res = await api.get("/api/Employee");
    employeesList.value = res.data?.objects || [];
  } catch (e) {
    console.warn("loadEmployees error:", e);
  }
}

async function loadCalendar() {
  await bookingStore.fetchBookings({
    date: selectedDate.value,
    bayId: selectedBayFilter.value,
    status: selectedStatusFilter.value
  });
}

function navigateDate(days) {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() + days);
  selectedDate.value = d.toISOString().split("T")[0];
  loadCalendar();
}

function goToToday() {
  selectedDate.value = new Date().toISOString().split("T")[0];
  loadCalendar();
}

function getBookingsForSlot(bayId, hour) {
  return (bookingStore.bookings || []).filter(b => {
    if (b.bayId !== bayId) return false;
    if (selectedStatusFilter.value && b.status !== selectedStatusFilter.value) return false;
    const startHour = b.startTime.split(":")[0] + ":00";
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
  bookingForm.value = {
    clientId: null,
    newClientName: "",
    newClientPhone: "",
    vehicleId: null,
    newVehiclePlate: "",
    newVehicleModel: "",
    bayId: bookingStore.bays[0]?.id || null,
    technicianEmployeeId: null,
    bookingDate: selectedDate.value,
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

function onServicesSelectionChanged() {
  let totalMins = 0;
  const items = [];
  selectedServiceIds.value.forEach(id => {
    const s = availableServices.value.find(x => x.id === id);
    if (s) {
      totalMins += (s.estimatedDurationMinutes || 30);
      items.push({
        workshopServiceId: s.id,
        estimatedDurationMinutes: s.estimatedDurationMinutes || 30,
        price: s.sellingPrice || 0
      });
    }
  });
  bookingForm.value.services = items;
  if (totalMins > 0) {
    bookingForm.value.durationMinutes = totalMins;
  }
  checkAvailabilityRealtime();
}

async function checkAvailabilityRealtime() {
  if (!bookingForm.value.bayId || !bookingForm.value.startTime || !bookingForm.value.bookingDate) return;
  availabilityCheck.value = await bookingStore.checkAvailability({
    bookingDate: bookingForm.value.bookingDate,
    bayId: bookingForm.value.bayId,
    startTime: bookingForm.value.startTime,
    durationMinutes: bookingForm.value.durationMinutes || 60,
    technicianEmployeeId: bookingForm.value.technicianEmployeeId
  });
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
      router.push("/ohda/job-cards");
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
    case 4: return "bg-orange-500/15 border-orange-500/30 text-orange-800 dark:text-orange-300";
    case 5: return "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300";
    case 6: return "bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300";
    case 7: return "bg-gray-500/15 border-gray-500/30 text-gray-700 dark:text-gray-300";
    default: return "bg-brand-gray/10 text-brand-gray";
  }
}

function formatDateHeader(val) {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch {
    return String(val);
  }
}
</script>
