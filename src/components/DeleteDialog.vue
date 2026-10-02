<template>
  <Dialog
    :visible="displayDeleteDialog"
    @update:visible="val => displayDeleteDialog = val"
    modal
    :closable="!loading"
    class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    :header="dialogTitle"
  >
    <div class="p-2 flex flex-col gap-5">
      <!-- Icon Indicator -->
      <div class="w-full flex justify-center items-center text-center pt-2">
        <div
          v-if="isDeactivate"
          class="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 w-16 h-16 flex items-center justify-center text-orange-500 shadow-sm"
        >
          <CircleOff class="w-8 h-8" />
        </div>
        <div
          v-else-if="isActivate"
          class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 w-16 h-16 flex items-center justify-center text-emerald-600 shadow-sm"
        >
          <CheckCircle class="w-8 h-8" />
        </div>
        <div
          v-else
          class="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 w-16 h-16 flex items-center justify-center text-red-500 shadow-sm"
        >
          <Trash class="w-8 h-8" />
        </div>
      </div>

      <!-- Title & Warning Description -->
      <div class="text-center space-y-2">
        <h3 class="font-bold text-lg text-brand-dark dark:text-white">
          {{ dialogTitle }}
        </h3>
        <p class="text-xs text-brand-gray dark:text-slate-400 leading-relaxed px-2">
          {{ subtitleText }}
        </p>
        <div v-if="itemName" class="inline-block px-3 py-1 rounded-xl bg-brand-light dark:bg-white/5 border border-brand-gray/15 font-semibold text-xs text-brand-dark dark:text-white font-mono">
          {{ itemName }}
        </div>
      </div>

      <!-- Action Buttons with Loading States -->
      <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10 mt-2">
        <SecondaryButton
          type="button"
          :disabled="loading"
          class="!px-4 !py-2.5 !text-xs font-semibold !rounded-xl"
          @click="displayDeleteDialog = false"
        >
          {{ $t('ohda.common.cancel') }}
        </SecondaryButton>

        <Button
          type="button"
          :disabled="loading"
          @click="confirmAction"
          class="!px-5 !py-2.5 !text-xs !font-bold !rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
          :class="isDeactivate
            ? '!bg-amber-600 hover:!bg-amber-700 !text-white'
            : isActivate
              ? '!bg-emerald-600 hover:!bg-emerald-700 !text-white'
              : '!bg-red-600 hover:!bg-red-700 !text-white shadow-red-600/20'"
        >
          <div v-if="loading" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
          <span v-if="loading">{{ isDeactivate ? $t('deleteDialog.deactivating', { itemType: itemType || '', itemName: itemName || '' }) : isActivate ? $t('deleteDialog.activating', { itemType: itemType || '', itemName: itemName || '' }) : $t('deleteDialog.deleting', { itemType: itemType || '', itemName: itemName || '' }) }}</span>
          <span v-else>{{ confirmButtonText }}</span>
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const displayDeleteDialog = defineModel();
const { t } = useI18n();

const props = defineProps({
  itemType: {
    type: String,
    default: ""
  },
  itemName: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  isDeactivate: {
    type: Boolean,
    default: false
  },
  isActivate: {
    type: Boolean,
    default: false
  },
  confirm: {
    type: Function,
    default: () => {}
  }
});

const loading = ref(false);

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  if (props.isDeactivate) {
    return t("deleteDialog.deactivateDialogTitle", { itemType: props.itemType });
  }
  if (props.isActivate) {
    return t("deleteDialog.activateDialogTitle", { itemType: props.itemType });
  }
  return t("deleteDialog.deleteDialogTitle", { itemType: props.itemType });
});

const subtitleText = computed(() => {
  if (props.isDeactivate) {
    return t("deleteDialog.deactivateDialogSubtitle", { itemType: props.itemType, itemName: props.itemName });
  }
  if (props.isActivate) {
    return t("deleteDialog.activateDialogSubtitle", { itemType: props.itemType, itemName: props.itemName });
  }
  return t("deleteDialog.deleteDialogSubtitle", { itemType: props.itemType, itemName: props.itemName });
});

const confirmButtonText = computed(() => {
  if (props.isDeactivate) return t("deleteDialog.yesDeactivate");
  if (props.isActivate) return t("deleteDialog.yesActivate");
  return t("deleteDialog.yesDelete");
});

const confirmAction = async () => {
  loading.value = true;
  try {
    if (props.confirm) {
      await props.confirm();
    }
    displayDeleteDialog.value = false;
  } catch (err) {
    console.error("[DeleteDialog Error]:", err);
  } finally {
    loading.value = false;
  }
};
</script>

