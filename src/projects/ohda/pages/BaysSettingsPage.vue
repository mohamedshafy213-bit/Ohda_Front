<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-brand-dark dark:text-white flex items-center gap-2">
          <Warehouse class="w-6 h-6 text-brand-accent" />
          <span>إعدادات مناطق الصيانة ومواعيد العمل</span>
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          إدارة مناطق وحارات صيانة الورشة، وجدول ساعات العمل الرسمية، والعطلات لمنع تضارب مواعيد الحجوزات
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-if="activeTab === 'bays'"
          @click="openAddBayModal"
          class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة منطقة صيانة جديدة</span>
        </button>

        <button
          v-if="activeTab === 'holidays'"
          @click="openAddHolidayModal"
          class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة عطلة رسمية</span>
        </button>

        <button
          v-if="activeTab === 'hours'"
          @click="saveWorkingHours"
          :disabled="bookingStore.loading"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>حفظ مواعيد العمل</span>
        </button>
      </div>
    </div>

    <!-- Tabs Bar -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2 text-xs font-semibold overflow-x-auto">
      <button
        type="button"
        @click="switchTab('bays')"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'bays'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <Warehouse class="w-4 h-4" />
        <span>مناطق وحارات الصيانة ({{ (bookingStore.bays || []).length }})</span>
      </button>

      <button
        type="button"
        @click="switchTab('hours')"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'hours'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <Clock class="w-4 h-4" />
        <span>جدول ساعات العمل الأسبوعي</span>
      </button>

      <button
        type="button"
        @click="switchTab('holidays')"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeTab === 'holidays'
            ? 'bg-brand-accent text-brand-dark font-bold shadow-xs'
            : 'text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light/50'
        ]"
      >
        <CalendarOff class="w-4 h-4" />
        <span>العطلات والإجازات الرسمية ({{ (bookingStore.holidays || []).length }})</span>
      </button>
    </div>

    <!-- TAB 1: Bays Management -->
    <div v-if="activeTab === 'bays'" class="space-y-4">
      <div v-if="bookingStore.loading && bookingStore.bays.length === 0" class="text-center py-12 text-brand-gray text-xs">
        جاري تحميل مناطق الصيانة...
      </div>

      <div v-else-if="bookingStore.bays.length === 0" class="text-center py-16 bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15">
        <Warehouse class="w-12 h-12 text-brand-gray mx-auto mb-3 opacity-40" />
        <h3 class="font-bold text-sm text-brand-dark dark:text-white">لم يتم تعريف أي مناطق صيانة بعد</h3>
        <p class="text-xs text-brand-gray mt-1 max-w-sm mx-auto">
          أضف مناطق صيانة الورشة مثل منطقة 1، حارة الكهرباء، منطقة الغسيل لتنظيم وتوزيع الحجوزات.
        </p>
        <button
          @click="openAddBayModal"
          class="mt-4 px-4 py-2 rounded-xl bg-brand-accent text-brand-dark font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة منطقة صيانة أولى</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="bay in bookingStore.bays"
          :key="bay.id"
          class="p-4 sm:p-5 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-white/5 shadow-xs hover:border-brand-accent/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center font-bold text-sm">
                  #{{ bay.sortOrder }}
                </div>
                <div>
                  <h3 class="font-bold text-sm text-brand-dark dark:text-white">{{ bay.name }}</h3>
                  <span v-if="bay.bayTypeName" class="text-[11px] text-brand-gray">{{ bay.bayTypeName }}</span>
                </div>
              </div>

              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold',
                  bay.isActive
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                ]"
              >
                {{ bay.isActive ? 'مفعلة' : 'معطلة مؤقتاً' }}
              </span>
            </div>

            <p class="text-xs text-brand-gray dark:text-brand-gray/80 line-clamp-2 mt-2">
              {{ bay.notes || 'لا توجد ملاحظات إضافية.' }}
            </p>

            <div class="mt-4 pt-3 border-t border-brand-gray/10 flex items-center justify-between text-xs text-brand-gray">
              <span>حجوزات اليوم:</span>
              <span class="font-bold font-mono text-brand-dark dark:text-white">{{ bay.activeBookingsCount || 0 }} حجز</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-brand-gray/10">
            <button
              @click="editBay(bay)"
              class="px-3 py-1.5 rounded-lg border border-brand-gray/20 hover:border-brand-accent text-xs font-semibold text-brand-dark dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
            <button
              @click="confirmDeleteBay(bay)"
              class="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Working Hours -->
    <div v-if="activeTab === 'hours'" class="space-y-4">
      <div class="bg-brand-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-brand-gray/15">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 class="font-bold text-sm text-brand-dark dark:text-white mb-1">جدول ساعات العمل الأسبوعية</h3>
            <p class="text-xs text-brand-gray">
              يتم الاعتماد على هذه المواعيد لمنع حجز أي مواعيد في أوقات الراحة أو بعد انتهاء الدوام.
            </p>
          </div>
          <button
            type="button"
            @click="resetWorkingHoursToDefault"
            class="text-xs text-brand-accent hover:underline font-semibold cursor-pointer shrink-0"
          >
            استعادة المواعيد الافتراضية
          </button>
        </div>

        <div v-if="bookingStore.loading && (!workingHoursList || workingHoursList.length === 0)" class="text-center py-12 text-brand-gray text-xs">
          جاري تحميل جدول ساعات العمل...
        </div>

        <div v-else-if="!workingHoursList || workingHoursList.length === 0" class="text-center py-12 text-brand-gray text-xs">
          لم يتم العثور على بيانات مواعيد العمل.
          <button type="button" @click="resetWorkingHoursToDefault" class="text-brand-accent underline block mx-auto mt-2 font-bold cursor-pointer">
            تعبئة أسبوع العمل الافتراضي
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(day, idx) in workingHoursList"
            :key="day.id ?? idx"
            class="p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-3 w-36 shrink-0">
              <input
                type="checkbox"
                v-model="day.isWorkingDay"
                :id="'day_' + (day.id ?? idx)"
                class="w-4 h-4 rounded text-brand-accent focus:ring-0 cursor-pointer"
              />
              <label :for="'day_' + (day.id ?? idx)" class="font-bold text-brand-dark dark:text-white cursor-pointer select-none">
                {{ day.dayName }}
              </label>
              <span
                :class="[
                  'text-[10px] px-2 py-0.5 rounded-full font-bold',
                  day.isWorkingDay ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/15 text-gray-500'
                ]"
              >
                {{ day.isWorkingDay ? 'يوم عمل' : 'عطلة أسبوعية' }}
              </span>
            </div>

            <div v-if="day.isWorkingDay" class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="text-brand-gray">من:</span>
                <input
                  v-model="day.openTime"
                  type="time"
                  class="px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-white dark:bg-brand-dark font-mono font-bold text-brand-dark dark:text-white"
                />
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-brand-gray">إلى:</span>
                <input
                  v-model="day.closeTime"
                  type="time"
                  class="px-2.5 py-1.5 rounded-lg border border-brand-gray/25 bg-white dark:bg-brand-dark font-mono font-bold text-brand-dark dark:text-white"
                />
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-brand-gray">فترة راحة (غداء):</span>
                <input
                  v-model="day.lunchBreakStart"
                  type="time"
                  placeholder="بدء الراحة"
                  class="px-2 py-1.5 rounded-lg border border-brand-gray/25 bg-white dark:bg-brand-dark font-mono text-[11px]"
                />
                <span class="text-brand-gray">-</span>
                <input
                  v-model="day.lunchBreakEnd"
                  type="time"
                  placeholder="انتهاء الراحة"
                  class="px-2 py-1.5 rounded-lg border border-brand-gray/25 bg-white dark:bg-brand-dark font-mono text-[11px]"
                />
              </div>
            </div>

            <div v-else class="text-xs text-brand-gray italic">
              مغلق طوال اليوم (لا يتم قبول حجوزات)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Holidays -->
    <div v-if="activeTab === 'holidays'" class="space-y-4">
      <div v-if="bookingStore.loading && (!bookingStore.holidays || bookingStore.holidays.length === 0)" class="text-center py-12 text-brand-gray text-xs">
        جاري تحميل العطلات الرسمية...
      </div>

      <div v-else-if="!bookingStore.holidays || bookingStore.holidays.length === 0" class="text-center py-16 bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15">
        <CalendarOff class="w-12 h-12 text-brand-gray mx-auto mb-3 opacity-40" />
        <h3 class="font-bold text-sm text-brand-dark dark:text-white">لا توجد عطلات رسمية مسجلة</h3>
        <p class="text-xs text-brand-gray mt-1 max-w-sm mx-auto">
          أضف أيام الإجازات السنوية كالأعياد والمناسبات الرسمية ليتم إغلاق التقويم تلقائياً فيها.
        </p>
        <button
          type="button"
          @click="openAddHolidayModal"
          class="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة عطلة</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="h in (bookingStore.holidays || [])"
          :key="h.id"
          class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-white/5 flex items-start justify-between gap-3 shadow-xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CalendarOff class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-sm text-brand-dark dark:text-white">{{ h.name }}</h4>
              <div class="font-mono text-xs text-purple-700 dark:text-purple-300 font-bold mt-0.5">
                {{ formatDate(h.holidayDateValue || h.holidayDate) }}
              </div>
              <span v-if="h.isRecurring" class="inline-block mt-1 text-[10px] bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                تتكرر سنوياً
              </span>
              <p v-if="h.notes" class="text-xs text-brand-gray mt-1">{{ h.notes }}</p>
            </div>
          </div>

          <button
            type="button"
            @click="confirmDeleteHoliday(h)"
            class="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Add/Edit Bay -->
    <OhdaModal
      :visible="showBayModal"
      @close="showBayModal = false"
      :title="editingBayId ? 'تعديل بيانات منطقة الصيانة' : 'إضافة منطقة صيانة جديدة'"
      :description="'حدد اسم منطقة الصيانة ونوعها وترتيب ظهورها في تقويم الحجوزات'"
      :icon="Warehouse"
      :close-on-backdrop="false"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitBayForm" id="bayForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم منطقة الصيانة أو الحارة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="bayForm.name"
            type="text"
            required
            placeholder="مثال: منطقة صيانة 1 - فحص سريع"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              الترتيب بالتقويم
            </label>
            <input
              v-model.number="bayForm.sortOrder"
              type="number"
              min="1"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              الحالة التشغيلية
            </label>
            <select
              v-model="bayForm.isActive"
              class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-brand-dark text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all"
            >
              <option :value="true">مفعلة وتستقبل حجوزات</option>
              <option :value="false">معطلة / تحت الصيانة</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات وتجهيزات منطقة الصيانة
          </label>
          <textarea
            v-model="bayForm.notes"
            rows="2"
            placeholder="مثال: منطقة صيانة مجهزة بعدة عفشة وتغيير زيت..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showBayModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="bayForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
        >
          {{ submitting ? 'جاري الحفظ...' : (editingBayId ? 'حفظ التعديلات' : 'إضافة منطقة الصيانة') }}
        </button>
      </template>
    </OhdaModal>

    <!-- Modal: Add Holiday -->
    <OhdaModal
      :visible="showHolidayModal"
      @close="showHolidayModal = false"
      title="إضافة إجازة أو عطلة رسمية"
      description="اختر تاريخ العطلة واسم المناسبة ليتم استثناؤها من مواعيد الحجز المتاحة"
      :icon="CalendarOff"
      :close-on-backdrop="false"
      max-width="max-w-md"
    >
      <form @submit.prevent="submitHolidayForm" id="holidayForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            اسم العطلة / المناسبة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="holidayForm.name"
            type="text"
            required
            placeholder="مثال: عيد الفطر المبارك، إجازة 6 أكتوبر..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-medium focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            تاريخ العطلة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="holidayForm.holidayDateValue"
            type="date"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="holidayForm.isRecurring"
            id="isRecurring"
            class="w-4 h-4 rounded text-brand-accent focus:ring-0 cursor-pointer"
          />
          <label for="isRecurring" class="font-medium text-brand-dark dark:text-white cursor-pointer select-none">
            عطلة تتكرر سنوياً في نفس التاريخ
          </label>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            ملاحظات (اختياري)
          </label>
          <textarea
            v-model="holidayForm.notes"
            rows="2"
            placeholder="ملاحظات إضافية عن الإجازة..."
            class="w-full px-3.5 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showHolidayModal = false"
          class="px-4 py-2 rounded-xl border border-brand-gray/20 text-brand-dark dark:text-white hover:bg-brand-light text-xs font-semibold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="holidayForm"
          :disabled="submitting"
          class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
        >
          {{ submitting ? 'جاري الحفظ...' : 'حفظ العطلة' }}
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaBookingStore } from "../stores/useOhdaBookingStore";
import OhdaModal from "../components/OhdaModal.vue";
import {
  Warehouse,
  Clock,
  CalendarOff,
  Plus,
  Pencil,
  Trash2,
  Save
} from "lucide-vue-next";

