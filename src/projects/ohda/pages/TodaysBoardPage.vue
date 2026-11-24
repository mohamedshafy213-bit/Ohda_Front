<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-brand-dark dark:text-white flex items-center gap-2">
          <LayoutDashboard class="w-6 h-6 text-brand-accent" />
          <span>لوحة اليوم السريعة (Today's Board)</span>
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          لوحة العمل السريعة لاستقبال ومتابعة حجوزات اليوم مع أزرار لمس سريعة لتسجيل الحضور وبدء الشغل
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openWalkInModal"
          class="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
        >
          <UserPlus class="w-4 h-4" />
          <span>+ حضور مباشر للعميل (Walk-in)</span>
        </button>

        <router-link
          to="/ohda/bookings-calendar"
          class="px-3.5 py-2 rounded-xl border border-brand-gray/20 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CalendarDays class="w-4 h-4" />
          <span>التقويم الكامل</span>
        </router-link>

        <button
          @click="loadBoard"
          :disabled="bookingStore.loading"
          class="px-3.5 py-2 rounded-xl bg-brand-light dark:bg-white/10 hover:bg-brand-gray/10 text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', bookingStore.loading ? 'animate-spin' : '']" />
          <span>تحديث</span>
        </button>
      </div>
    </div>

    <!-- Status Filter Pills -->
    <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2 text-xs font-semibold overflow-x-auto">
      <button
        @click="filterStatus = null"
        :class="[
          'px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0',
          filterStatus === null ? 'bg-brand-dark text-white font-bold' : 'text-brand-gray hover:text-brand-dark hover:bg-brand-light'
        ]"
      >
        الكل ({{ todaysList.length }})
      </button>

      <button
        @click="filterStatus = 2"
        :class="[
          'px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0',
          filterStatus === 2 ? 'bg-blue-600 text-white font-bold' : 'text-brand-gray hover:text-brand-dark hover:bg-brand-light'
        ]"
      >
        مؤكدة تنتظر الوصول ({{ confirmedCount }})
      </button>

      <button
        @click="filterStatus = 3"
        :class="[
          'px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0',
          filterStatus === 3 ? 'bg-purple-600 text-white font-bold' : 'text-brand-gray hover:text-brand-dark hover:bg-brand-light'
        ]"
      >
        حضر بالورشة جاهز للشغل ({{ arrivedCount }})
      </button>

      <button
        @click="filterStatus = 4"
        :class="[
          'px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0',
          filterStatus === 4 ? 'bg-orange-600 text-white font-bold' : 'text-brand-gray hover:text-brand-dark hover:bg-brand-light'
        ]"
      >
        قيد الصيانة بمنطقة العمل ({{ inProgressCount }})
      </button>

      <button
        @click="filterStatus = 5"
        :class="[
          'px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0',
          filterStatus === 5 ? 'bg-emerald-600 text-white font-bold' : 'text-brand-gray hover:text-brand-dark hover:bg-brand-light'
        ]"
      >
        مكتملة ({{ completedCount }})
      </button>
    </div>

    <!-- Bookings Cards Grid -->
    <div v-if="bookingStore.loading && todaysList.length === 0" class="text-center py-12 text-brand-gray text-xs">
      جاري تحميل حجوزات اليوم...
    </div>

    <div v-else-if="filteredList.length === 0" class="text-center py-16 bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/15">
      <CalendarCheck2 class="w-12 h-12 text-brand-gray mx-auto mb-3 opacity-40" />
      <h3 class="font-bold text-sm text-brand-dark dark:text-white">لا توجد حجوزات في هذا التصنيف اليوم</h3>
      <p class="text-xs text-brand-gray mt-1">
        يمكنك تسجيل حجز جديد من شاشة التقويم.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="bk in filteredList"
        :key="bk.id"
        class="p-4 sm:p-5 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-white/5 shadow-xs flex flex-col justify-between hover:border-brand-accent/50 transition-all space-y-4"
      >
        <!-- Top Info -->
        <div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-mono text-brand-gray font-bold">#{{ bk.bookingNumber }}</span>
              <h3 class="font-bold text-sm text-brand-dark dark:text-white mt-0.5">{{ bk.clientName }}</h3>
              <a :href="'tel:' + bk.clientPhone" class="text-xs font-mono text-brand-accent hover:underline font-bold">
                {{ bk.clientPhone }}
              </a>
            </div>

            <span :class="getStatusBadgeClass(bk.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold">
              {{ bk.statusName }}
            </span>
          </div>

          <!-- Vehicle & Bay Strip -->
          <div class="mt-3 p-2.5 rounded-xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/10 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 font-bold">
              <Car class="w-4 h-4 text-brand-gray" />
              <span class="font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">{{ bk.plateNumber || 'بدون لوحة' }}</span>
              <span class="text-[11px] text-brand-gray font-normal">{{ bk.vehicleModel }}</span>
            </div>

            <div class="text-[11px] font-bold text-brand-dark dark:text-white flex items-center gap-1">
              <Warehouse class="w-3.5 h-3.5 text-brand-accent" />
              <span>{{ bk.bayName }}</span>
            </div>
          </div>

          <!-- Time & Technician -->
          <div class="mt-2.5 flex items-center justify-between text-xs text-brand-gray">
            <div class="flex items-center gap-1 font-mono font-bold text-brand-dark dark:text-white">
              <Clock class="w-3.5 h-3.5 text-brand-gray" />
              <span>{{ bk.startTime }} - {{ bk.endTime }}</span>
              <span class="text-[10px] font-normal text-brand-gray">({{ bk.durationMinutes }} دقيقة)</span>
            </div>

            <div v-if="bk.technicianName" class="text-[11px]">
              الفني: <span class="font-bold text-brand-dark dark:text-white">{{ bk.technicianName }}</span>
            </div>
          </div>

          <!-- Services List -->
          <div v-if="bk.services && bk.services.length > 0" class="mt-3 pt-2 border-t border-brand-gray/10 text-xs">
            <div class="text-[10px] text-brand-gray mb-1">الخدمات:</div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="s in bk.services"
                :key="s.id"
                class="px-2 py-0.5 rounded-md bg-brand-light dark:bg-white/10 text-[10px] font-medium"
              >
                {{ s.serviceName }} ({{ s.price }} ج.م)
              </span>
            </div>
          </div>

          <!-- Linked Job Card Badge -->
          <div v-if="bk.convertedJobCardId" class="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
            <span>مرتبط بأمر الشغل:</span>
            <router-link to="/ohda/jobs" class="font-mono underline">
              {{ bk.convertedJobCardNumber || ('JOB #' + bk.convertedJobCardId) }}
            </router-link>
          </div>
        </div>

        <!-- Big Touch Action Buttons -->
        <div class="pt-3 border-t border-brand-gray/15 grid grid-cols-2 gap-2 text-xs">
          <!-- Button 1: Arrived -->
          <button
            v-if="bk.status === 1 || bk.status === 2"
            @click="updateStatus(bk.id, 3)"
            class="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
          >
            <Car class="w-4 h-4" />
            <span>حضر للورشة</span>
          </button>

          <!-- Button 2: Start Job / Convert to JobCard -->
          <button
            v-if="!bk.convertedJobCardId && bk.status !== 6"
            @click="convertToJob(bk.id)"
            class="px-3 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
          >
            <Wrench class="w-4 h-4" />
            <span>بدء الشغل (أمر شغل)</span>
          </button>

          <!-- Button 3: Complete -->
          <button
            v-if="bk.status === 4 || bk.status === 3"
            @click="updateStatus(bk.id, 5)"
            class="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>اكتمال الصيانة</span>
          </button>

          <!-- Button 4: No Show -->
          <button
            v-if="bk.status === 1 || bk.status === 2"
            @click="updateStatus(bk.id, 7)"
            class="px-3 py-2.5 rounded-xl border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <UserX class="w-4 h-4" />
            <span>لم يحضر</span>
          </button>

          <!-- Button 5: Cancel -->
          <button
            v-if="bk.status !== 5 && bk.status !== 6"
            @click="updateStatus(bk.id, 6)"
            class="px-3 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <XCircle class="w-4 h-4" />
            <span>إلغاء</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Walk-in Instant Booking & Job Modal -->
    <OhdaModal
      :visible="showWalkInModal"
      @close="showWalkInModal = false"
      title="تسجيل حضور مباشر للعميل (Walk-In)"
      description="إنشاء حجز فوري وبدء أمر الشغل واستلام المركبة بنقرة واحدة"
      :icon="UserPlus"
      max-width="max-w-lg"
    >
      <form @submit.prevent="submitWalkIn" id="walkInForm" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">اسم العميل *</label>
          <input
            type="text"
            v-model="walkInForm.customerName"
            required
            placeholder="الاسم ثلاثي..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1">رقم الهاتف</label>
            <input
              type="tel"
              v-model="walkInForm.customerPhone"
              @keypress="allowOnlyNumbers"
              @input="walkInForm.customerPhone = filterPhone(walkInForm.customerPhone)"
              maxlength="15"
              placeholder="01XXXXXXXXX"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">رقم اللوحة *</label>
            <input
              type="text"
              v-model="walkInForm.carPlate"
              required
              placeholder="مثال: س ق ر 1 2 3"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white font-mono font-bold focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1">موديل / نوع السيارة</label>
          <input
            type="text"
            v-model="walkInForm.carModel"
            placeholder="مثال: كيا سيراتو 2020"
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">شكوى العميل / ملاحظات الدخول</label>
          <textarea
            v-model="walkInForm.notes"
            rows="2"
            placeholder="سبب الدخول، الأعطال المطلوبة، أو فحص دوري..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 dark:border-white/10 bg-transparent text-brand-dark dark:text-white focus:border-brand-accent transition-all"
          ></textarea>
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
          form="walkInForm"
          :disabled="bookingStore.loading"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-brand-dark cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ bookingStore.loading ? 'جاري التسجيل...' : 'بدء أمر الشغل فوراً' }}</span>
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
import OhdaModal from "../components/OhdaModal.vue";
import { filterPhone, allowOnlyNumbers } from "@/utilities/validations";
import {
  LayoutDashboard,
  CalendarDays,
  RefreshCw,
  Car,
  Warehouse,
  Clock,
  Wrench,
  CheckCircle2,
  UserX,
  XCircle,
  CalendarCheck2,
  UserPlus
} from "lucide-vue-next";

