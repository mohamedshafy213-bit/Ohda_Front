<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-surface-900 dark:text-surface-100 transition-colors">
    <div class="absolute top-10 start-10 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-10 end-10 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Language Toggle Button -->
    <div class="absolute top-6 end-6 flex items-center gap-3">
      <Button
        @click="toggleLanguage"
        class="!bg-white dark:!bg-surface-900 hover:!bg-surface-100 dark:hover:!bg-surface-800 !text-surface-800 dark:!text-surface-200 !border !border-surface-200 dark:!border-surface-700 !rounded-xl !px-4 !py-2 flex items-center gap-2 text-sm backdrop-blur shadow-xs cursor-pointer transition-colors"
      >
        <Globe class="w-4 h-4 text-brand-accent" />
        <span>{{ currentLocale === 'ar' ? 'English (LTR)' : 'العربية (RTL)' }}</span>
      </Button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-xl z-10 transition-colors">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-accent/20">
          <Box class="w-8 h-8 text-surface-900" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 mb-2">
          {{ $t('ohda.systemTitle') }}
        </h1>
        <p class="text-xs text-surface-500 dark:text-surface-400">
          {{ $t('ohda.auth.subTitle') }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-2">
            {{ $t('ohda.auth.username') }}
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute start-3.5 top-3 text-surface-400 z-10" />
            <InputText
              v-model="form.username"
              type="text"
              required
              class="w-full !ps-10 !pe-4 !py-2.5 text-sm"
              :placeholder="$t('ohda.auth.usernamePlaceholder')"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-2">
            {{ $t('ohda.auth.password') }}
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute start-3.5 top-3 text-surface-400 z-10" />
            <InputText
              v-model="form.password"
              type="password"
              required
              class="w-full !ps-10 !pe-4 !py-2.5 text-sm"
              :placeholder="$t('ohda.auth.passwordPlaceholder')"
            />
          </div>
        </div>

        <Button
          type="submit"
          :disabled="authStore.loading"
          class="w-full !py-3 !px-4 !bg-brand-accent hover:!bg-brand-accent/90 !text-surface-900 !font-bold !rounded-xl shadow-md shadow-brand-accent/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span v-if="!authStore.loading">{{ $t('ohda.auth.loginBtn') }}</span>
          <span v-else>{{ $t('ohda.common.loading') }}</span>
          <ArrowRight v-if="currentLocale === 'en'" class="w-4 h-4" />
          <ArrowLeft v-else class="w-4 h-4" />
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { setLocale, getCurrentLocale } from "@/i18n";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useToastStore } from "@/stores/toastStore";

const router = useRouter();
const authStore = useOhdaAuthStore();
const toastStore = useToastStore();

const currentLocale = computed(() => getCurrentLocale());

const form = ref({
  username: "admin",
  password: "Admin@123"
});

function toggleLanguage() {
  const target = currentLocale.value === "ar" ? "en" : "ar";
  setLocale(target);
}

async function handleLogin() {
  const res = await authStore.login(form.value.username, form.value.password);
  if (res.success) {
    if (authStore.isSuperAdmin) {
      router.push("/ohda/branches");
    } else {
      router.push("/ohda/dashboard");
    }
  } else {
    toastStore.addErrorToast({
      title: currentLocale.value === "ar" ? "فشل تسجيل الدخول" : "Login Failed",
      message: res.message || (currentLocale.value === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password")
    });
  }
}
</script>