const toast = useToast();
const bookingStore = useOhdaBookingStore();

const activeTab = ref("bays");
const showBayModal = ref(false);
const editingBayId = ref(null);
const showHolidayModal = ref(false);
const submitting = ref(false);

const workingHoursList = ref([]);

const defaultWorkingHours = [
  { dayOfWeek: 0, dayName: "الأحد", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 },
  { dayOfWeek: 1, dayName: "الإثنين", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 },
  { dayOfWeek: 2, dayName: "الثلاثاء", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 },
  { dayOfWeek: 3, dayName: "الأربعاء", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 },
  { dayOfWeek: 4, dayName: "الخميس", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 },
  { dayOfWeek: 5, dayName: "الجمعة", isWorkingDay: false, openTime: "09:00", closeTime: "21:00", lunchBreakStart: null, lunchBreakEnd: null, slotDurationMinutes: 30 },
  { dayOfWeek: 6, dayName: "السبت", isWorkingDay: true, openTime: "09:00", closeTime: "21:00", lunchBreakStart: "13:00", lunchBreakEnd: "14:00", slotDurationMinutes: 30 }
];

function resetWorkingHoursToDefault() {
  workingHoursList.value = JSON.parse(JSON.stringify(defaultWorkingHours));
}

async function switchTab(tab) {
  activeTab.value = tab;
  if (tab === "hours") {
    if (!workingHoursList.value || workingHoursList.value.length === 0) {
      try {
        const hours = await bookingStore.fetchWorkingHours();
        if (hours && hours.length > 0) {
          workingHoursList.value = JSON.parse(JSON.stringify(hours));
        } else {
          resetWorkingHoursToDefault();
        }
      } catch {
        resetWorkingHoursToDefault();
      }
    }
  } else if (tab === "holidays") {
    try {
      await bookingStore.fetchHolidays();
    } catch (e) {
      console.warn("fetchHolidays error:", e);
    }
  } else if (tab === "bays") {
    try {
      await bookingStore.fetchBays();
    } catch (e) {
      console.warn("fetchBays error:", e);
    }
  }
}