const router = useRouter();
const toast = useToast();
const bookingStore = useOhdaBookingStore();

const filterStatus = ref(null);

const showWalkInModal = ref(false);
const walkInForm = ref({
  customerName: "",
  customerPhone: "",
  carPlate: "",
  carModel: "",
  notes: ""
});

function openWalkInModal() {
  walkInForm.value = {
    customerName: "",
    customerPhone: "",
    carPlate: "",
    carModel: "",
    notes: ""
  };
  showWalkInModal.value = true;
}

async function submitWalkIn() {
  if (!walkInForm.value.customerName?.trim() || !walkInForm.value.carPlate?.trim()) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "اسم العميل ورقم اللوحة مطلوبان.", life: 3000 });
    return;
  }

  const res = await bookingStore.createInstantWalkIn(walkInForm.value);
  if (res.success) {
    showWalkInModal.value = false;
    toast.add({
      severity: "success",
      summary: "تم بنجاح",
      detail: res.message || "تم تسجيل الحضور المباشر وبدء أمر الشغل بنجاح",
      life: 4000
    });
    await loadBoard();
    if (res.data?.jobId) {
      router.push("/ohda/jobs");
    }
  } else {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: res.message || "تعذر تسجيل الحضور وبدء الشغل",
      life: 4000
    });
  }
}

