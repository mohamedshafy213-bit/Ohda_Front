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

      <!-- Top KPI Row (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Branches -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
            <Building2 class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي الفروع بالمنصة</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ totalBranchesCount }}</div>
            <span class="text-[10px] text-emerald-600 font-semibold">{{ activeBranchesCount }} نشط</span>
          </div>
        </div>

        <!-- Card 2: Total Users (platform-wide) -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">إجمالي مستخدمي المنصة</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ totalPlatformUsers }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة إجمالية {{ totalAllowedUsers }}</span>
          </div>
        </div>

        <!-- Card 3: Total Product Capacity vs Used -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Package class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">استهلاك سعة الأصناف</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ totalPlatformProducts }}</div>
            <span class="text-[10px] text-brand-gray font-mono">من سعة إجمالية {{ totalAllowedProducts }}</span>
          </div>
        </div>

        <!-- Card 4: Suspended Branches -->
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">الفروع المعلقة</div>
            <div class="text-2xl font-bold text-amber-600 mt-0.5">{{ suspendedBranchesCount }}</div>
            <span class="text-[10px] text-brand-gray">فروع تتطلب مراجعة أو تفعيل</span>
          </div>
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
              المستخدمين ({{ b.userCount ?? b.currentUserCount }} / {{ b.maxUsers }})
            </span>
            <span v-if="b.isProductExceeded || b.productRatio >= 0.8" class="text-[11px] text-amber-700 font-semibold">
              الأصناف ({{ b.productCount ?? b.currentProductCount }} / {{ b.maxProducts }})
            </span>
            <button
              @click="openEditModal(b)"
              class="text-brand-accent hover:underline text-[10px] font-bold ms-1 cursor-pointer"
            >
              تعديل السعة &larr;
            </button>
          </div>
        </div>
      </div>

      <!-- Interactive Charts & Analytics Section with Branch Filter -->
      <div class="bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-6">
        <!-- Filter Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand-soft text-brand-accent flex items-center justify-center border border-brand-accent/20">
              <PieChart class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-brand-dark">تحليل ومؤشرات السعة التخزينية والحسابات</h2>
              <p class="text-xs text-brand-gray">استخدم القائمة لتصفية المؤشرات الدائرية حسب فرع محدد أو استعراض المنصة بالكامل</p>
            </div>
          </div>

          <!-- Branch Filter Dropdown -->
          <div class="flex items-center gap-2 w-full sm:w-72">
            <label class="text-xs font-bold text-brand-dark shrink-0">عرض المؤشرات لـ:</label>
            <Select
              v-model="selectedBranchFilter"
              :options="branchFilterOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs !rounded-xl"
            />
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <!-- Donut 1: User Quota Usage -->
          <div class="bg-brand-light/70 p-5 rounded-2xl border border-brand-gray/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                  <Users class="w-4 h-4 text-blue-500" />
                  سعة المستخدمين
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold">
                  {{ selectedBranchName }}
                </span>
              </div>
              <div class="h-52 relative flex items-center justify-center">
                <Doughnut :data="userDoughnutData" :options="doughnutOptions" />
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-brand-gray/15 text-xs flex justify-between text-brand-gray">
              <span>المستخدم: <strong class="text-brand-dark font-mono">{{ currentScopeUsers }}</strong></span>
              <span>المتبقي: <strong class="text-brand-dark font-mono">{{ currentScopeRemainingUsers }}</strong></span>
              <span>الإجمالي: <strong class="text-brand-dark font-mono">{{ currentScopeMaxUsers }}</strong></span>
            </div>
          </div>

          <!-- Donut 2: Product Quota Usage -->
          <div class="bg-brand-light/70 p-5 rounded-2xl border border-brand-gray/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                  <Package class="w-4 h-4 text-emerald-500" />
                  سعة الأصناف والمخزون
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                  {{ selectedBranchName }}
                </span>
              </div>
              <div class="h-52 relative flex items-center justify-center">
                <Doughnut :data="productDoughnutData" :options="doughnutOptions" />
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-brand-gray/15 text-xs flex justify-between text-brand-gray">
              <span>المستخدم: <strong class="text-brand-dark font-mono">{{ currentScopeProducts }}</strong></span>
              <span>المتبقي: <strong class="text-brand-dark font-mono">{{ currentScopeRemainingProducts }}</strong></span>
              <span>الإجمالي: <strong class="text-brand-dark font-mono">{{ currentScopeMaxProducts }}</strong></span>
            </div>
          </div>

          <!-- Bar Chart: Side-by-Side Comparison Across All Branches -->
          <div class="bg-brand-light/70 p-5 rounded-2xl border border-brand-gray/15 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-dark flex items-center gap-2">
                  <BarChart2 class="w-4 h-4 text-brand-accent" />
                  مقارنة الفروع جنباً إلى جنب
                </span>
                <span class="text-[10px] text-brand-gray font-semibold">مستخدمين vs أصناف</span>
              </div>
              <div class="h-52 relative">
                <Bar :data="barComparisonData" :options="barOptions" />
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-brand-gray/15 text-[11px] text-brand-gray flex items-center justify-between">
              <span>عدد الفروع المقارنة: <strong class="text-brand-dark font-mono">{{ branchList.length }}</strong></span>
              <router-link to="/ohda/branches" class="text-brand-accent hover:underline font-bold">
                إدارة كافة الفروع &larr;
              </router-link>
            </div>
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
          <span class="text-xs text-brand-gray">{{ branchList.length }} فروع مسجلة</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="branch in branchList"
            :key="branch.branchId || branch.id"
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
                    {{ branch.branchName || branch.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono font-bold text-brand-accent px-1.5 py-0.5 bg-brand-accent/10 rounded">
                      {{ branch.branchCode || branch.code }}
                    </span>
                    <span class="text-[10px] text-brand-gray">
                      {{ branch.industryTemplate || 'عام' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="branch.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
                >
                  {{ branch.isActive ? 'نشط' : 'معلق' }}
                </span>

                <!-- Quick Edit Action -->
                <button
                  @click="openEditModal(branch)"
                  class="p-1 text-brand-gray hover:text-brand-accent hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                  title="تعديل سعة الفرع"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
              </div>
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
                    <span class="font-bold text-brand-dark">{{ branch.userCount ?? branch.currentUserCount ?? 0 }}</span>
                    <span class="text-brand-gray">/ {{ branch.maxUsers }}</span>
                    <span
                      class="text-[10px] font-bold ms-1"
                      :class="getPercentageColor(((branch.userCount ?? branch.currentUserCount ?? 0) / (branch.maxUsers || 1)))"
                    >
                      ({{ Math.round(((branch.userCount ?? branch.currentUserCount ?? 0) / (branch.maxUsers || 1)) * 100) }}%)
                    </span>
                  </div>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor(((branch.userCount ?? branch.currentUserCount ?? 0) / (branch.maxUsers || 1)))"
                    :style="{ width: Math.min(100, Math.round(((branch.userCount ?? branch.currentUserCount ?? 0) / (branch.maxUsers || 1)) * 100)) + '%' }"
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
                    <span class="font-bold text-brand-dark">{{ branch.productCount ?? branch.currentProductCount ?? 0 }}</span>
                    <span class="text-brand-gray">/ {{ branch.maxProducts }}</span>
                    <span
                      class="text-[10px] font-bold ms-1"
                      :class="getPercentageColor(((branch.productCount ?? branch.currentProductCount ?? 0) / (branch.maxProducts || 1)))"
                    >
                      ({{ Math.round(((branch.productCount ?? branch.currentProductCount ?? 0) / (branch.maxProducts || 1)) * 100) }}%)
                    </span>
                  </div>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor(((branch.productCount ?? branch.currentProductCount ?? 0) / (branch.maxProducts || 1)))"
                    :style="{ width: Math.min(100, Math.round(((branch.productCount ?? branch.currentProductCount ?? 0) / (branch.maxProducts || 1)) * 100)) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Footer Details & Quick Action -->
            <div class="pt-3 border-t border-brand-gray/10 flex items-center justify-between text-xs">
              <router-link
                :to="`/ohda/branches/${branch.branchId || branch.id}/dashboard`"
                class="px-2.5 py-1 bg-brand-soft text-brand-accent hover:bg-brand-accent/20 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Activity class="w-3.5 h-3.5" />
                مؤشرات المخزون &larr;
              </router-link>

              <button
                @click="openEditModal(branch)"
                class="px-2.5 py-1 bg-brand-light hover:bg-brand-soft text-brand-dark hover:text-brand-accent rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Pencil class="w-3 h-3" />
                تعديل السعة
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Edit Branch Dialog -->
      <Dialog
        v-model:visible="showEditModal"
        modal
        header="تعديل بيانات وسعة الفرع"
        class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark"
      >
        <form @submit.prevent="submitEditBranch" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-brand-dark mb-1">اسم الفرع</label>
            <InputText v-model="editForm.name" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">سعة المستخدمين (Max Users)</label>
              <InputNumber v-model="editForm.maxUsers" :min="1" :max="1000" class="w-full" inputClass="!bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs" />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">سعة الأصناف (Max Products)</label>
              <InputNumber v-model="editForm.maxProducts" :min="1" :max="50000" class="w-full" inputClass="!bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
            <Button
              type="button"
              @click="showEditModal = false"
              class="!bg-brand-light hover:!bg-brand-soft !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-4 !py-2 text-xs font-semibold cursor-pointer"
            >
              {{ $t('ohda.common.cancel') }}
            </Button>
            <Button
              type="submit"
              :disabled="savingEdit"
              class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2"
            >
              <span v-if="savingEdit">{{ $t('ohda.common.saving') }}</span>
              <span v-else>{{ $t('ohda.common.save') }}</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from "chart.js";
import { Doughnut, Bar } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const authStore = useOhdaAuthStore();
const branchStore = useOhdaBranchStore();
const toast = useToast();

const loading = ref(false);
const selectedBranchFilter = ref(0);

// --- Branch List & Analytics ---
const analyticsData = computed(() => branchStore.analytics);

const branchList = computed(() => {
  if (analyticsData.value?.branches?.length) {
    return analyticsData.value.branches;
  }
  return branchStore.branches || [];
});

const totalBranchesCount = computed(() => {
  return analyticsData.value?.totalBranches ?? branchStore.branches.length;
});

const activeBranchesCount = computed(() => {
  if (analyticsData.value) return analyticsData.value.activeBranches;
  return branchStore.branches.filter(b => b.isActive).length;
});

const suspendedBranchesCount = computed(() => {
  if (analyticsData.value) return analyticsData.value.suspendedBranches;
  return branchStore.branches.filter(b => !b.isActive).length;
});

const totalPlatformUsers = computed(() => {
  if (analyticsData.value) return analyticsData.value.totalUsers;
  return branchStore.branches.reduce((acc, b) => acc + (b.currentUserCount || 0), 0);
});

const totalAllowedUsers = computed(() => {
  if (analyticsData.value) return analyticsData.value.totalUserCapacity;
  return branchStore.branches.reduce((acc, b) => acc + (b.maxUsers || 0), 0);
});

const totalPlatformProducts = computed(() => {
  if (analyticsData.value) return analyticsData.value.totalProducts;
  return branchStore.branches.reduce((acc, b) => acc + (b.currentProductCount || 0), 0);
});

const totalAllowedProducts = computed(() => {
  if (analyticsData.value) return analyticsData.value.totalProductCapacity;
  return branchStore.branches.reduce((acc, b) => acc + (b.maxProducts || 0), 0);
});

const branchFilterOptions = computed(() => {
  return [
    { label: "جميع الفروع (المنصة ككل)", value: 0 },
    ...branchList.value.map(b => ({
      label: `${b.branchName || b.name} (${b.branchCode || b.code})`,
      value: b.branchId || b.id
    }))
  ];
});

const selectedBranchObj = computed(() => {
  if (selectedBranchFilter.value === 0) return null;
  return branchList.value.find(b => (b.branchId || b.id) === selectedBranchFilter.value) || null;
});

const selectedBranchName = computed(() => {
  if (selectedBranchObj.value) {
    return selectedBranchObj.value.branchName || selectedBranchObj.value.name;
  }
  return "إجمالي المنصة";
});

// Scope counts for doughnut charts
const currentScopeUsers = computed(() => {
  if (selectedBranchObj.value) {
    return selectedBranchObj.value.userCount ?? selectedBranchObj.value.currentUserCount ?? 0;
  }
  return totalPlatformUsers.value;
});

const currentScopeMaxUsers = computed(() => {
  if (selectedBranchObj.value) {
    return selectedBranchObj.value.maxUsers || 1;
  }
  return totalAllowedUsers.value || 1;
});

const currentScopeRemainingUsers = computed(() => {
  return Math.max(0, currentScopeMaxUsers.value - currentScopeUsers.value);
});

const currentScopeProducts = computed(() => {
  if (selectedBranchObj.value) {
    return selectedBranchObj.value.productCount ?? selectedBranchObj.value.currentProductCount ?? 0;
  }
  return totalPlatformProducts.value;
});

const currentScopeMaxProducts = computed(() => {
  if (selectedBranchObj.value) {
    return selectedBranchObj.value.maxProducts || 1;
  }
  return totalAllowedProducts.value || 1;
});

const currentScopeRemainingProducts = computed(() => {
  return Math.max(0, currentScopeMaxProducts.value - currentScopeProducts.value);
});

// --- Chart.js Data & Options ---
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: { family: "inherit", size: 11 },
        padding: 12
      }
    }
  },
  cutout: "68%"
};

