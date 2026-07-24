<template>
  <div class="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
    <div class="absolute top-10 start-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-10 end-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Language Toggle Button using Volt Button -->
    <div class="absolute top-6 end-6 flex items-center gap-3">
      <Button
        @click="toggleLanguage"
        class="!bg-slate-800/80 hover:!bg-slate-700 !text-slate-200 !border !border-slate-700/60 !rounded-xl !px-4 !py-2 flex items-center gap-2 text-sm backdrop-blur"
      >
        <Globe class="w-4 h-4 text-emerald-400" />
        <span>{{ currentLocale === 'ar' ? 'English (LTR)' : 'العربية (RTL)' }}</span>
      </Button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl z-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Box class="w-8 h-8 text-slate-950" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-white mb-2">
          {{ $t('ohda.systemTitle') }}
        </h1>
        <p class="text-xs text-slate-400">
          {{ $t('ohda.auth.subTitle') }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-2">
            {{ $t('ohda.auth.username') }}
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute start-3 top-3.5 text-slate-400 z-10" />
            <InputText
              v-model="form.username"
              type="text"
              required
              class="w-full !bg-slate-900/60 !border-slate-700 focus:!border-emerald-500 !rounded-xl !py-2.5 !ps-10 !pe-4 text-sm !text-slate-100 placeholder-slate-500"
              placeholder="أدخل اسم المستخدم"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-2">
            {{ $t('ohda.auth.password') }}
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute start-3 top-3.5 text-slate-400 z-10" />
            <InputText
              v-model="form.password"
              type="password"
              required
              class="w-full !bg-slate-900/60 !border-slate-700 focus:!border-emerald-500 !rounded-xl !py-2.5 !ps-10 !pe-4 text-sm !text-slate-100 placeholder-slate-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          :disabled="authStore.loading"
          class="w-full !py-3 !px-4 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-400 hover:!to-teal-400 !text-slate-950 !font-bold !rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
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
    router.push("/ohda/dashboard");
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