const bayForm = ref({
  id: null,
  name: "",
  sortOrder: 1,
  isActive: true,
  notes: ""
});

const holidayForm = ref({
  name: "",
  holidayDateValue: new Date().toISOString().split("T")[0],
  isRecurring: false,
  notes: ""
});

onMounted(async () => {
  await Promise.allSettled([
    bookingStore.fetchBays().catch(() => {}),
    bookingStore.fetchWorkingHours().then(hours => {
      if (hours && hours.length > 0) {
        workingHoursList.value = JSON.parse(JSON.stringify(hours));
      } else {
        resetWorkingHoursToDefault();
      }
    }).catch(() => {
      resetWorkingHoursToDefault();
    }),
    bookingStore.fetchHolidays().catch(() => {})
  ]);
});

function openAddBayModal() {
  editingBayId.value = null;
  bayForm.value = {
    id: null,
    name: "",
    sortOrder: (bookingStore.bays.length || 0) + 1,
    isActive: true,
    notes: ""
  };
  showBayModal.value = true;
}

function editBay(bay) {
  editingBayId.value = bay.id;
  bayForm.value = {
    id: bay.id,
    name: bay.name,
    sortOrder: bay.sortOrder,
    isActive: bay.isActive,
    notes: bay.notes || ""
  };
  showBayModal.value = true;
}