const userDoughnutData = computed(() => {
  return {
    labels: ["المستخدم الفعلي", "المقاعد الشاغرة"],
    datasets: [
      {
        data: [currentScopeUsers.value, currentScopeRemainingUsers.value],
        backgroundColor: ["#3b82f6", "#e2e8f0"],
        hoverBackgroundColor: ["#2563eb", "#cbd5e1"],
        borderWidth: 0
      }
    ]
  };
});

const productDoughnutData = computed(() => {
  return {
    labels: ["الأصناف المستخدمة", "السعة المتبقية"],
    datasets: [
      {
        data: [currentScopeProducts.value, currentScopeRemainingProducts.value],
        backgroundColor: ["#10b981", "#e2e8f0"],
        hoverBackgroundColor: ["#059669", "#cbd5e1"],
        borderWidth: 0
      }
    ]
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: { family: "inherit", size: 10 },
        padding: 8
      }
    }
  },
  scales: {
    x: {
      ticks: { font: { family: "inherit", size: 10 } },
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { font: { family: "inherit", size: 10 } },
      grid: { color: "#f1f5f9" }
    }
  }
};

const barComparisonData = computed(() => {
  const labels = branchList.value.map(b => b.branchName || b.name);
  const users = branchList.value.map(b => b.userCount ?? b.currentUserCount ?? 0);
  const products = branchList.value.map(b => b.productCount ?? b.currentProductCount ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "المستخدمين",
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        data: users
      },
      {
        label: "الأصناف",
        backgroundColor: "#cca752",
        borderRadius: 6,
        data: products
      }
    ]
  };
});

