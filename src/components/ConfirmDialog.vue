<template>
  <Dialog 
    :visible="displayDialog" 
    modal 
    :closable="!loading"
    class="max-w-lg w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    :header="title || $t('ohda.common.confirm')"
    @update:visible="emitClose"
  >
    <div class="p-2 flex flex-col gap-5">
      <!-- Icon Indicator -->
      <div class="w-full flex justify-center items-center text-center pt-2">
        <div 
          class="rounded-2xl border p-3 w-16 h-16 flex items-center justify-center shadow-sm"
          :class="severity === 'danger'
            ? 'border-red-500/30 bg-red-500/10 text-red-500'
            : severity === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
              : 'border-brand-accent/30 bg-brand-soft text-brand-accent'"
        >
          <AlertTriangle v-if="severity === 'warning'" class="w-8 h-8" />
          <AlertOctagon v-else-if="severity === 'danger'" class="w-8 h-8" />
          <Info v-else class="w-8 h-8" />
        </div>
      </div>

      <!-- Title & Main Message -->
      <div class="text-center space-y-2">
        <h3 class="font-bold text-lg text-brand-dark dark:text-white">
          {{ title || $t('ohda.common.confirm') }}
        </h3>
        <p class="text-xs text-brand-gray dark:text-slate-400 leading-relaxed px-2">
          {{ message }}
        </p>
        <div v-if="itemName" class="inline-block px-3 py-1 rounded-xl bg-brand-light dark:bg-white/5 border border-brand-gray/15 font-semibold text-xs text-brand-dark dark:text-white font-mono">
          {{ itemName }}
        </div>
      </div>

      <!-- Warning Callout Box if Provided -->
      <div 
        v-if="warningMessage"
        class="p-3.5 rounded-2xl border flex items-start gap-3 text-xs"
        :class="severity === 'danger'
          ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'"
      >
        <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
        <span class="leading-relaxed">{{ warningMessage }}</span>
      </div>
      
      <!-- Notes field (optional) -->
      <div v-if="showNotes" class="space-y-1.5 text-xs">
        <label class="block font-semibold text-brand-dark dark:text-white">{{ notesLabel || $t('ohda.entryRequests.notes') }}</label>
        <Textarea 
          v-model="notesValue" 
          :rows="3" 
          class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          :placeholder="notesPlaceholder || $t('ohda.common.search')"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10 mt-2">
        <SecondaryButton
          type="button"
          :disabled="loading"
          class="!px-4 !py-2.5 !text-xs font-semibold !rounded-xl"
          @click="cancelAction"
        >
          {{ cancelText || $t('ohda.common.cancel') }}
        </SecondaryButton>

        <Button
          type="button"
          :disabled="loading"
          @click="confirmAction"
          class="!px-5 !py-2.5 !text-xs !font-bold !rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
          :class="severity === 'danger'
            ? '!bg-red-600 hover:!bg-red-700 !text-white shadow-red-600/20'
            : severity === 'warning'
              ? '!bg-amber-600 hover:!bg-amber-700 !text-white shadow-amber-600/20'
              : '!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark shadow-brand-accent/20'"
        >
          <div v-if="loading" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
          <span>{{ confirmText || $t('ohda.common.confirm') }}</span>
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const displayDialog = defineModel();
const { t } = useI18n();

const props = defineProps({
  itemName: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  message: {
    type: String,
    default: ""
  },
  warningMessage: {
    type: String,
    default: ""
  },
  confirmText: {
    type: String,
    default: ""
  },
  cancelText: {
    type: String,
    default: ""
  },
  severity: {
    type: String,
    default: "danger" // 'danger' | 'warning' | 'info'
  },
  showNotes: {
    type: Boolean,
    default: false
  },
  notesLabel: {
    type: String,
    default: ""
  },
  notesPlaceholder: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["confirm", "cancel"]);
const notesValue = ref("");
const loading = ref(false);

watch(displayDialog, (newVal) => {
  if (!newVal) {
    notesValue.value = "";
    loading.value = false;
  }
});

const emitClose = () => {
  displayDialog.value = false;
};

const confirmAction = async () => {
  loading.value = true;
  try {
    emit("confirm", notesValue.value || null);
  } finally {
    loading.value = false;
    emitClose();
  }
};

const cancelAction = () => {
  emit("cancel");
  emitClose();
};
</script>


