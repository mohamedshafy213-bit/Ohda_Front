<template>
  <div class="min-h-screen bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light flex flex-col font-sans">
    <!-- Topbar Navigation -->
    <header class="bg-brand-dark border-b border-white/10 sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white">
      <!-- Brand & Mobile Toggle -->
      <div class="flex items-center gap-3">
        <button @click="sidebarOpen = !sidebarOpen" class="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer">
          <Menu class="w-6 h-6" />
        </button>
        <router-link to="/ohda/dashboard" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 group-hover:scale-105 transition-transform">
            <Box class="w-5 h-5 text-brand-dark font-bold" />
          </div>
          <div>
            <h1 class="text-base font-bold text-white tracking-wide group-hover:text-brand-accent transition-colors">
              {{ $t('ohda.systemTitle') }}
            </h1>
            <span class="text-[10px] text-brand-accent font-mono font-semibold block">v2.5 Enterprise</span>
          </div>
        </router-link>
      </div>

      <!-- Right Header Tools: Language Switcher, Notifications, Profile & Logout -->
      <div class="flex items-center gap-3">
        <!-- Language Switcher -->
        <button
          @click="toggleLanguage"
          class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Globe class="w-4 h-4 text-brand-accent" />
          <span class="font-bold">{{ currentLocale === 'ar' ? 'EN' : 'عربي' }}</span>
        </button>

        <!-- Notifications Dropdown -->
        <div class="relative">
          <button
            @click="showNotifications = !showNotifications"
            class="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all cursor-pointer relative"
          >
            <Bell class="w-4 h-4 text-amber-400" />
            <span v-if="notifStore.unreadCount > 0" class="absolute -top-1 -end-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {{ notifStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications Panel -->
          <div
            v-if="showNotifications"
            class="absolute end-0 mt-2 w-80 bg-brand-dark border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3"
          >
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 class="text-xs font-bold text-white flex items-center gap-2">
                <Bell class="w-4 h-4 text-amber-400" />
                الإشعارات والتنبيهات
              </h3>
              <button @click="notifStore.markAllAsRead()" class="text-[10px] text-brand-accent hover:underline cursor-pointer">
                تحديد الكل كقروء
              </button>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div
                v-for="n in notifStore.notifications"
                :key="n.id"
                @click="notifStore.markAsRead(n.id)"
                class="p-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                :class="n.isRead ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-brand-accent/15 border-brand-accent/30 text-white'"
              >
                <div class="font-bold mb-0.5">{{ n.title }}</div>
                <div class="text-[11px] text-slate-300">{{ n.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile & Role Pill -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-xl">
          <User class="w-4 h-4 text-brand-accent" />
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
          'w-64 bg-brand-dark border-e border-white/10 p-4 space-y-2 shrink-0 backdrop-blur transition-all duration-300 z-30',
          sidebarOpen ? 'block' : 'hidden md:block'
        ]"
      >
        <nav class="space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group"
            :class="$route.path === item.path ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/30 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-4 h-4" :class="$route.path === item.path ? 'text-brand-accent' : 'text-slate-400 group-hover:text-slate-200'" />
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

      </aside>

      <!-- Main Content Router Area -->
      <main class="flex-1 overflow-y-auto p-6 bg-brand-light dark:bg-brand-dark/40">
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
  "/ohda/dashboard": { labelKey: "ohda.nav.dashboard", icon: "LayoutDashboard" },
  "/ohda/products": { labelKey: "ohda.nav.products", icon: "Package" },
  "/ohda/inventory": { labelKey: "ohda.nav.inventory", icon: "Boxes" },
  "/ohda/exit-requests": { labelKey: "ohda.nav.exitRequests", icon: "ArrowUpRight", getBadge: () => requestsStore.pendingExitRequestsCount || null },
  "/ohda/entry-requests": { labelKey: "ohda.nav.entryRequests", icon: "ArrowDownLeft", getBadge: () => requestsStore.pendingEntryRequestsCount || null },
  "/ohda/scan": { labelKey: "ohda.nav.scan", icon: "QrCode" },
  "/ohda/categories": { labelKey: "ohda.nav.categories", icon: "Tags" },
  "/ohda/suppliers": { labelKey: "ohda.nav.suppliers", icon: "Truck" },
  "/ohda/users": { labelKey: "ohda.nav.users", icon: "Users" },
  "/ohda/departments": { labelKey: "ohda.nav.departments", icon: "Building" },
  "/ohda/product-states": { labelKey: "ohda.nav.productStates", icon: "Activity" },
  "/ohda/approval-config": { labelKey: "ohda.nav.approvalConfig", icon: "Settings" },
  "/ohda/notifications": { labelKey: "ohda.nav.notifications", icon: "Bell" },
  "/ohda/compass": { labelKey: "ohda.nav.compass", icon: "Compass" }
};

const navItems = computed(() => {
  if (!authStore.allowedPaths) return [];
  return authStore.allowedPaths
    .filter(path => !path.toLowerCase().includes("order") && path !== "/ohda/notifications")
    .map(path => {
      const meta = pageMeta[path];

      let backendIcon = null;
      if (authStore.allowedPages) {
        const found = authStore.allowedPages.find(p => {
          if (!p || typeof p !== "object") return false;
          const pPath = p.path || p.route;
          if (!pPath) return false;
          const norm = pPath.startsWith("/ohda") ? pPath : `/ohda${pPath}`;
          const normalizedPath = norm === "/ohda/entry-request"
            ? "/ohda/entry-requests"
            : norm === "/ohda/exit-request"
              ? "/ohda/exit-requests"
              : norm;
          return normalizedPath === path;
        });
        if (found) {
          const rawIcon = found.icon || found.Icon;
          if (rawIcon) {
            const isLegacy = rawIcon.includes("_") || rawIcon === rawIcon.toLowerCase();
            if (!isLegacy) {
              backendIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
            } else if (rawIcon.toLowerCase() === "explore") {
              backendIcon = "Compass";
            }
          }
        }
      }

      return {
        path,
        label: meta ? t(meta.labelKey) : path.replace(/^\/ohda\//, "").replace(/[-\/]/g, " ").trim() || path,
        icon: backendIcon || meta?.icon || "FileText",
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