const branchesNearCapacity = computed(() => {
  return branchList.value.map(b => {
    const uCount = b.userCount ?? b.currentUserCount ?? 0;
    const pCount = b.productCount ?? b.currentProductCount ?? 0;
    const userRatio = uCount / (b.maxUsers || 1);
    const productRatio = pCount / (b.maxProducts || 1);
    return {
      ...b,
      userRatio,
      productRatio,
      isUserExceeded: uCount >= (b.maxUsers || 1),
      isProductExceeded: pCount >= (b.maxProducts || 1)
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

// --- Quick Edit Modal State ---
const showEditModal = ref(false);
const savingEdit = ref(false);
const editingBranchId = ref(null);
const editForm = ref({
  name: "",
  maxUsers: 10,
  maxProducts: 1000
});

function openEditModal(branch) {
  const id = branch.branchId || branch.id;
  editingBranchId.value = id;
  editForm.value = {
    name: branch.branchName || branch.name || "",
    maxUsers: branch.maxUsers || 10,
    maxProducts: branch.maxProducts || 1000
  };
  showEditModal.value = true;
}

async function submitEditBranch() {
  if (!editingBranchId.value) return;
  savingEdit.value = true;
  try {
    const res = await branchStore.updateBranch(editingBranchId.value, editForm.value);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم بنجاح",
        detail: "تم تحديث سعة الفرع بنجاح",
        life: 3000
      });
      showEditModal.value = false;
      await refreshData();
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message || "فشل تحديث الفرع",
        life: 4000
      });
    }
  } finally {
    savingEdit.value = false;
  }
}

async function refreshData() {
  loading.value = true;
  await Promise.all([
    branchStore.fetchBranches(),
    branchStore.fetchAnalytics(),
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
