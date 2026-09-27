<template>
  <Dialog
    v-model:visible="showModal"
    modal
    :closable="false"
    :closeOnEscape="false"
    class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-lg w-full !text-brand-dark dark:!text-brand-light font-sans"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <ShieldAlert class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-brand-dark dark:text-white">
            {{ isAr ? 'تغيير كلمة المرور إلزامي' : 'Mandatory Password Change' }}
          </h2>
          <p class="text-[11px] text-brand-gray">
            {{ isAr ? 'يرجى تعيين كلمة مرور جديدة لحسابك لمتابعة استخدام النظام' : 'Please set a new password to continue using the system' }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4 pt-2">
      <!-- Notice Alert -->
      <div class="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
        <KeyRound class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div class="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          {{ isAr 
            ? 'تم تسجيل الدخول بكلمة المرور الافتراضية (P@ssw0rd). لأسباب أمنية، يتوجب عليك إنشاء كلمة مرور قوية خاصة بك قبل البدء في استخدام النظام.'
            : 'You logged in with the default password (P@ssw0rd). For security, you must set a new strong password before proceeding.' }}
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Current Password -->
        <div>
          <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
            {{ isAr ? 'كلمة المرور الحالية (الافتراضية)' : 'Current (Default) Password' }} *
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              v-model="form.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              required
              placeholder="P@ssw0rd"
              class="w-full ps-9 pe-10 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark dark:hover:text-white p-1"
            >
              <Eye v-if="!showCurrent" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
            {{ isAr ? 'كلمة المرور الجديدة' : 'New Password' }} *
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full ps-9 pe-10 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
            />
            <button
              type="button"
              @click="showNew = !showNew"
              class="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark dark:hover:text-white p-1"
            >
              <Eye v-if="!showNew" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <span class="text-[10px] text-brand-gray block mt-1">
            {{ isAr ? 'يجب أن لا تقل كلمة المرور عن 6 خانات وتختلف عن كلمة المرور الافتراضية' : 'Must be at least 6 characters and different from default' }}
          </span>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
            {{ isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password' }} *
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full ps-9 pe-10 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark dark:hover:text-white p-1"
            >
              <Eye v-if="!showConfirm" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-brand-gray/15">
          <button
            type="button"
            @click="handleLogout"
            class="px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            <span>{{ isAr ? 'تسجيل الخروج' : 'Log Out' }}</span>
          </button>

          <Button
            type="submit"
            :disabled="loading"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 flex items-center gap-2 shadow-md shadow-brand-accent/20 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>{{ loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ وتعيين كلمة المرور' : 'Save & Set Password') }}</span>
          </Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { getCurrentLocale } from "@/i18n";
import { apiPost } from "@/utilities/fetchApi";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  Check
} from "lucide-vue-next";

const props = defineProps({
  manualOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["closed"]);

const router = useRouter();
const toast = useToast();
const authStore = useOhdaAuthStore();

const isAr = computed(() => getCurrentLocale() === "ar");

const showModal = computed({
  get() {
    return props.manualOpen || authStore.user?.mustChangePassword === true;
  },
  set(val) {
    if (!val && props.manualOpen) {
      emit("closed");
    }
  }
});

const loading = ref(false);
const errorMessage = ref("");
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

async function handleSubmit() {
  errorMessage.value = "";

  if (!form.value.currentPassword) {
    errorMessage.value = isAr.value ? "يرجى إدخال كلمة المرور الحالية" : "Current password is required";
    return;
  }

  if (!form.value.newPassword || form.value.newPassword.length < 6) {
    errorMessage.value = isAr.value ? "يجب أن تكون كلمة المرور الجديدة 6 خانات على الأقل" : "New password must be at least 6 characters";
    return;
  }

  if (form.value.newPassword === form.value.currentPassword) {
    errorMessage.value = isAr.value ? "كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية" : "New password must be different from current password";
    return;
  }

  if (form.value.newPassword.toLowerCase() === "p@ssw0rd") {
    errorMessage.value = isAr.value ? "لا يمكن استخدام كلمة المرور الافتراضية ككلمة مرور جديدة" : "Cannot use default password as new password";
    return;
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMessage.value = isAr.value ? "كلمة المرور الجديدة وتأكيدها غير متطابقين" : "New password and confirmation do not match";
    return;
  }

  loading.value = true;
  try {
    const res = await apiPost("/api/Auth/change-password", {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    });

    loading.value = false;

    if (res?.data?.isDone) {
      if (authStore.user) {
        authStore.user.mustChangePassword = false;
        localStorage.setItem("ohdaUser", JSON.stringify(authStore.user));
      }

      toast.add({
        severity: "success",
        summary: isAr.value ? "تم بنجاح" : "Success",
        detail: isAr.value ? "تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن متابعة العمل." : "Password changed successfully!",
        life: 4000
      });

      emit("closed");
    } else {
      errorMessage.value = res?.data?.returnMessage || (isAr.value ? "فشل تغيير كلمة المرور، يرجى التحقق من كلمة المرور الحالية" : "Failed to change password");
    }
  } catch (err) {
    loading.value = false;
    errorMessage.value = err?.response?.data?.returnMessage || (isAr.value ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect");
  }
}

function handleLogout() {
  authStore.logout();
  router.push("/ohda/login");
}
</script>
