<template>
  <div class="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4 relative overflow-hidden text-brand-dark">
    <div class="absolute top-10 start-10 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-10 end-10 w-96 h-96 bg-brand-gray/5 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Language Toggle Button using Volt Button -->
    <div class="absolute top-6 end-6 flex items-center gap-3">
      <Button
        @click="toggleLanguage"
        class="!bg-brand-white hover:!bg-brand-light !text-brand-dark !border !border-brand-gray/20 !rounded-xl !px-4 !py-2 flex items-center gap-2 text-sm backdrop-blur shadow-sm"
      >
        <Globe class="w-4 h-4 text-brand-accent" />
        <span>{{ currentLocale === 'ar' ? 'English (LTR)' : 'العربية (RTL)' }}</span>
      </Button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-brand-white border border-brand-gray/10 rounded-3xl p-8 shadow-xl z-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-accent/20">
          <Box class="w-8 h-8 text-brand-dark" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-dark mb-2">
          {{ $t('ohda.systemTitle') }}
        </h1>
        <p class="text-xs text-brand-gray">
          {{ $t('ohda.auth.subTitle') }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-brand-dark mb-2">
            {{ $t('ohda.auth.username') }}
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute start-3 top-3.5 text-brand-gray z-10" />
            <InputText
              v-model="form.username"
              type="text"
              required
              class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !rounded-xl !py-2.5 !ps-10 !pe-4 text-sm !text-brand-dark placeholder-brand-gray/60"
              placeholder="أدخل اسم المستخدم"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-dark mb-2">
            {{ $t('ohda.auth.password') }}
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute start-3 top-3.5 text-brand-gray z-10" />
            <InputText
              v-model="form.password"
              type="password"
              required
              class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !rounded-xl !py-2.5 !ps-10 !pe-4 text-sm !text-brand-dark placeholder-brand-gray/60"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          :disabled="authStore.loading"
          class="w-full !py-3 !px-4 !bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl shadow-md shadow-brand-accent/20 flex items-center justify-center gap-2"
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

const router = useRouter();
const authStore = useOhdaAuthStore();
const toast = useToast();

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
    toast.add({
      severity: "error",
      summary: currentLocale.value === "ar" ? "فشل تسجيل الدخول" : "Login Failed",
      detail: res.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
      life: 5000
    });
  }
}
</script>
