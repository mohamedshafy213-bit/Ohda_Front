<template>
  <div class="min-h-screen bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light flex flex-col font-sans">
    <!-- Topbar Navigation -->
    <header class="bg-brand-dark border-b border-white/10 sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white">
      <!-- Brand & Mobile Toggle -->
      <div class="flex items-center gap-3">
        <button @click="sidebarOpen = !sidebarOpen" class="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer">
          <Menu class="w-6 h-6" />
        </button>
        <router-link :to="authStore.isSuperAdmin ? '/ohda/branches' : '/ohda/dashboard'" class="flex items-center gap-3 group">
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
        <!-- Page Help Guide Button -->
        <button
          @click="showPageHelp = true"
          class="px-3 py-1.5 bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent border border-brand-accent/40 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-sm"
          :title="currentLocale === 'ar' ? 'دليل استخدام الصفحة (F1)' : 'Page Help Guide (F1)'"
        >
          <HelpCircle class="w-4 h-4 text-brand-accent" />
          <span class="hidden sm:inline">{{ currentLocale === 'ar' ? 'دليل الصفحة' : 'Page Guide' }}</span>
        </button>

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
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-400 block">{{ authStore.isSuperAdmin ? 'SuperAdmin (Platform)' : (authStore.user?.roleName || 'Role') }}</span>
              <span v-if="authStore.user?.branchName" class="text-[9px] text-brand-accent font-semibold block">({{ authStore.user.branchName }})</span>
            </div>
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

    <div class="flex-1 flex min-h-0">
      <!-- Sidebar Navigation -->
      <aside
        :class="[
          'w-64 bg-brand-dark border-e border-white/10 shrink-0 backdrop-blur transition-all duration-300 z-30 flex flex-col h-[calc(100vh-3.75rem)] sticky top-[3.75rem]',
          sidebarOpen ? 'flex fixed inset-y-0 start-0 top-[3.75rem] shadow-2xl z-50' : 'hidden md:flex'
        ]"
      >
        <!-- Nav Section: Clean with zero visible scrollbar -->
        <nav class="flex-1 space-y-2 p-3 overflow-y-auto no-scrollbar">
          <div v-for="(group, idx) in groupedNav" :key="group.key" class="space-y-1">
            <!-- Group Header (Collapsible, Bold & Larger Font with Category Icon, No Numbering) -->
            <button
              type="button"
              @click="toggleGroup(group.key)"
              class="w-full px-2.5 py-2 flex items-center justify-between text-xs font-black tracking-wide text-white select-none rounded-xl hover:bg-white/5 transition-all cursor-pointer group/header"
              :class="idx === 0 ? 'mt-0' : 'mt-2 border-t border-white/5 pt-2.5'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <component
                  :is="group.icon || 'Folder'"
                  class="w-4 h-4 text-brand-accent group-hover/header:scale-110 transition-transform shrink-0"
                />
                <span class="font-bold text-xs sm:text-[13px] text-white/95 group-hover/header:text-brand-accent transition-colors truncate">
                  {{ group.title }}
                </span>
              </div>
              <ChevronDown
                class="w-3.5 h-3.5 text-slate-400 group-hover/header:text-brand-accent transition-transform duration-200 shrink-0"
                :class="{ '-rotate-90 rtl:rotate-90 text-slate-500': !isGroupOpen(group.key) }"
              />
            </button>

            <!-- Group Links (Collapsible) -->
            <div
              v-show="isGroupOpen(group.key)"
              class="space-y-1 pt-0.5 transition-all duration-200"
            >
              <router-link
                v-for="item in group.items"
                :key="item.path"
                :to="item.path"
                class="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all group"
                :class="$route.path === item.path ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <component :is="item.icon" class="w-4 h-4 shrink-0" :class="$route.path === item.path ? 'text-brand-accent' : 'text-slate-400 group-hover:text-slate-200'" />
                  <span class="truncate">{{ item.label }}</span>
                </div>
                <span
                  v-if="item.badge"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 transition-all flex items-center gap-1"
                  :class="item.isAlert ? 'bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
                  :title="item.isAlert ? 'يوجد طلبات معادة / مرفوضة بحاجة إلى انتباهك' : ''"
                >
                  <span v-if="item.isAlert" class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block"></span>
                  {{ item.badge }}
                </span>
              </router-link>
            </div>
          </div>
        </nav>

        <!-- Sidebar Bottom Footer: Logout & Version -->
        <div class="p-3 border-t border-white/10 bg-brand-dark/95 backdrop-blur shrink-0 space-y-2.5">
          <!-- Sidebar Logout Button -->
          <button
            @click="logout"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <LogOut class="w-4 h-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>

          <!-- Ohda Version Badge -->
          <div class="flex items-center justify-between px-2 pt-1 border-t border-white/5 text-[10px] text-slate-400 font-medium select-none">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              نظام العهدة والمخزون
            </span>
            <span class="font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-[9px] font-semibold">v2.5 Enterprise</span>
          </div>
        </div>
      </aside>

      <!-- Main Content Router Area -->
      <main class="flex-1 overflow-y-auto p-6 bg-brand-light dark:bg-brand-dark/40">
        <router-view />
      </main>
    </div>

    <!-- Global Interactive Page Help Drawer -->
    <PageHelpDrawer v-model="showPageHelp" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { setLocale, getCurrentLocale } from "@/i18n";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaNotificationStore } from "../stores/useOhdaNotificationStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useI18n } from "vue-i18n";
