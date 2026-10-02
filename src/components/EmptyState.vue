<template>
  <div class="flex flex-col items-center justify-center p-8 text-center space-y-3 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-dashed border-brand-gray/20 my-2">
    <div class="w-14 h-14 rounded-2xl bg-brand-soft/80 dark:bg-white/10 text-brand-accent flex items-center justify-center shadow-xs">
      <component :is="iconComponent" class="w-7 h-7" />
    </div>
    <div class="max-w-md space-y-1">
      <h4 class="text-sm font-bold text-brand-dark dark:text-white">
        {{ title || $t('ohda.common.noData') }}
      </h4>
      <p v-if="description" class="text-xs text-brand-gray dark:text-slate-400 leading-relaxed">
        {{ description }}
      </p>
    </div>
    <div v-if="actionLabel" class="pt-2">
      <Button
        type="button"
        @click="$emit('action')"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/15 cursor-pointer"
      >
        <Plus v-if="showActionIcon" class="w-4 h-4" />
        <span>{{ actionLabel }}</span>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: "Inbox"
  },
  actionLabel: {
    type: String,
    default: ""
  },
  showActionIcon: {
    type: Boolean,
    default: true
  }
});

defineEmits(["action"]);

const iconComponent = computed(() => {
  return props.icon || "Inbox";
});
</script>
