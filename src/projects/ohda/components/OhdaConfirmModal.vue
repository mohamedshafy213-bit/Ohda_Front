<template>
  <OhdaModal
    :visible="confirmStore.visible"
    :title="confirmStore.title"
    :icon="confirmStore.isDestructive ? Trash2 : AlertCircle"
    maxWidth="max-w-md"
    :closeOnBackdrop="false"
    @close="confirmStore.handleCancel"
  >
    <div class="space-y-5 text-right">
      <div class="flex items-start gap-3 p-3.5 rounded-2xl" :class="confirmStore.isDestructive ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-brand-accent/10 text-brand-dark dark:text-white'">
        <component :is="confirmStore.isDestructive ? AlertTriangle : AlertCircle" class="w-5 h-5 shrink-0 mt-0.5" />
        <p class="text-xs font-semibold leading-relaxed">
          {{ confirmStore.message }}
        </p>
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-brand-gray/10">
        <button
          type="button"
          @click="confirmStore.handleCancel"
          class="px-4 py-2 rounded-xl border border-brand-gray/25 text-xs font-bold text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {{ confirmStore.cancelText }}
        </button>
        <button
          type="button"
          @click="confirmStore.handleConfirm"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          :class="confirmStore.isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-accent hover:bg-brand-accent/90 text-brand-dark'"
        >
          {{ confirmStore.confirmText }}
        </button>
      </div>
    </div>
  </OhdaModal>
</template>

<script setup>
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import OhdaModal from "./OhdaModal.vue";
import { Trash2, AlertCircle, AlertTriangle } from "lucide-vue-next";

const confirmStore = useOhdaConfirmStore();
</script>
