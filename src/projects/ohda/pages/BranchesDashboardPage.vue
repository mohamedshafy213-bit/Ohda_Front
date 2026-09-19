<template>
  <div class="space-y-6">
    <!-- SuperAdmin Authorization Guard -->
    <div v-if="!authStore.isSuperAdmin" class="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-3">
      <AlertOctagon class="w-12 h-12 text-red-500 mx-auto" />
      <h2 class="text-lg font-bold text-red-400">هذه الصفحة مخصصة لمدير المنصة العام (SuperAdmin) فقط</h2>
      <p class="text-xs text-slate-400">ليس لديك الصلاحيات الكافية للوصول إلى مؤشرات الأداء وحصص الفروع العامة.</p>
    </div>

    <template v-else>
      <!-- Header Title Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
            <Activity class="w-7 h-7 text-brand-accent" />
            {{ $t('ohda.branchesDashboard.title') }}
          </h1>
          <p class="text-xs text-brand-gray mt-1">
            {{ $t('ohda.branchesDashboard.subTitle') }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/ohda/branches"
            class="px-4 py-2 bg-brand-soft hover:bg-brand-soft/80 text-brand-accent font-bold rounded-xl text-xs flex items-center gap-2 border border-brand-accent/20 transition-all cursor-pointer"
          >
            <Building2 class="w-4 h-4" />
            {{ $t('ohda.nav.branches') }}
          </router-link>

          <Button
            @click="refreshData"
            :disabled="loading"
            class="!bg-brand-white hover:!bg-brand-light !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-3 !py-2 !text-xs flex items-center gap-2"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            {{ $t('ohda.common.refresh') }}
          </Button>
        </div>
      </div>

      <!-- High-Priority Quota Warnings Alert (if any branch >= 80% quota) -->
      <div
        v-if="branchesNearCapacity.length > 0"
        class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2"
      >
        <div class="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
          <AlertTriangle class="w-4 h-4" />
          <span>تنبيه سعة: يوجد {{ branchesNearCapacity.length }} فرع اقترب أو تجاوز الحد الأقصى للمستخدمين أو الأصناف</span>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <div
            v-for="b in branchesNearCapacity"
            :key="b.branchId || b.id"
            class="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs flex items-center gap-2 text-brand-dark"
          >
            <span class="font-bold font-mono">{{ b.branchCode || b.code }} ({{ b.branchName || b.name }}):</span>
            <span v-if="b.isUserExceeded || b.userRatio >= 0.8" class="text-[11px] text-red-600 font-semibold">
              المستخدمين ({{ b.totalUsers || b.currentUserCount }} / {{ b.maxUsers }})
            </span>
            <span v-if="b.isProductExceeded || b.productRatio >= 0.8" class="text-[11px] text-amber-700 font-semibold">
              الأصناف ({{ b.totalProducts || b.currentProductCount }} / {{ b.maxProducts }})
            </span>
            <router-link
              to="/ohda/branches"
              class="text-brand-accent hover:underline text-[10px] font-bold ms-1"
            >
              تعديل السعة &larr;
            </router-link>
          </div>
        </div>
      </div>

      <!-- Macro Platform KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
            <Building2 class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي الفروع بالمنصة</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ branchStore.branches.length }}</div>
            <span class="text-[10px] text-emerald-600 font-semibold">{{ branchStore.activeBranches.length }} نشط</span>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي مستخدمي الفروع</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ totalPlatformUsers }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة إجمالية {{ totalAllowedUsers }}</span>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Package class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي الأصناف المدارة</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ totalPlatformProducts }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة إجمالية {{ totalAllowedProducts }}</span>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/30">
            <TrendingUp class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">متوسط استهلاك السعة</div>
            <div class="text-2xl font-bold text-brand-accent mt-0.5">{{ averageUserQuotaPercentage }}%</div>
            <span class="text-[10px] text-brand-gray">استقرار الأداء ممتاز</span>
          </div>
        </div>
      </div>

      <!-- Multi-Branch Quota Comparison Cards Grid -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Layers class="w-4 h-4 text-brand-accent" />
            {{ $t('ohda.branchesDashboard.branchComparison') }}
          </h2>
          <span class="text-xs text-brand-gray">{{ branchStore.branches.length }} فروع مسجلة</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="branch in branchStore.branches"
            :key="branch.id"
            class="bg-brand-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:shadow-md"
            :class="branch.isActive ? 'border-brand-gray/15 hover:border-brand-accent/40' : 'border-amber-500/30 bg-amber-500/5'"
          >
            <!-- Branch Card Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-brand-soft border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                  <Building2 class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-brand-dark text-sm flex items-center gap-2">
                    {{ branch.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono font-bold text-brand-accent px-1.5 py-0.5 bg-brand-accent/10 rounded">
                      {{ branch.code }}
                    </span>
                    <span class="text-[10px] text-brand-gray">
                      {{ branch.industryTemplate || 'General' }}
                    </span>
                  </div>
                </div>
              </div>

              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="branch.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
              >
                {{ branch.isActive ? 'نشط' : 'معلق' }}
              </span>
            </div>

            <!-- Dual Quota Progress Bars -->
            <div class="space-y-3 pt-2 border-t border-brand-gray/10">
              <!-- User Quota -->
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-brand-gray flex items-center gap-1.5 font-medium">
                    <Users class="w-3.5 h-3.5 text-blue-500" />
                    المستخدمين:
                  </span>
                  <div class="flex items-center gap-1 font-mono">
                    <span class="font-bold text-brand-dark">{{ branch.currentUserCount || 0 }}</span>
                    <span class="text-brand-gray">/ {{ branch.maxUsers }}</span>
                    <span
                      class="text-[10px] font-bold ms-1"
                      :class="getPercentageColor((branch.currentUserCount || 0) / (branch.maxUsers || 1))"
                    >
                      ({{ Math.round(((branch.currentUserCount || 0) / (branch.maxUsers || 1)) * 100) }}%)
                    </span>
                  </div>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor((branch.currentUserCount || 0) / (branch.maxUsers || 1))"
                    :style="{ width: Math.min(100, Math.round(((branch.currentUserCount || 0) / (branch.maxUsers || 1)) * 100)) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Product Quota -->
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-brand-gray flex items-center gap-1.5 font-medium">
                    <Package class="w-3.5 h-3.5 text-emerald-500" />
                    الأصناف:
                  </span>
                  <div class="flex items-center gap-1 font-mono">
                    <span class="font-bold text-brand-dark">{{ branch.currentProductCount || 0 }}</span>
                    <span class="text-brand-gray">/ {{ branch.maxProducts }}</span>
                    <span
                      class="text-[10px] font-bold ms-1"
                      :class="getPercentageColor((branch.currentProductCount || 0) / (branch.maxProducts || 1))"
                    >
                      ({{ Math.round(((branch.currentProductCount || 0) / (branch.maxProducts || 1)) * 100) }}%)
                    </span>
                  </div>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor((branch.currentProductCount || 0) / (branch.maxProducts || 1))"
                    :style="{ width: Math.min(100, Math.round(((branch.currentProductCount || 0) / (branch.maxProducts || 1)) * 100)) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Footer Details & Quick Action -->
            <div class="pt-3 border-t border-brand-gray/10 flex items-center justify-between text-xs">
              <div class="text-[11px] text-brand-gray">
                مسؤول الفرع: <span class="font-semibold text-brand-dark">{{ branch.contactName || '—' }}</span>
              </div>

              <router-link
                to="/ohda/branches"
                class="px-2.5 py-1 bg-brand-light hover:bg-brand-soft text-brand-dark hover:text-brand-accent rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                إدارة الحصص &larr;
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";

const authStore = useOhdaAuthStore();
const branchStore = useOhdaBranchStore();
const loading = ref(false);

const totalPlatformUsers = computed(() => {
  return branchStore.branches.reduce((acc, b) => acc + (b.currentUserCount || 0), 0);
});

const totalAllowedUsers = computed(() => {
  return branchStore.branches.reduce((acc, b) => acc + (b.maxUsers || 0), 0);
});

const totalPlatformProducts = computed(() => {
  return branchStore.branches.reduce((acc, b) => acc + (b.currentProductCount || 0), 0);
});

const totalAllowedProducts = computed(() => {
  return branchStore.branches.reduce((acc, b) => acc + (b.maxProducts || 0), 0);
});

const averageUserQuotaPercentage = computed(() => {
  if (!totalAllowedUsers.value) return 0;
  return Math.round((totalPlatformUsers.value / totalAllowedUsers.value) * 100);
});

const branchesNearCapacity = computed(() => {
  return branchStore.branches.map(b => {
    const userRatio = (b.currentUserCount || 0) / (b.maxUsers || 1);
    const productRatio = (b.currentProductCount || 0) / (b.maxProducts || 1);
    return {
      ...b,
      userRatio,
      productRatio,
      isUserExceeded: (b.currentUserCount || 0) >= (b.maxUsers || 1),
      isProductExceeded: (b.currentProductCount || 0) >= (b.maxProducts || 1)
    };
  }).filter(b => b.userRatio >= 0.8 || b.productRatio >= 0.8);
});

function getPercentageColor(ratio) {
  if (ratio >= 1.0) return "text-red-500";
  if (ratio >= 0.8) return "text-amber-500";
  return "text-emerald-500";
}

function getProgressBarColor(ratio) {
  if (ratio >= 1.0) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-emerald-500";
}

async function refreshData() {
  loading.value = true;
  await Promise.all([
    branchStore.fetchBranches(),
    branchStore.fetchStats()
  ]);
  loading.value = false;
}

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await refreshData();
  }
});
</script>