async function submitBayForm() {
  submitting.value = true;
  try {
    await bookingStore.saveBay(bayForm.value);
    toast.add({
      severity: "success",
      summary: "تم بنجاح",
      detail: editingBayId.value ? "تم تحديث بيانات منطقة الصيانة بنجاح" : "تمت إضافة منطقة الصيانة بنجاح",
      life: 3000
    });
    showBayModal.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  } finally {
    submitting.value = false;
  }
}

async function confirmDeleteBay(bay) {
  if (!confirm(`هل أنت متأكد من حذف منطقة الصيانة "${bay.name}"؟`)) return;
  try {
    await bookingStore.deleteBay(bay.id);
    toast.add({ severity: "success", summary: "تم الحذف", detail: "تم حذف منطقة الصيانة بنجاح", life: 3000 });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "تعذر الحذف",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

async function saveWorkingHours() {
  try {
    await bookingStore.updateWorkingHours(workingHoursList.value);
    toast.add({ severity: "success", summary: "تم الحفظ", detail: "تم حفظ مواعيد وساعات العمل بنجاح", life: 3000 });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

function openAddHolidayModal() {
  holidayForm.value = {
    name: "",
    holidayDateValue: new Date().toISOString().split("T")[0],
    isRecurring: false,
    notes: ""
  };
  showHolidayModal.value = true;
}

async function submitHolidayForm() {
  submitting.value = true;
  try {
    await bookingStore.createHoliday(holidayForm.value);
    toast.add({ severity: "success", summary: "تم بنجاح", detail: "تم تسجيل العطلة بنجاح", life: 3000 });
    showHolidayModal.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  } finally {
    submitting.value = false;
  }
}

async function confirmDeleteHoliday(h) {
  if (!confirm(`هل تريد حذف عطلة "${h.name}"؟`)) return;
  try {
    await bookingStore.deleteHoliday(h.id);
    toast.add({ severity: "success", summary: "تم الحذف", detail: "تم حذف العطلة بنجاح", life: 3000 });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

function formatDate(val) {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return String(val);
  }
}
</script>
