<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <CheckCheck class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.approvalRequests.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.approvalRequests.subTitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="rounded-xl border border-brand-accent/20 bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-accent">
          {{ pendingCount }} {{ $t('ohda.approvalRequests.pending') }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.approvalRequests.exitRequests') }}</span>
          <Clock3 class="w-4 h-4 text-brand-accent" />
        </div>
        <div class="mt-3 text-2xl font-bold text-brand-dark">{{ requestsStore.pendingExitRequestsCount }}</div>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.approvalRequests.entryRequests') }}</span>
          <ClipboardCheck class="w-4 h-4 text-brand-accent" />
        </div>
        <div class="mt-3 text-2xl font-bold text-brand-dark">{{ requestsStore.pendingEntryRequestsCount }}</div>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-brand-gray">{{ $t('ohda.approvalRequests.total') }}</span>
          <ShieldCheck class="w-4 h-4 text-brand-accent" />
        </div>
        <div class="mt-3 text-2xl font-bold text-brand-dark">{{ pendingCount }}</div>
      </div>
    </div>

    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-brand-dark">{{ $t('ohda.approvalRequests.summary') }}</h2>
        <Button
          @click="refreshRequests"
          class="!bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/20 !rounded-xl !px-3 !py-2 !text-[11px] !font-semibold"
        >
          {{ $t('ohda.common.refresh') }}
        </Button>
      </div>

      <div class="rounded-xl border border-brand-gray/10 bg-brand-light p-4 text-sm text-brand-dark">
        {{ $t('ohda.approvalRequests.emptyState') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { CheckCheck, Clock3, ClipboardCheck, ShieldCheck } from "lucide-vue-next";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";

const requestsStore = useOhdaRequestsStore();

const pendingCount = computed(
  () => requestsStore.pendingExitRequestsCount + requestsStore.pendingEntryRequestsCount
);

async function refreshRequests() {
  await Promise.all([
    requestsStore.fetchExitRequests(),
    requestsStore.fetchEntryRequests()
  ]);
}

onMounted(() => {
  refreshRequests();
});
</script>