import PageHelpDrawer from "../components/PageHelpDrawer.vue";

const router = useRouter();
const route = useRoute();
const authStore = useOhdaAuthStore();
const notifStore = useOhdaNotificationStore();
const requestsStore = useOhdaRequestsStore();
const { t } = useI18n();

const sidebarOpen = ref(false);
const showNotifications = ref(false);
const showPageHelp = ref(false);

const openGroups = ref({
  general: true,
  inventory: true,
  requests: true,
  entities: true,
  security: true,
  branches: true,
  other: true
});

function toggleGroup(key) {
  openGroups.value[key] = !isGroupOpen(key);
}

function isGroupOpen(key) {
  return openGroups.value[key] !== false;
}

const currentLocale = computed(() => getCurrentLocale());

const pageMeta = {
  "/ohda/dashboard": { labelKey: "ohda.nav.dashboard", icon: "LayoutDashboard" },
  "/ohda/products": { labelKey: "ohda.nav.products", icon: "Package" },
  "/ohda/warehouse-bins": { labelKey: "ohda.nav.warehouseBins", icon: "Layers" },
  "/ohda/inventory": { labelKey: "ohda.nav.inventory", icon: "Boxes" },
  "/ohda/exit-requests": { 
    labelKey: "ohda.nav.exitRequests", 
    icon: "ArrowUpRight", 
    getBadge: () => requestsStore.pendingExitRequestsCount || null,
    isAlert: () => (requestsStore.myReturnedExitRequestsCount > 0)
  },
  "/ohda/entry-requests": { 
    labelKey: "ohda.nav.entryRequests", 
    icon: "ArrowDownLeft", 
    getBadge: () => requestsStore.pendingEntryRequestsCount || null,
    isAlert: () => (requestsStore.myReturnedEntryRequestsCount > 0)
  },
  "/ohda/scan": { labelKey: "ohda.nav.scan", icon: "QrCode" },
  "/ohda/categories": { labelKey: "ohda.nav.categories", icon: "Tags" },
  "/ohda/suppliers": { labelKey: "ohda.nav.suppliers", icon: "Truck" },
  "/ohda/users": { labelKey: "ohda.nav.users", icon: "Users" },
  "/ohda/departments": { labelKey: "ohda.nav.departments", icon: "Building" },
  "/ohda/product-states": { labelKey: "ohda.nav.productStates", icon: "Activity" },
  "/ohda/approval-config": { labelKey: "ohda.nav.approvalConfig", icon: "Settings" },
  "/ohda/notifications": { labelKey: "ohda.nav.notifications", icon: "Bell" },
  "/ohda/compass": { labelKey: "ohda.nav.compass", icon: "Compass" },
  "/ohda/branches": { labelKey: "ohda.nav.branches", icon: "Building2" },
  "/ohda/branches-dashboard": { labelKey: "ohda.nav.branchesDashboard", icon: "Activity" }
};