onMounted(async () => {
  await loadBoard();
});

async function loadBoard() {
  try {
    await bookingStore.fetchTodaysBoard();
  } catch (err) {
    console.error("loadBoard error:", err);
  }
}

const todaysList = computed(() => {
  return bookingStore.todaysBoard?.bookings || [];
});

const confirmedCount = computed(() => todaysList.value.filter(b => b.status === 2).length);
const arrivedCount = computed(() => todaysList.value.filter(b => b.status === 3).length);
const inProgressCount = computed(() => todaysList.value.filter(b => b.status === 4).length);
const completedCount = computed(() => todaysList.value.filter(b => b.status === 5).length);

const filteredList = computed(() => {
  if (!filterStatus.value) return todaysList.value;
  return todaysList.value.filter(b => b.status === filterStatus.value);
});

async function updateStatus(id, newStatus) {
  try {
    await bookingStore.updateBookingStatus(id, newStatus);
    toast.add({ severity: "success", summary: "تم التحديث", detail: "تم تحديث حالة الحجز بنجاح", life: 3000 });
    await loadBoard();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: err.response?.data?.returnMessage || err.message,
      life: 4000
    });
  }
}

async function convertToJob(id) {
  try {
    const res = await bookingStore.convertToJob(id);
    toast.add({
      severity: "success",
      summary: "تم التحويل بنجاح",
      detail: res.returnMessage || "تم فتح أمر شغل للمركبة بنجاح",
      life: 4000
    });
    await loadBoard();
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
    case 1: return "bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300";
    case 2: return "bg-blue-500/15 border border-blue-500/30 text-blue-800 dark:text-blue-300";
    case 3: return "bg-purple-500/15 border border-purple-500/30 text-purple-800 dark:text-purple-300";
    case 4: return "bg-orange-500/15 border border-orange-500/30 text-orange-800 dark:text-orange-300";
    case 5: return "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300";
    case 6: return "bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300";
    case 7: return "bg-gray-500/15 border border-gray-500/30 text-gray-700 dark:text-gray-300";
    default: return "bg-brand-gray/10 text-brand-gray";
  }
}
</script>
