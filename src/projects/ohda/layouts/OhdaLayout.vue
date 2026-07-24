<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- Topbar Navigation -->
    <header class="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      <!-- Brand & Mobile Toggle -->
      <div class="flex items-center gap-3">
        <button @click="sidebarOpen = !sidebarOpen" class="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer">
          <Menu class="w-6 h-6" />
        </button>
        <router-link to="/ohda/dashboard" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Box class="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 class="text-base font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
              {{ $t('ohda.systemTitle') }}
            </h1>
            <span class="text-[10px] text-emerald-400 font-mono font-semibold block">v2.5 Enterprise</span>
          </div>
        </router-link>
      </div>

      <!-- Right Header Tools: Language Switcher, Notifications, Profile & Logout -->
      <div class="flex items-center gap-3">
        <!-- Language Switcher -->
        <button
          @click="toggleLanguage"
          class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Globe class="w-4 h-4 text-emerald-400" />
          <span class="font-bold">{{ currentLocale === 'ar' ? 'EN' : 'عربي' }}</span>
        </button>

        <!-- Notifications Dropdown -->
        <div class="relative">
          <button
            @click="showNotifications = !showNotifications"
            class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl transition-all cursor-pointer relative"
          >
            <Bell class="w-4 h-4 text-amber-400" />
            <span v-if="notifStore.unreadCount > 0" class="absolute -top-1 -end-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {{ notifStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications Panel -->
          <div
            v-if="showNotifications"
            class="absolute end-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-3"
          >
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-white flex items-center gap-2">
                <Bell class="w-4 h-4 text-amber-400" />
                الإشعارات والتنبيهات
              </h3>
              <button @click="notifStore.markAllAsRead()" class="text-[10px] text-emerald-400 hover:underline cursor-pointer">
                تحديد الكل كقروء
              </button>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div
                v-for="n in notifStore.notifications"
                :key="n.id"
                @click="notifStore.markAsRead(n.id)"
                class="p-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                :class="n.isRead ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'"
              >
                <div class="font-bold mb-0.5">{{ n.title }}</div>
                <div class="text-[11px] text-slate-300">{{ n.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile & Role Pill -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <User class="w-4 h-4 text-emerald-400" />
          <div class="text-start">
            <span class="text-xs font-bold text-white block">{{ authStore.userName }}</span>
            <span class="text-[10px] text-slate-400 block">{{ authStore.user?.roleName || 'Role' }}</span>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar Navigation -->
      <aside
        :class="[
          'w-64 bg-slate-900/60 border-e border-slate-800/80 p-4 space-y-2 shrink-0 backdrop-blur transition-all duration-300 z-30',
          sidebarOpen ? 'block' : 'hidden md:block'
        ]"
      >
        <nav class="space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group"
            :class="$route.path === item.path ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-4 h-4" :class="$route.path === item.path ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'" />
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content Router Area -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-950/60">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { setLocale, getCurrentLocale } from "@/i18n";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaNotificationStore } from "../stores/useOhdaNotificationStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useI18n } from "vue-i18n";

const router = useRouter();
const authStore = useOhdaAuthStore();
const notifStore = useOhdaNotificationStore();
const requestsStore = useOhdaRequestsStore();
const { t } = useI18n();

const sidebarOpen = ref(false);
const showNotifications = ref(false);

const currentLocale = computed(() => getCurrentLocale());

const pageMeta = {
  "/ohda/dashboard": { labelKey: "ohda.nav.dashboard", icon: "LayoutGrid" },
  "/ohda/products": { labelKey: "ohda.nav.products", icon: "Package" },
  "/ohda/inventory": { labelKey: "ohda.nav.inventory", icon: "List" },
  "/ohda/exit-requests": { labelKey: "ohda.nav.exitRequests", icon: "FileText", getBadge: () => requestsStore.pendingExitRequestsCount || null },
  "/ohda/entry-requests": { labelKey: "ohda.nav.entryRequests", icon: "Download", getBadge: () => requestsStore.pendingEntryRequestsCount || null },
  "/ohda/scan": { labelKey: "ohda.nav.scan", icon: "Barcode" },
  "/ohda/categories": { labelKey: "ohda.nav.categories", icon: "Folder" },
  "/ohda/suppliers": { labelKey: "ohda.nav.suppliers", icon: "Users" },
  "/ohda/users": { labelKey: "ohda.nav.users", icon: "Shield" },
  "/ohda/notifications": { labelKey: "ohda.nav.notifications", icon: "Bell" }
};

const navItems = computed(() => {
  if (!authStore.allowedPaths) return [];
  return authStore.allowedPaths
    .filter(path => !path.toLowerCase().includes("order"))
    .map(path => {
      const meta = pageMeta[path];
      return {
        path,
        label: meta ? t(meta.labelKey) : path.replace(/^\/ohda\//, "").replace(/[-\/]/g, " ").trim() || path,
        icon: meta?.icon || "FileText",
        badge: meta?.getBadge ? meta.getBadge() : null
      };
    });
});

function toggleLanguage() {
  const target = currentLocale.value === "ar" ? "en" : "ar";
  setLocale(target);
}

function logout() {
  authStore.logout();
  router.push("/ohda/login");
}

onMounted(async () => {
  await Promise.all([
    authStore.fetchMyPages(),
    notifStore.fetchMyNotifications(),
    requestsStore.fetchExitRequests(),
    requestsStore.fetchEntryRequests()
  ]);
});
</script>