const navItems = computed(() => {
  if (!authStore.allowedPaths) return [];
  return authStore.allowedPaths
    .filter(path => authStore.isRouteAllowed(path))
    .filter(path => !path.toLowerCase().includes("order") && path !== "/ohda/notifications")
    .map(path => {
      const meta = pageMeta[path];

      let backendIcon = null;
      if (authStore.allowedPages) {
        const found = authStore.allowedPages.find(p => {
          if (!p || typeof p !== "object") return false;
          const pPath = p.path || p.route;
          if (!pPath) return false;
          const norm = pPath.toLowerCase().startsWith("/ohda") ? pPath : `/ohda${pPath}`;
          const lower = norm.toLowerCase();
          const normalizedPath = (lower === "/ohda/orders" || lower === "/ohda/order" || lower === "/ohda/entry-request" || lower === "/ohda/entry-requests")
            ? "/ohda/entry-requests"
            : (lower === "/ohda/exit-request" || lower === "/ohda/exit-requests")
              ? "/ohda/exit-requests"
              : lower;
          return normalizedPath === path.toLowerCase();
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
        badge: meta?.getBadge ? meta.getBadge() : null,
        isAlert: meta?.isAlert ? meta.isAlert() : false
      };
    });
});

const groupDefinitions = computed(() => {
  if (authStore.isSuperAdmin) {
    return [
      {
        key: "branches",
        labelKey: "ohda.groups.branches",
        icon: "Building2",
        paths: [
          "/ohda/branches",
          "/ohda/branches-dashboard"
        ]
      },
      {
        key: "users_group",
        labelKey: "ohda.groups.security",
        customTitle: currentLocale.value === "ar" ? "إدارة المستخدمين" : "User Management",
        icon: "Users",
        paths: [
          "/ohda/users"
        ]
      }
    ];
  }

  return [
    {
      key: "general",
      labelKey: "ohda.groups.general",
      icon: "LayoutDashboard",
      paths: ["/ohda/dashboard"]
    },
    {
      key: "inventory",
      labelKey: "ohda.groups.inventory",
      icon: "Boxes",
      paths: [
        "/ohda/products",
        "/ohda/inventory",
        "/ohda/warehouse-bins",
        "/ohda/categories",
        "/ohda/scan"
      ]
    },
    {
      key: "requests",
      labelKey: "ohda.groups.requests",
      icon: "ScrollText",
      paths: [
        "/ohda/exit-requests",
        "/ohda/entry-requests"
      ]
    },
    {
      key: "entities",
      labelKey: "ohda.groups.entities",
      icon: "Building2",
      paths: [
        "/ohda/departments",
        "/ohda/suppliers"
      ]
    },
    {
      key: "security",
      labelKey: "ohda.groups.security",
      icon: "Shield",
      paths: [
        "/ohda/users",
        "/ohda/approval-config",
        "/ohda/product-states",
        "/ohda/compass"
      ]
    }
  ];
});

const groupedNav = computed(() => {
  const items = navItems.value;
  if (!items.length) return [];

  const itemMap = new Map(items.map(it => [it.path.toLowerCase(), it]));
  const usedPaths = new Set();
  const groups = [];

  for (const def of groupDefinitions.value) {
    const groupItems = [];
    for (const p of def.paths) {
      const it = itemMap.get(p.toLowerCase());
      if (it && authStore.isRouteAllowed(it.path)) {
        groupItems.push(it);
        usedPaths.add(p.toLowerCase());
      }
    }
    if (groupItems.length > 0) {
      groups.push({
        key: def.key,
        title: def.customTitle || t(def.labelKey),
        icon: def.icon,
        items: groupItems
      });
    }
  }

  // Any other items not in the explicit categories - only for non-SuperAdmin
  if (!authStore.isSuperAdmin) {
    const otherItems = items.filter(it => !usedPaths.has(it.path.toLowerCase()));
    if (otherItems.length > 0) {
      groups.push({
        key: "other",
        title: currentLocale.value === "ar" ? "أخرى" : "Other",
        icon: "Folder",
        items: otherItems
      });
    }
  }

  return groups;
});

function toggleLanguage() {
  const target = currentLocale.value === "ar" ? "en" : "ar";
  setLocale(target);
}

function logout() {
  authStore.logout();
  router.push("/ohda/login");
}

// Auto expand active group on route change
watch(
  () => route.path,
  (currentPath) => {
    if (!currentPath) return;
    for (const group of groupedNav.value) {
      if (group.items.some(it => it.path.toLowerCase() === currentPath.toLowerCase())) {
        openGroups.value[group.key] = true;
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await Promise.all([
    authStore.fetchMyPages(),
    notifStore.fetchMyNotifications(),
    requestsStore.fetchExitRequests(),
    requestsStore.fetchEntryRequests()
  ]);
});
</script>
