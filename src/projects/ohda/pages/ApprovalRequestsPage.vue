<template>
  <div class="space-y-6 font-sans">
    <!-- Header Card -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm transition-colors">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-3">
          <CheckCheck class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.approvalRequests.title') }}
        </h1>
        <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
          {{ $t('ohda.approvalRequests.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="rounded-xl border border-brand-accent/20 bg-brand-soft dark:bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-brand-accent flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-brand-accent animate-ping"></span>
          {{ pendingCount }} {{ $t('ohda.approvalRequests.pending') }}
        </div>
        <Button
          @click="refreshRequests"
          :loading="loading"
          class="!bg-surface-100 dark:!bg-surface-800 hover:!bg-surface-200 dark:hover:!bg-surface-700 !text-surface-800 dark:!text-surface-200 !border !border-surface-300 dark:!border-surface-700 !rounded-xl !px-3 !py-2 !text-xs !font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          {{ $t('ohda.common.refresh') }}
        </Button>
      </div>
    </div>

    <!-- Summary Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Exit Requests Card -->
      <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.exitRequests') }}</span>
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ArrowUpRight class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3 text-3xl font-black text-surface-900 dark:text-surface-100 font-mono">{{ requestsStore.pendingExitRequestsCount }}</div>
        <div class="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <span class="text-[11px] text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.exitDesc') }}</span>
          <router-link
            to="/exit-requests"
            class="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            {{ $t('ohda.approvalRequests.goToExitRequests') }}
            <ArrowLeft class="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </router-link>
        </div>
      </div>

      <!-- Entry Requests Card -->
      <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.entryRequests') }}</span>
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ArrowDownLeft class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3 text-3xl font-black text-surface-900 dark:text-surface-100 font-mono">{{ requestsStore.pendingEntryRequestsCount }}</div>
        <div class="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <span class="text-[11px] text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.entryDesc') }}</span>
          <router-link
            to="/entry-requests"
            class="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            {{ $t('ohda.approvalRequests.goToEntryRequests') }}
            <ArrowLeft class="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </router-link>
        </div>
      </div>

      <!-- Total Pending Card -->
      <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.total') }}</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-3 text-3xl font-black text-brand-accent font-mono">{{ pendingCount }}</div>
        <div class="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <span class="text-[11px] text-surface-500 dark:text-surface-400">{{ $t('ohda.approvalRequests.summary') }}</span>
          <router-link
            to="/approval-config"
            class="text-xs font-bold text-surface-600 dark:text-surface-300 hover:text-brand-accent flex items-center gap-1"
          >
            {{ $t('ohda.nav.approvalConfig') }}
            <ArrowLeft class="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Overview Content -->
    <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-surface-900 dark:text-surface-100">{{ $t('ohda.approvalRequests.summary') }}</h2>
      </div>

      <div v-if="pendingCount === 0" class="py-8">
        <EmptyState
          :title="$t('ohda.approvalRequests.emptyState')"
          :description="$t('ohda.approvalRequests.subTitle')"
          :showAction="false"
        />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-850 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <ArrowUpRight class="w-4 h-4 text-amber-600" />
              {{ $t('ohda.approvalRequests.exitRequests') }}
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {{ requestsStore.pendingExitRequestsCount }}
            </span>
          </div>
          <p class="text-xs text-surface-500 dark:text-surface-400">
            {{ $t('ohda.approvalRequests.exitDesc') }}
          </p>
          <router-link
            to="/exit-requests"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            {{ $t('ohda.approvalRequests.goToExitRequests') }}
            <ArrowLeft class="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </router-link>
        </div>

        <div class="p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-850 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <ArrowDownLeft class="w-4 h-4 text-blue-600" />
              {{ $t('ohda.approvalRequests.entryRequests') }}
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              {{ requestsStore.pendingEntryRequestsCount }}
            </span>
          </div>
          <p class="text-xs text-surface-500 dark:text-surface-400">
            {{ $t('ohda.approvalRequests.entryDesc') }}
          </p>
          <router-link
            to="/entry-requests"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            {{ $t('ohda.approvalRequests.goToEntryRequests') }}
            <ArrowLeft class="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import EmptyState from "@/components/EmptyState.vue";

const requestsStore = useOhdaRequestsStore();
const loading = ref(false);

const pendingCount = computed(
  () => requestsStore.pendingExitRequestsCount + requestsStore.pendingEntryRequestsCount
);

async function refreshRequests() {
  loading.value = true;
  try {
    await Promise.all([
      requestsStore.fetchExitRequests(),
      requestsStore.fetchEntryRequests()
    ]);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  refreshRequests();
});
</script>
